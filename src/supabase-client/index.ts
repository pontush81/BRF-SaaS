/**
 * Re-export file for supabase-client.ts
 * 
 * This file exists to make the @/supabase-client import work correctly
 * with the path alias configuration.
 */

// Re-export specific functions from the original file
// Using explicit imports/exports instead of export * to avoid circular reference issues
import { createBrowserClient, getSupabaseBrowser } from '../supabase-client';
export { createBrowserClient, getSupabaseBrowser }; 