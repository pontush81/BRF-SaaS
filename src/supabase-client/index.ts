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