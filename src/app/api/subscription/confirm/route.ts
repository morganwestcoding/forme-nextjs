// app/api/subscription/confirm/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/app/libs/prismadb";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await request.json() as { sessionId?: string };
    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    // Load the returning user's record
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Fetch the checkout session and associated subscription
    const cs = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["subscription"] });

    if (cs.mode !== "subscription") {
      return NextResponse.json({ ok: true }); // not our case; no-op
    }

    // Trust Stripe metadata (we also verify via subscription below)
    const planId = (cs.metadata?.planId as string | undefined) ??
                   (typeof cs.subscription !== "string"
                      ? (cs.subscription?.metadata?.planId as string | undefined)
                      : undefined);

    const interval = (cs.metadata?.interval as string | undefined) ??
                     (typeof cs.subscription !== "string"
                        ? (cs.subscription?.items?.data?.[0]?.price?.recurring?.interval as string | undefined)
                        : undefined);

    // subscription object (expanded) or fetch by id
    const subscription =
      typeof cs.subscription === "string"
        ? await stripe.subscriptions.retrieve(cs.subscription)
        : cs.subscription;

    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    // Idempotency: if already stored and matches, short-circuit
    if (user.stripeSubscriptionId && user.stripeSubscriptionId === subscription.id) {
      return NextResponse.json({ ok: true }); // already confirmed
    }

    // Map planId -> tier label (updated for metal system)
    const tierLabel =
      planId === "gold"     ? "Gold"     :
      planId === "platinum" ? "Platinum" : 
      user.subscriptionTier || "Bronze";

    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    const priceId = subscription.items.data[0]?.price?.id || null;
    const billingInterval =
      subscription.items.data[0]?.price?.recurring?.interval || interval || null;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isSubscribed: ["active", "trialing", "past_due"].includes(subscription.status),
        subscriptionTier: tierLabel,
        subscriptionStartDate: new Date(),
        subscriptionEndDate: currentPeriodEnd,
        subscriptionStatus: subscription.status,
        stripeCustomerId: (cs.customer as string) || user.stripeCustomerId || undefined,
        stripeSubscriptionId: subscription.id,
        subscriptionPriceId: priceId,
        subscriptionBillingInterval: billingInterval,
        currentPeriodEnd,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[SUB_CONFIRM_POST]", error);
    return NextResponse.json(
      { error: error.message || "Internal error" },
      { status: 500 }
    );
  }
}