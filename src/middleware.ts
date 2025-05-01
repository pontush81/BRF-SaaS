import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Kontrollera om miljövariablerna är korrekt inställda
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Om miljövariablerna inte är inställda, fortsätt utan Supabase-klient
  if (!supabaseUrl || !supabaseAnonKey || 
      supabaseUrl === 'https://your-project-id.supabase.co' || 
      supabaseAnonKey === 'your-supabase-anon-key') {
    console.warn('Supabase environment variables are not properly configured');
    return response;
  }

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

  try {
    // Get the session from Supabase
    const { data: { session } } = await supabase.auth.getSession();

    // Tenant/organization handling
    const url = new URL(request.url);
    const hostname = request.headers.get('host') || '';
    
    // Example: If this is a path that should be protected
    if (url.pathname.startsWith('/dashboard') && !session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Handle multi-tenancy via subdomains (will implement later)
    // const subdomain = hostname.split('.')[0];
    // if (subdomain !== 'www' && subdomain !== 'app' && subdomain !== 'localhost:3000') {
    //   // Handle organization-specific subdomain
    // }
  } catch (error) {
    console.error('Error in middleware:', error);
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
