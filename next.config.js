/** @type {import('next').NextConfig} */

const nextConfig = {
  /* config options here */
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
    unoptimized: process.env.NODE_ENV !== 'production',
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
  // Optimize static files
  poweredByHeader: false,
  compress: true,
  
  // Asset prefix för CDN
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://www.handbok.org' : undefined,
  
  // Förbättrad CORS-hantering med crossOrigin-attribut på script och länkade resurser
  crossOrigin: 'anonymous',
  
  // Enable handling of domains and subdomains
  async rewrites() {
    return {
      beforeFiles: [
        // Gör statiska filer tillgängliga från alla domäner
        {
          source: '/_next/:path*',
          destination: '/_next/:path*',
          has: [
            {
              type: 'host',
              value: '(.*)',
            },
          ],
        },
        
        // Handle subdomain routing for BRF specific content
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: '(?<subdomain>.*)\\.handbok\\.org',
            },
          ],
          destination: '/:subdomain/:path*',
        },
      ],
    };
  },
  
  // Optimera cachning för statiska filer med förbättrade CORS-headers
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, OPTIONS',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, OPTIONS',
          },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
      {
        source: '/(.*).js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 