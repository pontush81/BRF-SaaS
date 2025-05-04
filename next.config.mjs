/** @type {import('next').NextConfig} */
const nextConfig = {
  // Hantera favicon.ico särskilt
  async redirects() {
    return [
      {
        source: '/favicon.ico',
        destination: '/api/favicon.ico',
        permanent: true,
      },
    ];
  },

  // Konfiguration för webbläsaroptimering
  reactStrictMode: true,
  
  // Förbättra för kända fel
  webpack: (config, { dev, isServer }) => {
    // Fix för next/headers i client components
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    
    return config;
  },
};

export default nextConfig; 