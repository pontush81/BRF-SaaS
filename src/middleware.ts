import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Dessa sidor är alltid tillgängliga även om man inte är inloggad
const publicPaths = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/about',
  '/contact',
  '/pricing',
  // Lägg till andra offentliga sidor här
];

// Definierar vilka routes som kräver olika behörigheter
const ADMIN_ROUTES = ['/admin', '/admin/']
const EDITOR_ROUTES = ['/editor', '/editor/']  
const AUTH_ROUTES = ['/dashboard', '/profile', '/handbook/edit', ...ADMIN_ROUTES, ...EDITOR_ROUTES]
const GUEST_ROUTES = ['/login', '/register', '/forgot-password']

export async function middleware(req: NextRequest) {
  // Skapa en respons som kan modifieras senare
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });
  
  // Skapa en Supabase-klient för att kolla om användaren är inloggad
  const supabase = createServerClient();
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Hämta användare från databasen om inloggad
  let role = 'GUEST'
  if (session?.user?.email) {
    try {
      // Använd Fetch API med serverless-funktion för att hämta användarroll
      // Detta krävs eftersom prisma inte kan användas direkt i middleware
      const userRes = await fetch(`${req.nextUrl.origin}/api/auth/get-user-role?email=${encodeURIComponent(session.user.email)}`, {
        headers: { 
          'Content-Type': 'application/json',
          // Skicka med autentisering för API route
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      
      if (userRes.ok) {
        const userData = await userRes.json()
        role = userData.role || 'GUEST'
      }
    } catch (error) {
      console.error('Error fetching user role:', error)
      // Vid fel, fortsätt med GUEST roll
    }
  }

  // Få den nuvarande sökvägen
  const { pathname } = req.nextUrl;

  // Kontrollera om det är en offentlig sida eller API-rutt
  const isPublicPath = publicPaths.includes(pathname) || publicPaths.some(path => pathname.startsWith(path));
  const isApiRoute = pathname.startsWith('/api');

  // Kontrollera om sökvägen är för statiska resurser
  const isStaticResource = pathname.startsWith('/_next/') || 
                           pathname.includes('.') ||
                           pathname.startsWith('/favicon.ico');

  // Om det är en statisk resurs, skippa autentiseringskontrollen
  if (isStaticResource) {
    return response;
  }

  // Om användaren inte är inloggad och försöker nå en skyddad sida
  if (!session && AUTH_ROUTES.some(route => pathname.startsWith(route))) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Om användaren är inloggad och försöker nå en gästsida
  if (session && GUEST_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Kontrollera rollbaserad åtkomst
  if (ADMIN_ROUTES.some(route => pathname.startsWith(route)) && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  
  if (EDITOR_ROUTES.some(route => pathname.startsWith(route)) && 
     (role !== 'ADMIN' && role !== 'EDITOR')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return response;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Matcha alla sökvägar utom för:
     * - API-routes som börjar med /api/
     * - Statiska filer som _next/static, favicon.ico, etc.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
  ],
};
