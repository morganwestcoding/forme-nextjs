import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/app/libs/prismadb";
import Stripe from "stripe";
import { apiError, apiErrorCode } from "@/app/utils/api";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

// GET /api/academies/[academyId]/stripe-connect/status
//
// Returns the current Connect onboarding status for an academy and syncs the
// local DB with whatever Stripe reports. Master-only (v1).
export async function GET(
  request: Request,
  { params }: { params: { academyId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return apiError("Not authenticated", 401);
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email as string },
    select: { id: true, role: true },
  });

  if (!currentUser || (currentUser.role !== "master" && currentUser.role !== "admin")) {
    return apiError("Only platform admins can view academy payment status", 403);
  }

  try {
    const academy = await prisma.academy.findUnique({
      where: { id: params.academyId },
      select: {
        id: true,
        stripeConnectAccountId: true,
        stripeConnectOnboardingComplete: true,
        stripeConnectChargesEnabled: true,
        stripeConnectPayoutsEnabled: true,
      },
    });

    if (!academy) {
      return apiError("Academy not found", 404);
    }

    if (!academy.stripeConnectAccountId) {
      return NextResponse.json({
        hasAccount: false,
        onboardingComplete: false,
        chargesEnabled: false,
        payoutsEnabled: false,
      });
    }

    const account = await stripe.accounts.retrieve(academy.stripeConnectAccountId);

    if (
      account.details_submitted !== academy.stripeConnectOnboardingComplete ||
      account.charges_enabled !== academy.stripeConnectChargesEnabled ||
      account.payouts_enabled !== academy.stripeConnectPayoutsEnabled
    ) {
      await prisma.academy.update({
        where: { id: academy.id },
        data: {
          stripeConnectDetailsSubmitted: account.details_submitted,
          stripeConnectOnboardingComplete: account.details_submitted,
          stripeConnectChargesEnabled: account.charges_enabled,
          stripeConnectPayoutsEnabled: account.payouts_enabled,
          ...(account.details_submitted && !academy.stripeConnectOnboardingComplete
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
    return apiError(error.message || "Failed to get account status", 500);
  }
}
