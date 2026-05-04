// app/api/subscription/cancel/route.ts
import { NextResponse } from "next/server";
import { apiError, apiErrorCode } from "@/app/utils/api";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/app/libs/prismadb";
import Stripe from "stripe";
import { createRateLimiter, getIP } from "@/app/libs/rateLimit";
import { sendEmail, subscriptionCancelledEmail } from "@/app/libs/email";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

const limiter = createRateLimiter("subscription-cancel", { limit: 5, windowSeconds: 60 });

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
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });
    if (!user) return apiErrorCode("USER_NOT_FOUND");

    if (!user.stripeSubscriptionId) {
      return apiError("No active subscription to cancel", 400);
    }

    // Cancel at period end so user keeps access until the billing cycle ends.
    // Stripe fires `customer.subscription.deleted` at period end, which our
    // webhook handles by setting isSubscribed=false.
    const subscription = await stripe.subscriptions.update(
      user.stripeSubscriptionId,
      { cancel_at_period_end: true }
    );

    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: subscription.status,
      },
    });

    const periodEnd = new Date(subscription.current_period_end * 1000);

    // Email: cancellation confirmation
    if (user.email) {
      const tpl = subscriptionCancelledEmail(
        user.subscriptionTier || 'your',
        periodEnd.toLocaleDateString(),
      );
      sendEmail({ ...tpl, to: user.email }).catch(() => {});
    }

    return NextResponse.json({
      ok: true,
      cancelAt: subscription.cancel_at
        ? new Date(subscription.cancel_at * 1000).toISOString()
        : null,
      currentPeriodEnd: periodEnd.toISOString(),
    });
  } catch (error: any) {
    return apiError(error.message || "Something went wrong", 500);
  }
}
