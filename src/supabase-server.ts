/**
 * Server-only Supabase-konfiguration
 *
 * Denna fil innehåller kod som endast är avsedd för serverkomponenter och serverfunktioner.
 * Denna fil ska ALDRIG importeras i klientkomponenter.
 */

"use server";

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { Database } from "@/types/database.types";
import { isDevelopment } from "@/lib/env";

// Definiera vår egen CookieOptions
interface CookieOptions {
  name?: string;
  value?: string;
  domain?: string;
  path?: string;
  maxAge?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
}

// Interface för cookieStore som matchar NextJS cookies
interface CookieStore {
  get: (name: string) => { value?: string } | Promise<{ value?: string }>;
  set?: (name: string, value: string, options?: CookieOptions) => void | Promise<void>;
  delete?: (name: string, options?: CookieOptions) => void | Promise<void>;
}

// Definiera typen för SupabaseClientOptions
type SupabaseOptions = {
  auth?: {
    autoRefreshToken?: boolean;
    persistSession?: boolean;
    detectSessionInUrl?: boolean;
  };
  cookies?: {
    get: (name: string) => string | undefined;
    set: (name: string, value: string, options?: CookieOptions) => void;
    remove: (name: string, options?: CookieOptions) => void;
  };
};

// Mock-typer
interface MockUser {
  id: string;
  email: string;
  app_metadata: Record<string, unknown>;
  user_metadata: {
    name: string;
  };
  aud: string;
  created_at: string;
}

// Globala typdeklarationer för testning och utveckling
declare global {
  // eslint-disable-next-line no-var
  var createServerClientMock: {
    createServerClient: (
      supabaseUrl: string,
      supabaseKey: string,
      options: SupabaseOptions
    ) => SupabaseClient<Database>;
  } | undefined;
}

/**
 * Skapa en Supabase-klient för serveranvändning med Next.js App Router
 *
 * @param cookieStore Next.js cookies()-objektet från next/headers
 * @returns En Supabase-klient konfigurerad för server
 */
export async function createServerClient(cookieStore?: CookieStore | any): Promise<SupabaseClient<Database>> {
  // Hämta miljövariabler - prova både SUPABASE_ och NEXT_PUBLIC_SUPABASE_ prefix för kompatibilitet
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase miljövariabler saknas:", {
      urlExists: !!supabaseUrl,
      keyExists: !!supabaseKey,
      NODE_ENV: process.env.NODE_ENV,
      DEPLOYMENT_ENV: process.env.DEPLOYMENT_ENV,
    });
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables"
    );
  }

  // Konfigurera cookies om de finns
  const options: SupabaseOptions = {};

  if (cookieStore) {
    // Kontrollera om vi har NextJS cookies() objekt eller vårt CookieStore interface
    const isNextJsCookies = typeof cookieStore.getAll !== 'function' &&
                           typeof cookieStore.get === 'function' &&
                           typeof cookieStore.has === 'function';

    options.cookies = {
      get: (name: string) => {
        try {
          if (isNextJsCookies) {
            // För Next.js cookies()
            return cookieStore.get(name)?.value;
          } else {
            // För vårt eget CookieStore
            const cookie = (cookieStore as CookieStore).get(name);
            // Hantera om cookieStore.get är async eller inte
            if (cookie instanceof Promise) {
              // Detta är inte optimalt för Promises, men vi måste göra en synkron funktion
              return undefined;
            }
            return cookie?.value;
          }
        } catch (e) {
          console.error("Error getting cookie:", e);
          return undefined;
        }
      },
      set: (name: string, value: string, options?: CookieOptions) => {
        try {
          if (!isNextJsCookies && (cookieStore as CookieStore).set) {
            (cookieStore as CookieStore).set?.(name, value, options);
          } else {
            console.warn('[supabase-server] NextJS cookies() cannot set cookies');
          }
        } catch (e) {
          console.error("Error setting cookie:", e);
        }
      },
      remove: (name: string, options?: CookieOptions) => {
        try {
          if (!isNextJsCookies && (cookieStore as CookieStore).delete) {
            (cookieStore as CookieStore).delete?.(name, options);
          } else {
            console.warn('[supabase-server] NextJS cookies() cannot remove cookies');
          }
        } catch (e) {
          console.error("Error removing cookie:", e);
        }
      },
    };
  }

  // Använd mock i utveckling om det finns en mock
  if (isDevelopment() && typeof globalThis.createServerClientMock !== 'undefined') {
    return globalThis.createServerClientMock.createServerClient(
      supabaseUrl,
      supabaseKey,
      options
    );
  }

  return createClient<Database>(supabaseUrl, supabaseKey, options);
}

/**
 * Skapa en Supabase-klient med servicerollen
 */
export async function createServiceRoleClient(): Promise<SupabaseClient<Database>> {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRole) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables"
    );
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRole, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Skapa en Supabase-klient som använder Next.js cookies
 */
export async function createClientCookies(): Promise<SupabaseClient<Database>> {
  const cookieStore = cookies();
  return createServerClient(cookieStore);
}

/**
 * Hämta aktuell användare från Supabase session
 */
export async function getServerSideUser(cookieStore: CookieStore | any): Promise<{ id: string; email: string } | null> {
  try {
    // Logga miljöinformation
    const isStaging = process.env.NODE_ENV === 'production' && process.env.DEPLOYMENT_ENV === 'staging';
    console.log('Server auth check environment:', {
      NODE_ENV: process.env.NODE_ENV,
      DEPLOYMENT_ENV: process.env.DEPLOYMENT_ENV || 'not set',
      isStaging
    });

    // Logga tillgängliga cookies
    let hasStagingAuth = false;
    if (typeof cookieStore.getAll === 'function') {
      const allCookies = cookieStore.getAll();
      console.log('Available cookies:', allCookies.map((c: any) => c.name));

      // Kontrollera om vi har staging-auth cookie
      hasStagingAuth = allCookies.some((c: any) => c.name === 'staging-auth');
    } else {
      // Om getAll inte finns, försök med get
      hasStagingAuth = !!cookieStore.get('staging-auth');
    }

    // Utvecklingsmiljö kan använda mock
    if (isDevelopment()) {
      console.log('Server auth check: Using development auth mock');
      const mockUser = {
        id: "123456",
        email: "test@example.com",
      };
      return mockUser;
    }

    // Staging-miljö med staging-auth cookie kan också använda mock
    if (isStaging && hasStagingAuth) {
      console.log('Server auth check: Using staging auth mock');
      const mockUser = {
        id: "staging-user-id",
        email: "staging@example.com",
      };

      // Försök också med Supabase-auth, men returnera mockad användare om det misslyckas
      try {
        // Skapa en Supabase-klient för serveranvändning
        const supabase = await createServerClient(cookieStore);

        // Supabase v2: använd getUser
        const { data, error } = await supabase.auth.getUser();

        if (!error && data?.user && data.user.email) {
          console.log('Server auth check success in staging:', {
            userId: data.user.id.substring(0, 8) + '...',
            userEmail: data.user.email,
          });

          return {
            id: data.user.id,
            email: data.user.email,
          };
        }

        // Om det misslyckades, logga felet och fortsätt med mockad användare
        console.log('Supabase auth failed in staging, using mock instead:', error?.message || 'No user data');
        return mockUser;
      } catch (supabaseError) {
        console.error('Error using Supabase in staging, using mock instead:', supabaseError);
        return mockUser;
      }
    }

    // Standard-flöde för andra miljöer
    // Skapa en Supabase-klient för serveranvändning
    const supabase = await createServerClient(cookieStore);

    // Supabase v2: använd getUser
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error('[supabase-server] Auth error:', error.message);
      return null;
    }

    if (!data?.user || !data.user.email) {
      console.log('[supabase-server] No user data found');
      return null;
    }

    console.log('Server auth check success:', {
      userId: data.user.id.substring(0, 8) + '...',
      userEmail: data.user.email,
    });

    return {
      id: data.user.id,
      email: data.user.email,
    };
  } catch (error) {
    console.error('[supabase-server] Error getting server-side user:', error);
    return null;
  }
}

// Skapa mock-implementation i utvecklingsmiljö
if (isDevelopment()) {
  const mockUser: MockUser = {
    id: "123456",
    email: "test@example.com",
    app_metadata: {},
    user_metadata: {
      name: "Test User",
    },
    aud: "authenticated",
    created_at: new Date().toISOString(),
  };

  const mockCookieStore: Record<string, string> = {};

  const mockAuth = {
    getUser: async () => {
      return {
        data: {
          user: mockUser
        },
        error: null
      };
    },
  };

  const mockSupabase = {
    auth: mockAuth,
  };

  // Skapa en mock createServerClient-funktion om den inte redan finns
  if (typeof globalThis.createServerClientMock === 'undefined') {
    globalThis.createServerClientMock = {
      createServerClient: (
        _supabaseUrl: string,
        _supabaseKey: string,
        options: SupabaseOptions
      ) => {
        // Hantera cookies om de finns
        if (options.cookies) {
          const cookiesImpl = options.cookies;
          cookiesImpl.get = (name: string) => mockCookieStore[name];
        }

        return mockSupabase as unknown as SupabaseClient<Database>;
      },
    };
  }
}
