import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Domäner som används för app-navigering
const APP_DOMAINS = ['handbok.se', 'localhost:3000']; // Lägg till egna produktionsdomäner
const MARKETING_DOMAINS = ['brf-saas.vercel.app']; // Lägg till marknadsföringsdomäner

// Helper-funktion för att kontrollera domäntyp
function getDomainType(host: string) {
  // Kontrollera om vi är på localhost
  if (host.includes('localhost')) {
    return { type: 'app', subdomain: 'localhost' };
  }

  const parts = host.split('.');
  const isLocalNetwork = /^(192\.168|10\.|172\.16\.)/.test(host);
  
  // Hantera lokala nätverk
  if (isLocalNetwork) {
    return { type: 'app', subdomain: 'localhost' };
  }

  // Kontrollera om detta är en app-domän
  for (const domain of APP_DOMAINS) {
    if (host.endsWith(domain)) {
      // Extrahera subdomain
      const domainParts = domain.split('.');
      const hostParts = host.split('.');
      const subdomainParts = hostParts.slice(0, hostParts.length - domainParts.length);
      
      // Om vi har en subdomän, returnera den
      if (subdomainParts.length > 0) {
        return { type: 'app', subdomain: subdomainParts.join('.') };
      }
      
      // Annars är det huvuddomänen utan subdomän
      return { type: 'marketing', subdomain: null };
    }
  }

  // Kontrollera marknadsföringsdomäner
  for (const domain of MARKETING_DOMAINS) {
    if (host === domain) {
      return { type: 'marketing', subdomain: null };
    }
  }

  // Default till marketing om vi inte kan identifiera
  return { type: 'marketing', subdomain: null };
}

// Middleware function
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Kontrollera om vi är i en webbläsarmiljö
  const isBrowser = typeof window !== 'undefined';
  const url = new URL(request.url);
  const hostname = request.headers.get('host') || '';
  
  // Analysera om vi är på en subdomän
  const { type, subdomain } = getDomainType(hostname);

  // Skapa en Supabase-klient för middleware
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Endast skapa supabase-klient om nödvändigt
    if (supabaseUrl && supabaseAnonKey && type === 'app' && subdomain && subdomain !== 'www' && subdomain !== 'app' && subdomain !== 'localhost') {
      const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value;
            },
            set(name: string, value: string, options: any) {
              response.cookies.set({
                name,
                value,
                ...options,
              });
            },
            remove(name: string, options: any) {
              response.cookies.set({
                name,
                value: '',
                ...options,
              });
            },
          },
        }
      );

      // Hämta session från Supabase
      const { data: { session } } = await supabase.auth.getSession();

      // Exempel: Om vi är på en organisations-subdomän
      if (subdomain) {
        // Lägg till subdomain i headers för att kunna använda i applikationen
        response.headers.set('x-subdomain', subdomain);
        
        // Lägg till i URL:ens searchParams så den är tillgänglig för getServerSideProps
        url.searchParams.set('subdomain', subdomain);
        
        // Omdirigera till inloggning om användaren inte är inloggad och försöker nå skyddade sidor
        if (url.pathname.startsWith('/dashboard') && !session) {
          return NextResponse.redirect(new URL('/login', request.url));
        }
      }
    }
  } catch (error) {
    console.error('Middleware error:', error);
  }

  return response;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
