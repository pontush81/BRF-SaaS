import { NextRequest, NextResponse } from 'next/server';

/**
 * Förenklad proxy-implementation för Supabase
 * 
 * Denna version använder en enklare route (/api/proxy) som är
 * mindre benägen att orsaka problem i Vercel-miljön.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Håll track på proxy-versionen
const PROXY_VERSION = '1.2.0';

// Logga initiering 
console.log('[Proxy] Initializing simple proxy v' + PROXY_VERSION);
console.log('[Proxy] Environment:', process.env.NODE_ENV || 'unknown', process.env.VERCEL_ENV || 'not-vercel');
console.log('[Proxy] Supabase URL:', SUPABASE_URL ? `${SUPABASE_URL.substring(0, 15)}...` : 'MISSING');
console.log('[Proxy] Has API Key:', SUPABASE_ANON_KEY ? 'Yes' : 'No');

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
 * OPTIONS-handler för CORS preflight-requests
 */
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * Health-check endpoint
 * 
 * Testar anslutningen till Supabase och returnerar statusinformation
 */
async function handleHealthCheck(req: NextRequest): Promise<NextResponse> {
  console.log(`[proxy] Health check begärd`);
  
  // Kontrollera om Supabase URL är konfigurerad
  if (!SUPABASE_URL) {
    console.error(`[proxy] Health check: SUPABASE_URL ej konfigurerad`);
    return NextResponse.json(
      { 
        status: "error", 
        message: "Supabase URL ej konfigurerad", 
        timestamp: new Date().toISOString(),
        supabase: {
          reachable: false,
          error: "Supabase URL saknas i miljövariabler"
        }
      },
      { status: 500, headers: corsHeaders }
    );
  }
  
  let verbose = false;
  try {
    // Kontrollera om verbose-läge begärts
    const url = new URL(req.url);
    verbose = url.searchParams.get('verbose') === 'true';
    
    console.log(`[proxy] Health check anropas för ${SUPABASE_URL} (verbose: ${verbose})`);
    
    // Försök nå Supabase health endpoint
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${SUPABASE_URL}/healthz`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'X-Client-Info': 'proxy-health-check'
      }
    });
    
    clearTimeout(timeoutId);
    
    const statusCode = response.status;
    let responseData = null;
    let responseText = null;

    try {
      responseText = await response.text();
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error(`[proxy] Health check: Kunde inte parsa Supabase-svar som JSON:`, 
          responseText.length > 100 ? responseText.substring(0, 100) + '...' : responseText);
      }
    } catch (textError) {
      console.error(`[proxy] Health check: Kunde inte läsa respons som text:`, textError);
    }

    const isReachable = response.ok;
    
    console.log(`[proxy] Health check resultat: ${statusCode} (reachable: ${isReachable})`);
    
    // Mer detaljerad respons i verbose-läge
    const supabaseInfo = {
      reachable: isReachable,
      status: statusCode,
      ...(responseData && { data: responseData }),
      ...(response.ok ? {} : { 
        error: `Supabase svarade med status: ${statusCode}`,
        response: verbose ? responseText : undefined
      })
    };

    return NextResponse.json(
      { 
        status: isReachable ? "ok" : "error", 
        message: isReachable ? "Supabase är nåbar" : "Supabase kunde inte nås",
        timestamp: new Date().toISOString(),
        supabase: supabaseInfo
      },
      { status: isReachable ? 200 : 502, headers: corsHeaders }
    );
  } catch (error) {
    console.error(`[proxy] Health check misslyckades:`, error);
    
    return NextResponse.json(
      { 
        status: "error", 
        message: "Kunde inte nå Supabase",
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
        supabase: {
          reachable: false,
          error: error instanceof Error ? error.message : String(error),
          details: verbose ? (error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack
          } : String(error)) : undefined
        }
      },
      { status: 502, headers: corsHeaders }
    );
  }
}

/**
 * Debug-endpoint
 * 
 * Returnerar detaljerad information om proxy-miljön och konfigurationen
 */
async function handleDebug(req: NextRequest): Promise<NextResponse> {
  console.log(`[proxy] Debug-information begärd`);
  
  // Samla in information
  const now = new Date();
  const data = {
    timestamp: now.toISOString(),
    environment: {
      isVercel: process.env.VERCEL === '1',
      nodeEnv: process.env.NODE_ENV || 'unknown',
      runtime: process.env.NEXT_RUNTIME || 'nodejs'
    },
    supabase: {
      url: SUPABASE_URL,
      projectId: SUPABASE_URL ? SUPABASE_URL.split('.')[0].split('://')[1] : undefined
    },
    request: {
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(req.headers.entries())
    }
  };
  
  return NextResponse.json(data, { 
    status: 200, 
    headers: corsHeaders 
  });
}

/**
 * Test direktanslutning till Supabase
 * 
 * Testar direktanslutningen till Supabase och returnerar resultatet
 */
async function handleTestDirect(req: NextRequest): Promise<NextResponse> {
  console.log(`[proxy] Test av direktanslutning till Supabase begärd`);
  
  // Kontrollera om Supabase URL är konfigurerad
  if (!SUPABASE_URL) {
    console.error(`[proxy] Test direktanslutning: SUPABASE_URL ej konfigurerad`);
    return NextResponse.json(
      { 
        status: false, 
        error: "Supabase URL ej konfigurerad", 
        timestamp: new Date().toISOString()
      },
      { status: 500, headers: corsHeaders }
    );
  }
  
  try {
    console.log(`[proxy] Testar direktanslutning till ${SUPABASE_URL}/healthz`);
    
    // Försök nå Supabase health endpoint direkt
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const startTime = Date.now();
    const response = await fetch(`${SUPABASE_URL}/healthz`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'X-Client-Info': 'proxy-direct-test'
      }
    });
    const endTime = Date.now();
    
    clearTimeout(timeoutId);
    
    const responseTime = endTime - startTime;
    const statusCode = response.status;
    
    let responseText;
    let responseData = null;
    
    try {
      responseText = await response.text();
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.log(`[proxy] Test direktanslutning: Kunde inte parsa svar som JSON:`, 
          responseText.length > 100 ? responseText.substring(0, 100) + '...' : responseText);
      }
    } catch (textError) {
      console.error(`[proxy] Test direktanslutning: Kunde inte läsa respons som text:`, textError);
    }
    
    console.log(`[proxy] Test direktanslutning resultat: ${statusCode}, tid: ${responseTime}ms`);
    
    return NextResponse.json(
      { 
        status: response.ok, 
        statusCode,
        responseTime,
        timestamp: new Date().toISOString(),
        data: responseData,
        rawResponse: responseText ? 
          (responseText.length > 500 ? responseText.substring(0, 500) + '...' : responseText) : 
          null
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error(`[proxy] Test direktanslutning misslyckades:`, error);
    
    return NextResponse.json(
      { 
        status: false, 
        error: error instanceof Error ? error.message : String(error),
        errorType: error instanceof Error ? error.name : typeof error,
        timestamp: new Date().toISOString()
      },
      { status: 200, headers: corsHeaders }
    );
  }
}

/**
 * Proxy-forwarding till Supabase
 * 
 * Vidarebefordrar anrop till Supabase API baserat på path och query parameters
 */
async function handleForward(req: NextRequest): Promise<NextResponse> {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api\/proxy/, '');
  
  // Kontrollera om Supabase URL är konfigurerad
  if (!SUPABASE_URL) {
    console.error(`[proxy] Forward: SUPABASE_URL ej konfigurerad`);
    return NextResponse.json(
      { error: "Supabase URL ej konfigurerad" },
      { status: 500, headers: corsHeaders }
    );
  }
  
  const targetUrl = `${SUPABASE_URL}${path}${url.search}`;
  
  console.log(`[proxy] Vidarebefordrar ${req.method} begäran till: ${targetUrl}`);
  
  try {
    // Kopiera alla inkommande headers förutom host
    const headers = new Headers();
    req.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'host') {
        headers.append(key, value);
      }
    });
    
    // Lägg till supabase anon key om den inte redan finns
    if (!headers.has('apikey') && SUPABASE_ANON_KEY) {
      headers.append('apikey', SUPABASE_ANON_KEY);
    }
    
    // Kopiera request body om det finns
    let body = undefined;
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      if (req.headers.get('content-type')?.includes('application/json')) {
        // För JSON-innehåll
        try {
          const jsonData = await req.json();
          body = JSON.stringify(jsonData);
        } catch (e) {
          console.error('[proxy] Kunde inte parsa JSON-body', e);
        }
      } else {
        // För andra innehållstyper, använd blob
        try {
          body = await req.blob();
        } catch (e) {
          console.error('[proxy] Kunde inte läsa request body som blob', e);
        }
      }
    }
    
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      redirect: 'follow',
    });
    
    // Bygg upp svarshuvuden
    const responseHeaders = new Headers(corsHeaders);
    response.headers.forEach((value, key) => {
      responseHeaders.append(key, value);
    });
    
    // Returnera svaret från Supabase
    const responseData = await response.blob();
    
    return new NextResponse(responseData, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error(`[proxy] Vidarebefordran misslyckades:`, error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 502, headers: corsHeaders }
    );
  }
}

/**
 * Gemensam handler för alla anrop
 * 
 * Routar förfrågningar baserat på path
 */
async function handleRequest(req: NextRequest, method: string) {
  try {
    const url = new URL(req.url);
    const path = url.pathname;
    
    console.log(`[Proxy] ${method} request to ${path}`);
    
    // Route förfrågningar baserat på path
    if (path === '/health') {
      return handleHealthCheck(req);
    } else if (path === '/debug') {
      return handleDebug(req);
    } else if (path === '/test-direct') {
      return handleTestDirect(req);
    } else {
      return handleForward(req);
    }
    
  } catch (error) {
    console.error(`[Proxy] Error handling ${method} request:`, error);
    
    return NextResponse.json({
      error: 'Proxy handler error',
      message: error instanceof Error ? error.message : 'Unknown error in proxy handler'
    }, { 
      status: 500, 
      headers: corsHeaders 
    });
  }
}

// Handler för GET-anrop
export async function GET(req: NextRequest) {
  return handleRequest(req, 'GET');
}

// Handler för POST-anrop
export async function POST(req: NextRequest) {
  return handleRequest(req, 'POST');
}

// Handler för PUT-anrop
export async function PUT(req: NextRequest) {
  return handleRequest(req, 'PUT');
}

// Handler för DELETE-anrop
export async function DELETE(req: NextRequest) {
  return handleRequest(req, 'DELETE');
}

// Handler för PATCH-anrop
export async function PATCH(req: NextRequest) {
  return handleRequest(req, 'PATCH');
} 