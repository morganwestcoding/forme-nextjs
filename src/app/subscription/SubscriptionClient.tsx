// app/subscription/SubscriptionClient.tsx
'use client';

import { useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { SafeUser } from "@/app/types";
import Heading from "@/components/Heading";
import { Check, Star, ChevronRight, ChevronLeft, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import FeatureComparison from "@/components/subscription/FeatureComparison";

type Billing = "monthly" | "yearly";

function cleanLabel(label?: string | null) {
  const cleaned = String(label || "Quartz").replace(/\s*\(.*\)\s*$/, "").trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

// Keep your server contract buckets: 'bronze' (free), 'professional' (paid), 'enterprise'
function canonicalize(label: string) {
  const raw = (label || "").toLowerCase();
  if (raw.includes("diamond") || raw.includes("enterprise")) return "enterprise";
  if (raw.includes("pearl") || raw.includes("civilian")) return "professional";
  if (raw.includes("sapphire") || raw.includes("ruby") || raw.includes("emerald")) return "professional";
  if (raw.includes("quartz") || raw.includes("basic")) return "bronze";
  // back-compat with old metals
  if (raw.includes("silver") || raw.includes("gold") || raw.includes("platinum") || raw.includes("professional") || /\bpro\b/.test(raw)) return "professional";
  if (raw.includes("bronze")) return "bronze";
  return "bronze";
}

interface Props {
  currentUser: SafeUser;
}

const SubscriptionClient: React.FC<Props> = ({ currentUser }) => {
  const router = useRouter();

  const [billing, setBilling] = useState<Billing>("monthly");
  const [detailPlanId, setDetailPlanId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const plans = [
    {
      id: "quartz",
      title: "Quartz (Basic)",
      badge: null as string | null,
      categoryPill: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200", label: "Basic" },
      monthly: 0,
      yearly: 0,
      gradient: "from-gray-50 to-white",
      ringColor: "ring-gray-300",
      listAccent: "hover:bg-gray-50",
      popular: false,
      features: [
        { title: "Core App Access", desc: "Browse & make basic bookings" },
        { title: "Simple Profile", desc: "Basic profile tools" },
        { title: "View Professionals", desc: "Discover local pros" },
        { title: "Standard Support", desc: "Email within 24–48h" },
      ],
      blurb: "Explore ForMe and get comfortable before upgrading.",
    },
    {
      id: "pearl",
      title: "Pearl (Civilians)",
      badge: "Member Perks",
      categoryPill: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", label: "Civilians" },
      monthly: 14.99,
      yearly: 14.99 * 12 * 0.8,
      gradient: "from-rose-50 to-white",
      ringColor: "ring-rose-300",
      listAccent: "hover:bg-rose-50",
      popular: false,
      features: [
        { title: "Member Discounts", desc: "Exclusive savings on services" },
        { title: "ForMe Cash Credit", desc: "Monthly wallet credit to spend" },
        { title: "Cadence Scheduling", desc: "Recurring bookings & reminders" },
        { title: "Perk Drops", desc: "Seasonal boosts & partner perks" },
      ],
      blurb: "For everyday users who want savings, credits, and effortless routine scheduling.",
    },
    {
      id: "sapphire",
      title: "Sapphire (Pro Tier 1)",
      badge: "Great Value",
      categoryPill: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "Professional" },
      monthly: 29.99,
      yearly: 29.99 * 12 * 0.8,
      gradient: "from-blue-50 to-white",
      ringColor: "ring-blue-300",
      listAccent: "hover:bg-blue-50",
      popular: false,
      features: [
        { title: "Profile Tools", desc: "Post photos & manage services" },
        { title: "Leads Access", desc: "See potential customers" },
        { title: "Pro QR Code", desc: "Scannable profile" },
        { title: "Listing Boost", desc: "Slight search boost" },
      ],
      blurb: "Kickstart your professional presence with essential tools and visibility.",
    },
    {
      id: "ruby",
      title: "Ruby (Pro Tier 2)",
      badge: "Most Popular",
      categoryPill: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "Featured Professional" },
      monthly: 59.99,
      yearly: 59.99 * 12 * 0.8,
      gradient: "from-red-50 to-white",
      ringColor: "ring-red-300",
      listAccent: "hover:bg-red-50",
      popular: true,
      features: [
        { title: "Featured Placement", desc: "Be seen by more customers" },
        { title: "Expanded Reach", desc: "Higher local exposure" },
        { title: "Advanced Profile", desc: "Reels & galleries" },
        { title: "Lead Insights", desc: "Better analytics on views" },
      ],
      blurb: "Level up your reach and visibility to get discovered faster.",
    },
    {
      id: "emerald",
      title: "Emerald (Pro Tier 3)",
      badge: "Premium",
      categoryPill: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Premium Professional" },
      monthly: 99.99,
      yearly: 99.99 * 12 * 0.8,
      gradient: "from-emerald-50 to-white",
      ringColor: "ring-emerald-300",
      listAccent: "hover:bg-emerald-50",
      popular: false,
      features: [
        { title: "Priority Placement", desc: "Top-tier visibility" },
        { title: "Guaranteed Leads", desc: "Up to 8 monthly prospects" },
        { title: "Premium Support", desc: "Faster human support" },
        { title: "Advanced Growth Tools", desc: "Extra pro features" },
      ],
      blurb: "For serious pros who want maximum exposure and concierge assistance.",
    },
    {
      id: "diamond",
      title: "Diamond (Enterprise)",
      badge: "Custom",
      categoryPill: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", label: "Enterprise" },
      monthly: 0,
      yearly: 0,
      gradient: "from-indigo-50 to-white",
      ringColor: "ring-indigo-300",
      listAccent: "hover:bg-indigo-50",
      popular: false,
      features: [
        { title: "Multi-User Access", desc: "Team management" },
        { title: "Analytics & Insights", desc: "Advanced reporting" },
        { title: "Premium Support", desc: "24/7 dedicated team" },
        { title: "Advertising", desc: "Sponsored listings & promos" },
      ],
      blurb: "Tailored for organizations—multi-seat access, analytics, priority support, and more.",
    },
  ];

  // Detect user's current plan (supports old metal names too)
  const dbValue = (currentUser?.subscriptionTier || "quartz (basic)").toLowerCase();
  const initialPlanId = useMemo(() => {
    if (dbValue.includes("quartz") || dbValue.includes("basic") || dbValue.includes("bronze")) return "quartz";
    if (dbValue.includes("pearl") || dbValue.includes("civilian")) return "pearl";
    if (dbValue.includes("sapphire") || dbValue.includes("silver")) return "sapphire";
    if (dbValue.includes("ruby") || dbValue.includes("gold")) return "ruby";
    if (dbValue.includes("emerald") || dbValue.includes("platinum")) return "emerald";
    if (dbValue.includes("diamond") || dbValue.includes("enterprise")) return "diamond";
    return "quartz";
  }, [dbValue]);

  const [selectedPlanId, setSelectedPlanId] = useState<string>(initialPlanId);

  const priceFor = (p: typeof plans[number]) => (billing === "monthly" ? p.monthly : p.yearly);
  const formatPrice = (n: number, planId: string) => (planId === "diamond" ? "Custom" : n === 0 ? "Free" : `$${n.toFixed(0)}`);
  const planById = (id: string) => plans.find((p) => p.id === id)!;

  const handleChoose = (planId: string) => {
    setSelectedPlanId(planId);
    setDetailPlanId(planId);
  };

  const confirmSelection = async () => {
    if (!detailPlanId) return;
    const chosen = planById(detailPlanId);
    try {
      setSaving(true);
      await axios.post("/api/subscription/select", { plan: chosen.title });
      const label = cleanLabel(chosen.title);
      const canon = canonicalize(chosen.title);
      const isPaid = canon !== "bronze";
      toast.success(`${label} ${isPaid ? "activated" : "selected"}.`);
      setDetailPlanId(null);
      setSelectedPlanId(chosen.id);
      router.refresh();
    } catch (e: any) {
      toast.error(e?.response?.data || "Failed to update subscription.");
    } finally {
      setSaving(false);
    }
  };

  const currentPlanLabel = cleanLabel(currentUser?.subscriptionTier); // ✅ single declaration

  // Comparison (no hooks inside .map)
  const Comparison = () => {
    const matrix = [
      { feature: "Member Discounts", quartz: "—", pearl: "✓", sapphire: "✓", ruby: "✓", emerald: "✓", diamond: "Custom" },
      { feature: "ForMe Cash (Monthly Credit)", quartz: "—", pearl: "✓", sapphire: "✓", ruby: "✓", emerald: "✓", diamond: "Custom" },
      { feature: "Cadence Scheduling", quartz: "—", pearl: "✓", sapphire: "✓", ruby: "✓", emerald: "✓", diamond: "Custom" },
      { feature: "Featured/Priority Placement", quartz: "—", pearl: "—", sapphire: "—", ruby: "Featured", emerald: "Priority", diamond: "Custom" },
      { feature: "Lead Insights", quartz: "—", pearl: "—", sapphire: "Basic", ruby: "Advanced", emerald: "Advanced", diamond: "Enterprise" },
      { feature: "Support Level", quartz: "Standard", pearl: "Priority", sapphire: "Priority", ruby: "Priority", emerald: "Premium", diamond: "24/7" },
      { feature: "Team Seats", quartz: "1", pearl: "1", sapphire: "1", ruby: "1", emerald: "1–2", diamond: "Multi-user" },
    ];
    return (
<FeatureComparison/>
    );
  };

  // FAQ (single open index; no per-item hooks)
  const FAQ = () => {
    const faqs = [
      { q: "Can I switch between plans?", a: "Yes. Upgrade or downgrade anytime; changes apply next billing cycle." },
      { q: "Do paid plans include ForMe Cash?", a: "Pearl and above include a monthly ForMe Cash credit usable on ForMe services." },
      { q: "What’s Cadence Scheduling?", a: "Set recurring bookings with auto-reminders so your routine services never slip." },
    ];
    const [open, setOpen] = useState<number | null>(null);
    return (
      <section className="mt-16 mb-10">
        <h2 className="text-2xl font-semibold text-center">Frequently Asked Questions</h2>
        <div className="mt-6 max-w-2xl mx-auto space-y-3">
          {faqs.map((f, i) => {
            const active = open === i;
            return (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
                <button
                  className="w-full px-5 py-4 flex items-center justify-between text-left"
                  onClick={() => setOpen(active ? null : i)}
                >
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-slate-500" />
                    <h3 className="text-sm font-medium text-slate-800">{f.q}</h3>
                  </div>
                  <span className={`transition-transform ${active ? "rotate-45" : ""}`}>+</span>
                </button>
                <div className={`px-5 transition-all duration-300 ${active ? "pb-4 max-h-40" : "max-h-0 pb-0 overflow-hidden"}`}>
                  <p className="text-sm text-slate-600">{f.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
          Choose the perfect plan
        </h1>
        <p className="text-slate-600 mt-2">
          Current plan: <span className="font-medium">{currentPlanLabel}</span>
        </p>

        {/* Billing Toggle */}
        <div className="mt-6 inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-white shadow border border-slate-200">
          <span className={`text-sm ${billing === "monthly" ? "text-slate-900 font-medium" : "text-slate-500"}`}>Monthly</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={billing === "yearly"}
              onChange={(e) => setBilling(e.target.checked ? "yearly" : "monthly")}
            />
            <div className="w-12 h-6 bg-slate-200 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-violet-500 transition-colors"></div>
            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-6"></div>
          </label>
          <span className={`text-sm flex items-center gap-2 ${billing === "yearly" ? "text-slate-900 font-medium" : "text-slate-500"}`}>
            Yearly
            <span className={`text-white text-xs px-2 py-0.5 rounded-full ${billing === "yearly" ? "bg-pink-500" : "bg-slate-300"}`}>
              Save 20%
            </span>
          </span>
        </div>
      </header>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-10 border-b border-slate-100">
        {plans.map((p) => {
          const isSelected = selectedPlanId === p.id;
          const price = priceFor(p);
          const priceText = formatPrice(price, p.id);

          return (
            <div
              key={p.id}
              className={`
                group relative rounded-2xl bg-gradient-to-b ${p.gradient} p-0.5
                transition-transform duration-300 hover:-translate-y-1
                ${isSelected ? `ring-2 ${p.ringColor}` : "ring-1 ring-slate-200"}
                shadow-md
              `}
            >
              {p.badge && (
                <div className="absolute -top-3 right-4">
                  <span className="px-3 py-1 text-xs font-medium text-white rounded-full bg-pink-500 shadow">
                    {p.badge}
                  </span>
                </div>
              )}

              <div className="rounded-2xl bg-white p-5 h-full flex flex-col">
                <div className="text-center mb-6">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border ${p.categoryPill.bg} ${p.categoryPill.text} ${p.categoryPill.border}`}>
                    {p.categoryPill.label}
                  </span>
                  <h2 className="text-2xl font-semibold mt-3">{cleanLabel(p.title)}</h2>
                  <div className="mt-2 text-4xl font-bold text-blue-600">
                    {priceText}
                    {p.id !== "diamond" && (
                      <span className="text-base text-slate-500 font-normal">/{billing === "yearly" ? "year" : "mo"}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {p.features.map((f) => (
                    <li key={f.title} className={`flex items-start gap-3 rounded-md px-3 py-2 transition ${p.listAccent}`}>
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-slate-800">{f.title}</div>
                        <div className="text-slate-500">{f.desc}</div>
                      </div>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleChoose(p.id)}
                  className={`
                    w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-white font-semibold
                    transition shadow
                    ${p.popular ? "bg-gradient-to-r from-blue-500 to-violet-500 hover:opacity-95" : "bg-slate-800 hover:bg-slate-900"}
                  `}
                >
                  Choose Plan
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail view */}
      {detailPlanId && (() => {
        const p = planById(detailPlanId);
        const price = priceFor(p);
        const priceText = formatPrice(price, p.id);

        return (
          <div className="mt-10 rounded-2xl bg-white shadow-lg border border-slate-100 p-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setDetailPlanId(null)}
                className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm">Back to all plans</span>
              </button>
              <span className="inline-flex items-center gap-1 text-sm text-amber-600">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                Plan details
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-2xl font-semibold">{cleanLabel(p.title)}</h3>
                <p className="text-slate-600 mt-2">{p.blurb}</p>

                <h4 className="text-sm font-semibold text-slate-600 mt-6 mb-3">Features included</h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  {p.features.map((f) => (
                    <div key={f.title} className="flex items-start gap-3 rounded-lg border border-slate-100 p-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-800">{f.title}</div>
                        <div className="text-xs text-slate-500">{f.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-1 rounded-xl border border-slate-100 p-4 h-fit">
                <div className="text-sm text-slate-500">Price</div>
                <div className="text-4xl font-bold text-blue-600 mt-1">
                  {priceText}
                  {p.id !== "diamond" && (
                    <span className="text-base font-normal text-slate-500">/{billing === "yearly" ? "year" : "mo"}</span>
                  )}
                </div>
                <div className="mt-4 text-xs text-slate-500">
                  Toggle <b>{billing}</b> / {billing === "yearly" ? "monthly" : "yearly"} above to compare.
                </div>

                <button
                  onClick={confirmSelection}
                  disabled={saving}
                  className="mt-5 w-full rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white font-semibold px-4 py-2.5 shadow hover:opacity-95 disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Select this plan"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <Comparison />
      <FAQ />
    </div>
  );
};

export default SubscriptionClient;
