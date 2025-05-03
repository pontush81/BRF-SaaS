import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { UserRole } from '@/lib/auth/roleUtils';

// Marketing site public paths
const PUBLIC_MARKETING_PATHS = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/om-oss',
  '/kontakt',
  '/pricing',
  '/features',
  '/faq',
  // Add other public marketing pages here
];

// Authentication routes
const AUTH_ROUTES = ['/dashboard', '/profile', '/join-organization', '/admin', '/admin/', '/editor', '/editor/']
const ADMIN_ROUTES = ['/admin', '/admin/']
const EDITOR_ROUTES = ['/editor', '/editor/']  
const GUEST_ROUTES = ['/login', '/register', '/forgot-password']
const SWITCH_ORG_ROUTE = '/switch-organization';

// Get domain parameters from environment variables
const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || 'handbok.se';
const MARKETING_DOMAIN = process.env.NEXT_PUBLIC_MARKETING_DOMAIN || 'localhost:3000';

// Interface för en organisation
interface Organization {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  role: UserRole;
  isDefault: boolean;
}

export async function middleware(req: NextRequest) {
  // Create a response that can be modified later
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });
  
  // Create a Supabase client to check if the user is logged in
  const supabase = createServerClient();
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Get user from database if logged in
  let isLoggedIn = false;
  let organizations: Organization[] = [];
  let currentOrganization: Organization | null = null;
  let role = UserRole.MEMBER;
  
  if (session?.user?.email) {
    isLoggedIn = true;
    try {
      // Use Fetch API with serverless function to get user data and organizations
      // We need to include any orgId from query params to ensure we get the correct current org
      const url = new URL(req.nextUrl);
      const orgId = url.searchParams.get('orgId');
      
      const userApiUrl = new URL(`/api/auth/current-user`, req.nextUrl.origin);
      if (orgId) {
        userApiUrl.searchParams.set('orgId', orgId);
      }
      
      const userRes = await fetch(userApiUrl, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token || ''}`
        }
      });
      
      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData) {
          organizations = userData.organizations || [];
          currentOrganization = userData.currentOrganization || null;
          role = userData.role as UserRole;
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // On error, continue with default values
    }
  }

  // Get hostname and pathname
  const { pathname, hostname } = req.nextUrl;
  
  // Check if this is a subdomain request (e.g. someorg.handbok.se)
  const isSubdomain = hostname !== MARKETING_DOMAIN && 
                      hostname !== APP_DOMAIN && 
                      (hostname.endsWith(`.${APP_DOMAIN}`) || hostname.includes(`.${APP_DOMAIN}:`));
  
  // Extract subdomain from hostname if present
  const subdomain = isSubdomain 
    ? hostname.replace(`.${APP_DOMAIN}`, '').replace(`:3000`, '') 
    : null;

  // Check if this is a static resource or API route
  const isStaticResource = pathname.startsWith('/_next/') || 
                          pathname.includes('.') ||
                          pathname.startsWith('/favicon.ico');
  
  const isApiRoute = pathname.startsWith('/api');

  // Skip authentication check for static resources or API routes
  if (isStaticResource || isApiRoute) {
    return response;
  }

  // Handle organization switching (from anywhere)
  if (pathname === SWITCH_ORG_ROUTE) {
    const url = new URL(req.nextUrl);
    const targetOrgId = url.searchParams.get('orgId');
    const redirectPath = url.searchParams.get('redirect') || '/dashboard';
    
    if (isLoggedIn && targetOrgId) {
      // Find the organization with the given ID
      const targetOrg = organizations.find(org => org.id === targetOrgId);
      
      if (targetOrg) {
        // Redirect to the target organization's subdomain
        const protocol = req.nextUrl.protocol;
        const port = hostname.includes(':') ? `:${hostname.split(':')[1]}` : '';
        const targetSubdomain = `${targetOrg.slug}.${APP_DOMAIN}${port}`;
        return NextResponse.redirect(new URL(`${protocol}//${targetSubdomain}${redirectPath}`));
      }
    }
    
    // If organization not found or user not logged in, redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // SUBDOMAIN ROUTING LOGIC
  if (isSubdomain && subdomain) {
    // If on a subdomain, we should serve the BRF content, not marketing content
    // Redirect root path on subdomain to the slug route
    if (pathname === '/') {
      return NextResponse.rewrite(new URL(`/${subdomain}`, req.url));
    }
    
    // Handle authentication for BRF members
    if (!isLoggedIn && !pathname.startsWith('/login') && !pathname.startsWith('/register')) {
      const redirectUrl = new URL('/login', req.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }
    
    // If user is logged in but doesn't have access to this specific organization
    if (isLoggedIn && organizations.length > 0) {
      const hasAccessToThisOrg = organizations.some(org => org.slug === subdomain);
      
      if (!hasAccessToThisOrg) {
        // Redirect to their default organization instead
        const defaultOrg = organizations.find(org => org.isDefault) || organizations[0];
        if (defaultOrg && defaultOrg.slug) {
          const protocol = req.nextUrl.protocol;
          const port = hostname.includes(':') ? `:${hostname.split(':')[1]}` : '';
          const defaultSubdomain = `${defaultOrg.slug}.${APP_DOMAIN}${port}`;
          return NextResponse.redirect(new URL(`${protocol}//${defaultSubdomain}/dashboard`));
        }
      }
    }
  } 
  // MARKETING SITE ROUTING LOGIC
  else {
    // On marketing site, redirect logged-in users with organizations to their default BRF subdomain
    if (isLoggedIn && organizations.length > 0 && pathname === '/dashboard') {
      const defaultOrg = organizations.find(org => org.isDefault) || organizations[0];
      
      if (defaultOrg && defaultOrg.slug) {
        // Construct the subdomain URL
        const protocol = req.nextUrl.protocol;
        const port = hostname.includes(':') ? `:${hostname.split(':')[1]}` : '';
        const subdomain = `${defaultOrg.slug}.${APP_DOMAIN}${port}`;
        return NextResponse.redirect(new URL(`${protocol}//${subdomain}/dashboard`));
      }
    }

    // If not logged in and trying to access a protected route on marketing site
    if (!isLoggedIn && AUTH_ROUTES.some(route => pathname.startsWith(route))) {
      const redirectUrl = new URL('/login', req.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // If logged in and trying to access a guest route on marketing site
    if (isLoggedIn && GUEST_ROUTES.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Check role-based access on marketing site or subdomain
    if (ADMIN_ROUTES.some(route => pathname.startsWith(route)) && role !== UserRole.ADMIN) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    
    if (EDITOR_ROUTES.some(route => pathname.startsWith(route)) && 
      (role !== UserRole.ADMIN && role !== UserRole.EDITOR)) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return response;
}

// Define which paths middleware should run on
export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * - API routes that start with /api/
     * - Static files like _next/static, favicon.ico, etc.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
  ],
};
