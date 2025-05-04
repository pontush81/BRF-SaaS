import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCheckoutSession, getOrCreateCustomer, getBaseUrl } from '@/lib/stripe';

// Detect environment
const isDev = process.env.NODE_ENV === 'development';
const isStaging = process.env.APP_ENV === 'staging';
const isProd = process.env.NODE_ENV === 'production' && process.env.APP_ENV !== 'staging';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const { organizationId, planType, successUrl, cancelUrl } = await request.json();
    
    if (!organizationId || !planType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Log in non-production environments
    if (!isProd) {
      console.log(`[Stripe Checkout] Creating session for org ${organizationId}, plan ${planType}`);
    }
    
    // Create or get customer
    await getOrCreateCustomer(organizationId, user.email || '');
    
    // Get base URL for this environment
    const baseUrl = getBaseUrl();
    
    // Use provided URLs or generate environment-specific URLs
    const finalSuccessUrl = successUrl || `${baseUrl}/subscription/success?org=${organizationId}`;
    const finalCancelUrl = cancelUrl || `${baseUrl}/subscription?org=${organizationId}`;
    
    // Create checkout session
    const session = await createCheckoutSession({
      organizationId,
      planType,
      successUrl: finalSuccessUrl,
      cancelUrl: finalCancelUrl,
    });
    
    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('[Stripe Checkout] Error creating checkout session:', error);
    return NextResponse.json({ error: error.message || 'Failed to create checkout session' }, { status: 500 });
  }
} 