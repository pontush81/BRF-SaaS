import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Helper to check if a path is a static asset - ALWAYS ALLOW THESE
function isStaticAsset(path: string): boolean {
  return (
    path.startsWith('/_next/') ||
    path.startsWith('/static/') ||
    path.startsWith('/favicon.ico') ||
    path.includes('.js') ||
    path.includes('.css') ||
    path.includes('.json') ||
    path.includes('.svg') ||
    path.includes('.png') ||
    path.includes('.jpg') ||
    path.includes('.jpeg') ||
    path.includes('.gif') ||
    path.includes('.webp') ||
    path.includes('.ico') ||
    path.includes('.woff') ||
    path.includes('.woff2') ||
    path.includes('.ttf') ||
    path.includes('.otf')
  );
}

export async function middleware(req: NextRequest) {
  // Get hostname and pathname
  const { pathname } = req.nextUrl;
  
  // IMPORTANT: ALWAYS ALLOW STATIC ASSETS AND API ROUTES - DO NOT PROCESS THESE
  if (isStaticAsset(pathname) || pathname.startsWith('/api')) {
    console.log(`Allowing static asset or API route: ${pathname}`);
    return NextResponse.next();
  }
  
  // Everything else is allowed by default - let Next.js handle routing
  console.log(`Default handling for path: ${pathname}`);
  return NextResponse.next();
}

// Define which paths middleware should run on
export const config = {
  matcher: [
    // More permissive matcher - only run on non-static, non-API routes
    '/((?!_next/|static/|favicon.ico|.*\\.).*)',
  ],
};
