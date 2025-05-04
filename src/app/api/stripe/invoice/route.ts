import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createInvoiceSubscription } from '@/lib/stripe';

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
    const { 
      organizationId, 
      planType, 
      billingInterval = 'yearly',
      organizationInfo
    } = await request.json();
    
    // Validate required fields
    if (!organizationId || !planType || !organizationInfo) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Validate organization info
    const requiredFields = ['name', 'address', 'postalCode', 'city', 'orgNumber'];
    const missingFields = requiredFields.filter(field => !organizationInfo[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        error: `Missing organization info: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }
    
    // Log in non-production environments
    if (!isProd) {
      console.log(`[Stripe Invoice] Creating invoice for org ${organizationId}, plan ${planType}`);
    }
    
    // Create invoice subscription
    const { subscription, invoice } = await createInvoiceSubscription({
      organizationId,
      planType,
      billingInterval,
      organizationInfo,
    });
    
    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      invoiceId: invoice.id,
      invoiceStatus: invoice.status,
      invoicePdf: invoice.invoice_pdf,
    });
  } catch (error: any) {
    console.error('[Stripe Invoice] Error creating invoice subscription:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to create invoice subscription' 
    }, { status: 500 });
  }
} 