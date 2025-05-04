/**
 * Re-export file for supabase-server functions
 * 
 * This file provides implementations that avoid circular dependencies
 * by directly wrapping functionality without import cycles.
 */

import { createClient } from '@supabase/supabase-js';
import { createServerClient as createSSRClient } from '@supabase/ssr';
import type { User, UserResponse } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const isDevelopment = process.env.NODE_ENV === 'development';

// Loggfunktion för debugging
const serverLog = (message: string, data?: any) => {
  console.log(`[Supabase-Server] ${message}`, data ? data : '');
};

// Direct implementation to avoid circular imports completely
export const createServerClient = () => {
  serverLog('Creating server client');
  
  const cookieStore = cookies();
  
  try {
    // Logga alla tillgängliga cookies
    const allCookies = cookieStore.getAll();
    serverLog('Available cookies:', allCookies.map(c => c.name));
    
    // Extrahera Supabase-cookies
    const accessToken = cookieStore.get('sb-access-token')?.value;
    const refreshToken = cookieStore.get('sb-refresh-token')?.value;
    const devAuth = cookieStore.get('supabase-dev-auth')?.value;
    
    serverLog('Cookie extraction:', { 
      hasAccessToken: !!accessToken, 
      hasRefreshToken: !!refreshToken, 
      hasDevAuth: !!devAuth 
    });
    
    // I utvecklingsläge, använd mock om devAuth cookie finns
    if (process.env.NODE_ENV === 'development' && devAuth === 'true') {
      serverLog('Using development mock client (dev auth cookie found)');
      
      const client = createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );
      
      // Spara originalet för att behålla alla metoder
      const originalAuth = client.auth;
      
      // Överskugga auth objektet med en mock implementation
      // som behåller alla originalmetoder men ersätter getUser
      // @ts-ignore - Avsiktlig överskrivning av auth-objektet
      client.auth = {
        ...originalAuth,
        // Överskugga getUser för att returnera användare i utvecklingsläge
        getUser: async (jwt?: string): Promise<UserResponse> => {
          serverLog('Mock getUser called', { jwt: jwt ? 'provided' : 'not provided' });
          
          const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
          
          // Skapa en mock user
          const user: User = {
            id: mockUserId,
            app_metadata: {
              provider: 'email',
              providers: ['email'],
            },
            user_metadata: {
              name: 'Test Testsson',
              role: 'admin',
            },
            aud: 'authenticated',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            email: 'test@example.com',
            phone: '',
            role: 'authenticated',
            email_confirmed_at: new Date().toISOString(),
            phone_confirmed_at: null,
            last_sign_in_at: new Date().toISOString(),
            confirmed_at: new Date().toISOString(),
            confirmation_sent_at: null,
            recovery_sent_at: null,
            email_change_sent_at: null,
            banned_until: null,
            reauthentication_sent_at: null,
            invited_at: null,
            action_link: null,
            deleted_at: null,
            identities: [],
            factors: [],
          };
          
          return { data: { user }, error: null };
        }
      };
      
      return client;
    }
    
    // För produktion eller om vi har tokens, skapa en klient med auth cookies
    if (accessToken && refreshToken) {
      serverLog('Creating authenticated server client with tokens');
      
      return createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false,
          },
          global: {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        }
      );
    }
    
    // Standard fall: skapa en anonym klient
    serverLog('Creating anonymous server client (no auth tokens found)');
    return createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  } catch (error) {
    serverLog('Error creating server client:', error);
    // Vid fel, skapa en standardklient
    return createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }
};

// Direct implementation of getServerSideUser
export async function getServerSideUser(): Promise<User | null> {
  try {
    serverLog('Getting server-side user');
    const supabase = createServerClient();
    
    try {
      // I utvecklingsläge, kontrollera om vi har dev auth cookie
      if (process.env.NODE_ENV === 'development') {
        const cookieStore = cookies();
        const devAuth = cookieStore.get('supabase-dev-auth');
        
        serverLog('Dev mode check:', { hasDevAuth: !!devAuth });
        
        if (devAuth?.value === 'true') {
          // Använd mock getUser i dev-läge
          const { data, error } = await supabase.auth.getUser();
          
          if (error) {
            serverLog('Error getting dev user:', error);
            return null;
          }
          
          if (data?.user) {
            serverLog('Found dev user:', { email: data.user.email, id: data.user.id });
            return data.user;
          }
        }
      }
      
      // Normalt flöde: hämta användare från Supabase
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        serverLog('Error getting user:', error);
        return null;
      }
      
      if (data?.user) {
        serverLog('Found authenticated user:', { email: data.user.email, id: data.user.id });
        return data.user;
      }
      
      serverLog('No user found');
      return null;
    } catch (error) {
      serverLog('Error in getUser call:', error);
      return null;
    }
  } catch (error) {
    serverLog('Unexpected error in getServerSideUser:', error);
    return null;
  }
} 