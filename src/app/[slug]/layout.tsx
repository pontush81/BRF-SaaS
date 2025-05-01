import React from 'react';
import { notFound } from 'next/navigation';
import { getOrganizationBySlugCached } from '@/lib/organizations';
import { AuthProvider } from '@/contexts/AuthContext';

interface OrganizationLayoutProps {
  children: React.ReactNode;
  params: {
    slug: string;
  };
}

// Metadata blir genererad dynamiskt baserat på organisationsnamnet
export async function generateMetadata({ params }: OrganizationLayoutProps) {
  const { slug } = params;
  const organization = await getOrganizationBySlugCached(slug);
  
  if (!organization) {
    return {
      title: 'Organisation hittades inte',
      description: 'Vi kunde inte hitta den angivna organisationen',
    };
  }
  
  return {
    title: `${organization.name} - Digital Handbok`,
    description: `Digital handbok för ${organization.name}`,
    keywords: `brf, bostadsrättsförening, handbok, ${organization.name}`,
  };
}

export default async function OrganizationLayout({ children, params }: OrganizationLayoutProps) {
  const { slug } = params;
  const organization = await getOrganizationBySlugCached(slug);
  
  // Om organisationen inte finns, visa 404
  if (!organization) {
    notFound();
  }
  
  return (
    <div className="organization-layout">
      {/* Placera organisationens information i en React context för att komma åt den i komponentträdet */}
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <h1 className="text-2xl font-semibold text-gray-900">{organization.name}</h1>
              {organization.handbook && (
                <p className="text-sm text-gray-600">{organization.handbook.description}</p>
              )}
            </div>
          </header>
          
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          
          <footer className="bg-white shadow-sm mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <p className="text-sm text-gray-600">
                © {new Date().getFullYear()} {organization.name} - Powered by BRF Handbok
              </p>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </div>
  );
} 