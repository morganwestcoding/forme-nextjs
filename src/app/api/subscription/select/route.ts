// app/api/subscription/select/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { plan, interval } = await req.json() as { plan: string; interval?: "monthly" | "yearly" };

    const normalized = (plan || "").toLowerCase();
    const isFree = normalized.includes("quartz") || normalized.includes("basic") || normalized.includes("bronze");
    if (!isFree) {
      return new NextResponse("Paid plan requires Stripe checkout", { status: 400 });
    }

    const user = await prisma.user.update({
      where: { email: session.user.email as string },
      data: {
        isSubscribed: false,
        subscriptionTier: "Quartz",
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
