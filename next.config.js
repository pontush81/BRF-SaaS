/** @type {import('next').NextConfig} */

const nextConfig = {
  /* config options here */
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    unoptimized: true,
    domains: ['picsum.photos', 'images.unsplash.com', 'lcckqvnwnrgvpnpavhyp.supabase.co'],
  },
  // Explicitly add environment variables
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  // Disable TypeScript type checking during build
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },

  // Disable eslint during build
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },

  // EXTREM FÖRENKLING: ta bort allt utom det nödvändigaste
  // Stäng av alla specialfunktioner som kan orsaka problem
  reactStrictMode: true,
  swcMinify: false,
  poweredByHeader: false,
  compress: true,

  // Configure dynamic routes and static exports
  experimental: {
    // Add any experimental features here if needed
  },

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
