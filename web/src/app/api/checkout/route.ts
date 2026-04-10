// app/api/checkout/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/app/libs/prismadb";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

const PLATFORM_FEE_PERCENT = 10; // 10% platform fee

export async function POST(request: Request) {
  // Support both mobile Bearer token and web session auth
  const { getUserFromRequest } = await import("@/app/utils/mobileAuth");
  let currentUser = await getUserFromRequest(request);

  if (!currentUser) {
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email as string },
      });
      if (dbUser) {
        currentUser = {
          ...dbUser,
          createdAt: dbUser.createdAt.toISOString(),
          updatedAt: dbUser.updatedAt.toISOString(),
          emailVerified: dbUser.emailVerified?.toISOString() || null,
          bio: dbUser.bio || '',
          isSubscribed: dbUser.isSubscribed,
          following: dbUser.following || [],
          followers: dbUser.followers || [],
          role: dbUser.role || 'user',
        };
      }
    }
  }

  if (!currentUser) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      totalPrice,
      date,
      time,
      listingId,
      serviceId,
      serviceName,
      employeeId,
      employeeName,
      note,
      businessName
    } = body;

    // Validate the required fields
    if (!totalPrice || !date || !time || !listingId || !serviceId || !employeeId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get the employee and the listing owner's Stripe Connect account
    let employee: any = null;
    let businessOwner: any = null;

    if (employeeId && employeeId !== "any") {
      employee = await prisma.employee.findUnique({
        where: { id: employeeId },
        include: {
          listing: {
            include: {
              user: {
                select: {
                  id: true,
                  stripeConnectAccountId: true,
                  stripeConnectChargesEnabled: true,
                  name: true,
                },
              },
            },
          },
        },
      });
      if (employee) {
        businessOwner = employee.listing.user;
      }
    }

    // Fallback: get business owner from listing directly
    if (!businessOwner && listingId) {
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        include: {
          user: {
            select: {
              id: true,
              stripeConnectAccountId: true,
              stripeConnectChargesEnabled: true,
              name: true,
            },
          },
        },
      });
      if (listing) {
        businessOwner = listing.user;
      }
    }

    const businessStripeAccountId = businessOwner?.stripeConnectAccountId;
    const businessChargesEnabled = businessOwner?.stripeConnectChargesEnabled;
    const hasStripeConnect = businessStripeAccountId && businessChargesEnabled;

    // Calculate amounts
    const totalAmountCents = totalPrice * 100;
    const applicationFeeCents = Math.round(totalAmountCents * (PLATFORM_FEE_PERCENT / 100));

    // Build checkout session config
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: serviceName || 'Service booking',
              description: `Booking with ${employee?.fullName || employeeName || 'Any Available'} at ${businessName || 'Business'} on ${new Date(date).toLocaleDateString()} at ${time}`,
            },
            unit_amount: totalAmountCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: body.platform === 'ios'
        ? `formesizzle://booking-success?session_id={CHECKOUT_SESSION_ID}`
        : `${process.env.NEXT_PUBLIC_APP_URL}/bookings/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: body.platform === 'ios'
        ? `formesizzle://booking-cancelled`
        : `${process.env.NEXT_PUBLIC_APP_URL}/listings/${listingId}`,
      metadata: {
        userId: currentUser.id,
        listingId,
        serviceId,
        serviceName: serviceName || '',
        employeeId,
        employeeName: employeeName || employee?.fullName || 'Any Available',
        date: new Date(date).toISOString(),
        time,
        note: note || '',
        businessName: businessName || employee.listing.title,
        businessOwnerId: businessOwner.id,
        employeeUserId: employee.userId,
        platformFeePercent: String(PLATFORM_FEE_PERCENT),
      },
    };

    // Payment goes to the business owner (not the employee directly)
    if (hasStripeConnect) {
      sessionConfig.payment_intent_data = {
        application_fee_amount: applicationFeeCents,
        transfer_data: {
          destination: businessStripeAccountId,
        },
      };
    }

    const checkoutSession = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}