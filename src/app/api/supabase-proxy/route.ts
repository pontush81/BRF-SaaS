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

if (!SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL miljövariabel är inte satt');
}

if (!SUPABASE_ANON_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY miljövariabel är inte satt');
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, apikey',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
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
    
    // Bygg upp fullständig Supabase-URL
    const targetUrl = `${SUPABASE_URL}/${supabasePath}${url.search}`;
    
    console.log(`[Supabase-Proxy] Vidarebefordrar anrop till: ${targetUrl}`);
    
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
  } catch (error) {
    console.error('[Supabase-Proxy] Error:', error);
    
    // Returnera ett tydligt felmeddelande
    return NextResponse.json(
      { error: 'Proxy Error', message: (error as Error).message },
      { 
        status: 500,
        headers: corsHeaders 
      }
    );
  }
}

/**
 * GET-metoden för diagnostik och enkla anrop
 */
export async function GET(req: NextRequest) {
  // Fungerar exakt likadant som POST-metoden
  return POST(req);
} 