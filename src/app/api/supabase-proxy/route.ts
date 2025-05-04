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

// Verifiera att URL:en är korrekt formaterad
let parsedSupabaseUrl: URL | null = null;
try {
  if (SUPABASE_URL) {
    parsedSupabaseUrl = new URL(SUPABASE_URL);
    console.log('[Supabase-Proxy] URL validated:', {
      protocol: parsedSupabaseUrl.protocol,
      hostname: parsedSupabaseUrl.hostname,
      projectRef: parsedSupabaseUrl.hostname.split('.')[0]
    });
  }
} catch (e) {
  console.error('[Supabase-Proxy] Invalid URL format:', SUPABASE_URL);
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
async function handleHealthCheck(req: NextRequest) {
  console.log('[Supabase-Proxy] Health check requested');
  try {
    // Extrahera request information för debugging
    const requestInfo = {
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(req.headers.entries()),
      timestamp: new Date().toISOString()
    };
    
    console.log('[Supabase-Proxy] Health check request info:', JSON.stringify(requestInfo, null, 2));
    
    // Testa om vi kan nå Supabase URL
    let supabaseReachable = false;
    let errorMessage = null;
    let responseData = null;
    let statusCode = null;
    
    if (!SUPABASE_URL) {
      console.error('[Supabase-Proxy] Health check failed: No Supabase URL configured');
      return NextResponse.json({
        status: 'error',
        error: 'Configuration error: NEXT_PUBLIC_SUPABASE_URL is not set',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'unknown',
        vercel: !!process.env.VERCEL || false,
      }, { 
        status: 500,
        headers: corsHeaders
      });
    }
    
    // Validera URL-format
    if (!parsedSupabaseUrl) {
      console.error('[Supabase-Proxy] Health check failed: Invalid Supabase URL format');
      return NextResponse.json({
        status: 'error',
        error: 'Configuration error: Invalid Supabase URL format',
        url: SUPABASE_URL,
        timestamp: new Date().toISOString(),
      }, { 
        status: 500,
        headers: corsHeaders
      });
    }
    
    try {
      // Försök göra en enkel anrop mot Supabase för att se om tjänsten är nåbar
      console.log(`[Supabase-Proxy] Testing connection to ${SUPABASE_URL}/auth/v1/health`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'apikey': SUPABASE_ANON_KEY || '',
          'Content-Type': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      statusCode = response.status;
      
      // Försök läsa response-body
      try {
        responseData = await response.json();
      } catch (parseError) {
        console.error('[Supabase-Proxy] Could not parse response JSON:', parseError);
        responseData = 'Not a valid JSON response';
      }
      
      console.log(`[Supabase-Proxy] Health check response:`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData
      });
      
      supabaseReachable = response.ok;
    } catch (error) {
      console.error('[Supabase-Proxy] Health check failed to reach Supabase:', error);
      errorMessage = error instanceof Error ? error.message : 'Unknown error';
      supabaseReachable = false;
      
      // Detaljerad fellogik för nätverksfel
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Connection timeout after 5 seconds';
        } else if ('code' in error) {
          // @ts-ignore - Node.js specific error code
          errorMessage = `Network error (${error.code}): ${error.message}`;
        }
      }
    }
    
    // Skapa ett mer detaljerat svar
    const healthResponse = {
      status: supabaseReachable ? 'ok' : 'error',
      proxy: {
        version: '1.1.0',
        running: true,
        host: req.headers.get('host') || 'unknown',
      },
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      vercel: !!process.env.VERCEL || false,
      request: {
        url: req.url,
        method: req.method,
        headers: {
          'user-agent': req.headers.get('user-agent') || 'unknown',
          'x-vercel-ip': req.headers.get('x-vercel-ip') || 'unknown',
          'x-real-ip': req.headers.get('x-real-ip') || 'unknown',
        }
      },
      supabase: {
        url: SUPABASE_URL,
        urlFormatValid: !!parsedSupabaseUrl,
        projectRef: parsedSupabaseUrl ? parsedSupabaseUrl.hostname.split('.')[0] : 'invalid',
        reachable: supabaseReachable,
        error: errorMessage,
        status: statusCode,
        response: responseData
      }
    };
    
    console.log(`[Supabase-Proxy] Health check completed:`, JSON.stringify(healthResponse, null, 2));
    
    return NextResponse.json(healthResponse, { 
      status: 200,
      headers: corsHeaders
    });
  } catch (error) {
    console.error('[Supabase-Proxy] Critical error in health check handler:', error);
    return NextResponse.json({ 
      status: 'error',
      message: 'Failed to perform health check',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
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
    
    console.log(`[Supabase-Proxy] POST request received for path: ${supabasePath}`);
    
    // Specialhantering för health check
    if (supabasePath === 'health') {
      return handleHealthCheck(req);
    }
    
    // Kontrollera att vi har nödvändig konfiguration
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error('[Supabase-Proxy] Configuration error: Missing Supabase URL or API key');
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
    console.log(`[Supabase-Proxy] Sending ${req.method} request to Supabase with headers:`, 
      JSON.stringify(Object.fromEntries(headers.entries()), null, 2));
    
    try {
      const response = await fetch(targetUrl, {
        method: req.method,
        headers,
        body: body || undefined,
        // cache: 'no-store', // Stäng av caching
      });
      
      console.log(`[Supabase-Proxy] Response received from Supabase: ${response.status} ${response.statusText}`);
      
      // Försök tolka svaret som JSON för loggning
      let responseData;
      try {
        const responseText = await response.text();
        
        try {
          // Försök parsa som JSON
          responseData = JSON.parse(responseText);
          console.log(`[Supabase-Proxy] JSON response preview:`, 
              typeof responseData === 'object' ? JSON.stringify(responseData).substring(0, 500) + '...' : responseText);
          
          // Skapa ny response med data
          const nextResponse = new NextResponse(JSON.stringify(responseData), {
            status: response.status,
            statusText: response.statusText,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
          
          return nextResponse;
        } catch (e) {
          // Inte JSON, återanvänd bara texten
          console.log(`[Supabase-Proxy] Non-JSON response (${responseText.length} chars)`,
              responseText.length > 100 ? responseText.substring(0, 100) + '...' : responseText);
          
          // Skapa response med originaltext
          const nextResponse = new NextResponse(responseText, {
            status: response.status,
            statusText: response.statusText,
            headers: {
              'Content-Type': response.headers.get('Content-Type') || 'text/plain',
              ...corsHeaders
            }
          });
          
          return nextResponse;
        }
      } catch (e) {
        console.error('[Supabase-Proxy] Could not read response body:', e);
        
        // Fallback till tom response med bara status
        return new NextResponse(null, {
          status: response.status,
          statusText: response.statusText,
          headers: corsHeaders
        });
      }
    } catch (fetchError) {
      console.error('[Supabase-Proxy] Fetch error:', fetchError);
      return NextResponse.json(
        { 
          error: 'Fetch Error', 
          message: fetchError instanceof Error ? fetchError.message : 'Failed to fetch from Supabase',
          path: supabasePath,
          targetUrl: targetUrl,
          stack: fetchError instanceof Error ? fetchError.stack : undefined
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
        message: error instanceof Error ? error.message : 'Unknown proxy error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * GET-metoden för diagnostik och enkla anrop
 */
export async function GET(req: NextRequest) {
  // Logg för alla inkommande förfrågningar
  console.log(`[Supabase-Proxy] GET request received: ${req.url}`);
  
  // Specialhantering för health endpoint
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  const supabasePath = pathParts.slice(3).join('/');
  
  if (supabasePath === 'health') {
    return handleHealthCheck(req);
  }
  
  // Specialhantering för debug endpoint
  if (supabasePath === 'debug') {
    // Samla information om miljön för debug
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        node_env: process.env.NODE_ENV,
        vercel: !!process.env.VERCEL,
        vercel_env: process.env.VERCEL_ENV || 'not-set',
        region: process.env.VERCEL_REGION || 'unknown',
      },
      supabase: {
        url: SUPABASE_URL,
        hasApiKey: !!SUPABASE_ANON_KEY,
        url_valid: !!parsedSupabaseUrl,
        parsed_url: parsedSupabaseUrl ? {
          protocol: parsedSupabaseUrl.protocol,
          hostname: parsedSupabaseUrl.hostname,
          projectRef: parsedSupabaseUrl.hostname.split('.')[0]
        } : null
      },
      request: {
        url: req.url,
        headers: Object.fromEntries(req.headers.entries()),
        cookies: req.cookies.getAll().map(c => c.name),
        ip: req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for'),
        user_agent: req.headers.get('user-agent')
      }
    };
    
    console.log('[Supabase-Proxy] Debug info requested:', JSON.stringify(debugInfo, null, 2));
    
    return NextResponse.json(debugInfo, { 
      status: 200,
      headers: corsHeaders
    });
  }
  
  // Annars, fungerar exakt likadant som POST-metoden
  return POST(req);
} 