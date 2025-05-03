import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { isDevelopment, isTest, isStaging, isProductionDatabase, logEnvironmentInfo } from "@/lib/env";

// Ladda Inter-typsnittet utan att använda font/google för bättre kompatibilitet
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'BRF-SaaS | Bostadsrättsföreningar som en tjänst',
  description: 'En SaaS-plattform för hantering av bostadsrättsföreningar',
  keywords: 'brf, bostadsrättsförening, saas, fastighetsförvaltning, multi-tenant',
  icons: {
    icon: '/favicon.ico',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Logga miljöinformation vid uppstart på serversidan
  logEnvironmentInfo();

  return (
    <html lang="sv">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta httpEquiv="Content-Security-Policy" content="default-src * 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'self' 'unsafe-inline' 'unsafe-eval'; style-src * 'self' 'unsafe-inline'; img-src * data: blob: 'self'; font-src * data: 'self'; connect-src * 'self'; frame-src 'self';" />
      </head>
      <body className={inter.className}>
        {/* Visa varning i icke-produktionsmiljöer */}
        {(isDevelopment() || isTest() || isStaging()) && (
          <div className="bg-amber-500 text-black p-2 text-center text-sm font-medium">
            {isDevelopment() && "UTVECKLINGSMILJÖ"}
            {isTest() && "TESTMILJÖ"}
            {isStaging() && "STAGING-MILJÖ"} 
            {" - Ändringar i denna miljö påverkar inte produktionsdata"}
          </div>
        )}
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
