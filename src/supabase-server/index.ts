/**
 * Re-export file for supabase-server functions
 * 
 * This file exports the key functions from supabase-server.ts
 * without creating circular dependencies.
 * 
 * These implementations simply re-route to the actual functions
 * in the parent file, allowing @/supabase-server to be imported
 * while avoiding import loops.
 */

// Import from supabase-js for type definitions only
import { createClient } from '@supabase/supabase-js';

// Re-export the functions directly
export const createServerClient = (cookieStore?: any) => {
  // Dynamically import to avoid circular references
  const supabaseServer = require('../supabase-server');
  return supabaseServer.createServerClient(cookieStore);
};

export const getServerSideUser = async (cookieStore: any) => {
  // Dynamically import to avoid circular references
  const supabaseServer = require('../supabase-server');
  return supabaseServer.getServerSideUser(cookieStore);
}; 