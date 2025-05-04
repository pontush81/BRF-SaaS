import { NextRequest, NextResponse } from 'next/server';
import { hasActiveSubscription } from '@/lib/stripe';
import { getOrganizationBySlug } from '@/lib/organizations';

// Exempt routes that should always be accessible
const EXEMPT_ROUTES = [
  '/api/',
  '/login',
  '/register',
  '/subscription',
  '/pricing',
  '/_next',
  '/favicon.ico',
];

export async function checkSubscription(request: NextRequest, organizationId: string) {
  try {
    // Check for active subscription
    const hasSubscription = await hasActiveSubscription(organizationId);
    
    // If they have a subscription, let them through
    if (hasSubscription) {
      return null; // No redirect needed
    }
    
    // Get current path
    const path = request.nextUrl.pathname;
    
    // Check if the current route is exempt
    for (const route of EXEMPT_ROUTES) {
      if (path.startsWith(route)) {
        return null; // No redirect needed for exempt routes
      }
    }
    
    // Otherwise, redirect to subscription page
    const subscriptionUrl = new URL('/subscription', request.url);
    return NextResponse.redirect(subscriptionUrl);
  } catch (error) {
    console.error('Error checking subscription:', error);
    // On error, we'll let them through for now (failsafe)
    // This prevents users from being locked out if there's a database/API issue
    return null;
  }
}

// Example usage in middleware.ts:
/*
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkSubscription } from './middleware/subscription-check';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  
  // Extract subdomain (ignore 'www' and localhost)
  const subdomain = hostname.split('.')[0];
  if (subdomain !== 'www' && !hostname.includes('localhost')) {
    // Get organization from subdomain
    const organization = await getOrganizationBySlug(subdomain);
    
    if (organization) {
      // Check subscription status
      const subscriptionRedirect = await checkSubscription(request, organization.id);
      if (subscriptionRedirect) {
        return subscriptionRedirect;
      }
    }
  }
  
  return NextResponse.next();
}
*/ 