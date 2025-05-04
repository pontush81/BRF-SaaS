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
  console.log('[Proxy/Health] Headers:', Object.fromEntries(request.headers.entries()));
  
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
    // Försök först göra en enkel DNS-kontroll
    let dnsResolution = {
      success: false,
      hostname: '',
      error: null
    };
    
    try {
      const urlObj = new URL(SUPABASE_URL);
      dnsResolution.hostname = urlObj.hostname;
      
      // En enkel fetch mot en icke-existent path för att testa DNS-upplösning
      // Vi använder GET och no-cors för att undvika CORS-problem
      // Vi bryr oss bara om DNS-resolution i detta steg, inte om svaret
      const dnsCheckResponse = await fetch(`${SUPABASE_URL}/dns-check-${Date.now()}`, {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store',
        signal: AbortSignal.timeout(3000) // 3 sekunder timeout
      });
      
      // Om vi kommer hit, lyckades DNS-upplösningen (även om svaret var 404)
      dnsResolution.success = true;
    } catch (dnsError) {
      // Inget problem om vi får 404 eller annat fel, så länge DNS fungerade
      if (dnsError instanceof TypeError && 
          (dnsError.message.includes('Failed to fetch') || 
           dnsError.message.includes('NetworkError'))) {
        dnsResolution.success = false;
        dnsResolution.error = dnsError.message;
      } else {
        // Annat fel än nätverksfel är sannolikt 404 eller timeout, vilket är ok
        dnsResolution.success = true;
      }
    }
    
    // Testa anslutningen genom att göra en enkel begäran till REST-API:et
    console.log(`[Proxy/Health] Performing health check for: ${SUPABASE_URL}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 sekunder timeout
    
    const healthEndpoint = `${SUPABASE_URL}/rest/v1/health?apikey=${SUPABASE_KEY}`;
    const response = await fetch(healthEndpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      },
      cache: 'no-store',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    try {
      const responseData = await response.json();
      
      if (response.ok) {
        console.log(`[Proxy/Health] Health check successful in ${responseTime}ms`);
        return NextResponse.json({
          reachable: true,
          status: response.status,
          responseTime,
          dns: dnsResolution,
          data: verbose ? responseData : undefined
        }, { headers: corsHeaders });
      } else {
        console.error(`[Proxy/Health] Health check failed with status ${response.status}`);
        return NextResponse.json({
          reachable: false,
          status: response.status,
          responseTime,
          dns: dnsResolution,
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
        dns: dnsResolution,
        error: `Failed to parse response as JSON: ${jsonError instanceof Error ? jsonError.message : 'Unknown error'}`,
        responsePreview: responseText?.substring(0, 100) + '...',
      }, { status: 200, headers: corsHeaders });
    }
  } catch (error: any) {
    console.error('[Proxy/Health] Health check exception:', error);
    
    // Försök avgöra feltypen för mer specifik information
    let errorType = 'unknown';
    let errorDetails = {};
    
    if (error.name === 'AbortError') {
      errorType = 'timeout';
      errorDetails = { timeout: true, message: 'Connection timed out' };
    } else if (error instanceof TypeError) {
      errorType = 'network';
      errorDetails = { 
        network: true, 
        message: error.message,
        dns: error.message.includes('Could not resolve') || error.message.includes('getaddrinfo')
      };
    }
    
    return NextResponse.json({
      reachable: false,
      error: `Connection error: ${error.message}`,
      errorType,
      details: errorDetails,
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
      // Fallback om vi inte hittar föräntad struktur
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
    
    // Kontrollera om detta är en auth-endpoint och lägg till Authorization header om det behövs
    const isAuthEndpoint = supabasePath.startsWith('/auth/');
    if (isAuthEndpoint) {
      console.log('[Proxy/Forward] Auth endpoint detected, ensuring proper auth headers');
      
      // Om anroparen redan har inkluderat en Authorization-header, respektera den
      if (!headers.has('Authorization')) {
        // Annars använd API-nyckeln
        headers.set('Authorization', `Bearer ${SUPABASE_KEY}`);
      }
    }
    
    // Ta bort headers som kan orsaka problem
    headers.delete('host');
    
    // Logga headers för debuggning
    console.log(`[Proxy/Forward] Request headers:`, Object.fromEntries(headers.entries()));
    
    // Logga request body för debugging om det är en auth-endpoint
    if (isAuthEndpoint && request.method === 'POST') {
      try {
        const clonedRequest = request.clone();
        const bodyText = await clonedRequest.text();
        console.log('[Proxy/Forward] Request body (first 100 chars):', 
          bodyText ? bodyText.substring(0, 100) : '[empty]');
      } catch (e) {
        console.error('[Proxy/Forward] Could not log request body:', e);
      }
    }
    
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
    
    // Logga svarshuvuden för debugging
    console.log('[Proxy/Forward] Response headers:', 
      Object.fromEntries(supabaseResponse.headers.entries()));
    
    // För auth endpoints, logga också responsens innehåll för debugging
    if (isAuthEndpoint) {
      try {
        const clonedResponse = supabaseResponse.clone();
        const responseText = await clonedResponse.text();
        console.log('[Proxy/Forward] Auth response body (first 100 chars):', 
          responseText ? responseText.substring(0, 100) : '[empty]');
        
        // Om responseText är tomt trots att statuskoden är ok, skapa ett eget felsvar
        if (!responseText && supabaseResponse.ok) {
          console.warn('[Proxy/Forward] Empty response body from Supabase auth endpoint');
          return NextResponse.json(
            { error: 'Empty response from Supabase auth endpoint' },
            { status: 500, headers: corsHeaders }
          );
        }
        
        // Försök parsa JSON för debugging
        try {
          const responseObj = JSON.parse(responseText);
          console.log('[Proxy/Forward] Response parsed successfully:', 
            Object.keys(responseObj).join(', '));
        } catch (e) {
          console.warn('[Proxy/Forward] Response is not valid JSON:', e);
        }
        
        // Använd den här texten för svaret istället för blob nedan
        const responseHeaders = new Headers();
        supabaseResponse.headers.forEach((value, key) => {
          responseHeaders.set(key, value);
        });
        
        // Lägg till CORS-headrar
        Object.entries(corsHeaders).forEach(([key, value]) => {
          responseHeaders.set(key, value);
        });
        
        return new NextResponse(responseText, {
          status: supabaseResponse.status,
          statusText: supabaseResponse.statusText,
          headers: responseHeaders,
        });
      } catch (e) {
        console.error('[Proxy/Forward] Error handling auth response:', e);
      }
    }
    
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