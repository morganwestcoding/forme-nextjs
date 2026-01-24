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
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is an employee (can receive payments)
    const employeeRecord = await prisma.employee.findFirst({
      where: { userId: currentUser.id, isActive: true },
    });

    if (!employeeRecord) {
      return NextResponse.json(
        { error: "You must be an active worker to set up payments" },
        { status: 403 }
      );
    }

    let accountId = currentUser.stripeConnectAccountId;

    // Create Connect Express account if not exists
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "US",
        email: currentUser.email || undefined,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: "individual",
        metadata: {
          userId: currentUser.id,
        },
      });

      accountId = account.id;

      await prisma.user.update({
        where: { id: currentUser.id },
        data: { stripeConnectAccountId: accountId },
      });
    }

    // Create Account Link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile/${currentUser.id}?stripe_connect=refresh`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile/${currentUser.id}?stripe_connect=success`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error: any) {
    console.error("Stripe Connect onboarding error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create onboarding link" },
      { status: 500 }
    );
  }
}
