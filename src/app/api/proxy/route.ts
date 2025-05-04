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
const PROXY_VERSION = '1.3.0';

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
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, apikey, X-Supabase-Proxy',
  'Access-Control-Max-Age': '86400',
};

// Lägg till headers på alla responses
function addCorsHeaders(response: Response | NextResponse): NextResponse {
  const headers = new Headers(response.headers);
  
  Object.entries(corsHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });
  
  // Om response är en NextResponse, sätt headers direkt
  if (response instanceof NextResponse) {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }
  
  // Annars skapa en ny NextResponse med samma body och status
  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

/**
 * Hanterar hälsokontroll av Supabase-anslutningen
 */
async function handleHealthCheck(request: NextRequest): Promise<NextResponse> {
  const verbose = request.nextUrl.searchParams.get('verbose') === 'true';
  const startTime = Date.now();
  
  // Logga exakt info om request för debugging
  console.log('[Proxy/Health] Request URL:', request.url);
  console.log('[Proxy/Health] Pathname:', new URL(request.url).pathname);
  
  if (!SUPABASE_URL) {
    console.error('[Proxy/Health] Health check failed: Missing Supabase URL');
    return NextResponse.json(
      { 
        reachable: false, 
        error: 'Missing Supabase URL configuration'
      }, 
      { status: 200, headers: corsHeaders }
    );
  }

  try {
    // Testa anslutningen genom att göra en enkel begäran
    const healthEndpoint = `${SUPABASE_URL}/rest/v1/health?apikey=${SUPABASE_KEY}`;
    console.log(`[Proxy/Health] Performing health check for: ${SUPABASE_URL}`);
    
    const response = await fetch(healthEndpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
      },
      cache: 'no-store',
    });

    const responseTime = Date.now() - startTime;
    
    try {
      const responseData = await response.json();
      
      if (response.ok) {
        console.log(`[Proxy/Health] Health check successful in ${responseTime}ms`);
        return NextResponse.json({
          reachable: true,
          status: response.status,
          responseTime,
          data: verbose ? responseData : undefined
        }, { headers: corsHeaders });
      } else {
        console.error(`[Proxy/Health] Health check failed with status ${response.status}`);
        return NextResponse.json({
          reachable: false,
          status: response.status,
          responseTime,
          error: `Server responded with status ${response.status}`,
          data: verbose ? responseData : undefined
        }, { status: 200, headers: corsHeaders });
      }
    } catch (jsonError) {
      console.error(`[Proxy/Health] Failed to parse response as JSON:`, jsonError);
      
      // Försök läsa response som text istället
      let responseText;
      try {
        const responseClone = response.clone();
        responseText = await responseClone.text();
      } catch (e) {
        responseText = 'Failed to read response as text';
      }
      
      return NextResponse.json({
        reachable: false,
        status: response.status,
        responseTime,
        error: `Failed to parse response as JSON: ${jsonError instanceof Error ? jsonError.message : 'Unknown error'}`,
        responsePreview: responseText?.substring(0, 100) + '...',
      }, { status: 200, headers: corsHeaders });
    }
  } catch (error: any) {
    console.error('[Proxy/Health] Health check exception:', error.message);
    return NextResponse.json({
      reachable: false,
      error: `Connection error: ${error.message}`,
      responseTime: Date.now() - startTime
    }, { status: 200, headers: corsHeaders });
  }
}

/**
 * Hanterar debugging-information
 */
async function handleDebug(request: NextRequest): Promise<NextResponse> {
  console.log('[Proxy/Debug] Debug endpoint called');
  
  const cookieStore = cookies();
  const allCookies: Record<string, string> = {};
  
  // Samla alla cookies
  for (const cookie of cookieStore.getAll()) {
    allCookies[cookie.name] = cookie.value;
  }
  
  const requestInfo = {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    cookies: Object.keys(allCookies).map(name => ({ name, hasValue: !!allCookies[name] })),
  };
  
  console.log('[Proxy/Debug] Request info:', JSON.stringify(requestInfo, null, 2));
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    version: PROXY_VERSION,
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      vercelEnv: process.env.VERCEL_ENV || 'local',
      region: process.env.VERCEL_REGION || 'unknown',
      supabaseUrl: SUPABASE_URL,
      hasKey: !!SUPABASE_KEY,
      projectId,
    },
    request: requestInfo,
    paths: {
      original: request.nextUrl.pathname,
      parsed: new URL(request.url).pathname,
    }
  }, { headers: corsHeaders });
}

/**
 * Vidarebefordrar begäran till Supabase
 */
async function forwardToSupabase(request: NextRequest): Promise<NextResponse> {
  if (!SUPABASE_URL) {
    console.error('[Proxy/Forward] Failed: Missing Supabase URL');
    return NextResponse.json(
      { error: 'Supabase URL is not configured' }, 
      { status: 500, headers: corsHeaders }
    );
  }

  if (!SUPABASE_KEY) {
    console.error('[Proxy/Forward] Failed: Missing Supabase API key');
    return NextResponse.json(
      { error: 'Supabase API key is not configured' }, 
      { status: 500, headers: corsHeaders }
    );
  }

  try {
    const url = new URL(request.url);
    
    // Använd samma path-extraktion som i GET-hanteraren för att vara konsekvent
    const originalPath = url.pathname;
    let pathSegments = originalPath.split('/');
    pathSegments = pathSegments.filter(segment => segment.length > 0);
    
    // Ta bort "api" och "proxy" från sökvägen
    let supabasePath = '';
    if (pathSegments.length >= 2 && pathSegments[0] === 'api' && pathSegments[1] === 'proxy') {
      pathSegments = pathSegments.slice(2);
      // Bygg sökväg för Supabase-anropet
      supabasePath = '/' + pathSegments.join('/');
    } else {
      // Fallback om vi inte hittar förväntad struktur
      supabasePath = originalPath.replace(/^\/api\/proxy\/?/, '/');
    }
    
    console.log(`[Proxy/Forward] Path extraction: Original: ${originalPath}, Extracted: ${supabasePath}`);
    
    if (!supabasePath || supabasePath === '/') {
      console.error('[Proxy/Forward] Invalid path after extraction');
      return NextResponse.json(
        { error: 'Invalid path', originalPath, extractedPath: supabasePath }, 
        { status: 400, headers: corsHeaders }
      );
    }

    const targetUrl = `${SUPABASE_URL}${supabasePath}${url.search}`;
    console.log(`[Proxy/Forward] Forwarding to: ${targetUrl}`);

    // Kopiera originalheadrar men lägg till Supabase-specifika headrar
    const headers = new Headers(request.headers);
    headers.set('apikey', SUPABASE_KEY);
    headers.set('X-Client-Info', 'supabase-proxy/' + PROXY_VERSION);
    
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
    console.log(`[Proxy/Forward] Sending ${request.method} request to Supabase`);
    const supabaseResponse = await fetch(supabaseRequest);
    console.log(`[Proxy/Forward] Response from Supabase: ${supabaseResponse.status} ${supabaseResponse.statusText}`);
    
    // Transformera svaret för att kunna returnera till klienten
    const responseBody = await supabaseResponse.blob();
    
    // Skapa svarshuvuden
    const responseHeaders = new Headers();
    supabaseResponse.headers.forEach((value, key) => {
      responseHeaders.set(key, value);
    });
    
    // Lägg till CORS-headrar
    Object.entries(corsHeaders).forEach(([key, value]) => {
      responseHeaders.set(key, value);
    });
    
    return new NextResponse(responseBody, {
      status: supabaseResponse.status,
      statusText: supabaseResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error('[Proxy/Forward] Error:', error);
    return NextResponse.json(
      { error: `Proxy error: ${error.message}` }, 
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * OPTIONS-hanterare för CORS
 */
export async function OPTIONS(request: NextRequest) {
  console.log(`[Proxy] OPTIONS request to: ${request.url}`);
  return new NextResponse(null, {
    headers: corsHeaders,
    status: 204,
  });
}

/**
 * GET-hanterare för proxy
 */
export async function GET(request: NextRequest) {
  // Logga full URL för felsökning
  console.log(`[Proxy] Full request URL: ${request.url}`);
  console.log(`[Proxy] Request method: ${request.method}`);
  console.log(`[Proxy] Request headers:`, Object.fromEntries(request.headers.entries()));
  
  const url = new URL(request.url);
  const path = url.pathname;
  
  console.log(`[Proxy] Parsed pathname: ${path}`);
  
  // Mer detaljerad path-analys för Vercel-miljön
  // Extrahera sökvägen från /api/proxy
  let pathSegments = path.split('/');
  // Ta bort tomma segment (från leading/trailing slashes)
  pathSegments = pathSegments.filter(segment => segment.length > 0);
  // Plocka bort "api" och "proxy" om de finns
  if (pathSegments.length >= 2 && pathSegments[0] === 'api' && pathSegments[1] === 'proxy') {
    // Ta bort api och proxy från sökvägen
    pathSegments = pathSegments.slice(2);
  }
  
  console.log(`[Proxy] Path segments after extraction:`, pathSegments);
  
  // Enkel diagnostik för rotanrop till /api/proxy - när inga ytterligare segment finns
  if (pathSegments.length === 0) {
    console.log('[Proxy] Root endpoint called, returning diagnostics');
    return NextResponse.json({
      status: 'ok',
      version: PROXY_VERSION,
      timestamp: new Date().toISOString(),
      endpoints: {
        health: `${url.origin}/api/proxy/health`,
        debug: `${url.origin}/api/proxy/debug`
      },
      environment: {
        node_env: process.env.NODE_ENV,
        vercel: !!process.env.VERCEL,
        vercel_env: process.env.VERCEL_ENV || 'not-set'
      }
    }, { 
      status: 200,
      headers: corsHeaders
    });
  }
  
  // Hantera olika endpunkter baserat på första segmentet efter /api/proxy/
  const firstSegment = pathSegments[0];
  
  if (firstSegment === 'health') {
    console.log('[Proxy] Health endpoint called');
    return handleHealthCheck(request);
  } else if (firstSegment === 'debug') {
    console.log('[Proxy] Debug endpoint called');
    return handleDebug(request);
  } else {
    console.log(`[Proxy] Forwarding request to Supabase, segments:`, pathSegments);
    return forwardToSupabase(request);
  }
}

/**
 * POST-hanterare för proxy
 */
export async function POST(request: NextRequest) {
  console.log(`[Proxy] POST request to: ${request.url}`);
  return forwardToSupabase(request);
}

/**
 * PUT-hanterare för proxy
 */
export async function PUT(request: NextRequest) {
  console.log(`[Proxy] PUT request to: ${request.url}`);
  return forwardToSupabase(request);
}

/**
 * DELETE-hanterare för proxy
 */
export async function DELETE(request: NextRequest) {
  console.log(`[Proxy] DELETE request to: ${request.url}`);
  return forwardToSupabase(request);
}

/**
 * PATCH-hanterare för proxy
 */
export async function PATCH(request: NextRequest) {
  console.log(`[Proxy] PATCH request to: ${request.url}`);
  return forwardToSupabase(request);
} 