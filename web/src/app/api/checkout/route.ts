// app/api/checkout/route.ts
import { NextResponse } from "next/server";
import { apiError, apiErrorCode } from "@/app/utils/api";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/app/libs/prismadb";
import Stripe from 'stripe';
import { createRateLimiter, getIP } from "@/app/libs/rateLimit";
import { getTransactionFeePercent } from "@/app/utils/subscription";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

const PLATFORM_FEE_PERCENT = 10; // 10% platform fee (ForMe's cut)

/** Parse a time string like "9:00 AM", "14:30", or "2:30 PM" into minutes since midnight */
function timeToMinutes(time: string): number {
  const cleaned = time.trim().toUpperCase();
  const isPM = cleaned.includes('PM');
  const isAM = cleaned.includes('AM');
  const digits = cleaned.replace(/[APM\s]/g, '');
  const [hStr, mStr] = digits.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr || '0', 10);

  if (isAM && h === 12) h = 0;
  if (isPM && h !== 12) h += 12;

  return h * 60 + m;
}

const limiter = createRateLimiter("checkout", { limit: 10, windowSeconds: 60 });

export async function POST(request: Request) {
  const ip = getIP(request);
  const rl = limiter(ip);
  if (!rl.allowed) {
    return apiError(`Too many requests. Try again in ${rl.retryAfterSeconds}s`, 429);
  }

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

  // Auth is no longer hard-required — guest checkout is supported. Identity
  // resolves from currentUser when signed-in, otherwise from guestEmail/guestName
  // in the request body. One of the two must be present.

  try {
    const body = await request.json();
    const {
      totalPrice,
      date,
      time,
      listingId,
      serviceId,
      serviceIds: rawServiceIds,
      serviceName,
      employeeId,
      employeeName,
      note,
      businessName,
      // Tip — passed in dollars to match totalPrice's unit. May be 0/undefined.
      tipAmount: rawTipAmount,
      // Guest checkout fields. Required iff currentUser is null.
      guestName,
      guestEmail,
      guestPhone,
    } = body;

    if (!currentUser) {
      if (!guestEmail?.trim() || !guestName?.trim()) {
        return apiError('Name and email are required for guest checkout', 400);
      }
    }

    // Validate the required fields
    if (!totalPrice || !date || !time || !listingId || !serviceId || !employeeId) {
      return apiErrorCode('MISSING_FIELDS');
    }

    // Multi-service support: serviceIds is the canonical list; serviceId stays
    // for legacy compatibility and as the "lead" service.
    const serviceIds: string[] = Array.isArray(rawServiceIds) && rawServiceIds.length > 0
      ? rawServiceIds.map((id: any) => String(id)).filter(Boolean)
      : [serviceId];

    const tipAmount: number = Math.max(0, Math.round(Number(rawTipAmount) || 0));
    const subtotal: number = Math.max(0, totalPrice - tipAmount);

    // ====== BOOKING RELIABILITY CHECKS ======

    const bookingDate = new Date(date);

    // 7C. Business hours enforcement
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const bookingDay = dayNames[bookingDate.getDay()];

    const storeHours = await prisma.storeHours.findFirst({
      where: { listingId, dayOfWeek: bookingDay },
    });

    if (storeHours) {
      if (storeHours.isClosed) {
        return apiError(`This business is closed on ${bookingDay}s`, 400);
      }

      // Compare booking time against open/close (times stored as "HH:MM" or "H:MM AM/PM")
      const bookingMinutes = timeToMinutes(time);
      const openMinutes = timeToMinutes(storeHours.openTime);
      const closeMinutes = timeToMinutes(storeHours.closeTime);

      if (bookingMinutes < openMinutes || bookingMinutes >= closeMinutes) {
        return apiError(
          `Booking time is outside business hours (${storeHours.openTime} - ${storeHours.closeTime})`,
          400
        );
      }
    }

    // 7A. Double-booking prevention
    // Check for existing reservations for the same employee at the same date/time
    const targetEmployeeId = employeeId !== "any" ? employeeId : null;

    if (targetEmployeeId) {
      // Get service duration and listing buffer for overlap check
      const [service, listing] = await Promise.all([
        prisma.service.findUnique({ where: { id: serviceId }, select: { durationMinutes: true } }),
        prisma.listing.findUnique({ where: { id: listingId }, select: { bufferMinutes: true } }),
      ]);

      const serviceDuration = service?.durationMinutes || 60;
      const buffer = listing?.bufferMinutes || 0;
      const totalBlockMinutes = serviceDuration + buffer;

      // Find existing reservations for this employee on the same date
      const startOfDay = new Date(bookingDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(bookingDate);
      endOfDay.setHours(23, 59, 59, 999);

      const existingReservations = await prisma.reservation.findMany({
        where: {
          employeeId: targetEmployeeId,
          date: { gte: startOfDay, lte: endOfDay },
          status: { not: 'cancelled' },
          paymentStatus: { not: 'refunded' },
          // Only real bookings block the slot — unpaid pending rows (no
          // paymentIntentId yet) can exist from abandoned checkout attempts
          // and must not lock their own slot on retry.
          paymentIntentId: { not: null },
        },
        include: {
          service: { select: { durationMinutes: true } },
        },
      });

      const newStartMin = timeToMinutes(time);
      const newEndMin = newStartMin + totalBlockMinutes;

      for (const existing of existingReservations) {
        const existingStartMin = timeToMinutes(existing.time);
        const existingDuration = existing.service?.durationMinutes || 60;
        const existingEndMin = existingStartMin + existingDuration + buffer;

        // Overlap check: two intervals [A, B) and [C, D) overlap when A < D and C < B
        if (newStartMin < existingEndMin && existingStartMin < newEndMin) {
          return apiError(
            'This time slot is no longer available. Please choose a different time.',
            409
          );
        }
      }
    }

    // Get the employee and the listing owner's Stripe Connect account.
    // If the listing belongs to an Academy, the academy is the destination
    // (the academy holds the Connect account on behalf of its students).
    let employee: any = null;
    let businessOwner: any = null;
    let listingAcademy: { id: string; stripeConnectAccountId: string | null; stripeConnectChargesEnabled: boolean; name: string } | null = null;
    let listingTitle: string | null = null;

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
        listingTitle = employee.listing.title;
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
        listingTitle = listing.title;
      }
    }

    if (!businessOwner) {
      return apiError("Listing not found", 404);
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

    // Calculate amounts — platform fee (ForMe's cut) + transaction fee (tier-based).
    // Tips bypass both fees: 100% of tips pass through to the worker.
    const subtotalCents = subtotal * 100;
    const tipCents = tipAmount * 100;
    const totalAmountCents = totalPrice * 100;
    const platformFeeCents = Math.round(subtotalCents * (PLATFORM_FEE_PERCENT / 100));
    // Guests have no subscription, so they pay the unsubscribed transaction
    // fee tier. Pass a synthetic empty-sub user when currentUser is null.
    const transactionFeePercent = getTransactionFeePercent(
      currentUser ?? { isSubscribed: false },
      totalAmountCents,
    );
    const transactionFeeCents = Math.round(subtotalCents * (transactionFeePercent / 100));
    const applicationFeeCents = platformFeeCents + transactionFeeCents;

    // Build line items — services as one line, tip as a separate line so
    // Stripe receipts show the breakdown the customer expects.
    const serviceLineName =
      serviceIds.length > 1
        ? `${serviceIds.length} services at ${businessName || 'Business'}`
        : serviceName || 'Service booking';
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: serviceLineName,
            description: `Booking with ${employee?.fullName || employeeName || 'Any Available'} at ${businessName || 'Business'} on ${new Date(date).toLocaleDateString()} at ${time}`,
          },
          unit_amount: subtotalCents,
        },
        quantity: 1,
      },
    ];
    if (tipCents > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Tip' },
          unit_amount: tipCents,
        },
        quantity: 1,
      });
    }

    // Build checkout session config
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: body.platform === 'ios'
        ? `formesizzle://booking-success?session_id={CHECKOUT_SESSION_ID}`
        : `${process.env.NEXT_PUBLIC_APP_URL}/bookings/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: body.platform === 'ios'
        ? `formesizzle://booking-cancelled`
        : `${process.env.NEXT_PUBLIC_APP_URL}/listings/${listingId}`,
      metadata: {
        // userId is empty string for guest checkouts — the webhook treats
        // empty as "no linked user" and falls back to guestEmail/guestName.
        userId: currentUser?.id || '',
        listingId,
        serviceId,
        // Comma-separated to stay within Stripe's 500-char per-value limit.
        serviceIds: serviceIds.join(','),
        serviceName: serviceName || '',
        employeeId,
        employeeName: employeeName || employee?.fullName || 'Any Available',
        date: new Date(date).toISOString(),
        time,
        note: note || '',
        businessName: businessName || listingTitle || '',
        businessOwnerId: businessOwner.id,
        employeeUserId: employee?.userId || '',
        platformFeePercent: String(PLATFORM_FEE_PERCENT),
        transactionFeePercent: String(transactionFeePercent),
        subtotal: String(subtotal),
        tipAmount: String(tipAmount),
        guestName: guestName?.trim() || '',
        guestEmail: guestEmail?.trim() || '',
        guestPhone: guestPhone?.trim() || '',
        // When set, the booking is for an academy-owned listing (e.g. a student).
        // Funds were routed to the academy's Connect account, not the listing owner.
        academyId: listingAcademy?.id ?? '',
      },
    };

    // For guest checkouts, prefill the receipt email so Stripe sends a copy.
    if (!currentUser && guestEmail?.trim()) {
      sessionConfig.customer_email = guestEmail.trim();
    }

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