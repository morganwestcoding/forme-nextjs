import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/utils/adminAuth";
import prisma from "@/app/libs/prismadb";
import { apiErrorCode } from "@/app/utils/api";

// GET /api/admin/disputes — list recent disputes (up to 100), each enriched
// with the related reservation summary. Mirrors the SSR /admin/disputes
// table. Master/admin only.
//
// Amounts are returned in cents (Stripe-native), same as the underlying
// `dispute.amount` field.
export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;

  try {
    const disputes = await prisma.dispute.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

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

    return NextResponse.json({
      disputes: disputes.map((d) => {
        const reservation = d.reservationId ? reservationMap.get(d.reservationId) : null;
        return {
          id: d.id,
          status: d.status,
          amount: d.amount,
          currency: d.currency,
          reason: d.reason,
          reservationId: d.reservationId,
          serviceName: reservation?.serviceName ?? null,
          listingTitle: reservation?.listing?.title ?? null,
          customerName: reservation?.user?.name ?? null,
          customerEmail: reservation?.user?.email ?? null,
          createdAt: d.createdAt.toISOString(),
        };
      }),
    });
  } catch (error) {
    return apiErrorCode("INTERNAL_ERROR");
  }
}
