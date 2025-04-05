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
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log(`Webhook event received: ${event.type}`);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(`Processing checkout session: ${session.id}`);
      
      // Create reservation from the session metadata
      if (session.metadata) {
        try {
          console.log("Session metadata:", JSON.stringify(session.metadata, null, 2));
          
          // Check if reservation already exists (to avoid duplicates)
          if (session.payment_intent) {
            const existingReservation = await prisma.reservation.findFirst({
              where: {
                paymentIntentId: String(session.payment_intent)
              }
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
          
          // Create notifications
          try {
            // Notification for the customer
            await prisma.notification.create({
              data: {
                type: 'RESERVATION_CREATED',
                content: `Your reservation for ${session.metadata.serviceName} has been confirmed`,
                userId: session.metadata.userId
              }
            });
            
            // Notification for the business owner
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
          // Log more detailed error information
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