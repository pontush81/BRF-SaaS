import { createBrowserClient } from '@supabase/ssr'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Deklarera global-typerna för TypeScript
declare global {
  // eslint-disable-next-line no-var
  var supabase: SupabaseClient | undefined
}

// Definiera konstanta värden för utveckling för att undvika problem med miljövariabler
const HARDCODED_URL = 'https://lcckqvnwnrgvpnpavhyp.supabase.co'
const HARDCODED_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjY2txdm53bnJndnBucGF2aHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMzIyNzQsImV4cCI6MjA2MTcwODI3NH0.slMq0kzATuFHTX9mtEWiY80aLbSPSMbpzQs15dqg5Us'
const HARDCODED_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjY2txdm53bnJndnBucGF2aHlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjEzMjI3NCwiZXhwIjoyMDYxNzA4Mjc0fQ.LV7xYRCHij9G7gLrygLzVnD0Dbp00Lrfj2z4CbnM9NM'

// Hämta URL och nycklar från miljövariabler eller använd hårdkodade värden
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || HARDCODED_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || HARDCODED_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || HARDCODED_SERVICE_KEY

/**
 * Create a Supabase client for use in the browser
 */
export const createBrowserSupabaseClient = () => {
  try {
    return createBrowserClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
          // Förhindra felmeddelanden i utvecklingsmiljö
          storageKey: 'supabase.auth.token',
          // Aktivera localStorage som fallback om cookies inte fungerar
          storage: {
            getItem: (key) => {
              try {
                return localStorage.getItem(key);
              } catch (error) {
                console.warn('localStorage not available, falling back to memory storage');
                return null;
              }
            },
            setItem: (key, value) => {
              try {
                localStorage.setItem(key, value);
              } catch (error) {
                console.warn('localStorage not available, using memory storage');
              }
            },
            removeItem: (key) => {
              try {
                localStorage.removeItem(key);
              } catch (error) {
                console.warn('localStorage not available');
              }
            },
          },
        }
      }
    )
  } catch (error) {
    console.error('Error creating browser Supabase client:', error);
    // Returnera en fallback-klient som simulerar felhantering
    return {
      auth: {
        signUp: () => Promise.reject(new Error('Kunde inte skapa Supabase-klient')),
        signInWithPassword: () => Promise.reject(new Error('Kunde inte skapa Supabase-klient')),
        signOut: () => Promise.resolve(),
        getSession: () => Promise.resolve({ data: { session: null } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      }
    } as any;
  }
}

/**
 * Create a Supabase client for server-side usage
 */
export const createServerClient = () => {
  return createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

// Kontrollera miljövariabler - endast för loggning
const checkEnvironmentVariables = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Supabase URL:', SUPABASE_URL ? SUPABASE_URL : 'SAKNAS (KRITISKT)');
    console.log('Supabase Anon Key:', SUPABASE_ANON_KEY ? '✓ DEFINIERAD' : 'SAKNAS (KRITISKT)');
    console.log('Supabase Service Role Key:', SUPABASE_SERVICE_ROLE_KEY ? '✓ DEFINIERAD' : 'SAKNAS (KRITISKT FÖR SERVEROPERATIONER)');
  }
  return true; // Returnera alltid true eftersom vi nu har hårdkodade fallback-värden
};

// Skapa en singleton-instans av Supabase-klienten för serveranvändning
let supabase: SupabaseClient;

if (typeof window === 'undefined') {
  // Servermiljö
  try {
    if (!global.supabase) {
      // Kontrollera miljövariabler
      checkEnvironmentVariables();
      global.supabase = createServerClient();
    }
    supabase = global.supabase;
  } catch (error) {
    console.error('Failed to initialize Supabase server client:', error);
    throw error;
  }
} else {
  // Klientmiljö - detta bör inte användas direkt,
  // använd createBrowserSupabaseClient istället
  if (process.env.NODE_ENV === 'development') {
    // Logga endast i utvecklingsmiljö
    checkEnvironmentVariables();
  }
}

export { supabase };

// Exportera type för att användas i hela appen
export type Database = any; // Detta bör ersättas med ditt schema när det är genererat 