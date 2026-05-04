// app/api/reservations/[reservationId]/refund/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { getUserFromRequest } from '@/app/utils/mobileAuth';
import { isMasterUser } from '@/app/libs/authorization';
import { apiError, apiErrorCode } from '@/app/utils/api';
import { createRateLimiter, getIP } from '@/app/libs/rateLimit';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

const limiter = createRateLimiter('refund', { limit: 5, windowSeconds: 60 });

export async function POST(
  request: Request,
  { params }: { params: { reservationId: string } }
) {
  try {
    const ip = getIP(request);
    const rl = limiter(ip);
    if (!rl.allowed) {
      return apiError(`Too many requests. Try again in ${rl.retryAfterSeconds}s`, 429);
    }

    const currentUser =
      (await getUserFromRequest(request)) || (await getCurrentUser());
    if (!currentUser) return apiErrorCode('UNAUTHORIZED');

    const reservation = await prisma.reservation.findUnique({
      where: { id: params.reservationId },
      include: { listing: true },
    });

    if (!reservation) return apiErrorCode('NOT_FOUND');

    // Only the customer, listing owner, or admin can request a refund
    const isCustomer = reservation.userId === currentUser.id;
    const isOwner = reservation.listing.userId === currentUser.id;
    const isAdmin = isMasterUser(currentUser);

    if (!isCustomer && !isOwner && !isAdmin) {
      return apiErrorCode('FORBIDDEN');
    }

    // Check refund eligibility
    if (reservation.paymentStatus !== 'completed') {
      return apiError('Payment has not been completed', 400);
    }

    if (reservation.refundStatus === 'completed') {
      return apiError('This reservation has already been refunded', 400);
    }

    if (reservation.refundStatus === 'requested') {
      return apiError('A refund has already been requested', 400);
    }

    if (!reservation.paymentIntentId) {
      return apiError('No payment found for this reservation', 400);
    }

    const body = await request.json().catch(() => ({}));
    const reason = typeof body.reason === 'string' ? body.reason.slice(0, 500) : 'Customer requested';

    // If admin or owner, process refund immediately
    // If customer, mark as requested (owner/admin approves later)
    if (isAdmin || isOwner) {
      // Process refund via Stripe
      const refund = await stripe.refunds.create({
        payment_intent: reservation.paymentIntentId,
        reason: 'requested_by_customer',
        metadata: {
          reservationId: reservation.id,
          refundedBy: currentUser.id,
          userRole: isAdmin ? 'admin' : 'owner',
        },
      });

      await prisma.reservation.update({
        where: { id: reservation.id },
        data: {
          refundStatus: 'completed',
          refundAmount: refund.amount,
          refundReason: reason,
          refundId: refund.id,
          refundedAt: new Date(),
          paymentStatus: 'refunded',
          status: 'cancelled',
        },
      });

      // Notify the customer (only if there's a linked user — guests have no
      // account to receive an in-app notification; they're notified via email).
      if (!isCustomer && reservation.userId) {
        await prisma.notification.create({
          data: {
            type: 'REFUND_COMPLETED',
            content: `Your reservation for ${reservation.serviceName} has been refunded.`,
            userId: reservation.userId,
            relatedListingId: reservation.listingId,
          },
        });
      }

      return NextResponse.json({
        status: 'completed',
        refundId: refund.id,
        amount: refund.amount,
      });
    } else {
      // Customer request — mark as requested, notify owner
      await prisma.reservation.update({
        where: { id: reservation.id },
        data: {
          refundStatus: 'requested',
          refundReason: reason,
        },
      });

      // Notify the listing owner
      await prisma.notification.create({
        data: {
          type: 'REFUND_REQUESTED',
          content: `${currentUser.name || 'A customer'} requested a refund for ${reservation.serviceName}.`,
          userId: reservation.listing.userId,
          relatedListingId: reservation.listingId,
        },
      });

      return NextResponse.json({ status: 'requested' });
    }
  } catch (error: any) {
    if (error?.type === 'StripeInvalidRequestError') {
      return apiError('Refund failed: ' + (error.message || 'Invalid request'), 400);
    }
    return apiErrorCode('INTERNAL_ERROR');
  }
}
