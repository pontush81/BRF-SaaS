import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { UserRole } from '@/lib/auth/roleUtils';
import { getEnvironment, Environment, getAppDomain } from '@/lib/env';

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

// Helper to check if a path is a static asset
function isStaticAsset(path: string): boolean {
  return (
    path.startsWith('/_next/') ||
    path.startsWith('/static/') ||
    path.includes('.') ||
    path === '/favicon.ico'
  );
}

// Helper to get the correct app domain based on environment
function getConfiguredAppDomain(): string {
  const env = getEnvironment();
  
  // För att säkerställa att vi använder rätt domän i olika miljöer
  if (env === Environment.DEVELOPMENT || env === Environment.TEST) {
    return 'localhost';
  }
  
  // Använd miljövariabeln eller fallback till handbok.org
  return process.env.NEXT_PUBLIC_APP_DOMAIN || 'handbok.org';
}

// Helper to get the correct marketing domain based on environment
function getConfiguredMarketingDomain(): string {
  const env = getEnvironment();
  
  // För att säkerställa att vi använder rätt domän i olika miljöer
  if (env === Environment.DEVELOPMENT || env === Environment.TEST) {
    return 'localhost';
  }
  
  // Använd miljövariabeln eller fallback
  return process.env.NEXT_PUBLIC_MARKETING_DOMAIN || 'www.handbok.org';
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
  console.log(`[Middleware] Processing request for: ${req.nextUrl.pathname}`);
  console.log(`[Middleware] Host: ${req.nextUrl.hostname}`);
  
  // Get hostname and pathname
  const { pathname, hostname } = req.nextUrl;
  
  // ALWAYS ALLOW STATIC ASSETS - these should bypass all middleware logic
  if (isStaticAsset(pathname)) {
    console.log(`[Middleware] Allowing static asset: ${pathname}`);
    return NextResponse.next();
  }
  
  // Check if this is an API route
  const isApiRoute = pathname.startsWith('/api');
  if (isApiRoute) {
    console.log(`[Middleware] Allowing API route: ${pathname}`);
    return NextResponse.next();
  }
  
  // Get configured domains based on environment
  const APP_DOMAIN = getConfiguredAppDomain();
  const MARKETING_DOMAIN = getConfiguredMarketingDomain();
  
  console.log(`[Middleware] APP_DOMAIN: ${APP_DOMAIN}`);
  console.log(`[Middleware] MARKETING_DOMAIN: ${MARKETING_DOMAIN}`);
  
  // Create a response that can be modified later
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });
  
  // Check if this is a subdomain request (e.g. someorg.handbok.org)
  // Vi behöver hantera både produktion och lokala utvecklingsinställningar
  const isSubdomain = hostname !== MARKETING_DOMAIN && 
                      hostname !== APP_DOMAIN && 
                      (hostname.endsWith(`.${APP_DOMAIN}`) || 
                       hostname.includes(`.${APP_DOMAIN}:`) ||
                       // Hantera lokala utvecklings-subdomäner som my-org.localhost
                       hostname.includes(`.localhost`));
  
  // Extract subdomain from hostname if present
  const subdomain = isSubdomain 
    ? hostname.replace(`.${APP_DOMAIN}`, '').replace(`.localhost`, '').replace(`:3000`, '') 
    : null;
  
  console.log(`[Middleware] isSubdomain: ${isSubdomain ? 'true' : 'false'}`);
  console.log(`[Middleware] subdomain: ${subdomain || 'none'}`);
  
  // Check if the current path is public on marketing site
  const isPublicMarketingPath = isPublicPath(pathname);
  
  // Allow access to public marketing pages without authentication
  if (!isSubdomain && isPublicMarketingPath) {
    console.log(`[Middleware] Allowing public marketing path: ${pathname}`);
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
    console.log(`[Middleware] User is logged in: ${session.user.email}`);
    
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
          console.log(`[Middleware] User role: ${role}`);
          console.log(`[Middleware] Organizations: ${organizations.length}`);
        }
      }
    } catch (error) {
      console.error('[Middleware] Error fetching user data:', error);
      // On error, continue with default values
    }
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
        console.log(`[Middleware] Redirecting to organization: ${targetSubdomain}${redirectPath}`);
        return NextResponse.redirect(new URL(`${protocol}//${targetSubdomain}${redirectPath}`));
      }
    }
    
    // If organization not found or user not logged in, redirect to dashboard
    console.log(`[Middleware] Redirecting to dashboard from switch-org`);
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // SUBDOMAIN ROUTING LOGIC
  if (isSubdomain && subdomain) {
    console.log(`[Middleware] Handling subdomain request: ${subdomain}`);
    
    // If on a subdomain, we should serve the BRF content, not marketing content
    // Redirect root path on subdomain to the slug route
    if (pathname === '/') {
      console.log(`[Middleware] Rewriting subdomain root to /${subdomain}`);
      return NextResponse.rewrite(new URL(`/${subdomain}`, req.url));
    }
    
    // Handle authentication for BRF members
    if (!isLoggedIn && !pathname.startsWith('/login') && !pathname.startsWith('/register')) {
      console.log(`[Middleware] Redirecting to login: Not logged in on subdomain`);
      const redirectUrl = new URL('/login', req.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }
    
    // If user is logged in but doesn't have access to this specific organization
    if (isLoggedIn && organizations.length > 0) {
      const hasAccessToThisOrg = organizations.some(org => org.slug === subdomain);
      
      if (!hasAccessToThisOrg) {
        console.log(`[Middleware] User doesn't have access to this organization: ${subdomain}`);
        // Redirect to their default organization instead
        const defaultOrg = organizations.find(org => org.isDefault) || organizations[0];
        if (defaultOrg && defaultOrg.slug) {
          const protocol = req.nextUrl.protocol;
          const port = hostname.includes(':') ? `:${hostname.split(':')[1]}` : '';
          const defaultSubdomain = `${defaultOrg.slug}.${APP_DOMAIN}${port}`;
          console.log(`[Middleware] Redirecting to default organization: ${defaultSubdomain}`);
          return NextResponse.redirect(new URL(`${protocol}//${defaultSubdomain}/dashboard`));
        }
      }
    }
  } 
  // MARKETING SITE ROUTING LOGIC
  else {
    console.log(`[Middleware] Handling marketing site request`);
    
    // On marketing site, redirect logged-in users with organizations to their default BRF subdomain
    if (isLoggedIn && organizations.length > 0 && pathname === '/dashboard') {
      const defaultOrg = organizations.find(org => org.isDefault) || organizations[0];
      
      if (defaultOrg && defaultOrg.slug) {
        // Construct the subdomain URL
        const protocol = req.nextUrl.protocol;
        const port = hostname.includes(':') ? `:${hostname.split(':')[1]}` : '';
        const subdomain = `${defaultOrg.slug}.${APP_DOMAIN}${port}`;
        console.log(`[Middleware] Redirecting to organization dashboard: ${subdomain}`);
        return NextResponse.redirect(new URL(`${protocol}//${subdomain}/dashboard`));
      }
    }

    // If not logged in and trying to access a protected route on marketing site
    if (!isLoggedIn && AUTH_ROUTES.some(route => pathname.startsWith(route))) {
      console.log(`[Middleware] Redirecting to login: Not logged in trying to access protected route`);
      const redirectUrl = new URL('/login', req.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // If logged in and trying to access a guest route on marketing site
    if (isLoggedIn && GUEST_ROUTES.some(route => pathname.startsWith(route))) {
      console.log(`[Middleware] Redirecting to dashboard: Logged in trying to access guest route`);
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Check role-based access on marketing site or subdomain
    if (ADMIN_ROUTES.some(route => pathname.startsWith(route)) && role !== UserRole.ADMIN) {
      console.log(`[Middleware] Redirecting to dashboard: Not admin trying to access admin route`);
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    
    if (EDITOR_ROUTES.some(route => pathname.startsWith(route)) && 
      (role !== UserRole.ADMIN && role !== UserRole.EDITOR)) {
      console.log(`[Middleware] Redirecting to dashboard: Not editor trying to access editor route`);
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  console.log(`[Middleware] Proceeding with request: ${pathname}`);
  return response;
}

// Define which paths middleware should run on
export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * - API routes that start with /api/
     * - Static files like _next/static, favicon.ico, etc.
     * 
     * Notera: Vi matchar fortfarande /_next/data för server-komponenter men de kommer att 
     * tillåtas av isStaticAsset-kontroll inuti middleware-funktionen
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
  ],
};
