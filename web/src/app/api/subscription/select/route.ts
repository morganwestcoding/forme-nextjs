// app/api/subscription/select/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { apiError, apiErrorCode } from "@/app/utils/api";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return apiErrorCode('UNAUTHORIZED');
    }

    const { plan, interval } = await req.json() as { plan: string; interval?: "monthly" | "yearly" };

    const normalized = (plan || "").toLowerCase();
    const isBronze = normalized.includes("bronze") || normalized.includes("basic") || normalized.includes("free");
    if (!isBronze) {
      return apiError("Paid plan requires Stripe checkout", 400);
    }

    const user = await prisma.user.update({
      where: { email: session.user.email as string },
      data: {
        isSubscribed: false,
        subscriptionTier: "Bronze",
        subscriptionStartDate: null,
        subscriptionEndDate: null,
        subscriptionStatus: null,
        subscriptionBillingInterval: interval || null,
        stripeSubscriptionId: null,
        subscriptionPriceId: null,
      },
    });

    return NextResponse.json(user);
  } catch (e: any) {
    console.error("[SUB_SELECT_POST]", e);
    return new NextResponse(e.message || "Internal error", { status: 500 });
  }
}