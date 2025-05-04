/**
 * COMPATIBILITY FILE
 * 
 * This file exists to maintain compatibility with older code that still
 * imports from '@/lib/supabase'. It re-exports everything from supabase-minimal.ts.
 * 
 * New code should import directly from:
 * - @/supabase-client.ts (for client components)
 * - @/supabase-server.ts (for server components)
 * - @/lib/supabase-minimal.ts (for shared constants)
 */

import { createClient, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } from './supabase-minimal';

// Re-export everything for compatibility
export { createClient, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY };

// For backward compatibility with code that might have used a default export
export default {
  createClient,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY
}; 