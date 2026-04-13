import prisma from "@/app/libs/prismadb";

export interface AdminStats {
  totalUsers: number;
  activeListings: number;
  reservationsThisMonth: number;
  revenueThisMonth: number;
  pendingVerifications: number;
  activeDisputes: number;
  activeSubscribers: number;
}

export default async function getAdminStats(): Promise<AdminStats> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalUsers,
    activeListings,
    reservationsThisMonth,
    revenueAgg,
    pendingVerifications,
    activeDisputes,
    activeSubscribers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count(),
    prisma.reservation.count({
      where: { createdAt: { gte: startOfMonth } },
    }),
    prisma.reservation.aggregate({
      _sum: { totalPrice: true },
      where: {
        createdAt: { gte: startOfMonth },
        paymentStatus: 'completed',
      },
    }),
    prisma.user.count({
      where: { verificationStatus: 'pending' },
    }),
    prisma.dispute.count({
      where: { status: { in: ['needs_response', 'under_review'] } },
    }),
    prisma.user.count({
      where: { isSubscribed: true },
    }),
  ]);

  return {
    totalUsers,
    activeListings,
    reservationsThisMonth,
    revenueThisMonth: revenueAgg._sum.totalPrice || 0,
    pendingVerifications,
    activeDisputes,
    activeSubscribers,
  };
}
