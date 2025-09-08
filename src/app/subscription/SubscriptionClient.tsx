// app/subscription/SubscriptionClient.tsx
'use client';

import { useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { SafeUser } from "@/app/types";
import FeatureComparison from "@/components/subscription/FeatureComparison";
import { Check, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

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
  const [billing, setBilling] = useState<Billing>("monthly");
  const [saving, setSaving] = useState(false);

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
        router.refresh();
        return;
      }

      const res = await axios.post("/api/subscription/checkout", {
        planId: planId as "gold",
        interval: billing,
      });

      const { sessionId } = res.data || {};
      if (!sessionId) {
        toast.error("Failed to create checkout session");
        return;
      }

      const { loadStripe } = await import("@stripe/stripe-js");
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      if (!stripe) throw new Error("Stripe failed to load");

      await stripe.redirectToCheckout({ sessionId });
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Simple, transparent pricing
        </h1>
        <p className="text-xl text-gray-600">
          Currently on <span className="font-semibold">{cleanLabel(currentUser?.subscriptionTier)}</span>
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center mb-12">
        <div className="bg-gray-100 p-1 rounded-full">
          <button
            onClick={() => setBilling("monthly")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              billing === "monthly" 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("yearly")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              billing === "yearly" 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Yearly <span className="text-green-600 ml-1">17% off</span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {plans.map((plan) => {
          const price = billing === "monthly" ? plan.price.monthly : plan.price.yearly;
          const isCurrentPlan = currentPlan === plan.id;
          const isPopular = plan.badge === "Most Popular";

          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl border p-8 transition-all hover:shadow-lg ${
                isPopular 
                  ? "border-blue-500 shadow-lg scale-105" 
                  : isCurrentPlan
                  ? "border-green-500"
                  : "border-gray-200"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {price === 0 ? "Free" : `$${price}`}
                  </span>
                  {price > 0 && (
                    <span className="text-gray-600 ml-1">
                      /{billing === "yearly" ? "year" : "month"}
                    </span>
                  )}
                </div>
                {billing === "yearly" && price > 0 && (
                  <p className="text-sm text-green-600 font-medium">
                    Save ${(plan.price.monthly * 12) - plan.price.yearly}/year
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelect(plan.id)}
                disabled={saving || isCurrentPlan}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  isCurrentPlan
                    ? "bg-green-100 text-green-800 cursor-default"
                    : isPopular
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
              >
                {saving ? (
                  "Processing..."
                ) : isCurrentPlan ? (
                  "Current Plan"
                ) : (
                  <>
                    {plan.cta}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison */}
      <FeatureComparison />
    </div>
  );
};

export default SubscriptionClient;