import { redirect } from "next/navigation";
import Link from "next/link";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";
import Container from "@/components/Container";


export default async function AdminDisputesPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser || (currentUser.role !== "master" && currentUser.role !== "admin")) redirect("/");

  const disputes = await prisma.dispute.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Fetch associated reservations in bulk
  const reservationIds = disputes
    .map((d) => d.reservationId)
    .filter((id): id is string => !!id);

  const reservations = reservationIds.length > 0
    ? await prisma.reservation.findMany({
        where: { id: { in: reservationIds } },
        select: {
          id: true,
          serviceName: true,
          totalPrice: true,
          user: { select: { name: true, email: true } },
          listing: { select: { title: true } },
        },
      })
    : [];

  const reservationMap = new Map(reservations.map((r) => [r.id, r]));

  const statusStyles: Record<string, string> = {
    needs_response: 'text-danger-soft-foreground bg-danger-soft ring-danger-soft',
    under_review: 'text-warning-soft-foreground bg-warning-soft ring-warning-soft',
    won: 'text-success-soft-foreground bg-success-soft ring-success-soft',
    lost: 'text-stone-700 dark:text-stone-200 bg-stone-50 dark:bg-stone-900 ring-stone-200',
  };

  return (
    <Container>
      <div className="mt-8 mb-12">
        <div className="mb-2">
          <Link href="/admin" className="text-xs text-stone-400  hover:text-stone-600 dark:text-stone-300 transition-colors">
            ← Back to Admin
          </Link>
        </div>
        <div className="mb-8">
          <p className="text-xs text-stone-400 dark:text-stone-500 mb-1">Master admin</p>
          <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">Disputes</h1>
          <p className="text-sm text-stone-400 dark:text-stone-500 mt-1">{disputes.length} disputes</p>
        </div>

        {disputes.length === 0 ? (
          <div className="text-sm text-stone-400 dark:text-stone-500 py-12 text-center">
            No disputes found.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-700/60">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-700/60 bg-stone-50 dark:bg-stone-900/50">
                  <th className="text-left py-3 px-4 font-medium text-stone-500  dark:text-stone-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-stone-500  dark:text-stone-500">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-stone-500  dark:text-stone-500">Reason</th>
                  <th className="text-left py-3 px-4 font-medium text-stone-500  dark:text-stone-500">Service</th>
                  <th className="text-left py-3 px-4 font-medium text-stone-500  dark:text-stone-500">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-stone-500  dark:text-stone-500">Business</th>
                  <th className="text-left py-3 px-4 font-medium text-stone-500  dark:text-stone-500">Date</th>
                </tr>
              </thead>
              <tbody>
                {disputes.map((dispute) => {
                  const reservation = dispute.reservationId
                    ? reservationMap.get(dispute.reservationId)
                    : null;

                  return (
                    <tr key={dispute.id} className="border-b border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:bg-stone-900/50 transition-colors">
                      <td className="py-3 px-4">
                        <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ring-1 ${statusStyles[dispute.status] || statusStyles.needs_response}`}>
                          {dispute.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-stone-900 dark:text-stone-100">
                        ${(dispute.amount / 100).toFixed(2)} {dispute.currency.toUpperCase()}
                      </td>
                      <td className="py-3 px-4 text-stone-600 dark:text-stone-300">{dispute.reason || '—'}</td>
                      <td className="py-3 px-4 text-stone-600 dark:text-stone-300">
                        {reservation?.serviceName || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-stone-900 dark:text-stone-100">{reservation?.user?.name || '—'}</p>
                          <p className="text-xs text-stone-400 dark:text-stone-500">{reservation?.user?.email || ''}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-stone-600 dark:text-stone-300">
                        {reservation?.listing?.title || '—'}
                      </td>
                      <td className="py-3 px-4 text-stone-500  dark:text-stone-500">
                        {dispute.createdAt.toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Container>
  );
}
