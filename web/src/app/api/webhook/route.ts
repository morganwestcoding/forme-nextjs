// src/app/api/webhook/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import prisma from '@/app/libs/prismadb';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    console.log("Webhook endpoint called!");
    const body = await req.text();
    const signature = headers().get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log(`Webhook event received: ${event.type}`);

    // ========== CHECKOUT COMPLETE ==========
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(`Processing checkout session: ${session.id}`);

      const kind = session.metadata?.kind;

      // ----- A) Reservations (existing) -----
      if (kind !== 'subscription') {
        // Create reservation from the session metadata
        if (session.metadata) {
          try {
            console.log("Session metadata:", JSON.stringify(session.metadata, null, 2));

            // Avoid duplicates by payment_intent
            if (session.payment_intent) {
              const existingReservation = await prisma.reservation.findFirst({
                where: { paymentIntentId: String(session.payment_intent) }
              });
              if (existingReservation) {
                console.log(`Reservation already exists for payment intent ${session.payment_intent}`);
                return NextResponse.json({ received: true });
              }
            }

            const reservation = await prisma.reservation.create({
              data: {
                userId: session.metadata.userId,
                listingId: session.metadata.listingId,
                serviceId: session.metadata.serviceId,
                serviceName: session.metadata.serviceName || 'Service',
                employeeId: session.metadata.employeeId,
                date: new Date(session.metadata.date),
                time: session.metadata.time,
                note: session.metadata.note || '',
                totalPrice: Number(session.amount_total! / 100),
                status: 'pending',
                paymentIntentId: session.payment_intent ? String(session.payment_intent) : null,
                paymentStatus: 'completed',
              },
            });

            console.log(`Reservation created successfully: ${reservation.id}`);

            // Notifications
            try {
              await prisma.notification.create({
                data: {
                  type: 'RESERVATION_CREATED',
                  content: `Your reservation for ${session.metadata.serviceName} has been confirmed`,
                  userId: session.metadata.userId
                }
              });

              const listing = await prisma.listing.findUnique({
                where: { id: session.metadata.listingId },
                select: { userId: true }
              });

              if (listing) {
                await prisma.notification.create({
                  data: {
                    type: 'NEW_RESERVATION',
                    content: `New reservation for ${session.metadata.serviceName} on ${new Date(session.metadata.date).toLocaleDateString()}`,
                    userId: listing.userId
                  }
                });
              }
            } catch (notifyError) {
              console.error('Error creating notifications:', notifyError);
            }
          } catch (error: any) {
            console.error('Error creating reservation:', error);
            console.error({
              message: error.message,
              code: error.code,
              name: error.name,
              stack: error.stack,
              meta: error.meta
            });
          }
        } else {
          console.error('No metadata found in session:', session.id);
        }

        return NextResponse.json({ received: true });
      }

      // ----- B) Subscriptions (new) -----
      if (kind === 'subscription') {
        try {
          const userId = session.metadata?.userId as string | undefined;
          const planId = session.metadata?.planId as string | undefined;
          const interval = session.metadata?.interval as "monthly" | "yearly" | undefined;

          if (!userId || !session.subscription) {
            console.error('Missing userId or subscription on session');
            return NextResponse.json({ received: true });
          }

          const subId = typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription.id;

          const sub = await stripe.subscriptions.retrieve(subId);

          const currentPeriodEnd = new Date(sub.current_period_end * 1000);
          const priceId = sub.items.data[0]?.price?.id || null;
          const stripeCustomerId = (session.customer as string) || null;

          const tierLabel =
            planId === 'pearl'   ? 'Pearl'   :
            planId === 'sapphire'? 'Sapphire':
            planId === 'ruby'    ? 'Ruby'    :
            planId === 'emerald' ? 'Emerald' : 'Unknown';

          await prisma.user.update({
            where: { id: userId },
            data: {
              isSubscribed: true,
              subscriptionTier: tierLabel,
              subscriptionStartDate: new Date(),
              subscriptionEndDate: currentPeriodEnd,
              stripeCustomerId: stripeCustomerId || undefined,
              stripeSubscriptionId: sub.id,
              subscriptionPriceId: priceId,
              subscriptionStatus: sub.status,
              subscriptionBillingInterval: sub.items.data[0]?.plan?.interval || interval || null,
              currentPeriodEnd,
            },
          });

          console.log(`Subscription saved for user ${userId} → ${tierLabel}`);
        } catch (err) {
          console.error("Subscription handling error:", err);
        }

        return NextResponse.json({ received: true });
      }
    }

    // ========== SUBSCRIPTION LIFECYCLE ==========
    if (
      event.type === 'customer.subscription.created' ||
      event.type === 'customer.subscription.updated'
    ) {
      const sub = event.data.object as Stripe.Subscription;

      const userId =
        (sub.metadata?.userId as string | undefined) ??
        (sub.items.data[0]?.price?.metadata?.userId as string | undefined);

      if (userId) {
        const currentPeriodEnd = new Date(sub.current_period_end * 1000);
        const priceId = sub.items.data[0]?.price?.id || null;
        const interval = sub.items.data[0]?.price?.recurring?.interval || null;

        await prisma.user.update({
          where: { id: userId },
          data: {
            isSubscribed: ['active', 'trialing', 'past_due'].includes(sub.status),
            subscriptionStatus: sub.status,
            subscriptionPriceId: priceId,
            subscriptionBillingInterval: interval,
            currentPeriodEnd,
            subscriptionEndDate: currentPeriodEnd,
          },
        });

        console.log(`Subscription ${event.type} persisted for user ${userId}`);
      }

      return NextResponse.json({ received: true });
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription;

      const userId =
        (sub.metadata?.userId as string | undefined) ??
        (sub.items.data[0]?.price?.metadata?.userId as string | undefined);

      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            isSubscribed: false,
            subscriptionStatus: 'canceled',
            stripeSubscriptionId: null,
            subscriptionPriceId: null,
          },
        });
        console.log(`Subscription canceled for user ${userId}`);
      }

      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    console.error(error.stack);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
