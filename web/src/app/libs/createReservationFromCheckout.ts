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
  if (!metadata || !metadata.userId || !metadata.listingId || !metadata.serviceId || !metadata.employeeId || !metadata.date || !metadata.time) {
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

  const reservation = await prisma.reservation.create({
    data: {
      userId: metadata.userId,
      listingId: metadata.listingId,
      serviceId: metadata.serviceId,
      serviceName: metadata.serviceName || 'Service',
      employeeId: metadata.employeeId,
      date: new Date(metadata.date),
      time: metadata.time,
      note: metadata.note || '',
      totalPrice: Number(session.amount_total! / 100),
      status: 'pending',
      paymentIntentId: paymentIntent,
      paymentStatus: 'completed',
    },
  });

  // Notifications + emails (best-effort)
  try {
    await prisma.notification.create({
      data: {
        type: 'RESERVATION_CREATED',
        content: `Your reservation for ${metadata.serviceName} has been confirmed`,
        userId: metadata.userId,
      },
    });

    const listing = await prisma.listing.findUnique({
      where: { id: metadata.listingId },
      select: { userId: true },
    });

    if (listing) {
      await prisma.notification.create({
        data: {
          type: 'NEW_RESERVATION',
          content: `New reservation for ${metadata.serviceName} on ${new Date(metadata.date).toLocaleDateString()}`,
          userId: listing.userId,
        },
      });

      const ownerUser = await prisma.user.findUnique({
        where: { id: listing.userId },
        select: { email: true, emailNotifications: true },
      });
      if (ownerUser) {
        const tpl = newBookingReceivedEmail({
          serviceName: metadata.serviceName || 'Service',
          customerName: metadata.employeeName || 'Customer',
          date: new Date(metadata.date).toLocaleDateString(),
          time: metadata.time,
          totalPrice: Number(session.amount_total! / 100),
        });
        sendNotificationEmail(ownerUser, tpl).catch(() => {});
      }
    }

    const customer = await prisma.user.findUnique({
      where: { id: metadata.userId },
      select: { email: true },
    });
    if (customer?.email) {
      const tpl = bookingConfirmationEmail({
        serviceName: metadata.serviceName || 'Service',
        businessName: metadata.businessName || 'Business',
        date: new Date(metadata.date).toLocaleDateString(),
        time: metadata.time,
        totalPrice: Number(session.amount_total! / 100),
      });
      sendEmail({ ...tpl, to: customer.email }).catch(() => {});
    }
  } catch {
    // notifications are non-critical
  }

  return { created: true, reservationId: reservation.id };
}
