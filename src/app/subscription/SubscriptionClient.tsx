// app/subscription/SubscriptionClient.tsx
'use client';

import { useMemo, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { SafeUser } from "@/app/types";
import FeatureComparison from "@/components/subscription/FeatureComparison";
import { Check, ArrowRight } from "lucide-react";
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
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      if (!stripe) throw new Error("Stripe failed to load");

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
      {/* Clean Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-8 lg:px-12 pt-16 pb-16">
          <div className="text-center max-w-2xl mx-auto">
            {isOnboarding && (
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-6">Step 2 of 2</p>
            )}
            <h1 className="text-4xl font-semibold tracking-tight text-gray-900 mb-4">
              {isOnboarding ? "Choose Your Plan" : "Plans that scale with your business"}
            </h1>
            <p className="text-base text-gray-500">
              {isOnboarding
                ? "Start free, upgrade as you grow"
                : <>You're on <span className="font-semibold text-gray-900">{cleanLabel(currentUser?.subscriptionTier)}</span>. Change plans anytime.</>
              }
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mt-12">
            <div className="inline-flex items-center gap-3">
              <button
                onClick={() => setBilling("monthly")}
                className={`px-6 py-3 rounded-xl border text-sm font-semibold tracking-tight transition-all duration-200 flex items-center gap-2 ${
                  billing === "monthly"
                    ? "bg-white border-gray-300 text-gray-900 shadow-sm"
                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-900"
                }`}
              >
                Monthly
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-500 text-white">
                  No Lock-In
                </span>
              </button>
              <button
                onClick={() => setBilling("yearly")}
                className={`px-6 py-3 rounded-xl border text-sm font-semibold tracking-tight transition-all duration-200 flex items-center gap-2 ${
                  billing === "yearly"
                    ? "bg-white border-gray-300 text-gray-900 shadow-sm"
                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-900"
                }`}
              >
                Yearly
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-green-500 text-white">
                  Save 17%
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="max-w-6xl mx-auto px-8 lg:px-12 py-16">
        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const price = billing === "monthly" ? plan.price.monthly : plan.price.yearly;
            const isCurrentPlan = currentPlan === plan.id;
            const isPopular = plan.badge === "Most Popular";

            return (
              <div
                key={plan.id}
                className={`group relative rounded-xl border p-8 transition-all duration-300 ${
                  isPopular
                    ? "bg-gray-50 border-gray-300 shadow-lg scale-[1.02]"
                    : isCurrentPlan
                    ? "bg-white border-gray-200"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-2.5 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gray-900 text-white px-3 py-1 rounded-full text-[10px] font-semibold tracking-tight uppercase">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 text-gray-400">
                    {plan.name}
                  </h3>
                  <div className="mb-1">
                    <span className="text-4xl font-semibold tracking-tight text-gray-900">
                      {price === 0 ? "Free" : `$${price}`}
                    </span>
                    {price > 0 && (
                      <span className="text-sm ml-1.5 text-gray-400">
                        /{billing === "yearly" ? "yr" : "mo"}
                      </span>
                    )}
                  </div>
                  {billing === "yearly" && price > 0 && (
                    <p className="text-[11px] font-medium text-green-600">
                      Save ${(plan.price.monthly * 12) - plan.price.yearly} annually
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-[13px] text-gray-600">
                      <Check className="w-3.5 h-3.5 mr-2.5 flex-shrink-0 mt-0.5 text-gray-900" strokeWidth={2.5} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelect(plan.id)}
                  disabled={saving || isCurrentPlan}
                  className={`w-full py-3 px-5 rounded-lg font-semibold text-[13px] tracking-tight transition-all duration-200 flex items-center justify-center gap-2 ${
                    isCurrentPlan
                      ? "bg-gray-900 text-white cursor-default"
                      : "bg-gray-900 text-white hover:bg-black"
                  }`}
                >
                  {saving ? (
                    "Processing..."
                  ) : isCurrentPlan ? (
                    <>
                      <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                      Current Plan
                    </>
                  ) : (
                    <>
                      {plan.cta}
                      <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
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
        <div className="max-w-6xl mx-auto px-8 lg:px-12 py-16">
          <FeatureComparison />
        </div>
      </div>
    </div>
  );
};

export default SubscriptionClient;