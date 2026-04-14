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
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return apiErrorCode('UNAUTHORIZED');
  }

  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return apiError("Missing session ID", 400);
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });

    if (!currentUser) {
      return apiErrorCode('USER_NOT_FOUND');
    }

    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (!stripeSession || stripeSession.payment_status !== 'paid') {
      return apiError("Payment not completed", 400);
    }

    const paymentIntentId = stripeSession.payment_intent
      ? String(stripeSession.payment_intent)
      : null;

    // 1) Look up reservation by paymentIntentId
    let reservation = paymentIntentId
      ? await prisma.reservation.findFirst({
          where: { paymentIntentId, userId: currentUser.id },
          include: RESERVATION_INCLUDE,
        })
      : null;

    // 2) Webhook fallback — if the reservation hasn't been created yet
    //    (webhook delayed/undelivered), create it now so the user sees their
    //    booking immediately under "My Trips". Idempotent on paymentIntentId.
    if (!reservation && stripeSession.metadata?.userId === currentUser.id) {
      const result = await createReservationFromCheckoutSession(stripeSession);
      if (result.created || result.reason === 'already_exists') {
        reservation = await prisma.reservation.findFirst({
          where: { paymentIntentId: paymentIntentId || undefined, userId: currentUser.id },
          include: RESERVATION_INCLUDE,
        });
      }
    }

    if (!reservation) {
      return NextResponse.json({
        success: true,
        message: "Payment successful, reservation processing",
        reservation: stripeSession.metadata
          ? {
              serviceName: stripeSession.metadata.serviceName,
              date: new Date(stripeSession.metadata.date),
              time: stripeSession.metadata.time,
              totalPrice: Number(stripeSession.amount_total! / 100),
              listing: {
                title: stripeSession.metadata.businessName || "Your booking",
                imageSrc: null,
              },
            }
          : null,
      });
    }

    return NextResponse.json({ success: true, reservation });
  } catch (error: any) {
    return apiError(error.message || "Something went wrong", 500);
  }
}
