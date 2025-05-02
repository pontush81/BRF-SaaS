import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Dessa sidor är alltid tillgängliga även om man inte är inloggad
const publicPaths = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/api/auth/callback',
  // Lägg till andra offentliga sidor här
];

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  // Skapa en Supabase-klient med cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          response.cookies.delete({
            name,
            ...options,
          });
        },
      },
    }
  );

  // Kontrollera om användaren är autentiserad
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Få den nuvarande sökvägen
  const { pathname } = req.nextUrl;

  // Kontrollera om sökvägen är offentlig
  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  // Kontrollera om det är en API-route
  const isApiRoute = pathname.startsWith('/api/');

  // Kontrollera om sökvägen är för statiska resurser
  const isStaticResource = pathname.startsWith('/_next/') || 
                           pathname.includes('.') ||
                           pathname.startsWith('/favicon.ico');

  // Om det är en statisk resurs, skippa autentiseringskontrollen
  if (isStaticResource) {
    return response;
  }

  // Om användaren inte är inloggad och försöker nå en skyddad sida
  if (!session && !isPublicPath && !isApiRoute) {
    // Omdirigera till inloggningssidan och spara den ursprungliga URL:en
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Om användaren är inloggad och försöker nå inloggning/registrering
  if (session && (pathname === '/login' || pathname === '/register')) {
    // Omdirigera till dashboard
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
