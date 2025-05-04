import { SupabaseClient } from '@supabase/supabase-js';

// Global type definitions for Supabase-related features
declare global {
  interface Window {
    __supabaseClient?: SupabaseClient<any, "public", any>;
    __mockAuthEnabled?: boolean;
    __mockUser?: any;
  }
}

// This empty export is needed to make TypeScript treat this as a module
export {}; 