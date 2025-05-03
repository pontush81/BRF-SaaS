/** @type {import('next').NextConfig} */

const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
  // Explicitly add environment variables
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  // General configuration
  reactStrictMode: true,
  swcMinify: true,
  // Enable handling of domains and subdomains
  async rewrites() {
    return {
      beforeFiles: [
        // Handle subdomain routing for BRF specific content
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: '(?<subdomain>.*)\\.handbok\\.se',
            },
          ],
          destination: '/:subdomain/:path*',
        },
      ],
    };
  },
};

module.exports = nextConfig; 