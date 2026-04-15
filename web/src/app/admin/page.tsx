import Link from "next/link";
import { redirect } from "next/navigation";
import getCurrentUser from "@/app/actions/getCurrentUser";
import getAdminStats from "@/app/actions/getAdminStats";
import Container from "@/components/Container";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "master") {
    redirect("/");
  }

  const stats = await getAdminStats();

  const cards = [
    { label: "Total Users", value: stats.totalUsers.toLocaleString() },
    { label: "Active Listings", value: stats.activeListings.toLocaleString() },
    { label: "Reservations (Month)", value: stats.reservationsThisMonth.toLocaleString() },
    { label: "Revenue (Month)", value: `$${stats.revenueThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
    { label: "Active Subscribers", value: stats.activeSubscribers.toLocaleString() },
    { label: "Pending Verifications", value: stats.pendingVerifications.toLocaleString(), alert: stats.pendingVerifications > 0 },
    { label: "Active Disputes", value: stats.activeDisputes.toLocaleString(), alert: stats.activeDisputes > 0 },
  ];

  const nav = [
    { label: "Users", description: "Manage accounts, suspend users", href: "/admin/users" },
    { label: "Verifications", description: "Approve or reject licensing submissions", href: "/admin/verifications" },
    { label: "Disputes", description: "View payment disputes and resolutions", href: "/admin/disputes" },
    { label: "Academies", description: "Manage academy partners and payouts", href: "/admin/academies" },
  ];

  return (
    <Container>
      <div className="mt-8 mb-12">
        <div className="mb-2">
          <Link href="/" className="text-[12px] text-stone-400  hover:text-stone-600 dark:text-stone-300 transition-colors">
            ← Back to ForMe
          </Link>
        </div>
        <div className="mb-8">
          <p className="text-[12px] text-stone-400 dark:text-stone-500 mb-1">Master admin</p>
          <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">Dashboard</h1>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {cards.map((card) => (
            <div
              key={card.label}
              className={`rounded-2xl border p-5 ${card.alert ? 'border-amber-200 bg-amber-50/50' : 'border-stone-200/60 bg-white dark:bg-stone-900'}`}
            >
              <p className="text-[11px] font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wide mb-1">{card.label}</p>
              <p className={`text-2xl font-bold tracking-tight ${card.alert ? 'text-amber-700' : 'text-stone-900 dark:text-stone-100'}`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="grid md:grid-cols-2 gap-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-stone-200/60 bg-white dark:bg-stone-900 p-5 hover:border-stone-300 dark:border-stone-700 hover:shadow-sm transition-all"
            >
              <h3 className="text-[15px] font-semibold text-stone-900 dark:text-stone-100">{item.label}</h3>
              <p className="text-[13px] text-stone-500  dark:text-stone-500 mt-1">{item.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </Container>
  );
}
