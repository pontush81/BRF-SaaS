'use server';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Förenklad proxy-implementation för Supabase
 * 
 * Denna version använder en enklare route (/api/proxy) som är
 * mindre benägen att orsaka problem i Vercel-miljön.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Håll track på proxy-versionen
const PROXY_VERSION = '1.2.0';

// Logga initiering 
console.log('[Proxy] Initializing simple proxy v' + PROXY_VERSION);
console.log('[Proxy] Environment:', process.env.NODE_ENV || 'unknown', process.env.VERCEL_ENV || 'not-vercel');
console.log('[Proxy] Supabase URL:', SUPABASE_URL ? `${SUPABASE_URL.substring(0, 15)}...` : 'MISSING');
console.log('[Proxy] Has API Key:', SUPABASE_KEY ? 'Yes' : 'No');

// Validera URL-format
let projectId = 'unknown';
try {
  if (SUPABASE_URL) {
    const urlObj = new URL(SUPABASE_URL);
    projectId = urlObj.hostname.split('.')[0];
    console.log('[Proxy] Project ID:', projectId);
  }
} catch (e) {
  console.error('[Proxy] Invalid URL format:', e);
}

// CORS headers för alla svar
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * Hanterar hälsokontroll av Supabase-anslutningen
 */
async function handleHealthCheck(request: NextRequest): Promise<NextResponse> {
  const verbose = request.nextUrl.searchParams.get('verbose') === 'true';
  const startTime = Date.now();
  
  if (!SUPABASE_URL) {
    console.error('Proxy health check failed: Missing Supabase URL');
    return NextResponse.json(
      { 
        reachable: false, 
        error: 'Missing Supabase URL configuration'
      }, 
      { status: 500 }
    );
  }

  try {
    // Testa anslutningen genom att göra en enkel begäran
    const healthEndpoint = `${SUPABASE_URL}/rest/v1/health?apikey=${SUPABASE_KEY}`;
    console.log(`Performing health check for: ${SUPABASE_URL}`);
    
    const response = await fetch(healthEndpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
      },
      cache: 'no-store',
    });

    const responseTime = Date.now() - startTime;
    const responseData = await response.json();
    
    if (response.ok) {
      console.log(`Health check successful in ${responseTime}ms`);
      return NextResponse.json({
        reachable: true,
        status: response.status,
        responseTime,
        data: verbose ? responseData : undefined
      });
    } else {
      console.error(`Health check failed with status ${response.status}`);
      return NextResponse.json({
        reachable: false,
        status: response.status,
        responseTime,
        error: `Server responded with status ${response.status}`,
        data: verbose ? responseData : undefined
      }, { status: 200 }); // Still return 200 to client
    }
  } catch (error: any) {
    console.error('Health check exception:', error.message);
    return NextResponse.json({
      reachable: false,
      error: `Connection error: ${error.message}`,
      responseTime: Date.now() - startTime
    }, { status: 200 }); // Still return 200 to client
  }
}

/**
 * Hanterar debugging-information
 */
async function handleDebug(request: NextRequest): Promise<NextResponse> {
  const cookieStore = cookies();
  const allCookies: Record<string, string> = {};
  
  // Samla alla cookies
  for (const cookie of cookieStore.getAll()) {
    allCookies[cookie.name] = cookie.value;
  }
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      vercelEnv: process.env.VERCEL_ENV || 'local',
      region: process.env.VERCEL_REGION || 'unknown',
      supabaseUrl: SUPABASE_URL,
      hasKey: !!SUPABASE_KEY,
    },
    request: {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers),
    },
    cookies: allCookies,
  });
}

/**
 * Vidarebefordrar begäran till Supabase
 */
async function forwardToSupabase(request: NextRequest): Promise<NextResponse> {
  if (!SUPABASE_URL) {
    console.error('Proxy forward failed: Missing Supabase URL');
    return NextResponse.json(
      { error: 'Supabase URL is not configured' }, 
      { status: 500 }
    );
  }

  if (!SUPABASE_KEY) {
    console.error('Proxy forward failed: Missing Supabase API key');
    return NextResponse.json(
      { error: 'Supabase API key is not configured' }, 
      { status: 500 }
    );
  }

  try {
    // Extrahera sökvägen från begäran (allt efter /api/proxy)
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/api\/proxy/, '');
    
    if (!path || path === '/') {
      return NextResponse.json(
        { error: 'Invalid path' }, 
        { status: 400 }
      );
    }

    const targetUrl = `${SUPABASE_URL}${path}${url.search}`;
    console.log(`Forwarding request to: ${targetUrl}`);

    // Kopiera originalheadrar men lägg till Supabase-specifika headrar
    const headers = new Headers(request.headers);
    headers.set('apikey', SUPABASE_KEY);
    
    // Ta bort headers som kan orsaka problem
    headers.delete('host');
    
    // Skapa en ny begäran till Supabase
    const supabaseRequest = new Request(targetUrl, {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.blob() : undefined,
      redirect: 'follow',
    });

    // Skicka begäran till Supabase
    const supabaseResponse = await fetch(supabaseRequest);
    
    // Transformera svaret för att kunna returnera till klienten
    const responseBody = await supabaseResponse.blob();
    
    // Skapa svarshuvuden
    const responseHeaders = new Headers();
    supabaseResponse.headers.forEach((value, key) => {
      responseHeaders.set(key, value);
    });
    
    // Lägg till CORS-headrar
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return new NextResponse(responseBody, {
      status: supabaseResponse.status,
      statusText: supabaseResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error('Proxy forward error:', error);
    return NextResponse.json(
      { error: `Proxy error: ${error.message}` }, 
      { status: 500 }
    );
  }
}

/**
 * OPTIONS-hanterare för CORS
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

/**
 * GET-hanterare för proxy
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // Loggning för att hjälpa till med felsökning
  console.log(`GET request to: ${path}`);
  
  // Hantera olika endpunkter
  if (path.endsWith('/health')) {
    return handleHealthCheck(request);
  } else if (path.endsWith('/debug')) {
    return handleDebug(request);
  } else {
    return forwardToSupabase(request);
  }
}

/**
 * POST-hanterare för proxy
 */
export async function POST(request: NextRequest) {
  return forwardToSupabase(request);
}

/**
 * PUT-hanterare för proxy
 */
export async function PUT(request: NextRequest) {
  return forwardToSupabase(request);
}

/**
 * DELETE-hanterare för proxy
 */
export async function DELETE(request: NextRequest) {
  return forwardToSupabase(request);
}

/**
 * PATCH-hanterare för proxy
 */
export async function PATCH(request: NextRequest) {
  return forwardToSupabase(request);
} 