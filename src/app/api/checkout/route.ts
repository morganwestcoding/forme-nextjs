// app/api/checkout/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/app/libs/prismadb";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia', // Update this to match your Stripe version
});

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

    // Get the listing details
    const listing = await prisma.listing.findUnique({
      where: {
        id: listingId,
      },
      include: {
        user: true,
      },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Create a Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: serviceName || 'Service booking',
              description: `Booking for ${businessName || listing.title} on ${new Date(date).toLocaleDateString()} at ${time}`,
            },
            unit_amount: totalPrice * 100, // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/trips/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/listings/${listingId}`,
      metadata: {
        userId: currentUser.id,
        listingId,
        serviceId,
        serviceName: serviceName || '',
        employeeId,
        employeeName: employeeName || '',
        date: new Date(date).toISOString(),
        time,
        note: note || '',
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