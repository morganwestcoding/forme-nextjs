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
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
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

    // Get the current user
    const currentUser = await prisma.user.findUnique({
      where: {
        email: session.user.email as string,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the employee and their user's Stripe Connect account
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        user: {
          select: {
            stripeConnectAccountId: true,
            stripeConnectChargesEnabled: true,
            name: true,
          },
        },
        listing: true,
      },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Check if employee has a valid Stripe Connect account
    const employeeStripeAccountId = employee.user.stripeConnectAccountId;
    const employeeChargesEnabled = employee.user.stripeConnectChargesEnabled;

    if (!employeeStripeAccountId || !employeeChargesEnabled) {
      return NextResponse.json(
        {
          error: "This worker has not set up their payment account yet. Please contact them or choose another provider.",
          code: "STRIPE_CONNECT_NOT_SETUP"
        },
        { status: 400 }
      );
    }

    // Calculate amounts
    const totalAmountCents = totalPrice * 100;
    const applicationFeeCents = Math.round(totalAmountCents * (PLATFORM_FEE_PERCENT / 100));

    // Create Stripe checkout session with destination charge
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: serviceName || 'Service booking',
              description: `Booking with ${employee.fullName} at ${businessName || employee.listing.title} on ${new Date(date).toLocaleDateString()} at ${time}`,
            },
            unit_amount: totalAmountCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/bookings/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/listings/${listingId}`,
      // Destination charge: funds go to employee's Connect account
      payment_intent_data: {
        application_fee_amount: applicationFeeCents,
        transfer_data: {
          destination: employeeStripeAccountId,
        },
      },
      metadata: {
        userId: currentUser.id,
        listingId,
        serviceId,
        serviceName: serviceName || '',
        employeeId,
        employeeName: employeeName || employee.fullName,
        date: new Date(date).toISOString(),
        time,
        note: note || '',
        businessName: businessName || employee.listing.title,
        // Store for reference
        employeeUserId: employee.userId,
        platformFeePercent: String(PLATFORM_FEE_PERCENT),
      },
    });

    return NextResponse.json({ sessionId: checkoutSession.id });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}