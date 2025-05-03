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

// Get domain parameters from environment variables
const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || 'handbok.se';
const MARKETING_DOMAIN = process.env.NEXT_PUBLIC_MARKETING_DOMAIN || 'localhost:3000';

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
  let role = UserRole.MEMBER; // Default: MEMBER
  let isLoggedIn = false;
  let organizationId = null;
  
  if (session?.user?.email) {
    isLoggedIn = true;
    try {
      // Use Fetch API with serverless function to get user role
      // This is required because prisma can't be used directly in middleware
      const userRes = await fetch(`${req.nextUrl.origin}/api/auth/current-user`, {
        headers: { 
          'Content-Type': 'application/json',
          // Send authentication for API route
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData && userData.role) {
          role = userData.role as UserRole;
          organizationId = userData.organizationId;
        }
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      // On error, continue as regular member
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
  } 
  // MARKETING SITE ROUTING LOGIC
  else {
    // On marketing site, redirect logged-in users with organization to their BRF subdomain
    if (isLoggedIn && organizationId && pathname === '/dashboard') {
      try {
        const orgRes = await fetch(`${req.nextUrl.origin}/api/organizations/${organizationId}`, {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || ''}`
          }
        });
        
        if (orgRes.ok) {
          const orgData = await orgRes.json();
          if (orgData && orgData.slug) {
            // Construct the subdomain URL
            const protocol = req.nextUrl.protocol;
            const port = hostname.includes(':') ? `:${hostname.split(':')[1]}` : '';
            const subdomain = `${orgData.slug}.${APP_DOMAIN}${port}`;
            return NextResponse.redirect(new URL(`${protocol}//${subdomain}/dashboard`));
          }
        }
      } catch (error) {
        console.error('Error fetching organization:', error);
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

    // Check role-based access on marketing site
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
