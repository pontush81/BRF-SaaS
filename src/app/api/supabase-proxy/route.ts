import { NextRequest, NextResponse } from 'next/server';

/**
 * API-proxy för Supabase anrop
 * 
 * Denna proxy möjliggör anrop till Supabase-API:et genom att agera som en CORS-proxy
 * och omdirigerar anrop som går till /api/supabase-proxy/[path] till Supabase.
 * 
 * Exempel: /api/supabase-proxy/auth/v1/token -> https://yourproject.supabase.co/auth/v1/token
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Hantera miljökonfiguration i servern
console.log('[Supabase-Proxy] Initializing with URL:', SUPABASE_URL ? `${SUPABASE_URL.substring(0, 15)}...` : 'MISSING');

if (!SUPABASE_URL) {
  console.error('[Supabase-Proxy] ERROR: NEXT_PUBLIC_SUPABASE_URL environment variable is not set');
  // Vi thrower inte error här för att undvika att hela servern kraschar
}

if (!SUPABASE_ANON_KEY) {
  console.error('[Supabase-Proxy] ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is not set');
  // Vi thrower inte error här för att undvika att hela servern kraschar
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, apikey, X-Supabase-Proxy',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * Specialhantering för health checks
 * 
 * Anrop till /api/supabase-proxy/health är ett specialfall som returnerar en enkel
 * statuskontroll och ett diagnostiskt svar utan att faktiskt anropa Supabase.
 */
async function handleHealthCheck() {
  try {
    // Testa om vi kan nå Supabase URL
    let supabaseReachable = false;
    let errorMessage = null;
    
    if (SUPABASE_URL) {
      try {
        // Försök göra en enkel anrop mot Supabase för att se om tjänsten är nåbar
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'apikey': SUPABASE_ANON_KEY || '',
            'Content-Type': 'application/json'
          }
        });
        
        clearTimeout(timeoutId);
        supabaseReachable = response.ok;
      } catch (error) {
        console.error('[Supabase-Proxy] Health check failed to reach Supabase:', error);
        errorMessage = error instanceof Error ? error.message : 'Unknown error';
        supabaseReachable = false;
      }
    }
    
    return NextResponse.json({
      status: 'ok',
      proxy: true,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      vercel: !!process.env.VERCEL || false,
      supabase: {
        url: SUPABASE_URL ? `${SUPABASE_URL.substring(0, 15)}...` : 'not configured',
        reachable: supabaseReachable,
        error: errorMessage
      }
    }, { 
      status: 200,
      headers: corsHeaders
    });
  } catch (error) {
    console.error('[Supabase-Proxy] Error handling health check:', error);
    return NextResponse.json({ 
      status: 'error',
      message: 'Failed to perform health check',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
}

/**
 * Proxyfunktion för att hantera anrop mot Supabase
 * 
 * - Extraherar path och query parameters från anropet
 * - Vidarebefordrar anropet till Supabase med rätt headers
 * - Returnerar svaret från Supabase
 */
export async function POST(req: NextRequest) {
  try {
    // Extrahera delen av URL:en som ska vidarebefordras
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    
    // Ta bort /api/supabase-proxy/ från pathname
    const supabasePath = pathParts.slice(3).join('/');
    
    // Specialhantering för health check
    if (supabasePath === 'health') {
      return handleHealthCheck();
    }
    
    // Kontrollera att vi har nödvändig konfiguration
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { 
          error: 'Configuration Error', 
          message: 'Supabase configuration is missing' 
        },
        { status: 500, headers: corsHeaders }
      );
    }
    
    // Bygg upp fullständig Supabase-URL
    const targetUrl = `${SUPABASE_URL}/${supabasePath}${url.search}`;
    
    console.log(`[Supabase-Proxy] Proxying request to: ${targetUrl}`);
    
    // Hämta request body
    const body = await req.text();
    
    // Behåll alla headers från originalbegäran
    const headers = new Headers();
    req.headers.forEach((value, key) => {
      headers.set(key, value);
    });
    
    // Sätt alltid Supabase API-nyckel
    headers.set('apikey', SUPABASE_ANON_KEY);
    
    // Lägg till 'X-Client-Info' header för att indikera att anropet kommer från vår proxy
    headers.set('X-Client-Info', 'supabase-js-proxy/1.0.0');
    
    // Vidarebefordra anropet till Supabase
    try {
      const response = await fetch(targetUrl, {
        method: req.method,
        headers,
        body: body || undefined,
        // cache: 'no-store', // Stäng av caching
      });
      
      // Skapa en response med samma status och headers som Supabase-svaret
      const responseData = await response.text();
      
      // Skapa NextResponse med data från Supabase-svaret
      const nextResponse = new NextResponse(responseData, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'application/json',
          ...corsHeaders
        }
      });
      
      return nextResponse;
    } catch (fetchError) {
      console.error('[Supabase-Proxy] Fetch error:', fetchError);
      return NextResponse.json(
        { 
          error: 'Fetch Error', 
          message: fetchError instanceof Error ? fetchError.message : 'Failed to fetch from Supabase',
          path: supabasePath
        },
        { status: 502, headers: corsHeaders }
      );
    }
  } catch (error) {
    console.error('[Supabase-Proxy] Error:', error);
    
    // Returnera ett tydligt felmeddelande
    return NextResponse.json(
      { 
        error: 'Proxy Error', 
        message: error instanceof Error ? error.message : 'Unknown proxy error'
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * GET-metoden för diagnostik och enkla anrop
 */
export async function GET(req: NextRequest) {
  // Specialhantering för health endpoint
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  const supabasePath = pathParts.slice(3).join('/');
  
  if (supabasePath === 'health') {
    return handleHealthCheck();
  }
  
  // Annars, fungerar exakt likadant som POST-metoden
  return POST(req);
} 