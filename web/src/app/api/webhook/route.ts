// src/app/api/webhook/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import prisma from '@/app/libs/prismadb';
import { apiError } from '@/app/utils/api';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error: any) {
      return apiError(error.message, 400);
    }

    // ========== CHECKOUT COMPLETE ==========
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      const kind = session.metadata?.kind;

      // ----- A) Reservations (existing) -----
      if (kind !== 'subscription') {
        // Create reservation from the session metadata
        if (session.metadata) {
          try {
            // Avoid duplicates by payment_intent
            const paymentIntent = session.payment_intent ? String(session.payment_intent) : null;
            if (paymentIntent) {
              const existingReservation = await prisma.reservation.findFirst({
                where: { paymentIntentId: paymentIntent }
              });
              if (existingReservation) {
                return NextResponse.json({ received: true });
              }
            } else {
              // No payment_intent means we can't guarantee idempotency — skip creation
              return NextResponse.json({ received: true });
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
              // Notification creation failed; non-critical
            }
          } catch (error: any) {
            // Reservation creation failed
          }
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
            return NextResponse.json({ received: true });
          }

          const subId = typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription.id;

          // Idempotency: skip if this subscription is already stored for this user
          const existingUser = await prisma.user.findUnique({ where: { id: userId }, select: { stripeSubscriptionId: true } });
          if (existingUser?.stripeSubscriptionId === subId) {
            return NextResponse.json({ received: true });
          }

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

        } catch (err) {
          // Subscription handling failed
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
      }

      return NextResponse.json({ received: true });
    }

    // ========== STRIPE CONNECT ACCOUNT EVENTS ==========
    if (event.type === 'account.updated') {
      const account = event.data.object as Stripe.Account;

      // A Connect account ID may belong to either a User (worker) or an
      // Academy (Phase 5b). Try the user first, then fall back to academy.
      const user = await prisma.user.findFirst({
        where: { stripeConnectAccountId: account.id },
      });

      if (user) {
        const wasNotComplete = !user.stripeConnectOnboardingComplete;

        await prisma.user.update({
          where: { id: user.id },
          data: {
            stripeConnectDetailsSubmitted: account.details_submitted,
            stripeConnectOnboardingComplete: account.details_submitted,
            stripeConnectChargesEnabled: account.charges_enabled,
            stripeConnectPayoutsEnabled: account.payouts_enabled,
            ...(account.details_submitted && wasNotComplete
              ? { stripeConnectOnboardedAt: new Date() }
              : {}),
          },
        });

        // Create notification when onboarding completes (idempotent — skip if already sent)
        if (account.details_submitted && wasNotComplete) {
          const alreadyNotified = await prisma.notification.findFirst({
            where: { userId: user.id, type: 'STRIPE_CONNECT_COMPLETE' },
          });
          if (!alreadyNotified) {
            await prisma.notification.create({
              data: {
                type: 'STRIPE_CONNECT_COMPLETE',
                content: 'Your payment account is now set up! You can start receiving payments for your services.',
                userId: user.id,
              },
            });
          }
        }
      } else {
        const academy = await prisma.academy.findFirst({
          where: { stripeConnectAccountId: account.id },
        });

        if (academy) {
          const wasNotComplete = !academy.stripeConnectOnboardingComplete;

          await prisma.academy.update({
            where: { id: academy.id },
            data: {
              stripeConnectDetailsSubmitted: account.details_submitted,
              stripeConnectOnboardingComplete: account.details_submitted,
              stripeConnectChargesEnabled: account.charges_enabled,
              stripeConnectPayoutsEnabled: account.payouts_enabled,
              ...(account.details_submitted && wasNotComplete
                ? { stripeConnectOnboardedAt: new Date() }
                : {}),
            },
          });

        }
      }

      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    return apiError('Webhook handler failed', 500);
  }
}
