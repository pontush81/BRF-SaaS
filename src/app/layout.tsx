import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';

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
  return (
    <html lang="sv">
      <body className={inter.className}>
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  );
}
