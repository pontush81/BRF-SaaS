import { createBrowserClient } from '@supabase/ssr'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Deklarera global-typerna för TypeScript
declare global {
  // eslint-disable-next-line no-var
  var supabase: SupabaseClient | undefined
}

// Definiera konstanter från miljövariabler
// Detta tillåter att vi kan hårdkoda värdena under utveckling om det behövs
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lcckqvnwnrgvpnpavhyp.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjY2txdm53bnJndnBucGF2aHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg2NzMwODYsImV4cCI6MjAzNDI0OTA4Nn0.fUOFr-fPX9FdO9vIvyRDr18FrghGShZZjsgb4nrD0OU'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjY2txdm53bnJndnBucGF2aHlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxODY3MzA4NiwiZXhwIjoyMDM0MjQ5MDg2fQ.GKPmbPBt2G81NRZVszw8rZ-rUzrQ9BpXU69nXhRm3fI'

/**
 * Create a Supabase client for use in the browser
 */
export const createBrowserSupabaseClient = () => {
  return createBrowserClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  )
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
    console.log('Supabase URL:', SUPABASE_URL ? 'defined' : 'undefined');
    console.log('Supabase Anon Key:', SUPABASE_ANON_KEY ? 'defined' : 'undefined');
    console.log('Supabase Service Role Key:', SUPABASE_SERVICE_ROLE_KEY ? 'defined' : 'undefined');
  }
  return true;
};

// Skapa en singleton-instans av Supabase-klienten för serveranvändning
let supabase: SupabaseClient;

if (typeof window === 'undefined') {
  // Servermiljö
  try {
    if (!global.supabase) {
      // Kontrollera miljövariabler endast i utvecklingsmiljö
      checkEnvironmentVariables();
      
      global.supabase = createServerClient();
    }
    supabase = global.supabase;
  } catch (error) {
    console.error('Failed to initialize Supabase server client:', error);
    
    throw new Error('Failed to initialize Supabase server client');
  }
} else {
  // Klientmiljö - detta bör inte användas direkt,
  // använd createBrowserSupabaseClient istället
  try {
    supabase = createServerClient();
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    
    throw new Error('Failed to initialize Supabase client');
  }
}

export { supabase };

// Exportera type för att användas i hela appen
export type Database = any; // Detta bör ersättas med ditt schema när det är genererat 