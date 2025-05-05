/**
 * Re-export file for supabase-client functions
 *
 * This file provides direct implementations that avoid circular dependencies
 * by directly implementing the functionality without import cycles.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  User,
  UserResponse,
  Session,
  AuthResponse,
} from '@supabase/supabase-js';

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const isDevelopment = process.env.NODE_ENV !== 'production';
// Förbättra Vercel-detektering och inkludera även browser-kontroll
const isVercel =
  process.env.NEXT_PUBLIC_VERCEL_ENV ||
  process.env.VERCEL_ENV ||
  process.env.NEXT_PUBLIC_VERCEL ||
  process.env.VERCEL;

// Kontrollera om vi är i Vercel-miljö eller i produktion (men inte i utveckling)
const isRunningOnVercel =
  !!isVercel ||
  (process.env.NODE_ENV === 'production' && typeof window !== 'undefined');

// Forcera användning av proxy i produktion, även om Vercel-detektering misslyckas
const shouldUseProxy =
  isRunningOnVercel || process.env.NODE_ENV === 'production';

// Försök validera URL
let isValidUrl = false;
try {
  if (SUPABASE_URL) {
    new URL(SUPABASE_URL);
    isValidUrl = true;
  }
} catch (e) {
  console.error('[supabase-client] Invalid URL format:', SUPABASE_URL);
}

// Lägg till loggning av konfiguration
console.log('[supabase-client] Configuration:', {
  SUPABASE_URL: SUPABASE_URL
    ? `${SUPABASE_URL.substring(0, 30)}...`
    : 'MISSING',
  isValidUrl,
  hasAnonKey: !!SUPABASE_ANON_KEY,
  environment: process.env.NODE_ENV || 'unknown',
  isVercel: isRunningOnVercel ? 'yes' : 'no',
  usingProxy: shouldUseProxy ? 'yes' : 'no',
});

// Definiera en typsäker version av window.__supabaseClient
// Remove the duplicate Window interface declaration and use the one from supabase-globals.d.ts

// Uppdatera clientInstance typen - with compatible type to match the global definition
let clientInstance: SupabaseClient<any, 'public', any> | undefined = undefined;

// Helper för att testa om en URL är tillgänglig
const checkUrlConnection = async (url: string): Promise<boolean> => {
  if (typeof window === 'undefined') return true; // På serversidan, anta att allt funkar

  // I produktionsmiljö, använd alltid proxyn för connection-check
  if (shouldUseProxy) {
    // Gör alltid ett anrop mot vårt proxy-API istället för direkt mot Supabase
    try {
      console.log(`[supabase-client] Testing connection via proxy API`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const proxyHealthUrl = `/api/proxy/health`;
      const response = await fetch(proxyHealthUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'X-Supabase-Proxy': 'true',
          'Cache-Control': 'no-cache, no-store',
        },
      });

      clearTimeout(timeoutId);

      console.log(
        `[supabase-client] Proxy connection test result: ${response.status}`
      );
      return response.ok;
    } catch (error) {
      console.error(`[supabase-client] Proxy connection test failed:`, error);
      return false;
    }
  }

  // Vanlig kontroll för dev-miljö
  try {
    // Skapa ett lite mer "kontrollerat" URL för en simpel GET-förfrågan
    const testUrl = `${url}/auth/v1/health`;

    console.log(`[supabase-client] Testing connection to: ${testUrl}`);

    // Använd fetch med timeout för att testa anslutningen
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 sekunder timeout

    const response = await fetch(testUrl, {
      method: 'GET',
      mode: 'cors',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
      },
    });

    clearTimeout(timeoutId);

    console.log(`[supabase-client] Connection test result: ${response.status}`);

    return response.ok;
  } catch (error) {
    console.error(`[supabase-client] Connection test failed:`, error);
    return false;
  }
};

// Skapa en anpassad fetch-funktion som hanterar förfrågningar annorlunda baserat på miljö
function createCustomFetch(): typeof fetch {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    // Konvertera URL till string för kontroll
    const urlStr =
      input instanceof URL
        ? input.toString()
        : typeof input === 'string'
          ? input
          : input.url;

    // Kontrollera om detta är en förfrågan till Supabase
    const isSupabaseRequest = urlStr.includes(SUPABASE_URL);

    // Logga anrop för debugging i utvecklingsläge
    if (process.env.NODE_ENV === 'development') {
      console.log(`[createCustomFetch] Request to: ${urlStr}`);
      console.log(
        `[createCustomFetch] isSupabaseRequest: ${isSupabaseRequest}, isRunningOnVercel: ${isRunningOnVercel}`
      );
    }

    // Om vi kör på Vercel OCH det är en Supabase-förfrågan, använd vår proxy
    if (isRunningOnVercel && isSupabaseRequest) {
      // Ersätt Supabase URL med vår proxy
      const originalUrl = urlStr;
      let modifiedUrl: string;

      if (typeof input === 'string') {
        // Ändra från /api/supabase-proxy till /api/proxy
        modifiedUrl = originalUrl.replace(SUPABASE_URL, '/api/proxy');
      } else if (input instanceof URL) {
        // För URL-objekt
        modifiedUrl = `/api/proxy${input.pathname}${input.search}`;
      } else if ('url' in input && 'pathname' in input && 'search' in input) {
        // För Request-objekt
        modifiedUrl = `/api/proxy${input.pathname}${input.search}`;
      } else {
        // Fallback för andra typer (detta bör inte behövas med korrekt typning)
        modifiedUrl = `/api/proxy`;
        console.warn('[createCustomFetch] Oväntad input-typ:', input);
      }

      // För debugging i development mode
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[createCustomFetch] Proxying request via Vercel, original: ${originalUrl}, modified: ${modifiedUrl}`
        );
      }

      try {
        const response = await fetch(modifiedUrl, init);
        return response;
      } catch (error) {
        console.error(`[createCustomFetch] Proxy fetch error:`, error);
        throw error;
      }
    }

    // För alla andra förfrågningar, använd vanlig fetch
    return fetch(input, init);
  };
}

// Direct implementation to avoid circular imports
export const createBrowserClient = () => {
  try {
    console.log('[supabase-client] Creating browser client');

    // Försök normalisera URL:en (ta bort eventuella avslutande slashes)
    let normalizedUrl = SUPABASE_URL.trim();
    while (normalizedUrl.endsWith('/')) {
      normalizedUrl = normalizedUrl.slice(0, -1);
    }

    // Validera URL och nyckel
    if (!normalizedUrl || normalizedUrl === '') {
      console.error(
        '[supabase-client] MISSING SUPABASE_URL. Cannot create client.'
      );
      throw new Error('Missing SUPABASE_URL configuration');
    }

    if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.trim() === '') {
      console.error(
        '[supabase-client] MISSING SUPABASE_ANON_KEY. Cannot create client.'
      );
      throw new Error('Missing SUPABASE_ANON_KEY configuration');
    }

    if (typeof window === 'undefined') {
      // Server-side - create a minimal client
      console.log('[supabase-client] Creating server-side minimal client');
      return createClient(normalizedUrl, SUPABASE_ANON_KEY);
    }

    // Reset any existing instance to avoid session errors
    try {
      if (window.__supabaseClient) {
        console.log('[supabase-client] Resetting existing client instance');
        window.__supabaseClient = undefined;
        clientInstance = undefined;
      }
    } catch (e) {
      console.error('Error resetting Supabase client:', e);
    }

    // Parse URL for better diagnostics
    try {
      const urlParts = new URL(normalizedUrl);
      console.log('[supabase-client] URL details:', {
        protocol: urlParts.protocol,
        hostname: urlParts.hostname,
        pathname: urlParts.pathname,
      });

      // Visa projektets ID från URL för diagnostik
      const hostnameParts = urlParts.hostname.split('.');
      if (hostnameParts.length > 0) {
        console.log('[supabase-client] Project reference:', hostnameParts[0]);
      }
    } catch (error) {
      console.error('[supabase-client] Error parsing URL:', error);
    }

    // Create a new client
    if (!window.__supabaseClient) {
      console.log(
        '[supabase-client] Creating new Supabase client with URL:',
        normalizedUrl
      );

      // Använd alltid anpassad fetch i produktion
      const customFetch = shouldUseProxy ? createCustomFetch() : undefined;

      if (shouldUseProxy) {
        console.log(
          '[supabase-client] Using custom fetch with proxy for production/Vercel environment'
        );
      }

      // Skapa klient med förbättrade anslutningsinställningar
      const client = createClient(normalizedUrl, SUPABASE_ANON_KEY, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          flowType: 'pkce',
        },
        global: {
          // Lägg till custom headers för att hjälpa med CORS-problem
          headers: {
            'X-Client-Info': 'supabase-js/2.x',
          },
          fetch: customFetch,
        },
      });

      console.log('[supabase-client] Client created successfully');

      // In development, check for mock mode
      if (isDevelopment) {
        const hasMockCookie = document.cookie.includes(
          'supabase-dev-auth=true'
        );

        if (hasMockCookie) {
          console.log('[supabase-client] Setting up mock auth mode');

          // Store the original auth object and its methods
          const origAuth = client.auth;

          // Instead of replacing the entire auth object, store the original methods
          // and override only the ones we need for mocking
          const origGetUser = origAuth.getUser;
          const origGetSession = origAuth.getSession;

          // Override specific methods while keeping all other original methods
          origAuth.getUser = async (jwt?: string): Promise<UserResponse> => {
            console.log(
              'Mock getUser called',
              jwt ? 'with JWT' : 'without JWT'
            );

            // Create a properly typed mock user that matches Supabase User type
            const mockUser: User = {
              id: '12345-mock-user-id',
              email: 'dev@example.com',
              app_metadata: { provider: 'email' },
              user_metadata: { name: 'Utvecklaren' },
              aud: 'authenticated',
              created_at: new Date().toISOString(),
              role: 'authenticated',
              updated_at: new Date().toISOString(),
              phone: undefined,
            };

            return {
              data: { user: mockUser },
              error: null,
            };
          };

          origAuth.getSession = async () => {
            // Create a properly typed mock user that matches Supabase User type
            const mockUser: User = {
              id: '12345-mock-user-id',
              email: 'dev@example.com',
              app_metadata: { provider: 'email' },
              user_metadata: { name: 'Utvecklaren' },
              aud: 'authenticated',
              created_at: new Date().toISOString(),
              role: 'authenticated',
              updated_at: new Date().toISOString(),
              phone: undefined,
            };

            const mockSession: Session = {
              access_token: 'mock-token',
              refresh_token: 'mock-refresh-token',
              expires_in: 3600,
              expires_at: Math.floor(Date.now() / 1000) + 3600,
              token_type: 'bearer',
              user: mockUser,
            };

            // Use type casting to make TypeScript happy
            return {
              data: { session: mockSession },
              error: null,
            } as unknown as ReturnType<typeof origAuth.getSession>;
          };
        }
      }

      window.__supabaseClient = client;
    }

    clientInstance = window.__supabaseClient;
    return clientInstance;
  } catch (error) {
    console.error(
      '[supabase-client/index] Error creating browser client:',
      error
    );
    // Mer detaljer om vad som gick fel
    if (error instanceof Error) {
      console.error('[supabase-client/index] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }

    // Fallback till lokal utveckling
    if (isDevelopment) {
      console.warn(
        '[supabase-client/index] Using fallback client for development'
      );
      // Fallback med lokal URL om vi är i utveckling
      try {
        return createClient(
          'http://localhost:54321',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
        );
      } catch (e) {
        console.error(
          '[supabase-client/index] Error creating development fallback client:',
          e
        );
      }
    }

    // Sista utvägen: Använd en mock-klient som inte gör några faktiska nätverksanrop
    console.warn(
      '[supabase-client/index] Using minimal mock client as last resort'
    );
    try {
      const mockClient = createClient(
        SUPABASE_URL || 'https://example.supabase.co',
        SUPABASE_ANON_KEY || 'mock-key',
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false,
          },
        }
      ) as ReturnType<typeof createClient>;

      // Överskugga auth-metoder med mock-implementationer
      const originalAuth = mockClient.auth;
      // @ts-ignore - Avsiktlig överskrivning
      mockClient.auth = {
        ...originalAuth,
        // Ersätt kritiska metoder med mock-implementationer
        signInWithPassword: async (credentials: {
          email?: string;
          phone?: string;
          password: string;
        }) => {
          console.log(
            '[supabase-client/mock] Mock signInWithPassword called',
            credentials.email || 'no email'
          );

          // Skapa en korrekt typad mock-användare
          const mockUser: User = {
            id: 'mock-user',
            email: credentials.email || 'mock@example.com',
            app_metadata: { provider: 'email' },
            user_metadata: { name: 'Mock User' },
            aud: 'authenticated',
            created_at: new Date().toISOString(),
            role: 'authenticated',
            updated_at: new Date().toISOString(),
            phone: credentials.phone || undefined,
          };

          // Skapa en korrekt typad session
          const mockSession: Session = {
            access_token: 'mock-token',
            refresh_token: 'mock-refresh',
            expires_in: 3600,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            token_type: 'bearer',
            user: mockUser,
          };

          return {
            data: {
              user: mockUser,
              session: mockSession,
            },
            error: null,
          };
        },
      };

      return mockClient;
    } catch (mockError) {
      console.error(
        '[supabase-client/index] Even mock client creation failed:',
        mockError
      );
      // Absolut sista utväg - returnera ett objekt som inte kraschar
      return {} as any;
    }
  }
};

// Get existing client or create a new one
export const getSupabaseBrowser = () => {
  if (clientInstance) return clientInstance;
  return createBrowserClient();
};
