// app/api/subscription/change/route.ts
import { NextResponse } from "next/server";
import { apiError, apiErrorCode } from "@/app/utils/api";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/app/libs/prismadb";
import Stripe from "stripe";
import { createRateLimiter, getIP } from "@/app/libs/rateLimit";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

type PlanId = "gold" | "platinum";
type Interval = "monthly" | "yearly";

const PLAN_PRICING: Record<PlanId, { monthly: number; yearly: number }> = {
  gold: { monthly: 30, yearly: 300 },
  platinum: { monthly: 100, yearly: 1000 },
};

const PRICE_VERSION = "v2";

async function findOrCreatePrice(
  client: Stripe,
  planId: PlanId,
  interval: Interval
): Promise<Stripe.Price> {
  const lookup_key = `${planId}_${interval}_${PRICE_VERSION}`;

  // Search existing prices
  let starting_after: string | undefined;
  while (true) {
    const page = await client.prices.list({ limit: 100, starting_after });
    const found = page.data.find((p) => p.lookup_key === lookup_key && p.active);
    if (found) return found;
    if (!page.has_more) break;
    starting_after = page.data[page.data.length - 1].id;
  }

  // Create product if needed
  let productId: string | undefined;
  let prodAfter: string | undefined;
  while (true) {
    const page = await client.products.list({ limit: 100, starting_after: prodAfter });
    const existing = page.data.find((prod) => (prod.metadata as any)?.apiId === planId);
    if (existing) { productId = existing.id; break; }
    if (!page.has_more) break;
    prodAfter = page.data[page.data.length - 1].id;
  }
  if (!productId) {
    const product = await client.products.create({
      name: planId === "gold" ? "Gold Plan" : "Platinum Plan",
      metadata: { apiId: planId },
    });
    productId = product.id;
  }

  return client.prices.create({
    product: productId,
    currency: "usd",
    unit_amount: Math.round(PLAN_PRICING[planId][interval] * 100),
    recurring: { interval: interval === "monthly" ? "month" : "year" },
    nickname: lookup_key,
    lookup_key,
  });
}

const limiter = createRateLimiter("subscription-change", { limit: 5, windowSeconds: 60 });

export async function POST(request: Request) {
  const ip = getIP(request);
  const rl = limiter(ip);
  if (!rl.allowed) {
    return apiError(`Too many requests. Try again in ${rl.retryAfterSeconds}s`, 429);
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return apiErrorCode("UNAUTHORIZED");
  }

  try {
    const { planId, interval } = (await request.json()) as {
      planId: PlanId;
      interval: Interval;
    };

    if (!planId || !interval) {
      return apiErrorCode("MISSING_FIELDS");
    }
    if (!["gold", "platinum"].includes(planId)) {
      return apiError("Invalid plan. Use the cancel endpoint to downgrade to free.", 400);
    }
    if (!["monthly", "yearly"].includes(interval)) {
      return apiError("Invalid interval", 400);
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });
    if (!user) return apiErrorCode("USER_NOT_FOUND");

    if (!user.stripeSubscriptionId) {
      return apiError("No active subscription. Use the checkout endpoint to subscribe.", 400);
    }

    // Get the current subscription to find the item to swap
    const currentSub = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
    const currentItem = currentSub.items.data[0];
    if (!currentItem) {
      return apiError("Subscription has no items", 500);
    }

    // Resolve the target price
    const newPrice = await findOrCreatePrice(stripe, planId, interval);

    // If already on this exact price, no-op
    if (currentItem.price.id === newPrice.id) {
      return apiError("You are already on this plan and interval", 400);
    }

    // Swap the subscription item. Stripe prorates automatically.
    // Also un-cancel if the subscription was scheduled to cancel.
    const updated = await stripe.subscriptions.update(user.stripeSubscriptionId, {
      items: [{ id: currentItem.id, price: newPrice.id }],
      proration_behavior: "always_invoice",
      cancel_at_period_end: false,
      metadata: {
        userId: user.id,
        planId,
        interval,
      },
    });

    const tierLabel = planId === "gold" ? "Gold" : "Platinum";
    const billingInterval = updated.items.data[0]?.price?.recurring?.interval || interval;
    const currentPeriodEnd = new Date(updated.current_period_end * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isSubscribed: true,
        subscriptionTier: tierLabel,
        subscriptionStatus: updated.status,
        subscriptionPriceId: newPrice.id,
        subscriptionBillingInterval: billingInterval,
        currentPeriodEnd,
        subscriptionEndDate: currentPeriodEnd,
      },
    });

    return NextResponse.json({
      ok: true,
      plan: tierLabel,
      interval: billingInterval,
      currentPeriodEnd: currentPeriodEnd.toISOString(),
    });
  } catch (error: any) {
    return apiError(error.message || "Something went wrong", 500);
  }
}
