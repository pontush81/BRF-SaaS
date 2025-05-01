import { createClient, SupabaseClient } from '@supabase/supabase-js';

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

// Skapa en mer komplett mockad Supabase-klient
const createMockClient = (): SupabaseClient => {
  return {
    // Nödvändiga grundfunktioner
    supabaseUrl: 'https://mock-instance.supabase.co',
    supabaseKey: 'mock-key',
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
          then: () => Promise.resolve([]),
        }),
        filter: () => ({
          then: () => Promise.resolve([]),
        }),
        then: () => Promise.resolve([]),
      }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      upsert: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
    }),
    // Auth-relaterade funktioner
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signUp: () => Promise.resolve({ data: null, error: null }),
      signInWithPassword: () => Promise.resolve({ data: null, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    // Realtidsfunktioner
    realtime: {
      channel: () => ({
        on: () => ({ subscribe: () => {} }),
        subscribe: () => Promise.resolve(),
      }),
    },
    // Övriga nödvändiga funktioner
    storage: { from: () => ({}) },
    functions: { invoke: () => Promise.resolve({ data: null, error: null }) },
    rest: {},
    channel: () => ({ subscribe: () => ({ receive: () => ({}) }) }),
    // Skapa tomimplementationer för de återstående funktionerna med unknown
  } as unknown as SupabaseClient;
};

let supabase: SupabaseClient;

if (!isPlaceholder(supabaseUrl) && !isPlaceholder(supabaseAnonKey)) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Supabase initialization error:', error);
    // Använd den mockade klienten om initieringen misslyckas
    supabase = createMockClient();
  }
} else {
  console.warn('Supabase is not properly configured, using mock client');
  // Använd den mockade klienten om miljövariabler saknas
  supabase = createMockClient();
}

export { supabase }; 