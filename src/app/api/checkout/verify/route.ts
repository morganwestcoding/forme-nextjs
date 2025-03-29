// app/api/checkout/verify/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/app/libs/prismadb";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // Get session_id from query parameters
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session ID" }, { status: 400 });
    }

    // Get the current user
    const currentUser = await prisma.user.findUnique({
      where: {
        email: session.user.email as string,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify the session with Stripe
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (!stripeSession || stripeSession.payment_status !== 'paid') {
      return NextResponse.json({ success: false, error: "Payment not completed" }, { status: 400 });
    }

    // Find the reservation associated with this payment
    const reservation = await prisma.reservation.findFirst({
      where: {
        paymentIntentId: stripeSession.payment_intent ? String(stripeSession.payment_intent) : undefined,
        userId: currentUser.id,
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            imageSrc: true,
            category: true,
            location: true,
          }
        },
      }
    });

    // If no reservation found but payment is successful, it might still be processing
    // (webhook may not have created it yet)
    if (!reservation) {
      // Create a temporary reservation object from Stripe metadata
      const tempReservation = stripeSession.metadata ? {
        serviceName: stripeSession.metadata.serviceName,
        date: new Date(stripeSession.metadata.date),
        time: stripeSession.metadata.time,
        totalPrice: Number(stripeSession.amount_total! / 100), // Convert from cents
        listing: {
          title: stripeSession.metadata.businessName || "Your booking",
        }
      } : null;

      return NextResponse.json({ 
        success: true, 
        message: "Payment successful, reservation processing",
        reservation: tempReservation
      });
    }

    return NextResponse.json({ success: true, reservation });
  } catch (error: any) {
    console.error("Checkout verification error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}