/**
 * Re-export file for supabase-server.ts
 * 
 * This file exists to make the @/supabase-server import work correctly
 * with the path alias configuration.
 */

// Re-export specific functions from the original file
// This avoids potential circular imports when using export *
import { createServerClient, getServerSideUser } from '../supabase-server.ts';
export { createServerClient, getServerSideUser }; 