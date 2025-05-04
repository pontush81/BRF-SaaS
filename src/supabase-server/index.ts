/**
 * Re-export file for supabase-server.ts
 * 
 * This file exists to make the @/supabase-server import work correctly
 * with the path alias configuration.
 */

// Export everything from the server file
// This single export includes all needed functions like getServerSideUser and createServerClient
export * from '../supabase-server'; 