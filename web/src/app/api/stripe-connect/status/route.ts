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

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return apiErrorCode('UNAUTHORIZED');
  }

  try {
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email as string },
      select: {
        id: true,
        stripeConnectAccountId: true,
        stripeConnectOnboardingComplete: true,
        stripeConnectChargesEnabled: true,
        stripeConnectPayoutsEnabled: true,
      },
    });

    if (!currentUser) {
      return apiErrorCode('USER_NOT_FOUND');
    }

    if (!currentUser.stripeConnectAccountId) {
      return NextResponse.json({
        hasAccount: false,
        onboardingComplete: false,
        chargesEnabled: false,
        payoutsEnabled: false,
      });
    }

    // Fetch latest status from Stripe
    const account = await stripe.accounts.retrieve(
      currentUser.stripeConnectAccountId
    );

    // Update local DB if status changed
    if (
      account.details_submitted !== currentUser.stripeConnectOnboardingComplete ||
      account.charges_enabled !== currentUser.stripeConnectChargesEnabled ||
      account.payouts_enabled !== currentUser.stripeConnectPayoutsEnabled
    ) {
      await prisma.user.update({
        where: { id: currentUser.id },
        data: {
          stripeConnectDetailsSubmitted: account.details_submitted,
          stripeConnectOnboardingComplete: account.details_submitted,
          stripeConnectChargesEnabled: account.charges_enabled,
          stripeConnectPayoutsEnabled: account.payouts_enabled,
          ...(account.details_submitted && !currentUser.stripeConnectOnboardingComplete
            ? { stripeConnectOnboardedAt: new Date() }
            : {}),
        },
      });
    }

    return NextResponse.json({
      hasAccount: true,
      accountId: account.id,
      onboardingComplete: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      requirements: account.requirements,
    });
  } catch (error: any) {
    console.error("Stripe Connect status error:", error);
    return apiError(error.message || "Failed to get account status", 500);
  }
}
