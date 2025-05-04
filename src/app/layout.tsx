import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { ToastProvider } from '@/components/ui/use-toast';
import { isDevelopment, isTest, isStaging, isProductionDatabase, logEnvironmentInfo } from "@/lib/env";
import Providers from './providers';
import { headers } from 'next/headers';

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

  // Lägg till global error handler för att logga fel
  if (typeof window !== 'undefined') {
    // Lägg till global error handler
    window.addEventListener('error', (event) => {
      try {
        fetch('/api/error-logger', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: window.location.href,
            error: event.error?.message || event.message,
            stack: event.error?.stack || 'No stack trace available',
          }),
        }).catch((e) => console.error('Failed to log error:', e));
      } catch (e) {
        console.error('Error in error handler:', e);
      }
    });

    // Fånga även unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      try {
        fetch('/api/error-logger', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: window.location.href,
            error: `Unhandled promise rejection: ${event.reason}`,
            stack: event.reason?.stack || 'No stack trace available',
          }),
        }).catch((e) => console.error('Failed to log error:', e));
      } catch (e) {
        console.error('Error in rejection handler:', e);
      }
    });
  }

  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return (
    <html lang="sv">
      <head>
        {/* Garantera favicon location */}
        <link rel="icon" href="/favicon.ico" />
        
        {/* Extremt tillåtande CSP för felsökning */}
        <meta httpEquiv="Content-Security-Policy" content="default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline'; font-src * data:;" />
      </head>
      <body className={inter.className}>
        {isDevelopment && (
          <div className="fixed top-0 left-0 w-full bg-yellow-400 text-black text-center z-50 py-1 text-sm font-bold">
            ⚠️ UTVECKLINGSMILJÖ - Mockad data kan användas ⚠️
          </div>
        )}
        <Providers>
          <div className={`${isDevelopment ? 'pt-8' : ''}`}>
            <Navigation />
            <main className="min-h-screen bg-gray-50">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
