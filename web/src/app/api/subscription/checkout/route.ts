// app/api/subscription/checkout/route.ts
import { NextResponse } from "next/server";
import { apiError, apiErrorCode } from "@/app/utils/api";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/app/libs/prismadb";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

type PlanId = "gold" | "platinum";
type Interval = "monthly" | "yearly";

// Pricing 2.0: Gold $30/mo, Platinum $100/mo. Yearly = 10x monthly (2 months free).
const PLAN_PRICING: Record<PlanId, { monthly: number; yearly: number }> = {
  gold: { monthly: 30, yearly: 300 },
  platinum: { monthly: 100, yearly: 1000 },
};

// Bump this when prices change so Stripe creates new Price objects instead of
// reusing the old ones cached under the previous lookup_key.
const PRICE_VERSION = "v2";

async function ensureProduct(client: Stripe, apiId: PlanId): Promise<Stripe.Product> {
  let starting_after: string | undefined;
  while (true) {
    const page: Stripe.ApiList<Stripe.Product> = await client.products.list({ limit: 100, starting_after });
    const existing = page.data.find((prod) => (prod.metadata as any)?.apiId === apiId);
    if (existing) return existing;
    if (!page.has_more) break;
    starting_after = page.data[page.data.length - 1].id;
  }

  const name = apiId === "gold" ? "Gold Plan" : "Platinum Plan";

  return client.products.create({ name, metadata: { apiId } });
}

async function ensureRecurringPrice(
  client: Stripe,
  planId: PlanId,
  interval: Interval
): Promise<Stripe.Price> {
  const lookup_key = `${planId}_${interval}_${PRICE_VERSION}`;

  let starting_after: string | undefined;
  while (true) {
    const page: Stripe.ApiList<Stripe.Price> = await client.prices.list({ limit: 100, starting_after });
    const found = page.data.find((price) => price.lookup_key === lookup_key && price.active);
    if (found) return found;
    if (!page.has_more) break;
    starting_after = page.data[page.data.length - 1].id;
  }

  const product = await ensureProduct(client, planId);
  const amount = PLAN_PRICING[planId][interval];

  return client.prices.create({
    product: product.id,
    currency: "usd",
    unit_amount: Math.round(amount * 100),
    recurring: { interval: interval === "monthly" ? "month" : "year" },
    nickname: lookup_key,
    lookup_key,
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return apiErrorCode('UNAUTHORIZED');
  }

  try {
    const { planId, interval, metadata } = (await request.json()) as {
      planId: PlanId;
      interval: Interval;
      metadata?: { isOnboarding?: string };
    };

    if (!planId || !interval) {
      return apiErrorCode('MISSING_FIELDS');
    }

    const isOnboarding = metadata?.isOnboarding === 'true';

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });
    if (!currentUser) {
      return apiErrorCode('USER_NOT_FOUND');
    }

    const price = await ensureRecurringPrice(stripe, planId, interval);

    let stripeCustomerId = (currentUser as any).stripeCustomerId as string | undefined;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: currentUser.email || undefined,
        name: currentUser.name || undefined,
        metadata: { userId: currentUser.id },
      });
      stripeCustomerId = customer.id;

      await prisma.user.update({
        where: { id: currentUser.id },
        data: { stripeCustomerId },
      });
    }

    const successUrl = isOnboarding
      ? `${process.env.NEXT_PUBLIC_APP_URL}/subscription?status=success&session_id={CHECKOUT_SESSION_ID}&onboarding=true`
      : `${process.env.NEXT_PUBLIC_APP_URL}/subscription?status=success&session_id={CHECKOUT_SESSION_ID}`;

    const cancelUrl = isOnboarding
      ? `${process.env.NEXT_PUBLIC_APP_URL}/subscription?status=cancelled&onboarding=true`
      : `${process.env.NEXT_PUBLIC_APP_URL}/subscription?status=cancelled`;

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      line_items: [{ price: price.id, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        kind: "subscription",
        userId: currentUser.id,
        planId,
        interval,
        isOnboarding: isOnboarding ? 'true' : 'false',
      },
      subscription_data: {
        metadata: {
          userId: currentUser.id,
          planId,
          interval,
          isOnboarding: isOnboarding ? 'true' : 'false',
        },
      },
    });

    return NextResponse.json({ sessionId: checkoutSession.id });
  } catch (error: any) {
    console.error("Subscription checkout error:", error);
    return apiError(error.message || "Something went wrong", 500);
  }
}