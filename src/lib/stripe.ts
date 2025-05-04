import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Detect environment
const isDev = process.env.NODE_ENV === 'development';
const isStaging = process.env.APP_ENV === 'staging';
const isProd = process.env.NODE_ENV === 'production' && process.env.APP_ENV !== 'staging';

// Get environment-specific base URL
export const getBaseUrl = () => {
  if (typeof window !== 'undefined') return ''; // browser should use relative url
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  return 'http://localhost:3000'; // dev SSR should use localhost
};

// Initialize Stripe with API key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-04-30.basil',
});

// Log environment info for debugging (not in production)
if (!isProd) {
  console.log(`[Stripe] Using ${isDev ? 'development' : isStaging ? 'staging' : 'production'} environment`);
  console.log(`[Stripe] Using ${process.env.STRIPE_SECRET_KEY?.startsWith('sk_test') ? 'test' : 'live'} keys`);
}

// Define price IDs for each plan - Monthly and Yearly options
export const STRIPE_PRICE_IDS = {
  // Monthly prices
  BASIC_MONTHLY: process.env.STRIPE_PRICE_ID_BASIC_MONTHLY || 'price_placeholder',
  STANDARD_MONTHLY: process.env.STRIPE_PRICE_ID_STANDARD_MONTHLY || 'price_placeholder',
  PREMIUM_MONTHLY: process.env.STRIPE_PRICE_ID_PREMIUM_MONTHLY || 'price_placeholder',
  
  // Yearly prices
  BASIC_YEARLY: process.env.STRIPE_PRICE_ID_BASIC_YEARLY || 'price_placeholder',
  STANDARD_YEARLY: process.env.STRIPE_PRICE_ID_STANDARD_YEARLY || 'price_placeholder',
  PREMIUM_YEARLY: process.env.STRIPE_PRICE_ID_PREMIUM_YEARLY || 'price_placeholder',
};

// Plan prices for display (SEK)
export const PLAN_PRICES = {
  BASIC: { monthly: 299, yearly: 2988 }, // 10% yearly discount
  STANDARD: { monthly: 599, yearly: 5988 },
  PREMIUM: { monthly: 999, yearly: 9988 },
};

/**
 * Create or retrieve a Stripe customer for the organization
 */
export async function getOrCreateCustomer(organizationId: string, email: string) {
  try {
    // Get organization with subscription
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: { subscription: true },
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    // If customer already exists, return it
    if (organization.subscription?.stripeCustomerId) {
      const customer = await stripe.customers.retrieve(
        organization.subscription.stripeCustomerId
      );
      return customer;
    }

    // Create new customer
    const customerData = {
      email,
      name: organization.name,
      metadata: {
        organizationId,
        environment: isDev ? 'development' : isStaging ? 'staging' : 'production',
      },
    };

    const customer = await stripe.customers.create(customerData);

    // Update or create subscription record with customer ID
    await prisma.subscription.upsert({
      where: { organizationId },
      update: { stripeCustomerId: customer.id },
      create: {
        organizationId,
        stripeCustomerId: customer.id,
        planType: 'BASIC',
        status: 'TRIAL',
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    });

    return customer;
  } catch (error) {
    console.error('Error creating/retrieving Stripe customer:', error);
    throw error;
  }
}

/**
 * Create a checkout session for subscription (card payment)
 */
export async function createCheckoutSession({
  organizationId,
  planType,
  billingInterval = 'monthly',
  successUrl,
  cancelUrl,
}: {
  organizationId: string;
  planType: 'BASIC' | 'STANDARD' | 'PREMIUM';
  billingInterval?: 'monthly' | 'yearly';
  successUrl: string;
  cancelUrl: string;
}) {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: { subscription: true },
    });

    if (!organization || !organization.subscription?.stripeCustomerId) {
      throw new Error('Organization has no Stripe customer ID');
    }

    // Get the price ID for the selected plan and billing interval
    const priceKey = `${planType}_${billingInterval.toUpperCase()}` as keyof typeof STRIPE_PRICE_IDS;
    const priceId = STRIPE_PRICE_IDS[priceKey];

    // Use dynamic URLs if not provided
    const baseUrl = getBaseUrl();
    const finalSuccessUrl = successUrl || `${baseUrl}/subscription/success`;
    const finalCancelUrl = cancelUrl || `${baseUrl}/subscription`;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: organization.subscription.stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,
      metadata: {
        organizationId,
        planType,
        billingInterval,
        environment: isDev ? 'development' : isStaging ? 'staging' : 'production',
      },
      subscription_data: {
        trial_period_days: 30,
        metadata: {
          organizationId,
          planType,
          billingInterval,
          environment: isDev ? 'development' : isStaging ? 'staging' : 'production',
        },
      },
    });

    // Log in non-production environments
    if (!isProd) {
      console.log(`[Stripe] Created checkout session: ${session.id}`);
      console.log(`[Stripe] Checkout URL: ${session.url}`);
    }

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Create an invoice for subscription (invoice payment)
 */
export async function createInvoiceSubscription({
  organizationId,
  planType,
  billingInterval = 'yearly',
  organizationInfo,
}: {
  organizationId: string;
  planType: 'BASIC' | 'STANDARD' | 'PREMIUM';
  billingInterval?: 'monthly' | 'yearly';
  organizationInfo: {
    name: string;
    address: string;
    postalCode: string;
    city: string;
    country?: string;
    orgNumber?: string;
  };
}) {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: { subscription: true },
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    // Create or get customer
    let customer;
    if (!organization.subscription?.stripeCustomerId) {
      customer = await getOrCreateCustomer(organizationId, organizationInfo.name);
    } else {
      customer = { id: organization.subscription.stripeCustomerId };
    }

    // Update customer billing information
    await stripe.customers.update(customer.id, {
      address: {
        line1: organizationInfo.address,
        postal_code: organizationInfo.postalCode,
        city: organizationInfo.city,
        country: organizationInfo.country || 'SE',
      },
      metadata: {
        org_number: organizationInfo.orgNumber || '', // Organizational number for BRF
      },
    });

    // Get the price ID for the selected plan and billing interval
    const priceKey = `${planType}_${billingInterval.toUpperCase()}` as keyof typeof STRIPE_PRICE_IDS;
    const priceId = STRIPE_PRICE_IDS[priceKey];

    // Create subscription with invoice collection method
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      collection_method: 'send_invoice',
      days_until_due: 30, // 30 days to pay the invoice
      trial_period_days: 30,
      metadata: {
        organizationId,
        planType,
        billingInterval,
        environment: isDev ? 'development' : isStaging ? 'staging' : 'production',
      },
    });

    // Store subscription information in database
    await prisma.subscription.upsert({
      where: { organizationId },
      update: {
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        planType,
        status: 'TRIAL',
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
      create: {
        organizationId,
        stripeCustomerId: customer.id,
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        planType,
        status: 'TRIAL',
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    });

    // For yearly billing we need to create an invoice immediately
    const invoice = await stripe.invoices.create({
      customer: customer.id,
      subscription: subscription.id,
      auto_advance: true, // auto-finalize the draft
      collection_method: 'send_invoice',
      days_until_due: 30,
    });

    // Finalize and send the invoice
    if (invoice && invoice.id) {
      await stripe.invoices.finalizeInvoice(invoice.id);
      await stripe.invoices.sendInvoice(invoice.id);
    }

    // Log in non-production environments
    if (!isProd) {
      console.log(`[Stripe] Created invoice subscription: ${subscription.id}`);
      console.log(`[Stripe] Invoice created: ${invoice.id}`);
    }

    return {
      subscription,
      invoice,
    };
  } catch (error) {
    console.error('Error creating invoice subscription:', error);
    throw error;
  }
}

/**
 * Handle webhook events from Stripe
 */
export async function handleStripeWebhook(event: Stripe.Event) {
  try {
    // Log the event type in non-production environments
    if (!isProd) {
      console.log(`[Stripe Webhook] Processing event: ${event.type}`);
    }

    // Check if the event is from the correct environment
    const eventEnv = event.livemode ? 'production' : 'test';
    const currentEnv = isProd ? 'production' : 'test';

    if (eventEnv !== currentEnv) {
      console.error(`[Stripe Webhook] Environment mismatch: Event is ${eventEnv}, but current environment is ${currentEnv}`);
      return;
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const organizationId = session.metadata?.organizationId;
        const planType = session.metadata?.planType as 'BASIC' | 'STANDARD' | 'PREMIUM';
        
        if (!organizationId || !planType) {
          throw new Error('Missing metadata in checkout session');
        }

        if (session.subscription) {
          await prisma.subscription.update({
            where: { organizationId },
            data: {
              stripeSubscriptionId: session.subscription as string,
              stripePriceId: session.metadata?.billingInterval === 'yearly' 
                ? STRIPE_PRICE_IDS[`${planType}_YEARLY` as keyof typeof STRIPE_PRICE_IDS]
                : STRIPE_PRICE_IDS[`${planType}_MONTHLY` as keyof typeof STRIPE_PRICE_IDS],
              planType,
              status: 'ACTIVE',
            },
          });
          
          if (!isProd) {
            console.log(`[Stripe Webhook] Updated subscription for organization ${organizationId} to ${planType}`);
          }
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        // Konvertera hela objektet till any för att undvika egenskapsfel
        const subscriptionId = (invoice as any).subscription;
        
        const subscription = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: subscriptionId },
        });

        if (subscription) {
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: { status: 'ACTIVE' },
          });
          
          if (!isProd) {
            console.log(`[Stripe Webhook] Payment succeeded for subscription ${subscriptionId}`);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        // Konvertera hela objektet till any för att undvika egenskapsfel
        const subscriptionId = (invoice as any).subscription;
        
        const subscription = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: subscriptionId },
        });

        if (subscription) {
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: { status: 'PAST_DUE' },
          });
          
          if (!isProd) {
            console.log(`[Stripe Webhook] Payment failed for subscription ${subscriptionId}`);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const stripeSubscription = event.data.object as Stripe.Subscription;
        const subscriptionId = stripeSubscription.id;
        
        const subscription = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: subscriptionId },
        });

        if (subscription) {
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: { 
              status: 'CANCELED',
              endDate: new Date()
            },
          });
          
          if (!isProd) {
            console.log(`[Stripe Webhook] Subscription ${subscriptionId} was canceled`);
          }
        }
        break;
      }

      // Handle specific invoice events for invoice-based billing
      case 'invoice.finalized': {
        const invoice = event.data.object as Stripe.Invoice;
        if (!isProd) {
          console.log(`[Stripe Webhook] Invoice finalized: ${invoice.id}`);
        }
        break;
      }

      case 'invoice.sent': {
        const invoice = event.data.object as Stripe.Invoice;
        if (!isProd) {
          console.log(`[Stripe Webhook] Invoice sent to customer: ${invoice.id}`);
        }
        break;
      }
    }
  } catch (error) {
    console.error('Error handling Stripe webhook:', error);
    throw error;
  }
}

/**
 * Check if an organization has an active subscription
 */
export async function hasActiveSubscription(organizationId: string): Promise<boolean> {
  const subscription = await prisma.subscription.findUnique({
    where: { organizationId },
  });

  if (!subscription) return false;

  // Active paid subscription
  if (subscription.status === 'ACTIVE' && subscription.stripeSubscriptionId) {
    return true;
  }

  // Active trial
  if (subscription.status === 'TRIAL' && subscription.trialEndsAt) {
    const now = new Date();
    return now < subscription.trialEndsAt;
  }

  return false;
}

/**
 * Create a customer portal session for managing subscriptions
 */
export async function createCustomerPortalSession({
  organizationId,
  returnUrl,
}: {
  organizationId: string;
  returnUrl?: string;
}) {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: { subscription: true },
    });

    if (!organization || !organization.subscription?.stripeCustomerId) {
      throw new Error('Organization has no Stripe customer ID');
    }

    // Use dynamic URL if not provided
    const baseUrl = getBaseUrl();
    const finalReturnUrl = returnUrl || `${baseUrl}/settings/billing`;

    // Create portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: organization.subscription.stripeCustomerId,
      return_url: finalReturnUrl,
      configuration: process.env.STRIPE_PORTAL_CONFIGURATION_ID,
    });

    // Log in non-production environments
    if (!isProd) {
      console.log(`[Stripe] Created customer portal session: ${portalSession.id}`);
      console.log(`[Stripe] Portal URL: ${portalSession.url}`);
    }

    return portalSession;
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    throw error;
  }
} 