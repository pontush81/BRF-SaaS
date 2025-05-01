import { createClient } from '@supabase/supabase-js';

/**
 * Create a Supabase client for use in the browser
 */
export const createBrowserClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
};

/**
 * Create a Supabase client for server-side usage
 */
export const createServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
    },
  });
};

// Kontrollera om miljövariabler är placeholders
const isPlaceholder = (value?: string) => {
  return !value || value.includes('your-') || value === 'undefined';
};

// Kontrollera om Supabase-miljövariabler är korrekt inställda
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Skapa mockad klient om miljövariabler saknas
let supabase: ReturnType<typeof createClient>;

if (!isPlaceholder(supabaseUrl) && !isPlaceholder(supabaseAnonKey)) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Supabase initialization error:', error);
    // Skapa mockad klient om initieringen misslyckas
    supabase = {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signUp: () => Promise.resolve({ data: null, error: null }),
        signInWithPassword: () => Promise.resolve({ data: null, error: null }),
        signOut: () => Promise.resolve({ error: null }),
      },
    } as ReturnType<typeof createClient>;
  }
} else {
  console.warn('Supabase is not properly configured, using mock client');
  // Skapa mockad klient om miljövariabler saknas
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signUp: () => Promise.resolve({ data: null, error: null }),
      signInWithPassword: () => Promise.resolve({ data: null, error: null }),
      signOut: () => Promise.resolve({ error: null }),
    },
  } as ReturnType<typeof createClient>;
}

export { supabase }; 