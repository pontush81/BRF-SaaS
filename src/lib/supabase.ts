import { createBrowserClient } from '@supabase/ssr'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Deklarera global-typerna för TypeScript
declare global {
  // eslint-disable-next-line no-var
  var supabase: SupabaseClient | undefined
}

/**
 * Create a Supabase client for use in the browser
 */
export const createBrowserSupabaseClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * Create a Supabase client for server-side usage
 */
export const createServerClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

// Kontrollera om miljövariabler är placeholders
const checkEnvironmentVariables = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || supabaseUrl.includes('[project-ref]')) {
    console.warn('Warning: NEXT_PUBLIC_SUPABASE_URL is not set correctly');
    return false;
  }

  if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key') {
    console.warn('Warning: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set correctly');
    return false;
  }

  if (!serviceRoleKey || serviceRoleKey === 'your-service-role-key') {
    console.warn('Warning: SUPABASE_SERVICE_ROLE_KEY is not set correctly');
    return false;
  }

  return true;
};

// Skapa en singleton-instans av Supabase-klienten för serveranvändning
let supabase: SupabaseClient;

if (typeof window === 'undefined') {
  // Servermiljö
  if (!global.supabase) {
    // Kontrollera miljövariabler endast i utvecklingsmiljö
    if (process.env.NODE_ENV === 'development') {
      checkEnvironmentVariables();
    }
    
    global.supabase = createServerClient();
  }
  supabase = global.supabase;
} else {
  // Klientmiljö - detta bör inte användas direkt,
  // använd createBrowserSupabaseClient istället
  supabase = createServerClient();
}

export { supabase };

// Exportera type för att användas i hela appen
export type Database = any; // Detta bör ersättas med ditt schema när det är genererat 