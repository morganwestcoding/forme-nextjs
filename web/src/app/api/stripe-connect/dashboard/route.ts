import { NextResponse } from "next/server";
import { apiError, apiErrorCode } from "@/app/utils/api";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getUserFromRequest } from "@/app/utils/mobileAuth";
import prisma from "@/app/libs/prismadb";
import Stripe from "stripe";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(request: Request) {
  // Accept either mobile bearer token or web NextAuth session.
  const mobileUser = await getUserFromRequest(request);
  const session = mobileUser ? null : await getServerSession(authOptions);
  if (!mobileUser && !session?.user?.email) {
    return apiErrorCode('UNAUTHORIZED');
  }

  try {
    const currentUser = mobileUser
      ? await prisma.user.findUnique({ where: { id: mobileUser.id } })
      : await prisma.user.findUnique({ where: { email: session!.user!.email as string } });

    if (!currentUser?.stripeConnectAccountId) {
      return apiError("No Stripe Connect account found", 404);
    }

    const loginLink = await stripe.accounts.createLoginLink(
      currentUser.stripeConnectAccountId
    );

    return NextResponse.json({ url: loginLink.url });
  } catch (error: any) {
    return apiError(error.message || "Failed to create dashboard link", 500);
  }
}
