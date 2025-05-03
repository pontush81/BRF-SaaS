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
    unoptimized: true,
  },
  // Explicitly add environment variables
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  
  // EXTREM FÖRENKLING: ta bort allt utom det nödvändigaste
  // Stäng av alla specialfunktioner som kan orsaka problem
  reactStrictMode: false,
  swcMinify: false,
  poweredByHeader: false,
  compress: true,
  
  // Ta bort alla specialfunktioner för rewriting
  // Låt Next.js hantera statiska resurser på sitt standardsätt
  async headers() {
    return [
      {
        // Tillåt alla CORS-requests till alla routes
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' }
        ],
      },
    ];
  },
};

module.exports = nextConfig; 