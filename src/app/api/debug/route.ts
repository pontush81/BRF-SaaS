import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * API-endpoint för diagnostik
 * 
 * Denna endpoint samlar detaljerad information om servermiljön,
 * konfiguration och nätverksstatus för att hjälpa till vid felsökning.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Förberedda test URLs baserat på projekt ID
const getTestUrls = () => {
  if (!SUPABASE_URL) return [];
  
  try {
    const urlObj = new URL(SUPABASE_URL);
    const projectId = urlObj.hostname.split('.')[0];
    
    return [
      { name: 'Health Check', url: `${SUPABASE_URL}/auth/v1/health` },
      { name: 'Auth API', url: `${SUPABASE_URL}/auth/v1/token?grant_type=none` },
      { name: 'REST API', url: `${SUPABASE_URL}/rest/v1/?apikey=${SUPABASE_ANON_KEY}` },
      { name: 'Public Project Page', url: `https://supabase.com/dashboard/project/${projectId}/api` },
    ];
  } catch (e) {
    console.error('Fel vid parsning av Supabase URL:', e);
    return [];
  }
};

// Test nätverksanslutning mot en URL
const testConnection = async (url: string): Promise<{
  success: boolean;
  status?: number;
  error?: string;
  timing: number;
}> => {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'apikey': SUPABASE_ANON_KEY || '',
        'Content-Type': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    const endTime = Date.now();
    
    return {
      success: response.ok,
      status: response.status,
      timing: endTime - startTime
    };
  } catch (error) {
    const endTime = Date.now();
    
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
      
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out after 5 seconds';
      }
    }
    
    return {
      success: false,
      error: errorMessage,
      timing: endTime - startTime
    };
  }
};

// Kontrollera DNS-inställningar
const checkDns = async (hostname: string): Promise<{
  resolved: boolean;
  error?: string;
  ip?: string;
}> => {
  // I server-side kontext kan vi inte göra DNS-uppslagningar direkt
  // Vi simulerar genom att försöka nå adressen
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(`https://${hostname}/`, {
      method: 'HEAD',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    return {
      resolved: true,
      // Vi kan inte få faktisk IP i server-side
      ip: 'Server-side DNS lookup succeeded'
    };
  } catch (error) {
    return {
      resolved: false,
      error: error instanceof Error ? error.message : 'Unknown DNS error'
    };
  }
};

// Testa supabase klient konfiguration
const testSupabaseClient = async () => {
  try {
    // Använd server client för test
    const cookieStore = cookies();
    const supabase = createServerClient(
      SUPABASE_URL || '',
      SUPABASE_ANON_KEY || '',
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            // Gör inget i denna diagnostikfunktion
          },
          remove(name: string, options: any) {
            // Gör inget i denna diagnostikfunktion
          },
        },
      }
    );

    // Försök göra ett enkelt anrop
    const { data, error } = await supabase.auth.getSession();
    
    return {
      success: !error,
      session: data.session ? 'Present' : 'Missing',
      error: error ? error.message : undefined
    };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown client error',
      stack: error instanceof Error ? error.stack : undefined
    };
  }
};

/**
 * GET-handler för diagnostik-endpointen
 */
export async function GET(req: NextRequest) {
  console.log('[Diagnostics] Request received:', req.url);
  
  const startTime = Date.now();
  
  try {
    // Validera Supabase URL
    let parsedSupabaseUrl: URL | null = null;
    let projectId = 'unknown';
    try {
      if (SUPABASE_URL) {
        parsedSupabaseUrl = new URL(SUPABASE_URL);
        projectId = parsedSupabaseUrl.hostname.split('.')[0];
      }
    } catch (e) {
      console.error('[Diagnostics] Invalid URL format:', e);
    }
    
    // Samla grundläggande miljöinformation
    const environment = {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL ? true : false,
      VERCEL_ENV: process.env.VERCEL_ENV || 'not-set',
      VERCEL_REGION: process.env.VERCEL_REGION || 'unknown',
      VERCEL_URL: process.env.VERCEL_URL || 'not-set',
      HOSTNAME: process.env.HOSTNAME || 'unknown',
      runtime: 'edge',
    };
    
    // Samla information om Supabase-konfiguration
    const supabaseConfig = {
      url: SUPABASE_URL,
      hasApiKey: !!SUPABASE_ANON_KEY,
      projectId,
      validUrl: !!parsedSupabaseUrl,
      urlDetails: parsedSupabaseUrl ? {
        protocol: parsedSupabaseUrl.protocol,
        hostname: parsedSupabaseUrl.hostname,
        pathname: parsedSupabaseUrl.pathname || '/',
      } : null,
    };
    
    // Undersök request för att hjälpa debugging
    const requestInfo = {
      url: req.url,
      method: req.method,
      headers: Object.fromEntries(req.headers.entries()),
      ip: req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
    };
    
    // Hämta alla cookies
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll().map(c => c.name);
    const sessionCookies = cookieStore.getAll()
      .filter(c => c.name.startsWith('sb-') || c.name.includes('supabase'))
      .map(c => ({ 
        name: c.name, 
        // Dölja värden av säkerhetsskäl, visa bara om token finns
        hasValue: c.value ? true : false,
        length: c.value ? c.value.length : 0
      }));
    
    // Utför nätverkstester
    let connectionTests = [];
    if (parsedSupabaseUrl) {
      // DNS-check
      const dnsCheck = await checkDns(parsedSupabaseUrl.hostname);
      
      // Individuella testanrop till viktiga endpoints
      const testUrls = getTestUrls();
      const testResults = [];
      
      for (const test of testUrls) {
        testResults.push({
          name: test.name,
          url: test.url,
          result: await testConnection(test.url)
        });
      }
      
      connectionTests = [
        { name: 'DNS Resolution', result: dnsCheck },
        ...testResults
      ];
    }
    
    // Testa Supabase-klient
    const clientTest = await testSupabaseClient();
    
    // Slutlig diagnostikdata
    const diagnosticData = {
      timestamp: new Date().toISOString(),
      processingTime: `${Date.now() - startTime}ms`,
      environment,
      supabase: supabaseConfig,
      request: requestInfo,
      cookies: {
        count: allCookies.length,
        all: allCookies,
        session: sessionCookies
      },
      tests: {
        connection: connectionTests,
        client: clientTest
      },
      proxy: {
        url: '/api/proxy/health',
        hint: 'Gör ett separat anrop till /api/proxy/health för att testa proxy-funktionaliteten'
      }
    };
    
    // Returnera diagnostikdata som JSON
    return NextResponse.json(diagnosticData, { 
      status: 200,
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    });
    
  } catch (error) {
    console.error('[Diagnostics] Error generating diagnostic data:', error);
    
    return NextResponse.json({
      error: 'Failed to generate diagnostic data',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { 
      status: 500,
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    });
  }
} 