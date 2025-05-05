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
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
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
  const supabaseUrl = process.env.SUPABASE_URL;
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
    // Skapa en Supabase-klient för serveranvändning
    const supabase = await createServerClient(cookieStore);

    // Supabase v2: använd getUser
    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user || !data.user.email) {
      return null;
    }

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
          cookiesImpl.set = (name: string, value: string) => { mockCookieStore[name] = value; };
          cookiesImpl.remove = (name: string) => { delete mockCookieStore[name]; };
        }

        return mockSupabase as unknown as SupabaseClient<Database>;
      },
    };
  }
}
