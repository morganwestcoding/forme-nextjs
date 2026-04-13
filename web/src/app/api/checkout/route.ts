// app/api/checkout/route.ts
import { NextResponse } from "next/server";
import { apiError, apiErrorCode } from "@/app/utils/api";
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
    return apiErrorCode('UNAUTHORIZED');
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
      return apiErrorCode('MISSING_FIELDS');
    }

    // Get the employee and the listing owner's Stripe Connect account.
    // If the listing belongs to an Academy, the academy is the destination
    // (the academy holds the Connect account on behalf of its students).
    let employee: any = null;
    let businessOwner: any = null;
    let listingAcademy: { id: string; stripeConnectAccountId: string | null; stripeConnectChargesEnabled: boolean; name: string } | null = null;

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
              academy: {
                select: {
                  id: true,
                  name: true,
                  stripeConnectAccountId: true,
                  stripeConnectChargesEnabled: true,
                },
              },
            },
          },
        },
      });
      if (employee) {
        businessOwner = employee.listing.user;
        listingAcademy = employee.listing.academy;
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
          academy: {
            select: {
              id: true,
              name: true,
              stripeConnectAccountId: true,
              stripeConnectChargesEnabled: true,
            },
          },
        },
      });
      if (listing) {
        businessOwner = listing.user;
        listingAcademy = listing.academy;
      }
    }

    // Academy-owned listings route payment to the academy's Connect account
    // instead of the listing owner. Students don't have their own Connect
    // account — the academy receives the funds and disburses (or keeps) them
    // according to the student's PayAgreement.
    const destinationStripeAccountId = listingAcademy?.stripeConnectAccountId
      ?? businessOwner?.stripeConnectAccountId;
    const destinationChargesEnabled = listingAcademy
      ? listingAcademy.stripeConnectChargesEnabled
      : businessOwner?.stripeConnectChargesEnabled;
    const hasStripeConnect = destinationStripeAccountId && destinationChargesEnabled;

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
        // When set, the booking is for an academy-owned listing (e.g. a student).
        // Funds were routed to the academy's Connect account, not the listing owner.
        academyId: listingAcademy?.id ?? '',
      },
    };

    // Payment goes to the destination Connect account — academy if the listing
    // belongs to one, otherwise the business owner.
    if (hasStripeConnect) {
      sessionConfig.payment_intent_data = {
        application_fee_amount: applicationFeeCents,
        transfer_data: {
          destination: destinationStripeAccountId,
        },
      };
    }

    const checkoutSession = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url });
  } catch (error: any) {
    return apiError(error.message || "Something went wrong", 500);
  }
}