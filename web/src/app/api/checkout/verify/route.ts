// app/api/checkout/verify/route.ts
import { NextResponse } from "next/server";
import { apiError, apiErrorCode } from "@/app/utils/api";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/app/libs/prismadb";
import Stripe from 'stripe';
import { createReservationFromCheckoutSession } from "@/app/libs/createReservationFromCheckout";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

const RESERVATION_INCLUDE = {
  listing: {
    select: {
      id: true,
      title: true,
      imageSrc: true,
      category: true,
      location: true,
      address: true,
    },
  },
  employee: {
    select: { id: true, fullName: true, jobTitle: true },
  },
} as const;

export async function GET(request: Request) {
  // Auth is optional — guest checkouts must be able to verify their own
  // session without a session cookie. We scope guest verification to the
  // session_id (which only the booker has via the success URL Stripe redirects
  // them to) so it's effectively a one-time bearer token for that reservation.
  const session = await getServerSession(authOptions);
  let currentUser: Awaited<ReturnType<typeof prisma.user.findUnique>> = null;
  if (session?.user?.email) {
    currentUser = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });
  }

  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return apiError("Missing session ID", 400);
    }

    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (!stripeSession || stripeSession.payment_status !== 'paid') {
      return apiError("Payment not completed", 400);
    }

    const isGuestCheckout = !stripeSession.metadata?.userId;

    // Logged-in users may only verify their own sessions. Guest checkouts
    // bypass this since they have no userId; the session_id itself is the
    // proof of ownership (only the booker reached the success URL).
    if (!isGuestCheckout && currentUser && stripeSession.metadata?.userId !== currentUser.id) {
      return apiErrorCode('FORBIDDEN');
    }

    const paymentIntentId = stripeSession.payment_intent
      ? String(stripeSession.payment_intent)
      : null;

    // 1) Look up reservation by paymentIntentId. For logged-in users we also
    //    constrain by userId; for guest checkouts we just trust paymentIntent.
    const baseWhere = paymentIntentId ? { paymentIntentId } : null;
    let reservation = baseWhere
      ? await prisma.reservation.findFirst({
          where: isGuestCheckout || !currentUser
            ? baseWhere
            : { ...baseWhere, userId: currentUser.id },
          include: RESERVATION_INCLUDE,
        })
      : null;

    // 2) Webhook fallback — if the reservation hasn't been created yet
    //    (webhook delayed/undelivered), create it now so the user sees their
    //    booking immediately under "My Trips". Idempotent on paymentIntentId.
    const ownsSession =
      isGuestCheckout ||
      (currentUser && stripeSession.metadata?.userId === currentUser.id);
    if (!reservation && ownsSession) {
      const result = await createReservationFromCheckoutSession(stripeSession);
      if (result.created || result.reason === 'already_exists') {
        reservation = paymentIntentId
          ? await prisma.reservation.findFirst({
              where: isGuestCheckout || !currentUser
                ? { paymentIntentId }
                : { paymentIntentId, userId: currentUser.id },
              include: RESERVATION_INCLUDE,
            })
          : null;
      }
    }

    if (!reservation) {
      return NextResponse.json({
        success: true,
        message: "Payment successful, reservation processing",
        reservation: stripeSession.metadata
          ? {
              serviceName: stripeSession.metadata.serviceName,
              serviceCount: stripeSession.metadata.serviceIds
                ? stripeSession.metadata.serviceIds.split(',').filter(Boolean).length
                : 1,
              date: new Date(stripeSession.metadata.date),
              time: stripeSession.metadata.time,
              totalPrice: Number(stripeSession.amount_total! / 100),
              subtotal: stripeSession.metadata.subtotal
                ? Number(stripeSession.metadata.subtotal)
                : undefined,
              tipAmount: stripeSession.metadata.tipAmount
                ? Number(stripeSession.metadata.tipAmount)
                : 0,
              listing: {
                title: stripeSession.metadata.businessName || "Your booking",
                imageSrc: null,
              },
              isGuest: isGuestCheckout,
            }
          : null,
      });
    }

    return NextResponse.json({
      success: true,
      reservation: {
        ...reservation,
        serviceCount: reservation.serviceIds?.length || 1,
        isGuest: !reservation.userId,
      },
    });
  } catch (error: any) {
    return apiError(error.message || "Something went wrong", 500);
  }
}
