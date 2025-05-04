/**
 * Re-export file for supabase-client functions
 * 
 * This file provides direct implementations that avoid circular dependencies
 * by directly implementing the functionality without import cycles.
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const isDevelopment = process.env.NODE_ENV === 'development';

// For tracking the client instance
let clientInstance: any = null;

// Direct implementation to avoid circular imports
export const createBrowserClient = () => {
  try {
    if (typeof window === 'undefined') {
      // Server-side - create a minimal client
      return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    
    // Reset any existing instance to avoid session errors
    try {
      if (window.__supabaseClient) {
        window.__supabaseClient = null;
        clientInstance = null;
      }
    } catch (e) {
      console.error('Error resetting Supabase client:', e);
    }
    
    // Create a new client
    if (!window.__supabaseClient) {
      const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      });
      
      // In development, check for mock mode
      if (isDevelopment) {
        const hasMockCookie = document.cookie.includes('supabase-dev-auth=true');
        
        if (hasMockCookie) {
          // Add mock methods for development
          const origAuth = client.auth;
          client.auth = {
            ...origAuth,
            getUser: async () => {
              const mockUser = {
                id: '12345-mock-user-id',
                email: 'dev@example.com',
                app_metadata: {},
                user_metadata: { name: 'Utvecklaren' },
                created_at: new Date().toISOString()
              };
              
              return { data: { user: mockUser }, error: null };
            },
            getSession: async () => {
              const mockUser = {
                id: '12345-mock-user-id',
                email: 'dev@example.com',
                app_metadata: {},
                user_metadata: { name: 'Utvecklaren' },
                created_at: new Date().toISOString()
              };
              
              const mockSession = {
                access_token: 'mock-token',
                refresh_token: 'mock-refresh-token',
                expires_at: Math.floor(Date.now() / 1000) + 3600,
                user: mockUser
              };
              
              return { data: { session: mockSession }, error: null };
            }
          };
        }
      }
      
      window.__supabaseClient = client;
    }
    
    clientInstance = window.__supabaseClient;
    return clientInstance;
  } catch (error) {
    console.error("[supabase-client/index] Error creating browser client:", error);
    // Return a minimal client as fallback
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