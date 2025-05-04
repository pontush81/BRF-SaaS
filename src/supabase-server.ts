/**
 * Server-only Supabase-konfiguration
 *
 * Denna fil innehåller kod som endast är avsedd för serverkomponenter och serverfunktioner.
 * Denna fil ska ALDRIG importeras i klientkomponenter.
 */

'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Miljö-detektion
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Skapa en Supabase-klient för serveranvändning med Next.js App Router
 * 
 * @param cookieStore Next.js cookies()-objektet från next/headers
 * @returns En Supabase-klient konfigurerad för server
 */
export const createServerClient = (cookieStore?: any) => {
  try {
    console.log("[supabase-server] Creating server client with", { 
      hasCookies: !!cookieStore,
      url: SUPABASE_URL
    });
    
    // I utvecklingsmiljö, kan vi returnera en mock-klient med förenklad auth
    if (isDevelopment) {
      console.log("[supabase-server] Returning development mock client");
      
      // Skapa en basklient
      const mockClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          storageKey: 'supabase.auth.token',
        }
      });
      
      // Lägg till mockade auth-metoder för utvecklingsmiljö
      const mockAuth = {
        getUser: async () => {
          // Hämta cookie-info för debugging
          const mockCookies = cookieStore ? 
            Object.fromEntries(cookieStore.getAll().map((c: any) => [c.name, c.value])) : 
            {};
          
          console.log("[supabase-server-mock] getUser called, mockCookies:", Object.keys(mockCookies));
          
          // Returnera alltid en mockad användare i utvecklingsmiljö
          // För en riktig implementering skulle vi läsa sessionsdata
          const mockUser = {
            id: '12345-mock-server-user-id',
            email: 'dev@example.com',
            app_metadata: {},
            user_metadata: { name: 'Server Utvecklare' },
            aud: 'authenticated',
            created_at: new Date().toISOString()
          };
          
          // För testning av login-flödet, låt oss se om en särskild cookie finns
          // Detta kommer att låta login-sidan fungera
          if (mockCookies['supabase-dev-auth'] === 'true') {
            return { data: { user: mockUser }, error: null };
          } else {
            return { data: { user: null }, error: null };
          }
        }
      };
      
      // Lägg till de mockade metoderna i klienten
      mockClient.auth = { 
        ...mockClient.auth, 
        ...mockAuth 
      };
      
      return mockClient;
    }
    
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error("[supabase-server] Missing SUPABASE_URL or SUPABASE_ANON_KEY");
      throw new Error('Missing Supabase environment variables');
    }
    
    // Grundläggande auth-konfiguration som alltid ska vara med
    const authConfig = {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'supabase.auth.token',
    };
    
    // Skapa en client med explicit auth-konfiguration
    if (cookieStore) {
      try {
        // Använd anon-nyckel för autentiserad client med cookies
        const supabaseClient = createClient(
          SUPABASE_URL,
          SUPABASE_ANON_KEY,
          {
            auth: authConfig,
            global: {
              headers: {
                'X-Client-Info': 'supabase-js-server/nextjs'
              }
            },
            cookies: {
              get(name) {
                try {
                  return cookieStore.get(name)?.value;
                } catch (error) {
                  console.error("[supabase-server] Error getting cookie:", error);
                  return undefined;
                }
              },
              set(name, value, options) {
                try {
                  cookieStore.set({ name, value, ...options });
                } catch (error) {
                  console.warn('[supabase-server] Cookies can only be set in route handlers or Server Actions');
                }
              },
              remove(name, options) {
                try {
                  cookieStore.set({ name, value: '', ...options, maxAge: 0 });
                } catch (error) {
                  console.warn('[supabase-server] Cookies can only be removed in route handlers or Server Actions');
                }
              }
            }
          }
        );

        // Verifiera att auth är korrekt konfigurerad
        if (!supabaseClient.auth) {
          console.error("[supabase-server] Supabase client auth is undefined after creation");
          throw new Error('Supabase client auth is undefined');
        }
        
        return supabaseClient;
      } catch (clientError) {
        console.error("[supabase-server] Error creating client with cookies:", clientError);
        throw clientError;
      }
    }
    
    // Om cookies inte är tillgängliga, använd admin-client (endast för server-till-server operationer)
    console.log("[supabase-server] Using fallback service role client (no cookies)");
    try {
      const serviceRoleClient = createClient(
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: authConfig
        }
      );
      
      // Verifiera att auth är korrekt konfigurerad
      if (!serviceRoleClient.auth) {
        console.error("[supabase-server] Service role client auth is undefined after creation");
        throw new Error('Service role client auth is undefined');
      }
      
      return serviceRoleClient;
    } catch (serviceError) {
      console.error("[supabase-server] Error creating service role client:", serviceError);
      throw serviceError;
    }
  } catch (error) {
    console.error("[supabase-server] Fatal error creating Supabase client:", error);
    throw error;
  }
}

/**
 * Hämta aktuell användare från Supabase session och databas
 * för användning i serverkomponenter
 * 
 * @param cookieStore Next.js cookies()-objektet från next/headers
 * @returns User-objekt eller null om användaren inte är inloggad
 */
export async function getServerSideUser(cookieStore: any) {
  try {
    console.log("Getting user server...");
    
    if (!cookieStore) {
      console.error("[supabase-server] No cookie store provided");
      return null;
    }
    
    // I utvecklingsmiljö, kolla efter vår speciella development-cookie
    if (isDevelopment) {
      const hasDevCookie = cookieStore.get('supabase-dev-auth')?.value === 'true';
      
      if (hasDevCookie) {
        console.log("[supabase-server] Development auth cookie found, returning mock user");
        return {
          id: '12345-mock-server-user-id',
          email: 'dev@example.com',
        };
      } else {
        console.log("[supabase-server] No development auth cookie found");
        return null;
      }
    }
    
    try {
      // Skapa en Supabase-klient för serveranvändning
      const supabase = createServerClient(cookieStore);
      
      if (!supabase) {
        console.error("[supabase-server] Failed to create Supabase client");
        return null;
      }
      
      // Kontrollera att auth är tillgänglig
      if (!supabase.auth) {
        console.error("[supabase-server] Supabase client auth is undefined");
        return null;
      }
      
      // Supabase v2: använd getUser istället för getSession
      try {
        const { data, error } = await supabase.auth.getUser();
        
        console.log("User check:", { 
          userExists: !!data?.user,
          userId: data?.user?.id,
          userEmail: data?.user?.email ? `${data.user.email.substring(0, 3)}...` : null
        });
        
        if (error || !data.user || !data.user.email) {
          console.log("No user found");
          return null;
        }
        
        return {
          id: data.user.id,
          email: data.user.email,
        };
      } catch (authError) {
        console.error('[supabase-server] Error calling supabase.auth.getUser():', authError);
        return null;
      }
    } catch (clientError) {
      console.error('[supabase-server] Error creating Supabase client:', clientError);
      return null;
    }
  } catch (error) {
    console.error('[supabase-server] Error getting server-side user:', error);
    return null;
  }
}

// TESTFALL för getServerSideUser (Supabase v2)
// Lägg i samma fil för enkelhet, men flytta gärna till separat testfil i riktig testmiljö
if (process.env.NODE_ENV === 'test') {
  const { describe, it, expect, beforeEach, jest } = require('@jest/globals');

  describe('getServerSideUser', () => {
    let mockSupabase;
    let mockCookieStore;

    beforeEach(() => {
      mockCookieStore = {
        get: jest.fn(),
        set: jest.fn(),
        delete: jest.fn(),
      };
    });

    it('returnerar användare om supabase.auth.getUser returnerar user', async () => {
      mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: { id: '123', email: 'test@example.com' } }, error: null })
        }
      };
      // Mocka createServerClient till att returnera mockSupabase
      const origCreateServerClient = createServerClient;
      global.createServerClient = () => mockSupabase;
      const result = await getServerSideUser(mockCookieStore);
      expect(result).toEqual({ id: '123', email: 'test@example.com' });
      global.createServerClient = origCreateServerClient;
    });

    it('returnerar null om supabase.auth.getUser returnerar error', async () => {
      mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: 'error' })
        }
      };
      const origCreateServerClient = createServerClient;
      global.createServerClient = () => mockSupabase;
      const result = await getServerSideUser(mockCookieStore);
      expect(result).toBeNull();
      global.createServerClient = origCreateServerClient;
    });
  });
} 