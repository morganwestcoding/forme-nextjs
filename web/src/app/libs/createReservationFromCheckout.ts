import Stripe from 'stripe';
import prisma from '@/app/libs/prismadb';
import {
  sendEmail,
  sendNotificationEmail,
  bookingConfirmationEmail,
  newBookingReceivedEmail,
} from '@/app/libs/email';

type CreateResult =
  | { created: true; reservationId: string }
  | { created: false; reason: 'no_payment_intent' | 'already_exists' | 'missing_metadata'; reservationId?: string };

/**
 * Idempotently create a Reservation from a completed Stripe Checkout Session.
 * Called from both the Stripe webhook and the success-page verify endpoint
 * so the booking lands in the DB even if the webhook is delayed or undelivered.
 */
export async function createReservationFromCheckoutSession(
  session: Stripe.Checkout.Session
): Promise<CreateResult> {
  const metadata = session.metadata;
  // Either userId (logged-in) or guestEmail (guest checkout) must identify
  // the booker. Everything else is required either way.
  if (
    !metadata ||
    !metadata.listingId ||
    !metadata.serviceId ||
    !metadata.employeeId ||
    !metadata.date ||
    !metadata.time ||
    (!metadata.userId && !metadata.guestEmail)
  ) {
    return { created: false, reason: 'missing_metadata' };
  }

  const paymentIntent = session.payment_intent ? String(session.payment_intent) : null;
  if (!paymentIntent) {
    return { created: false, reason: 'no_payment_intent' };
  }

  const existing = await prisma.reservation.findFirst({
    where: { paymentIntentId: paymentIntent },
    select: { id: true },
  });
  if (existing) {
    return { created: false, reason: 'already_exists', reservationId: existing.id };
  }

  // serviceIds is comma-separated in metadata to stay under Stripe's 500-char
  // per-value cap. Falls back to the singular serviceId for legacy sessions.
  const serviceIds = metadata.serviceIds
    ? metadata.serviceIds.split(',').filter(Boolean)
    : [metadata.serviceId];

  const totalPrice = Number(session.amount_total! / 100);
  const tipAmount = metadata.tipAmount ? Number(metadata.tipAmount) : 0;
  const subtotal = metadata.subtotal ? Number(metadata.subtotal) : totalPrice - tipAmount;

  const reservation = await prisma.reservation.create({
    data: {
      userId: metadata.userId || null,
      listingId: metadata.listingId,
      serviceId: metadata.serviceId,
      serviceName: metadata.serviceName || 'Service',
      serviceIds,
      employeeId: metadata.employeeId,
      date: new Date(metadata.date),
      time: metadata.time,
      note: metadata.note || '',
      totalPrice,
      subtotal,
      tipAmount,
      guestName: metadata.guestName || null,
      guestEmail: metadata.guestEmail || null,
      guestPhone: metadata.guestPhone || null,
      status: 'pending',
      paymentIntentId: paymentIntent,
      paymentStatus: 'completed',
    },
  });

  // Service-count summary used in notification text and emails.
  const serviceCountLabel =
    serviceIds.length > 1
      ? `${serviceIds.length} services`
      : metadata.serviceName || 'Service';

  // Notifications + emails (best-effort)
  try {
    if (metadata.userId) {
      await prisma.notification.create({
        data: {
          type: 'RESERVATION_CREATED',
          content: `Your reservation for ${serviceCountLabel} has been confirmed`,
          userId: metadata.userId,
          relatedListingId: metadata.listingId,
        },
      });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: metadata.listingId },
      select: { userId: true },
    });

    if (listing) {
      await prisma.notification.create({
        data: {
          type: 'NEW_RESERVATION',
          content: `New reservation for ${serviceCountLabel} on ${new Date(metadata.date).toLocaleDateString()}`,
          userId: listing.userId,
          relatedListingId: metadata.listingId,
        },
      });

      const ownerUser = await prisma.user.findUnique({
        where: { id: listing.userId },
        select: { email: true, emailNotifications: true },
      });
      if (ownerUser) {
        const tpl = newBookingReceivedEmail({
          serviceName: serviceCountLabel,
          serviceCount: serviceIds.length,
          customerName: metadata.guestName || metadata.employeeName || 'Customer',
          date: new Date(metadata.date).toLocaleDateString(),
          time: metadata.time,
          subtotal,
          tipAmount,
          totalPrice,
        });
        sendNotificationEmail(ownerUser, tpl).catch(() => {});
      }
    }

    // Resolve recipient email: logged-in user via DB, else guestEmail from metadata.
    let recipientEmail: string | null = null;
    if (metadata.userId) {
      const customer = await prisma.user.findUnique({
        where: { id: metadata.userId },
        select: { email: true },
      });
      recipientEmail = customer?.email || null;
    } else if (metadata.guestEmail) {
      recipientEmail = metadata.guestEmail;
    }
    if (recipientEmail) {
      const tpl = bookingConfirmationEmail({
        serviceName: serviceCountLabel,
        serviceCount: serviceIds.length,
        businessName: metadata.businessName || 'Business',
        date: new Date(metadata.date).toLocaleDateString(),
        time: metadata.time,
        subtotal,
        tipAmount,
        totalPrice,
      });
      sendEmail({ ...tpl, to: recipientEmail }).catch(() => {});
    }
  } catch {
    // notifications are non-critical
  }

  return { created: true, reservationId: reservation.id };
}
