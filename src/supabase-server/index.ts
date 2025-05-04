/**
 * Re-export file for supabase-server.ts
 * 
 * This file exists to make the @/supabase-server import work correctly
 * with the path alias configuration.
 */

// Export everything from the server file
export * from '../supabase-server'; 

// Re-export specific functions that are used in imports for more explicit documentation
export { getServerSideUser, createServerClient } from '../supabase-server'; 