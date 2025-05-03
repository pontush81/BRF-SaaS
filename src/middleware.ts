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
  '/legal',
  '/legal/terms',
  '/legal/privacy',
  '/legal/cookies',
  '/legal/service-agreement',
  '/legal/disclaimer',
  '/legal/contact',
  // Add other public marketing pages here
];

// Authentication routes
const AUTH_ROUTES = ['/dashboard', '/profile', '/join-organization', '/admin', '/admin/', '/editor', '/editor/']
const ADMIN_ROUTES = ['/admin', '/admin/']
const EDITOR_ROUTES = ['/editor', '/editor/']  
const GUEST_ROUTES = ['/login', '/register', '/forgot-password']
const SWITCH_ORG_ROUTE = '/switch-organization';

// Helper function to check if a path is public
function isPublicPath(path: string): boolean {
  // Exact matches
  if (PUBLIC_MARKETING_PATHS.includes(path)) {
    return true;
  }
  
  // Check if path starts with any of the public paths that represent sections
  // like /legal/privacy should match if /legal is public
  return PUBLIC_MARKETING_PATHS.some(publicPath => 
    publicPath !== '/' && path.startsWith(publicPath + '/')
  );
}

// Helper to check if a path is a static asset - ALWAYS ALLOW THESE
function isStaticAsset(path: string): boolean {
  return (
    path.startsWith('/_next/') ||
    path.startsWith('/static/') ||
    path.startsWith('/favicon.ico') ||
    path.endsWith('.js') ||
    path.endsWith('.css') ||
    path.endsWith('.json') ||
    path.endsWith('.svg') ||
    path.endsWith('.png') ||
    path.endsWith('.jpg') ||
    path.endsWith('.jpeg') ||
    path.endsWith('.gif') ||
    path.endsWith('.webp') ||
    path.endsWith('.ico') ||
    path.endsWith('.woff') ||
    path.endsWith('.woff2') ||
    path.endsWith('.ttf') ||
    path.endsWith('.otf')
  );
}

// Helper function to check if a hostname is a marketing site
function isMarketingSite(hostname: string, marketingDomains: string[]): boolean {
  return marketingDomains.some(domain => hostname === domain);
}

// Add debug function to log requests in development
function logDebug(message: string, req: NextRequest): void {
  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[MIDDLEWARE] ${message} - ${req.method} ${req.nextUrl.pathname} (${req.nextUrl.hostname})`);
  }
}

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
  // Get hostname and pathname
  const { pathname, hostname } = req.nextUrl;
  
  // Log request details at the beginning for debugging
  const isDev = process.env.NODE_ENV === 'development';
  const reqId = Math.random().toString(36).substr(2, 9);
  
  if (isDev) {
    console.log(`[${reqId}] Request: ${hostname}${pathname}`);
  }
  
  // ALWAYS ALLOW STATIC ASSETS - these should bypass all middleware logic
  if (isStaticAsset(pathname)) {
    if (isDev) console.log(`[${reqId}] Static asset: ${pathname} - allowed`);
    return NextResponse.next();
  }
  
  // Check if this is an API route - ALWAYS ALLOW THESE
  const isApiRoute = pathname.startsWith('/api');
  if (isApiRoute) {
    if (isDev) console.log(`[${reqId}] API route: ${pathname} - allowed`);
    return NextResponse.next();
  }
  
  // SIMPLIFIED AND ROBUST DOMAIN DETECTION
  // Get APP_DOMAIN and MARKETING_DOMAIN from environment or use sensible defaults
  const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || 'handbok.org';
  const MARKETING_DOMAINS = [
    process.env.NEXT_PUBLIC_MARKETING_DOMAIN || 'www.handbok.org',
    'www.stage.handbok.org', // Add stage domain explicitly
    'www.handbok.com' // Add .com domain
  ];

  if (isDev) {
    console.log(`[${reqId}] ENV: APP_DOMAIN=${APP_DOMAIN}, MARKETING_DOMAINS=${MARKETING_DOMAINS.join(',')}`);
    console.log(`[${reqId}] Current hostname: ${hostname}`);
  }
  
  // Create a response that can be modified later
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });
  
  // Check if this is a subdomain request - handle both production and development
  const isLocalhost = hostname === 'localhost' || hostname.includes('.localhost');
  
  // Check if this is a marketing site
  const isMarketingDomain = isMarketingSite(hostname, MARKETING_DOMAINS);
  
  // First check if this is localhost (for development)
  // Then check if it's a subdomain of our app domain (and not a marketing domain)
  const isSubdomain = !isLocalhost && 
                      !isMarketingDomain && 
                      hostname !== APP_DOMAIN && 
                      (hostname.endsWith(`.${APP_DOMAIN}`) || hostname.includes(`.${APP_DOMAIN}:`));
  
  // Extract subdomain from hostname if present
  const subdomain = isSubdomain 
    ? hostname.replace(`.${APP_DOMAIN}`, '').replace(`:3000`, '') 
    : null;
  
  if (isDev) {
    console.log(`[${reqId}] isLocalhost: ${isLocalhost}`);
    console.log(`[${reqId}] isMarketingDomain: ${isMarketingDomain}`);
    console.log(`[${reqId}] isSubdomain: ${isSubdomain}`);
    console.log(`[${reqId}] subdomain: ${subdomain}`);
  }
  
  // Special handling for local development
  // If we're on localhost and not accessing a static resource,
  // we'll simulate a marketing site experience
  if (isLocalhost) {
    // Always allow public paths on localhost
    if (isPublicPath(pathname)) {
      if (isDev) console.log(`[${reqId}] Public path on localhost: ${pathname} - allowed`);
      return response;
    }
  }
  
  // Check if the current path is public on marketing site
  const isPublicMarketingPath = isPublicPath(pathname);
  
  // Allow access to public marketing pages without authentication on marketing domains
  if (isMarketingDomain && isPublicMarketingPath) {
    if (isDev) console.log(`[${reqId}] Public marketing path: ${pathname} - allowed`);
    return response;
  }
  
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

  if (isDev) {
    console.log(`[${reqId}] isLoggedIn: ${isLoggedIn}`);
    console.log(`[${reqId}] organizations: ${organizations.length}`);
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
        if (isDev) console.log(`[${reqId}] Switching org: redirecting to ${targetSubdomain}${redirectPath}`);
        return NextResponse.redirect(new URL(`${protocol}//${targetSubdomain}${redirectPath}`));
      }
    }
    
    // If organization not found or user not logged in, redirect to dashboard
    if (isDev) console.log(`[${reqId}] Switching org: fallback to dashboard`);
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // SUBDOMAIN ROUTING LOGIC
  if (isSubdomain && subdomain) {
    if (isDev) console.log(`[${reqId}] Handling subdomain request: ${subdomain}`);
    // If on a subdomain, we should serve the BRF content, not marketing content
    // Redirect root path on subdomain to the slug route
    if (pathname === '/') {
      if (isDev) console.log(`[${reqId}] Rewriting root path to /${subdomain}`);
      return NextResponse.rewrite(new URL(`/${subdomain}`, req.url));
    }
    
    // Handle authentication for BRF members
    if (!isLoggedIn && !pathname.startsWith('/login') && !pathname.startsWith('/register')) {
      const redirectUrl = new URL('/login', req.url);
      redirectUrl.searchParams.set('redirect', pathname);
      if (isDev) console.log(`[${reqId}] Not logged in: redirecting to login`);
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
          if (isDev) console.log(`[${reqId}] No access to this org: redirecting to ${defaultSubdomain}`);
          return NextResponse.redirect(new URL(`${protocol}//${defaultSubdomain}/dashboard`));
        }
      }
    }
  } 
  // MARKETING SITE ROUTING LOGIC
  else if (isMarketingDomain || hostname === APP_DOMAIN) {
    if (isDev) console.log(`[${reqId}] Handling marketing site request`);
    // On marketing site, redirect logged-in users with organizations to their default BRF subdomain
    if (isLoggedIn && organizations.length > 0 && pathname === '/dashboard') {
      const defaultOrg = organizations.find(org => org.isDefault) || organizations[0];
      
      if (defaultOrg && defaultOrg.slug) {
        // Construct the subdomain URL
        const protocol = req.nextUrl.protocol;
        const port = hostname.includes(':') ? `:${hostname.split(':')[1]}` : '';
        const subdomain = `${defaultOrg.slug}.${APP_DOMAIN}${port}`;
        if (isDev) console.log(`[${reqId}] Redirecting to default org: ${subdomain}`);
        return NextResponse.redirect(new URL(`${protocol}//${subdomain}/dashboard`));
      }
    }

    // If not logged in and trying to access a protected route on marketing site
    if (!isLoggedIn && AUTH_ROUTES.some(route => pathname.startsWith(route))) {
      const redirectUrl = new URL('/login', req.url);
      redirectUrl.searchParams.set('redirect', pathname);
      if (isDev) console.log(`[${reqId}] Not logged in: redirecting to login`);
      return NextResponse.redirect(redirectUrl);
    }

    // If logged in and trying to access a guest route on marketing site
    if (isLoggedIn && GUEST_ROUTES.some(route => pathname.startsWith(route))) {
      if (isDev) console.log(`[${reqId}] Already logged in: redirecting to dashboard`);
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Check role-based access on marketing site or subdomain
    if (ADMIN_ROUTES.some(route => pathname.startsWith(route)) && role !== UserRole.ADMIN) {
      if (isDev) console.log(`[${reqId}] Not admin: redirecting to dashboard`);
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    
    if (EDITOR_ROUTES.some(route => pathname.startsWith(route)) && 
      (role !== UserRole.ADMIN && role !== UserRole.EDITOR)) {
      if (isDev) console.log(`[${reqId}] Not editor: redirecting to dashboard`);
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  if (isDev) console.log(`[${reqId}] Final decision: allowing request`);
  return response;
}

// Define which paths middleware should run on
export const config = {
  matcher: [
    // Match all request paths except for the ones we want to exclude
    // This is a more restrictive matcher to avoid interfering with static assets
    // It explicitly avoids ALL static assets with common extensions and _next paths
    '/((?!_next/static|_next/image|_next/data|favicon.ico|api).*)',
  ],
};
