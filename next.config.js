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
    unoptimized: true, // Alltid använd ooptimerade bilder för bättre kompatibilitet
  },
  // Explicitly add environment variables
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  // General configuration
  reactStrictMode: false, // Inaktivera strict mode för att minska problem
  swcMinify: true,
  // Optimize static files
  poweredByHeader: false,
  compress: true,
  
  // VIKTIGT: Ta bort assetPrefix för att undvika problem med statiska filer
  // assetPrefix: process.env.NODE_ENV === 'production' ? 'https://www.handbok.org' : undefined,
  
  // Förbättrad CORS-hantering
  crossOrigin: 'anonymous',
  
  // Enable handling of domains and subdomains
  async rewrites() {
    return {
      beforeFiles: [
        // Gör statiska filer tillgängliga från alla domäner
        {
          source: '/_next/:path*',
          destination: '/_next/:path*',
        },
        // Se till att favicon är tillgänglig
        {
          source: '/favicon.ico',
          destination: '/favicon.ico',
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
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ],
      },
      {
        source: '/(.*).js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ],
      },
      {
        source: '/(.*).css',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ],
      },
      {
        source: '/_next/static/media/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ],
      },
    ];
  },
};

module.exports = nextConfig; 