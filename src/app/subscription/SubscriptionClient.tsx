// app/subscription/SubscriptionClient.tsx
'use client';

import { useMemo, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { SafeUser } from "@/app/types";
import FeatureComparison from "@/components/subscription/FeatureComparison";
import { CheckmarkCircle02Icon, ArrowRight01Icon } from "hugeicons-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type Billing = "monthly" | "yearly";

function cleanLabel(label?: string | null) {
  const cleaned = String(label || "Bronze").replace(/\s*\(.*\)\s*$/, "").trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function canonicalize(label: string) {
  const raw = (label || "").toLowerCase();
  if (raw.includes("platinum") || raw.includes("enterprise") || raw.includes("business")) return "enterprise";
  if (raw.includes("gold") || raw.includes("professional") || raw.includes("pro")) return "professional";
  if (raw.includes("bronze") || raw.includes("basic") || raw.includes("free")) return "bronze";
  return "bronze";
}

interface Props {
  currentUser: SafeUser;
}

const SubscriptionClient: React.FC<Props> = ({ currentUser }) => {
  const router = useRouter();
  const { update } = useSession();
  const [billing, setBilling] = useState<Billing>("monthly");
  const [saving, setSaving] = useState(false);
  const [hasProcessedPayment, setHasProcessedPayment] = useState(false);
  const [searchParams] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search);
    }
    return new URLSearchParams();
  });
  const isOnboarding = searchParams.get('onboarding') === 'true';
  const status = searchParams.get('status');
  const sessionId = searchParams.get('session_id');

  // Handle payment success and redirect to discover during onboarding
  useEffect(() => {
    // Don't process if already processed
    if (hasProcessedPayment) return;

    const handlePaymentSuccess = async () => {
      if (status === 'success' && sessionId && isOnboarding) {
        setHasProcessedPayment(true);

        try {
          // Update session to get latest subscription info
          await update();

          // Refresh to get updated user data
          router.refresh();

          // Show success message and redirect to discover
          toast.success("Subscription activated! Welcome to ForMe.");

          setTimeout(() => {
            router.push('/');
          }, 1000);
        } catch (error) {
          console.error('Error updating session after payment:', error);
          // Still redirect even if there's an error
          setTimeout(() => {
            router.push('/');
          }, 1000);
        }
      } else if (status === 'cancelled' && isOnboarding && !hasProcessedPayment) {
        setHasProcessedPayment(true);
        toast.error("Payment cancelled. You can try again or continue with Bronze.");
      }
    };

    handlePaymentSuccess();
  }, [status, sessionId, isOnboarding, router, update, hasProcessedPayment]);

  const plans = [
    {
      id: "bronze",
      name: "Bronze",
      price: { monthly: 0, yearly: 0 },
      badge: null,
      features: ["Core app access", "Post content", "Basic profile", "View professionals"],
      cta: "Get Started"
    },
    {
      id: "gold", 
      name: "Gold",
      price: { monthly: 29, yearly: 290 },
      badge: "Most Popular",
      features: ["Everything in Bronze", "ForMe Cash credit", "Member discounts", "Lead access", "Professional scheduling"],
      cta: "Upgrade to Gold"
    },
    {
      id: "platinum",
      name: "Platinum", 
      price: { monthly: 99, yearly: 990 },
      badge: null,
      features: ["Everything in Gold", "Multi-user management", "Advanced analytics", "Team tools", "Priority support"],
      cta: "Go Enterprise"
    }
  ];

  const dbValue = (currentUser?.subscriptionTier || "bronze").toLowerCase();
  const currentPlan = useMemo(() => {
    if (dbValue.includes("platinum")) return "platinum";
    if (dbValue.includes("gold")) return "gold"; 
    return "bronze";
  }, [dbValue]);

  const handleSelect = async (planId: string) => {
    if (planId === "platinum") {
      window.location.href = "/contact";
      return;
    }

    try {
      setSaving(true);

      if (planId === "bronze") {
        await axios.post("/api/subscription/select", { plan: "Bronze", interval: billing });
        toast.success("Bronze plan selected");

        // Force refresh to update session with new subscription
        router.refresh();

        // If onboarding, redirect to discover page after a short delay
        if (isOnboarding) {
          setTimeout(() => {
            toast.success("Welcome to ForMe! Let's explore.");
            router.push('/');
          }, 800);
        }
        return;
      }

      const res = await axios.post("/api/subscription/checkout", {
        planId: planId as "gold",
        interval: billing,
        // Pass onboarding flag so we can redirect properly after payment
        metadata: { isOnboarding: isOnboarding ? 'true' : 'false' }
      });

      const { sessionId } = res.data || {};
      if (!sessionId) {
        toast.error("Failed to create checkout session");
        return;
      }

      const { loadStripe } = await import("@stripe/stripe-js");
      const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

      if (!publishableKey) {
        toast.error("Stripe configuration error. Please contact support.");
        return;
      }

      const stripe = await loadStripe(publishableKey);
      if (!stripe) {
        toast.error("Failed to load payment system. Please try again.");
        return;
      }

      // Redirect to Stripe checkout - after payment, they'll come back to success URL
      await stripe.redirectToCheckout({ sessionId });
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Clean Header - matches Market page */}
      <div className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 md:px-24 pt-12 pb-8">
          <div className="text-center">
            {isOnboarding && (
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">Step 2 of 2</p>
            )}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
              {isOnboarding ? "Choose Your Plan" : "Subscription"}
            </h1>
            <p className="text-gray-500 text-base mt-3 max-w-2xl mx-auto">
              {isOnboarding
                ? "Start free, upgrade as you grow"
                : <>You&apos;re on <span className="font-semibold text-gray-900">{cleanLabel(currentUser?.subscriptionTier)}</span>. Change plans anytime.</>
              }
            </p>
          </div>

          {/* Billing Toggle - matches Analytics tab style */}
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setBilling("monthly")}
                className={`
                  px-4 py-1.5 text-[13px] font-medium rounded-xl border transition-all duration-300 ease-out active:scale-[0.97]
                  ${billing === 'monthly'
                    ? 'bg-[#60A5FA] border-[#60A5FA] text-white shadow-md shadow-[#60A5FA]/25'
                    : 'bg-transparent border-neutral-300 text-neutral-500 hover:border-[#60A5FA] hover:text-[#60A5FA] hover:bg-[#60A5FA]/5'
                  }
                `}
              >
                Monthly
              </button>
              <button
                onClick={() => setBilling("yearly")}
                className={`
                  px-4 py-1.5 text-[13px] font-medium rounded-xl border transition-all duration-300 ease-out active:scale-[0.97]
                  ${billing === 'yearly'
                    ? 'bg-[#60A5FA] border-[#60A5FA] text-white shadow-md shadow-[#60A5FA]/25'
                    : 'bg-transparent border-neutral-300 text-neutral-500 hover:border-[#60A5FA] hover:text-[#60A5FA] hover:bg-[#60A5FA]/5'
                  }
                `}
              >
                Yearly
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-24 py-12">
        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const price = billing === "monthly" ? plan.price.monthly : plan.price.yearly;
            const isCurrentPlan = currentPlan === plan.id;
            const isPopular = plan.badge === "Most Popular";

            return (
              <div
                key={plan.id}
                className={`group relative rounded-2xl border p-8 transition-all duration-300 ${
                  isPopular
                    ? "bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl scale-[1.02]"
                    : isCurrentPlan
                    ? "bg-white border-gray-200 shadow-sm"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-gray-700 to-gray-600 text-white px-4 py-1.5 rounded-full text-[10px] font-medium tracking-wide uppercase shadow-lg">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${isPopular ? 'text-gray-400' : 'text-gray-400'}`}>
                    {plan.name}
                  </h3>
                  <div className="mb-1">
                    <span className={`text-4xl font-semibold tracking-tight ${isPopular ? 'text-white' : 'text-gray-900'}`}>
                      {price === 0 ? "Free" : `$${price}`}
                    </span>
                    {price > 0 && (
                      <span className={`text-sm ml-1.5 ${isPopular ? 'text-gray-400' : 'text-gray-400'}`}>
                        /{billing === "yearly" ? "yr" : "mo"}
                      </span>
                    )}
                  </div>
                  {billing === "yearly" && price > 0 && (
                    <p className={`text-[11px] font-medium ${isPopular ? 'text-gray-300' : 'text-gray-500'}`}>
                      Save ${(plan.price.monthly * 12) - plan.price.yearly} annually
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className={`flex items-start text-[13px] ${isPopular ? 'text-gray-300' : 'text-gray-600'}`}>
                      <CheckmarkCircle02Icon size={14} color={isPopular ? '#d1d5db' : '#9ca3af'} className="mr-2.5 flex-shrink-0 mt-0.5" strokeWidth={2} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelect(plan.id)}
                  disabled={saving || isCurrentPlan}
                  className={`w-full py-3 px-5 rounded-lg font-medium text-[13px] transition-all duration-200 flex items-center justify-center gap-2 ${
                    isPopular
                      ? "bg-white text-gray-900 hover:bg-gray-100"
                      : isCurrentPlan
                      ? "bg-gray-100 text-gray-500 cursor-default border border-gray-200"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  {saving ? (
                    "Processing..."
                  ) : isCurrentPlan ? (
                    <>
                      <CheckmarkCircle02Icon size={14} strokeWidth={2} />
                      Current Plan
                    </>
                  ) : (
                    <>
                      {plan.cta}
                      <ArrowRight01Icon size={14} strokeWidth={2} />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="border-t border-gray-100 bg-gray-50/30">
        <div className="max-w-7xl mx-auto px-6 md:px-24 py-12">
          <FeatureComparison />
        </div>
      </div>
    </div>
  );
};

export default SubscriptionClient;