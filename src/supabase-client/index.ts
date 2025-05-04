/**
 * Re-export file for supabase-client functions
 * 
 * This file provides direct implementations that avoid circular dependencies
 * by directly implementing the functionality without import cycles.
 */

import { createClient } from '@supabase/supabase-js';
import type { User, UserResponse, Session, AuthResponse } from '@supabase/supabase-js';

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const isDevelopment = process.env.NODE_ENV === 'development';

// Lägg till loggning av konfiguration
console.log('[supabase-client] Configuration:', { 
  SUPABASE_URL: SUPABASE_URL ? `${SUPABASE_URL.substring(0, 15)}...` : 'MISSING', 
  hasAnonKey: !!SUPABASE_ANON_KEY,
  environment: process.env.NODE_ENV || 'unknown'
});

// For tracking the client instance
let clientInstance: any = null;

// Direct implementation to avoid circular imports
export const createBrowserClient = () => {
  try {
    console.log('[supabase-client] Creating browser client');
    
    // Validera URL och nyckel
    if (!SUPABASE_URL || SUPABASE_URL.trim() === '') {
      console.error('[supabase-client] MISSING SUPABASE_URL. Cannot create client.');
      throw new Error('Missing SUPABASE_URL configuration');
    }
    
    if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.trim() === '') {
      console.error('[supabase-client] MISSING SUPABASE_ANON_KEY. Cannot create client.');
      throw new Error('Missing SUPABASE_ANON_KEY configuration');
    }

    if (typeof window === 'undefined') {
      // Server-side - create a minimal client
      console.log('[supabase-client] Creating server-side minimal client');
      return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    
    // Reset any existing instance to avoid session errors
    try {
      if (window.__supabaseClient) {
        console.log('[supabase-client] Resetting existing client instance');
        window.__supabaseClient = null;
        clientInstance = null;
      }
    } catch (e) {
      console.error('Error resetting Supabase client:', e);
    }
    
    // Create a new client
    if (!window.__supabaseClient) {
      console.log('[supabase-client] Creating new Supabase client with URL:', 
                 SUPABASE_URL.substring(0, 20) + '...');
                 
      const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      });
      
      console.log('[supabase-client] Client created successfully');
      
      // In development, check for mock mode
      if (isDevelopment) {
        const hasMockCookie = document.cookie.includes('supabase-dev-auth=true');
        
        if (hasMockCookie) {
          console.log('[supabase-client] Setting up mock auth mode');
          
          // Store the original auth object and its methods
          const origAuth = client.auth;
          
          // Instead of replacing the entire auth object, store the original methods
          // and override only the ones we need for mocking
          const origGetUser = origAuth.getUser;
          const origGetSession = origAuth.getSession;
          
          // Override specific methods while keeping all other original methods
          origAuth.getUser = async (jwt?: string): Promise<UserResponse> => {
            console.log('Mock getUser called', jwt ? 'with JWT' : 'without JWT');
            
            // Create a properly typed mock user that matches Supabase User type
            const mockUser: User = {
              id: '12345-mock-user-id',
              email: 'dev@example.com',
              app_metadata: { provider: 'email' },
              user_metadata: { name: 'Utvecklaren' },
              aud: 'authenticated',
              created_at: new Date().toISOString(),
              role: 'authenticated',
              updated_at: new Date().toISOString(),
              phone: null
            };
            
            return { 
              data: { user: mockUser }, 
              error: null 
            };
          };
          
          origAuth.getSession = async (): Promise<AuthResponse> => {
            // Create a properly typed mock user that matches Supabase User type
            const mockUser: User = {
              id: '12345-mock-user-id',
              email: 'dev@example.com',
              app_metadata: { provider: 'email' },
              user_metadata: { name: 'Utvecklaren' },
              aud: 'authenticated',
              created_at: new Date().toISOString(),
              role: 'authenticated',
              updated_at: new Date().toISOString(),
              phone: null
            };
            
            const mockSession: Session = {
              access_token: 'mock-token',
              refresh_token: 'mock-refresh-token',
              expires_in: 3600,
              token_type: 'bearer',
              user: mockUser
            };
            
            return { 
              data: { session: mockSession, user: mockUser }, 
              error: null 
            };
          };
        }
      }
      
      window.__supabaseClient = client;
    }
    
    clientInstance = window.__supabaseClient;
    return clientInstance;
  } catch (error) {
    console.error("[supabase-client/index] Error creating browser client:", error);
    // Mer detaljer om vad som gick fel
    if (error instanceof Error) {
      console.error("[supabase-client/index] Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    // Fallback till lokal utveckling
    if (isDevelopment) {
      console.warn("[supabase-client/index] Using fallback client for development");
      // Fallback med lokal URL om vi är i utveckling
      return createClient(
        "http://localhost:54321", 
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
      );
    }
    
    // Return a minimal client as fallback
    console.warn("[supabase-client/index] Using minimal fallback client");
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
};

// Get existing client or create a new one
export const getSupabaseBrowser = () => {
  if (clientInstance) return clientInstance;
  return createBrowserClient();
};

// Add type declaration
declare global {
  interface Window {
    __supabaseClient?: any;
  }
} 