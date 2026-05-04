import Link from "next/link";
import { redirect } from "next/navigation";
import {
  UserMultipleIcon,
  GridViewIcon,
  Calendar01Icon,
  DollarCircleIcon,
  CheckmarkCircle02Icon,
  ShieldUserIcon,
  AlertCircleIcon,
  Mortarboard01Icon,
  ArrowUpRight01Icon,
  Flag03Icon,
  PaintBrush01Icon,
} from "hugeicons-react";
import getCurrentUser from "@/app/actions/getCurrentUser";
import getAdminStats from "@/app/actions/getAdminStats";
import Container from "@/components/Container";

export const metadata = {
  title: 'Admin',
  description: 'Internal administrative dashboard',
  robots: { index: false, follow: false },
};

const PILL_STYLE = {
  background: "linear-gradient(135deg, #2a2a2a 0%, #000 100%)",
  boxShadow: "0 1px 3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.12)",
};

export default async function AdminPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || (currentUser.role !== "master" && currentUser.role !== "admin")) {
    redirect("/");
  }

  const stats = await getAdminStats();
  const isMaster = currentUser.role === "master";

  const formatCurrency = (n: number) =>
    `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const kpis = [
    { label: "Total users", value: stats.totalUsers.toLocaleString(), icon: UserMultipleIcon },
    { label: "Active listings", value: stats.activeListings.toLocaleString(), icon: GridViewIcon },
    { label: "Reservations · MTD", value: stats.reservationsThisMonth.toLocaleString(), icon: Calendar01Icon },
    { label: "Revenue · MTD", value: formatCurrency(stats.revenueThisMonth), icon: DollarCircleIcon },
    { label: "Active subscribers", value: stats.activeSubscribers.toLocaleString(), icon: CheckmarkCircle02Icon },
    {
      label: "Pending verifications",
      value: stats.pendingVerifications.toLocaleString(),
      icon: ShieldUserIcon,
      alert: stats.pendingVerifications > 0,
    },
    {
      label: "Active disputes",
      value: stats.activeDisputes.toLocaleString(),
      icon: AlertCircleIcon,
      alert: stats.activeDisputes > 0,
    },
  ];

  const nav = [
    {
      label: "Users",
      description: "Accounts, roles, suspensions",
      href: "/admin/users",
      icon: UserMultipleIcon,
    },
    {
      label: "Verifications",
      description: "Approve licensing submissions",
      href: "/admin/verifications",
      icon: ShieldUserIcon,
      badge: stats.pendingVerifications,
    },
    {
      label: "Disputes",
      description: "Payment disputes & resolutions",
      href: "/admin/disputes",
      icon: Flag03Icon,
      badge: stats.activeDisputes,
    },
    {
      label: "Academies",
      description: "Partner programs & payouts",
      href: "/admin/academies",
      icon: Mortarboard01Icon,
    },
    {
      label: "Kitchen sink",
      description: "UI primitives reference",
      href: "/admin/kitchen-sink",
      icon: PaintBrush01Icon,
    },
  ];

  return (
    <Container>
      <div className="mt-8 mb-12">
        <div className="mb-2">
          <Link href="/" className="text-xs text-stone-400 hover:text-stone-600 dark:text-stone-300 transition-colors">
            ← Back to ForMe
          </Link>
        </div>
        <div className="mb-8">
          <p className="text-xs text-stone-400 dark:text-stone-500 mb-1">{isMaster ? "Master admin" : "Admin"}</p>
          <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">Dashboard</h1>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-10">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.label}
                className={`rounded-2xl border p-5 ${
                  kpi.alert
                    ? "border-warning-soft bg-warning-soft/60 dark:border-amber-900/40 dark:bg-amber-950/20"
                    : "border-stone-200/60 dark:border-stone-800 bg-white dark:bg-stone-900"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      kpi.alert
                        ? "bg-warning-soft text-warning-soft-foreground dark:bg-amber-900/40 dark:text-warning/70"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" strokeWidth={1.75} />
                  </div>
                </div>
                <p className="text-xs font-medium text-stone-400 dark:text-stone-500 mb-1">
                  {kpi.label}
                </p>
                <p
                  className={`text-2xl font-semibold tracking-tight tabular-nums ${
                    kpi.alert
                      ? "text-warning-soft-foreground dark:text-warning/70"
                      : "text-stone-900 dark:text-stone-100"
                  }`}
                >
                  {kpi.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Operations grid */}
        <div className="grid sm:grid-cols-2 gap-3">
          {nav.map((item) => {
            const Icon = item.icon;
            const hasBadge = typeof item.badge === "number" && item.badge > 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative rounded-2xl border border-stone-200/60 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 hover:border-stone-300 dark:hover:border-stone-700 hover:shadow-elevation-1 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white transition-transform group-hover:scale-105"
                    style={PILL_STYLE}
                  >
                    <Icon className="w-5 h-5" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {item.label}
                      </h3>
                      {hasBadge && (
                        <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold text-white bg-warning tabular-nums">
                          {item.badge! > 99 ? "99+" : item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                      {item.description}
                    </p>
                  </div>
                  <ArrowUpRight01Icon
                    className="w-4 h-4 text-stone-300 dark:text-stone-600 shrink-0 transition-all group-hover:text-stone-700 dark:group-hover:text-stone-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    strokeWidth={2}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </Container>
  );
}
