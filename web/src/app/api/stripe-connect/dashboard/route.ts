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

    if (!currentUser?.stripeConnectAccountId) {
      return NextResponse.json(
        { error: "No Stripe Connect account found" },
        { status: 404 }
      );
    }

    const loginLink = await stripe.accounts.createLoginLink(
      currentUser.stripeConnectAccountId
    );

    return NextResponse.json({ url: loginLink.url });
  } catch (error: any) {
    console.error("Stripe Connect dashboard error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create dashboard link" },
      { status: 500 }
    );
  }
}
