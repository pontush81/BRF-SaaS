#!/usr/bin/env node

/**
 * This script provides instructions for updating the Supabase Site URL
 * for email confirmations.
 * 
 * Since the Supabase Management API requires proper authentication,
 * this script now provides manual instructions for updating through the UI.
 */

// Get environment variables based on current NODE_ENV
const NODE_ENV = process.env.NODE_ENV || 'development';
console.log(`Running in ${NODE_ENV} environment`);

// Load the environment-specific variables
require('dotenv').config({ path: `.env.${NODE_ENV}` });
// Fall back to the main .env file if needed
require('dotenv').config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.handbok.org';

// Validate required variables
if (!SUPABASE_URL) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  process.exit(1);
}

// Extract the project reference from Supabase URL
const projectRef = SUPABASE_URL.match(/\/\/([^.]+)\./)?.[1];

if (!projectRef) {
  console.error('Could not extract project reference from Supabase URL');
  process.exit(1);
}

// Display manual instructions
console.log(`
============================================================
  MANUAL SUPABASE CONFIGURATION INSTRUCTIONS
============================================================

The Site URL for email confirmations needs to be updated in 
your Supabase project settings.

1. Login to Supabase Dashboard: https://app.supabase.com
2. Select your project: ${projectRef}
3. Go to Authentication -> URL Configuration
4. Update the "Site URL" field to:
   ${APP_URL}
5. Click "Save" to apply changes

After updating, your email confirmation links will point to:
${APP_URL} instead of localhost:3000

============================================================
`);

console.log('✅ Instructions displayed successfully');
process.exit(0); 