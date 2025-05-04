/**
 * Re-export file for supabase-server functions
 * 
 * This file provides implementations that avoid circular dependencies
 * by directly wrapping functionality without import cycles.
 */

import { createClient } from '@supabase/supabase-js';
import { createServerClient as createSSRClient } from '@supabase/ssr';
import type { User, UserResponse } from '@supabase/supabase-js';

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const isDevelopment = process.env.NODE_ENV === 'development';

// Direct implementation to avoid circular imports completely
export const createServerClient = (cookieStore?: any) => {
  try {
    console.log("[supabase-server/index] Creating server client");
    
    // In development mode, we can return a simplified client
    if (isDevelopment) {
      const mockClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      });
      
      // Store the original auth object
      const origAuth = mockClient.auth;
      
      // Override only the specific method we need for mocking
      origAuth.getUser = async (jwt?: string): Promise<UserResponse> => {
        console.log('[Server] Mock getUser called', jwt ? 'with JWT' : 'without JWT');
        
        const mockCookies = cookieStore ? 
          Object.fromEntries(cookieStore.getAll().map((c: any) => [c.name, c.value])) : 
          {};
        
        if (mockCookies['supabase-dev-auth'] === 'true') {
          // Create a properly typed mock user that matches Supabase User type
          const mockUser: User = {
            id: '12345-mock-server-user-id',
            email: 'dev@example.com',
            app_metadata: { provider: 'email' },
            user_metadata: { name: 'Server Utvecklare' },
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
        }
        
        return { data: { user: null }, error: null };
      };
      
      return mockClient;
    }
    
    // Basic auth configuration
    const authConfig = {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    };
    
    // Create client with cookies if available
    if (cookieStore) {
      // Use the SSR helper from Supabase for proper cookie handling
      return createSSRClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        cookies: {
          get: (name) => {
            try {
              return cookieStore.get(name)?.value;
            } catch (error) {
              console.error("Error getting cookie:", error);
              return undefined;
            }
          },
          set: (name, value, options) => {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              console.warn('Cookies can only be set in route handlers or Server Actions');
            }
          },
          remove: (name, options) => {
            try {
              cookieStore.set({ name, value: '', ...options, maxAge: 0 });
            } catch (error) {
              console.warn('Cookies can only be removed in route handlers or Server Actions');
            }
          }
        }
      });
    }
    
    // Fallback to service role client
    return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: authConfig });
  } catch (error) {
    console.error("[supabase-server/index] Error creating client:", error);
    throw error;
  }
};

// Direct implementation of getServerSideUser
export const getServerSideUser = async (cookieStore: any) => {
  try {
    if (!cookieStore) {
      return null;
    }
    
    // In development mode, check for special cookie
    if (isDevelopment) {
      const hasDevCookie = cookieStore.get('supabase-dev-auth')?.value === 'true';
      
      if (hasDevCookie) {
        return {
          id: '12345-mock-server-user-id',
          email: 'dev@example.com',
        };
      }
      
      return null;
    }
    
    // Create client and get user
    const supabase = createServerClient(cookieStore);
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data.user || !data.user.email) {
      return null;
    }
    
    return {
      id: data.user.id,
      email: data.user.email,
    };
  } catch (error) {
    console.error("[supabase-server/index] Error getting user:", error);
    return null;
  }
}; 