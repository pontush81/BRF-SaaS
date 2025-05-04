/**
 * Type declaration file for environment variables
 * 
 * Extends standard ProcessEnv to include all our environment variables
 * with proper typing
 */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Supabase configuration
      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
      
      // Environment type
      NODE_ENV: 'development' | 'production' | 'test' | 'staging';
      
      // Vercel specific
      NEXT_PUBLIC_VERCEL_ENV?: string;
      VERCEL_ENV?: string;
      NEXT_PUBLIC_VERCEL?: string;
      VERCEL?: string;
      
      // Add any other environment variables your app uses
      // NEXT_PUBLIC_API_URL?: string;
      // NEXT_PUBLIC_APP_URL?: string;
    }
  }
}

export {}; 