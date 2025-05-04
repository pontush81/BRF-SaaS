/**
 * Re-export file for supabase-client functions
 * 
 * This file exports the key functions from supabase-client.ts
 * without creating circular dependencies.
 * 
 * These implementations simply re-route to the actual functions
 * in the parent file, allowing @/supabase-client to be imported
 * while avoiding import loops.
 */

// Import from supabase-js for type definitions only
import { createClient } from '@supabase/supabase-js';

// Re-export the functions directly
export const createBrowserClient = () => {
  // Dynamically import to avoid circular references
  const supabaseClient = require('../supabase-client');
  return supabaseClient.createBrowserClient();
};

export const getSupabaseBrowser = () => {
  // Dynamically import to avoid circular references
  const supabaseClient = require('../supabase-client');
  return supabaseClient.getSupabaseBrowser();
}; 