// app/api/subscription/portal/route.ts
import { NextResponse } from "next/server";
import { apiError, apiErrorCode } from "@/app/utils/api";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/app/libs/prismadb";
import Stripe from "stripe";
import { createRateLimiter, getIP } from "@/app/libs/rateLimit";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

const limiter = createRateLimiter("subscription-portal", { limit: 5, windowSeconds: 60 });

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

    if (!user.stripeCustomerId) {
      return apiError("No billing account found", 400);
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: any) {
    return apiError(error.message || "Something went wrong", 500);
  }
}
