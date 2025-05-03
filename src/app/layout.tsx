import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { isDevelopment, isTest, isStaging, isProductionDatabase, logEnvironmentInfo } from "@/lib/env";

// Förenkla fontladdningen
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BRF-SaaS | Bostadsrättsföreningar som en tjänst',
  description: 'En SaaS-plattform för hantering av bostadsrättsföreningar',
  keywords: 'brf, bostadsrättsförening, saas, fastighetsförvaltning, multi-tenant',
  // Explicit favicon i metadata
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Ta bort loggning för förenkling
  // logEnvironmentInfo();

  return (
    <html lang="sv">
      <head>
        {/* Garantera favicon location */}
        <link rel="icon" href="/favicon.ico" />
        
        {/* Extremt tillåtande CSP för felsökning */}
        <meta httpEquiv="Content-Security-Policy" content="default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline'; font-src * data:;" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <Navigation />
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
