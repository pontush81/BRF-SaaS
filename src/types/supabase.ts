import { SupabaseClient } from '@supabase/supabase-js';

// Use the Database type from database.types - but rename it to avoid conflicts
import { Database as DbSchema } from './database.types';

// Export a typed Supabase client that uses our Database type
export type TypedSupabaseClient = SupabaseClient<DbSchema>;

// JSON type for use within this file
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Re-export database types
export type { Database } from './database.types';

// We don't declare the Window interface here as it's already in supabase-globals.d.ts
