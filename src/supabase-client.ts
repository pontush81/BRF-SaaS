/**
 * Klient-endast Supabase-konfiguration
 *
 * Denna fil innehåller endast kod som är säker att importera i klientkomponenter.
 * Innehåller INGA importer från next/headers eller annan server-only kod.
 */

import {
  createClient,
  SupabaseClient,
  AuthTokenResponsePassword,
  AuthError,
  Session,
  AuthChangeEvent,
  Subscription,
} from '@supabase/supabase-js';
import type { SignInWithPasswordCredentials } from '@supabase/supabase-js';

// Miljövariabler för Supabase
const SUPABASE_URL: string = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY: string =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY: string =
  process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Log for debugging but not revealing full keys
console.log('SUPABASE_URL:', SUPABASE_URL);
console.log(
  'SUPABASE_ANON_KEY:',
  SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.substring(0, 8) + '...' : 'NOT SET'
);

// Kontrollera om vi är i utvecklingsmiljö
const isDevelopment = process.env.NODE_ENV === 'development';

// För klientinstansen i browser
let clientInstance: SupabaseClient | undefined = undefined;

// I utvecklingsmiljö, kontrollera om vi har mock-läge aktiverat
const hasMockCookie =
  typeof document !== 'undefined' &&
  document.cookie.includes('supabase-dev-auth=true');

// Skapa en Supabase-klient för webbläsaren
export function createBrowserClient() {
  if (typeof window === 'undefined') {
    // Vi är på servern, men anropas från klienten - skapa en minimal klient
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  // Rensa alla befintliga instanser för att undvika sessionsfel
  try {
    if (window.__supabaseClient) {
      console.log('Återställer Supabase-klienten för att undvika sessionsfel');
      window.__supabaseClient = undefined;
      clientInstance = undefined;
    }
  } catch (e) {
    console.error('Fel vid återställning av Supabase-klient:', e);
  }

  // Skapa en ny klient
  if (!window.__supabaseClient) {
    // I utvecklingsmiljö, använd en klient med mock-autentisering
    if (isDevelopment) {
      console.log(
        'Skapar Supabase-klient med mock-autentisering för utvecklingsmiljö'
      );

      // I utvecklingsmiljö, kontrollera om vi har mock-läge aktiverat
      console.log('Mock cookie status:', hasMockCookie ? 'Hittad' : 'Saknas');

      // Skapa en klient med anpassad auth för utvecklingsmiljö
      window.__supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          storageKey: 'supabase.auth.token',
        },
      });

      // Sätt mock-autentisering baserat på cookie
      window.__mockAuthEnabled = hasMockCookie;
      window.__mockUser = null;

      if (hasMockCookie) {
        console.log('Mock auth cookie funnen, använder mock-autentisering');

        // Skapa mock-metoder för utvecklingsmiljö
        const origAuth = window.__supabaseClient.auth;

        // Skapa ett anpassat auth-objekt som integrerar med ursprunglig auth
        const mockAuth = {
          ...origAuth,
          // Mock signInWithPassword
          signInWithPassword: async (
            credentials: SignInWithPasswordCredentials
          ): Promise<AuthTokenResponsePassword> => {
            console.log('MOCK: signInWithPassword med', {
              email: (credentials as any).email,
            });

            // Godkänn alla inloggningar i utvecklingsmiljö men bekräfta att lösenord finns
            if (!credentials.password || credentials.password.length < 1) {
              return {
                data: { user: null, session: null },
                error: new Error('Lösenord krävs') as AuthError,
              };
            }

            // I verkligheten skulle vi kolla mot en databas
            const mockUser = {
              id: '12345-mock-user-id',
              email: (credentials as any).email,
              app_metadata: {},
              user_metadata: { name: 'Utvecklaren' },
              aud: 'authenticated',
              created_at: new Date().toISOString(),
            };

            const mockSession: Session = {
              access_token: 'mock-token-' + Date.now(),
              refresh_token: 'mock-refresh-token-' + Date.now(),
              expires_at: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
              expires_in: 3600,
              token_type: 'bearer',
              user: mockUser,
            };

            // Spara mock-användare för framtida anrop
            window.__mockUser = mockUser;

            // Sätt cookie för att indikera inloggad status
            document.cookie = 'supabase-dev-auth=true; path=/; max-age=86400';

            return {
              data: {
                user: mockUser,
                session: mockSession,
              },
              error: null,
            };
          },

          // Mock getUser
          getUser: async () => {
            console.log('MOCK: getUser anropad');
            if (window.__mockUser) {
              return {
                data: { user: window.__mockUser },
                error: null,
              };
            }

            // Om vi har cookie men ingen mockUser, skapa en
            if (hasMockCookie && !window.__mockUser) {
              window.__mockUser = {
                id: '12345-mock-user-id',
                email: 'dev@example.com',
                app_metadata: {},
                user_metadata: { name: 'Utvecklaren' },
                aud: 'authenticated',
                created_at: new Date().toISOString(),
              };
              return {
                data: { user: window.__mockUser },
                error: null,
              };
            }

            return { data: { user: null }, error: null };
          },

          // Mock getSession
          getSession: async () => {
            console.log('MOCK: getSession anropad');
            if (window.__mockUser) {
              const mockSession: Session = {
                access_token: 'mock-token',
                refresh_token: 'mock-refresh-token',
                expires_at: Math.floor(Date.now() / 1000) + 3600,
                expires_in: 3600,
                token_type: 'bearer',
                user: window.__mockUser,
              };
              return {
                data: { session: mockSession },
                error: null,
              };
            }

            // Om vi har cookie men ingen mockUser, skapa en session
            if (hasMockCookie && !window.__mockUser) {
              window.__mockUser = {
                id: '12345-mock-user-id',
                email: 'dev@example.com',
                app_metadata: {},
                user_metadata: { name: 'Utvecklaren' },
                aud: 'authenticated',
                created_at: new Date().toISOString(),
              };

              const mockSession: Session = {
                access_token: 'mock-token',
                refresh_token: 'mock-refresh-token',
                expires_at: Math.floor(Date.now() / 1000) + 3600,
                expires_in: 3600,
                token_type: 'bearer',
                user: window.__mockUser,
              };
              return {
                data: { session: mockSession },
                error: null,
              };
            }

            return { data: { session: null }, error: null };
          },

          // Mock signOut
          signOut: async () => {
            console.log('MOCK: signOut anropad');
            window.__mockUser = null;
            // Delete the mock auth cookie
            document.cookie =
              'supabase-dev-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            return { error: null };
          },

          // Mock onAuthStateChange
          onAuthStateChange: (
            callback: (
              event: AuthChangeEvent,
              session: Session | null
            ) => void | Promise<void>
          ) => {
            console.log('MOCK: onAuthStateChange registrerad');
            // Ingen faktisk händelsehantering i mock
            return {
              data: {
                subscription: {
                  unsubscribe: () => {},
                } as Subscription,
              },
            };
          },
        };

        // Ersätt auth-objektet med vår mock
        window.__supabaseClient.auth = mockAuth as any;
      }
    } else {
      // I produktion, använd standard Supabase-klient
      window.__supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          storageKey: 'supabase.auth.token',
        },
      });
    }
  }

  clientInstance = window.__supabaseClient;
  return clientInstance;
}

// Få den existerande klientinstansen eller skapa en ny
export function getSupabaseBrowser() {
  if (clientInstance) return clientInstance;
  return createBrowserClient();
}

// Exportera miljövariablerna för användning i andra filer
export { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY };

// Typ för Supabase-schema
export type Database = any;

// Remove the duplicate global declaration
