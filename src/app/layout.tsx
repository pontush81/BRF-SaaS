import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { isDevelopment, isTest, isStaging, isProductionDatabase, logEnvironmentInfo } from "@/lib/env";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BRF-SaaS | Bostadsrättsföreningar som en tjänst',
  description: 'En SaaS-plattform för hantering av bostadsrättsföreningar',
  keywords: 'brf, bostadsrättsförening, saas, fastighetsförvaltning, multi-tenant',
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
