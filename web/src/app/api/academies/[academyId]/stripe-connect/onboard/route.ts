import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/app/libs/prismadb";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

// POST /api/academies/[academyId]/stripe-connect/onboard
//
// Creates (or reuses) a Stripe Connect Express account for an Academy and
// returns an onboarding link the master admin can hand to the academy.
//
// Auth: master role only. v1 has no academy admin accounts (Phase 7), so the
// platform owner initiates onboarding on the academy's behalf — the academy
// completes KYC themselves via the returned URL.
export async function POST(
  request: Request,
  { params }: { params: { academyId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email as string },
    select: { id: true, role: true },
  });

  if (!currentUser || currentUser.role !== "master") {
    return NextResponse.json(
      { error: "Only platform admins can onboard academies" },
      { status: 403 }
    );
  }

  try {
    const academy = await prisma.academy.findUnique({
      where: { id: params.academyId },
    });

    if (!academy) {
      return NextResponse.json({ error: "Academy not found" }, { status: 404 });
    }

    let accountId = academy.stripeConnectAccountId;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "US",
        email: academy.contactEmail || undefined,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: "company",
        company: {
          name: academy.name,
        },
        metadata: {
          academyId: academy.id,
          academyName: academy.name,
        },
      });

      accountId = account.id;

      await prisma.academy.update({
        where: { id: academy.id },
        data: { stripeConnectAccountId: accountId },
      });
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/academies/${academy.id}?stripe_connect=refresh`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/academies/${academy.id}?stripe_connect=success`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error: any) {
    console.error("Academy Stripe Connect onboarding error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create onboarding link" },
      { status: 500 }
    );
  }
}
