'use client';

import React, { useMemo, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { SafeUser } from "@/app/types";
import FeatureComparison from "@/components/subscription/FeatureComparison";
import { CheckmarkCircle02Icon, ArrowRight01Icon, Cancel01Icon } from "hugeicons-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/ui/Button";
import Celebration from "@/components/Celebration";

function cleanLabel(label?: string | null) {
  const raw = String(label || "Freemium").replace(/\s*\(.*\)\s*$/, "").trim();
  const normalized = raw.toLowerCase() === "bronze" ? "Freemium" : raw;
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

interface Props {
  currentUser: SafeUser;
}

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
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showChangeConfirm, setShowChangeConfirm] = useState<{ planId: string; interval: string } | null>(null);
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

  const isActiveSubscriber = currentUser?.isSubscribed &&
    ['active', 'trialing', 'past_due'].includes(currentUser?.subscriptionStatus || '');

  const isCanceling = currentUser?.subscriptionStatus === 'active' &&
    currentUser?.stripeSubscriptionId != null;

  const handleSelect = async (planId: string) => {
    try {
      setSaving(true);

      // If user has an active paid subscription and is switching plans
      if (isActiveSubscriber && planId !== "bronze" && planId !== currentPlan) {
        setShowChangeConfirm({ planId, interval: billing });
        setSaving(false);
        return;
      }

      if (planId === "bronze") {
        if (isActiveSubscriber) {
          // Show cancel confirmation instead of immediate downgrade
          setShowCancelConfirm(true);
          setSaving(false);
          return;
        }
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

  const handleCancel = async () => {
    try {
      setSaving(true);
      const res = await axios.post("/api/subscription/cancel");
      const endDate = res.data?.currentPeriodEnd;
      setShowCancelConfirm(false);
      toast.success(
        endDate
          ? `Subscription cancelled. You have access until ${new Date(endDate).toLocaleDateString()}.`
          : "Subscription cancelled."
      );
      router.refresh();
    } catch (err) {
      toast.error((err as any)?.response?.data?.error || "Failed to cancel subscription");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePlan = async () => {
    if (!showChangeConfirm) return;
    try {
      setSaving(true);
      const res = await axios.post("/api/subscription/change", {
        planId: showChangeConfirm.planId,
        interval: showChangeConfirm.interval,
      });
      setShowChangeConfirm(null);
      toast.success(`Switched to ${res.data?.plan} (${res.data?.interval})`);
      router.refresh();
    } catch (err) {
      toast.error((err as any)?.response?.data?.error || "Failed to change plan");
    } finally {
      setSaving(false);
    }
  };

  const handleBillingPortal = async () => {
    try {
      setSaving(true);
      const res = await axios.post("/api/subscription/portal");
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      toast.error((err as any)?.response?.data?.error || "Failed to open billing portal");
    } finally {
      setSaving(false);
    }
  };

  const handleCelebrationComplete = useCallback(() => {
    window.location.href = '/';
  }, []);

  if (showCelebration) {
    return <Celebration onComplete={handleCelebrationComplete} userName={currentUser?.name?.split(' ')[0]} />;
  }

  const currentPlanData = plans.find((p) => p.id === currentPlan);

  return (
    <Container>
      <PageHeader currentUser={currentUser} currentPage="Subscription" />
      <div className="mt-8">
        <div className="mb-8">
          {isOnboarding && <p className="text-[12px] text-stone-400 dark:text-stone-500 mb-2">Step 2 of 2</p>}
          <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">
            {isOnboarding ? "Choose Your Plan" : "Subscription"}
          </h1>
          <p className="text-[14px] text-stone-400 dark:text-stone-500 mt-1">
            {isOnboarding
              ? "Start free, upgrade as you grow"
              : <>You&apos;re on <span className="font-semibold text-stone-900 dark:text-stone-100">{cleanLabel(currentUser?.subscriptionTier)}</span>. Change plans anytime.</>}
          </p>
        </div>

        {/* Active subscription management card */}
        {isActiveSubscriber && !isOnboarding && (
          <div className="mb-8 rounded-2xl border border-stone-200/60 bg-white dark:bg-stone-900 p-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <p className="text-[11px] font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wide mb-1">Current Plan</p>
                <p className="text-xl font-bold text-stone-900 dark:text-stone-100">{currentPlanData?.name}</p>
                <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-[13px] text-stone-500  dark:text-stone-500">
                  {currentUser?.subscriptionBillingInterval && (
                    <span>Billed {currentUser.subscriptionBillingInterval === 'year' ? 'yearly' : 'monthly'}</span>
                  )}
                  {currentUser?.currentPeriodEnd && (
                    <span>
                      {currentUser.subscriptionStatus === 'active'
                        ? `Renews ${new Date(currentUser.currentPeriodEnd).toLocaleDateString()}`
                        : `Access until ${new Date(currentUser.currentPeriodEnd).toLocaleDateString()}`}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleBillingPortal}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-[12px] font-medium bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200/60 dark:border-stone-700 transition-all"
                >
                  Billing &amp; Invoices
                </button>
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-[12px] font-medium bg-red-50 text-red-600 hover:bg-red-100 border border-red-200/60 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 dark:border-red-500/20 transition-all"
                >
                  Cancel Plan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Billing toggle */}
        <div className="flex items-center gap-2 mb-8">
          {(["monthly", "yearly"] as const).map((b) => (
            <button key={b} onClick={() => setBilling(b)} className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all whitespace-nowrap ${billing === b ? 'bg-gradient-to-br from-stone-800 to-black text-white shadow-[0_1px_3px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.12)]' : 'bg-stone-50  text-stone-500  dark:text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]'}`}>
              {b === 'monthly' ? 'Monthly' : 'Yearly'}
            </button>
          ))}
        </div>

        {/* Plan cards */}
        <div className="grid md:grid-cols-3 gap-5 pb-12">
          {plans.map((plan) => {
            const price = billing === "monthly" ? plan.price.monthly : plan.price.yearly;
            const isCurrent = currentPlan === plan.id;
            const isPopular = plan.badge === "Most Popular";

            // Determine CTA label
            let ctaLabel = plan.cta;
            if (isCurrent) {
              ctaLabel = "Current Plan";
            } else if (isActiveSubscriber && plan.id !== "bronze") {
              ctaLabel = `Switch to ${plan.name}`;
            } else if (plan.id === "bronze" && isActiveSubscriber) {
              ctaLabel = "Downgrade";
            }

            return (
              <div key={plan.id} className={`group relative rounded-2xl border p-6 transition-all duration-300 ${isPopular ? "bg-stone-900 border-stone-800 dark:bg-white dark:border-white shadow-xl" : isCurrent ? "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800 shadow-sm" : "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 hover:-translate-y-0.5 hover:shadow-lg"}`}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-stone-700 text-white px-4 py-1 rounded-full text-[10px] font-medium tracking-wide">{plan.badge}</span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-[12px] text-stone-400 dark:text-stone-500 mb-3">{plan.name}</h3>
                  <div className="mb-1">
                    <span className={`text-[32px] font-bold tracking-tight tabular-nums ${isPopular ? 'text-white dark:text-stone-900' : 'text-stone-900 dark:text-stone-100'}`}>
                      {price === 0 ? "Free" : `$${price}`}
                    </span>
                    {price > 0 && <span className="text-[13px] ml-1.5 text-stone-400 dark:text-stone-500">/{billing === "yearly" ? "yr" : "mo"}</span>}
                  </div>
                  {billing === "yearly" && price > 0 && (
                    <p className={`text-[11px] font-medium ${isPopular ? 'text-emerald-400 dark:text-emerald-600' : 'text-emerald-600'}`}>Save ${(plan.price.monthly * 12) - plan.price.yearly}/yr</p>
                  )}
                  <p className={`text-[11px] mt-2 ${isPopular ? 'text-stone-400 dark:text-stone-500' : 'text-stone-500 dark:text-stone-400'}`}>
                    {plan.fees}
                  </p>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className={`flex items-start text-[13px] ${isPopular ? 'text-stone-300 dark:text-stone-600' : 'text-stone-500 dark:text-stone-400'}`}>
                      <CheckmarkCircle02Icon size={14} color="#a8a29e" className="mr-2.5 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSelect(plan.id)}
                  disabled={saving || isCurrent}
                  className={`w-full py-3 px-5 rounded-xl font-medium text-[13px] transition-all duration-200 flex items-center justify-center gap-2 ${isPopular ? "bg-white text-stone-900 hover:bg-stone-50 dark:bg-stone-900 dark:text-white dark:hover:bg-stone-800" : isCurrent ? "bg-stone-50 dark:bg-stone-900 text-stone-400 dark:text-stone-500 cursor-default border border-stone-200/60 dark:border-stone-800" : "bg-stone-900 text-white hover:bg-stone-800 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-100"}`}
                  style={!isCurrent ? { boxShadow: '0 2px 8px rgba(0,0,0,0.12)' } : undefined}
                >
                  {saving ? "Processing..." : isCurrent ? (<><CheckmarkCircle02Icon size={14} strokeWidth={1.5} /> {ctaLabel}</>) : (<>{ctaLabel} <ArrowRight01Icon size={14} strokeWidth={1.5} /></>)}
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-[11px] text-stone-400 dark:text-stone-500 pb-6">
          By selecting a plan, you agree to the ForMe{' '}
          <a href="/terms" target="_blank" className="underline hover:text-stone-600 dark:text-stone-300">Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" target="_blank" className="underline hover:text-stone-600 dark:text-stone-300">Privacy Policy</a>.
        </p>
        <div className="pt-8 border-t border-stone-100 dark:border-stone-800">
          <FeatureComparison />
        </div>
      </div>

      {/* Cancel confirmation overlay */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-[9999] backdrop-blur-sm bg-stone-900/60 flex items-center justify-center p-4" onClick={() => setShowCancelConfirm(false)}>
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <Cancel01Icon className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Cancel Subscription?</h3>
            </div>
            <p className="text-[13px] text-stone-500  dark:text-stone-500 mb-2">
              Your {currentPlanData?.name} plan will remain active until the end of your current billing period
              {currentUser?.currentPeriodEnd && (
                <> ({new Date(currentUser.currentPeriodEnd).toLocaleDateString()})</>
              )}.
            </p>
            <p className="text-[13px] text-stone-500  dark:text-stone-500 mb-6">
              After that, you&apos;ll be downgraded to the Freemium plan and lose access to premium features like analytics and SEO tools.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-3 rounded-xl text-[13px] font-medium bg-stone-50  text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800 border border-stone-200/60 transition-all"
              >
                Keep Plan
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex-1 py-3 rounded-xl text-[13px] font-medium bg-red-600 text-white hover:bg-red-700 transition-all"
              >
                {saving ? "Cancelling..." : "Cancel Subscription"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change plan confirmation overlay */}
      {showChangeConfirm && (
        <div className="fixed inset-0 z-[9999] backdrop-blur-sm bg-stone-900/60 flex items-center justify-center p-4" onClick={() => setShowChangeConfirm(null)}>
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">Change Plan</h3>
            <p className="text-[13px] text-stone-500  dark:text-stone-500 mb-2">
              Switch from <span className="font-semibold text-stone-900 dark:text-stone-100">{currentPlanData?.name}</span> to{' '}
              <span className="font-semibold text-stone-900 dark:text-stone-100">{plans.find(p => p.id === showChangeConfirm.planId)?.name}</span>{' '}
              ({showChangeConfirm.interval})?
            </p>
            <p className="text-[13px] text-stone-500  dark:text-stone-500 mb-6">
              The price difference will be prorated to your current billing cycle. Your new plan starts immediately.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowChangeConfirm(null)}
                className="flex-1 py-3 rounded-xl text-[13px] font-medium bg-stone-50  text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800 border border-stone-200/60 transition-all"
              >
                Never Mind
              </button>
              <Button
                onClick={handleChangePlan}
                loading={saving}
                fullWidth
                size="lg"
              >
                {saving ? "Switching..." : "Confirm Switch"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default SubscriptionClient;
