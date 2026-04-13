'use client';

import React, { useMemo, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { SafeUser } from "@/app/types";
import FeatureComparison from "@/components/subscription/FeatureComparison";
import { CheckmarkCircle02Icon, ArrowRight01Icon } from "hugeicons-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";
import Celebration from "@/components/Celebration";

function cleanLabel(label?: string | null) {
  const raw = String(label || "Freemium").replace(/\s*\(.*\)\s*$/, "").trim();
  // Legacy "Bronze" tier in the DB is the same thing as today's "Freemium".
  const normalized = raw.toLowerCase() === "bronze" ? "Freemium" : raw;
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

interface Props {
  currentUser: SafeUser;
}

// Pricing 2.0 — see /Pricing 2.0.pdf
// Plan ids ("bronze" / "gold" / "platinum") are kept stable for backward
// compatibility with the checkout API and existing DB rows. Display name
// for "bronze" is now "Freemium".
const plans = [
  {
    id: "bronze",
    name: "Freemium",
    price: { monthly: 0, yearly: 0 },
    badge: null,
    features: [
      "Full platform access",
      "Professional profile & storefront",
      "Marketing tools",
      "Video content posting",
      "Online booking",
      "Stripe payment processing",
    ],
    fees: "Tiered transaction fees (7% / 5% / 3%)",
    cta: "Get Started",
  },
  {
    id: "gold",
    name: "Gold",
    price: { monthly: 30, yearly: 300 },
    badge: "Most Popular",
    features: [
      "Everything in Freemium",
      "SEO tools",
      "Business analytics dashboard",
    ],
    fees: "$0 transaction fees",
    cta: "Upgrade to Gold",
  },
  {
    id: "platinum",
    name: "Platinum",
    price: { monthly: 100, yearly: 1000 },
    badge: null,
    features: [
      "Everything in Gold",
      "$200 ForMe marketing credits",
      "Run promotions inside marketplace",
    ],
    fees: "$0 transaction fees",
    cta: "Upgrade to Platinum",
  },
];

const SubscriptionClient: React.FC<Props> = ({ currentUser }) => {
  const router = useRouter();
  const { update } = useSession();
  const [billing, setBilling] = useState("monthly" as "monthly" | "yearly");
  const [saving, setSaving] = useState(false);
  const [hasProcessedPayment, setHasProcessedPayment] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [searchParams] = useState(() => {
    if (typeof window !== 'undefined') return new URLSearchParams(window.location.search);
    return new URLSearchParams();
  });
  const isOnboarding = searchParams.get('onboarding') === 'true';
  const status = searchParams.get('status');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (hasProcessedPayment) return;
    const handlePaymentSuccess = async () => {
      if (status === 'success' && sessionId && isOnboarding) {
        setHasProcessedPayment(true);
        try {
          await update();
          router.refresh();
          setShowCelebration(true);
        } catch {
          setShowCelebration(true);
        }
      } else if (status === 'cancelled' && isOnboarding && !hasProcessedPayment) {
        setHasProcessedPayment(true);
        toast.error("Payment cancelled. You can try again or continue with Bronze.");
      }
    };
    handlePaymentSuccess();
  }, [status, sessionId, isOnboarding, router, update, hasProcessedPayment]);

  const dbValue = (currentUser?.subscriptionTier || "bronze").toLowerCase();
  const currentPlan = useMemo(() => {
    if (dbValue.includes("platinum")) return "platinum";
    if (dbValue.includes("gold")) return "gold";
    return "bronze";
  }, [dbValue]);

  const handleSelect = async (planId: string) => {
    try {
      setSaving(true);
      if (planId === "bronze") {
        await axios.post("/api/subscription/select", { plan: "Bronze", interval: billing });
        router.refresh();
        if (isOnboarding) {
          setShowCelebration(true);
        } else {
          toast.success("Bronze plan selected");
        }
        return;
      }
      const res = await axios.post("/api/subscription/checkout", {
        planId: planId,
        interval: billing,
        metadata: { isOnboarding: isOnboarding ? 'true' : 'false' }
      });
      const sid = res.data?.sessionId;
      if (!sid) { toast.error("Failed to create checkout session"); return; }
      const { loadStripe } = await import("@stripe/stripe-js");
      const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      if (!pk) { toast.error("Stripe configuration error."); return; }
      const stripe = await loadStripe(pk);
      if (!stripe) { toast.error("Failed to load payment system."); return; }
      await stripe.redirectToCheckout({ sessionId: sid });
    } catch (err) {
      toast.error((err as any)?.response?.data?.error || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleCelebrationComplete = useCallback(() => {
    // Hard navigation to guarantee the Celebration overlay fully unmounts.
    // router.push('/') can leave the fixed z-[9999] overlay stuck during
    // Next.js client-side transitions, resulting in a white screen.
    window.location.href = '/';
  }, []);

  if (showCelebration) {
    return <Celebration onComplete={handleCelebrationComplete} userName={currentUser?.name?.split(' ')[0]} />;
  }

  return (
    <Container>
      <PageHeader currentUser={currentUser} currentPage="Subscription" />
      <div className="mt-8">
        <div className="mb-8">
          {isOnboarding && <p className="text-[12px] text-stone-400 mb-2">Step 2 of 2</p>}
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">
            {isOnboarding ? "Choose Your Plan" : "Subscription"}
          </h1>
          <p className="text-[14px] text-stone-400 mt-1">
            {isOnboarding
              ? "Start free, upgrade as you grow"
              : <>You&apos;re on <span className="font-semibold text-stone-900">{cleanLabel(currentUser?.subscriptionTier)}</span>. Change plans anytime.</>}
          </p>
        </div>
        <div className="flex items-center gap-2 mb-8">
          {(["monthly", "yearly"] as const).map((b) => (
            <button key={b} onClick={() => setBilling(b)} className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all whitespace-nowrap ${billing === b ? 'bg-stone-900 text-white' : 'bg-stone-50 text-stone-500 hover:bg-stone-100 border border-stone-200/60'}`}>
              {b === 'monthly' ? 'Monthly' : 'Yearly'}
            </button>
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-5 pb-12">
          {plans.map((plan) => {
            const price = billing === "monthly" ? plan.price.monthly : plan.price.yearly;
            const isCurrent = currentPlan === plan.id;
            const isPopular = plan.badge === "Most Popular";
            return (
              <div key={plan.id} className={`group relative rounded-2xl border p-6 transition-all duration-300 ${isPopular ? "bg-stone-900 border-stone-800 shadow-xl" : isCurrent ? "bg-white border-stone-200/60 shadow-sm" : "bg-white border-stone-200/60 hover:border-stone-300 hover:-translate-y-0.5 hover:shadow-lg"}`}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-stone-700 text-white px-4 py-1 rounded-full text-[10px] font-medium tracking-wide">{plan.badge}</span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-[12px] text-stone-400 mb-3">{plan.name}</h3>
                  <div className="mb-1">
                    <span className={`text-[32px] font-bold tracking-tight tabular-nums ${isPopular ? 'text-white' : 'text-stone-900'}`}>
                      {price === 0 ? "Free" : `$${price}`}
                    </span>
                    {price > 0 && <span className="text-[13px] ml-1.5 text-stone-400">/{billing === "yearly" ? "yr" : "mo"}</span>}
                  </div>
                  {billing === "yearly" && price > 0 && (
                    <p className={`text-[11px] font-medium ${isPopular ? 'text-emerald-400' : 'text-emerald-600'}`}>Save ${(plan.price.monthly * 12) - plan.price.yearly}/yr</p>
                  )}
                  <p className={`text-[11px] mt-2 ${isPopular ? 'text-stone-400' : 'text-stone-500'}`}>
                    {plan.fees}
                  </p>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className={`flex items-start text-[13px] ${isPopular ? 'text-stone-300' : 'text-stone-500'}`}>
                      <CheckmarkCircle02Icon size={14} color="#a8a29e" className="mr-2.5 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSelect(plan.id)}
                  disabled={saving || isCurrent}
                  className={`w-full py-3 px-5 rounded-xl font-medium text-[13px] transition-all duration-200 flex items-center justify-center gap-2 ${isPopular ? "bg-white text-stone-900 hover:bg-stone-50" : isCurrent ? "bg-stone-50 text-stone-400 cursor-default border border-stone-200/60" : "bg-stone-900 text-white hover:bg-stone-800"}`}
                  style={!isCurrent ? { boxShadow: '0 2px 8px rgba(0,0,0,0.12)' } : undefined}
                >
                  {saving ? "Processing..." : isCurrent ? (<><CheckmarkCircle02Icon size={14} strokeWidth={1.5} /> Current Plan</>) : (<>{plan.cta} <ArrowRight01Icon size={14} strokeWidth={1.5} /></>)}
                </button>
              </div>
            );
          })}
        </div>
        <p className="text-center text-[11px] text-stone-400 pb-6">
          By selecting a plan, you agree to the ForMe{' '}
          <a href="/terms" target="_blank" className="underline hover:text-stone-600">Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" target="_blank" className="underline hover:text-stone-600">Privacy Policy</a>.
        </p>
        <div className="pt-8 border-t border-stone-100">
          <FeatureComparison />
        </div>
      </div>
    </Container>
  );
};

export default SubscriptionClient;
