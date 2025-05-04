import { NextRequest, NextResponse } from 'next/server';
import { handleStripeWebhook } from '@/lib/stripe';
import Stripe from 'stripe';

// Detect environment
const isDev = process.env.NODE_ENV === 'development';
const isStaging = process.env.APP_ENV === 'staging';
const isProd = process.env.NODE_ENV === 'production' && process.env.APP_ENV !== 'staging';

export async function POST(request: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-04-30.basil',
    });
    
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');
    
    if (!signature) {
      console.error('[Stripe Webhook] Missing Stripe signature');
      return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
    }
    
    let event: Stripe.Event;
    
    try {
      // Get the appropriate webhook secret based on environment
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
      
      if (!webhookSecret) {
        console.error('[Stripe Webhook] Missing webhook secret for environment:', 
          isDev ? 'development' : isStaging ? 'staging' : 'production');
        return NextResponse.json({ error: 'Missing webhook secret configuration' }, { status: 500 });
      }
      
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err: any) {
      console.error('[Stripe Webhook] Signature verification failed:', err.message);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }
    
    // Log in non-production environments
    if (!isProd) {
      console.log(`[Stripe Webhook] Received event type: ${event.type}`);
    }
    
    // Handle the event
    await handleStripeWebhook(event);
    
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[Stripe Webhook] Error handling webhook:', error);
    return NextResponse.json({ error: error.message || 'Failed to handle webhook' }, { status: 500 });
  }
} 