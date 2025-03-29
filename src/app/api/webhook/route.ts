// app/api/webhook/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import prisma from '@/app/libs/prismadb';

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
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Create reservation from the session metadata
      if (session.metadata) {
        try {
          await prisma.reservation.create({
            data: {
              userId: session.metadata.userId,
              listingId: session.metadata.listingId,
              serviceId: session.metadata.serviceId,
              serviceName: session.metadata.serviceName || 'Service',
              employeeId: session.metadata.employeeId,
              date: new Date(session.metadata.date),
              time: session.metadata.time,
              note: session.metadata.note || '',
              totalPrice: Number(session.amount_total! / 100), // Convert from cents to dollars
              status: 'pending',
              paymentIntentId: session.payment_intent ? String(session.payment_intent) : null,
              paymentStatus: 'completed',
            },
          });
          
          console.log(`Reservation created successfully for session ${session.id}`);
          
          // Optionally send confirmation email to user and notification to business
          // This could be implemented with a messaging queue or email service
          
        } catch (error) {
          console.error('Error creating reservation:', error);
          // We don't return an error response here as Stripe will retry the webhook
          // Instead log the error and return success to prevent retries
        }
      }
    }

    // Handle additional event types if needed
    // For example: payment_intent.succeeded, payment_intent.payment_failed, etc.

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Required for Stripe to work with Next.js Edge Runtime
export const config = {
  api: {
    bodyParser: false, // Required for webhook validation
  },
};