/**
 * Minimal Supabase Utilities
 * 
 * This file provides minimal Supabase constants and utilities
 * that can be safely imported by both client and server components.
 * It does not import any Next.js server-only modules.
 */

import { createClient } from '@supabase/supabase-js';

// Miljövariabler för Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Export the constants and createClient for use in other modules
export { createClient, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY }; 