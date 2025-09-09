// app/api/subscription/verify/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/app/libs/prismadb";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json({ error: "Missing session ID" }, { status: 400 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
    if (!stripeSession) {
      return NextResponse.json({ success: false, error: "Invalid session" }, { status: 400 });
    }
    if (stripeSession.mode !== "subscription") {
      return NextResponse.json({ success: false, error: "Wrong session mode" }, { status: 400 });
    }

    // Payment may be "paid" or "no payment required" depending on trial; we just confirm session completion
    if (stripeSession.status !== "complete") {
      return NextResponse.json({ success: false, error: "Checkout not completed" }, { status: 400 });
    }

    // Pull the subscription for receipt-ish info
    if (stripeSession.subscription) {
      const subId = typeof stripeSession.subscription === "string"
        ? stripeSession.subscription
        : stripeSession.subscription.id;
      const sub = await stripe.subscriptions.retrieve(subId);

      const item = sub.items.data[0];
      const planNickname = item?.price?.nickname || item?.price?.lookup_key || item?.price?.id;
      const interval = item?.price?.recurring?.interval;

      // Extract plan name for display (updated for metal system)
      let planDisplayName = "Unknown Plan";
      if (planNickname?.includes("gold")) {
        planDisplayName = "Gold Plan";
      } else if (planNickname?.includes("platinum")) {
        planDisplayName = "Platinum Plan";
      }

      return NextResponse.json({
        success: true,
        subscription: {
          id: sub.id,
          status: sub.status,
          priceId: item?.price?.id,
          interval,
          currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null,
          planNickname,
          planDisplayName, // Add friendly display name
        },
      });
    }

    return NextResponse.json({ success: true, subscription: null });
  } catch (error: any) {
    console.error("Subscription verification error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}