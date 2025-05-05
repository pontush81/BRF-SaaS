import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/supabase-server';
import { createCustomerPortalSession } from '@/lib/stripe';

// Detect environment
const isDev = process.env.NODE_ENV === 'development';
const isStaging = process.env.APP_ENV === 'staging';
const isProd =
  process.env.NODE_ENV === 'production' && process.env.APP_ENV !== 'staging';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createServerClient(cookies());
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const { organizationId, returnUrl } = await request.json();

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    // Log in non-production environments
    if (!isProd) {
      console.log(
        `[Stripe Portal] Creating portal session for org ${organizationId}`
      );
    }

    // Create customer portal session
    const portalSession = await createCustomerPortalSession({
      organizationId,
      returnUrl,
    });

    return NextResponse.json({
      url: portalSession.url,
      sessionId: portalSession.id,
    });
  } catch (error: any) {
    console.error('[Stripe Portal] Error creating portal session:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to create customer portal session',
      },
      { status: 500 }
    );
  }
}
