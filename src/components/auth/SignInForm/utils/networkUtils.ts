import { SupabaseConnectionCheckResult } from '../SignInFormTypes';

/**
 * Testar nätverksanslutning till en URL
 */
export const checkConnectivity = async (url: string): Promise<boolean> => {
  try {
    console.log(`Testar anslutning till ${url}...`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      mode: 'no-cors', // För att kringgå CORS på enkel förfrågan
      cache: 'no-store' // Förhindra caching
    });

    clearTimeout(timeoutId);
    console.log(`Anslutningstest gav status: ${response.status}`);
    return true;
  } catch (error) {
    console.error(`Anslutningstest misslyckades:`, error);
    return false;
  }
};

/**
 * Kontrollerar Supabase-anslutningen via proxy
 */
export const checkSupabaseViaProxy = async (): Promise<SupabaseConnectionCheckResult> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // Längre timeout

    console.log("Checking Supabase connectivity via proxy...");

    const start = Date.now();
    const response = await fetch('/api/proxy/health?verbose=true', {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache, no-store'
      }
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - start;

    // Logga rårespons för debugging
    const responseText = await response.text();
    console.log(`Proxy health check raw response (${responseTime}ms):`, responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse proxy health response:", e);
      return {
        status: 'error',
        reachable: false,
        error: `Parsing error: ${e instanceof Error ? e.message : String(e)}`,
        details: `Invalid JSON: ${responseText.substring(0, 100)}...`
      };
    }

    if (data.reachable) {
      return {
        status: 'ok',
        reachable: true,
        details: `Connected in ${responseTime}ms`
      };
    } else {
      return {
        status: 'error',
        reachable: false,
        error: data.error || 'Unknown proxy error',
        details: data.data ? JSON.stringify(data.data) : undefined
      };
    }
  } catch (error) {
    console.error("Proxy health check error:", error);

    if (error instanceof Error && error.name === 'AbortError') {
      return { status: 'timeout', reachable: false, error: 'Timeout checking proxy' };
    }

    return {
      status: 'error',
      reachable: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * Hämtar server-diagnostik för att felsöka problem
 */
export const getServerDiagnostics = async (): Promise<any> => {
  try {
    const response = await fetch('/api/proxy/debug', {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store'
      }
    });

    if (!response.ok) {
      return { error: `Server responded with status ${response.status}` };
    }

    return await response.json();
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : String(error)
    };
  }
};
