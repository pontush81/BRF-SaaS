import { getOrganizationBySlug } from '@/lib/organizations';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';

// Generera metadata för sidan
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const organization = await getOrganizationBySlug(params.slug);
  
  if (!organization) {
    return {
      title: 'Hittades inte',
      description: 'Föreningen hittades inte',
    };
  }
  
  return {
    title: {
      default: organization.name,
      template: `%s | ${organization.name}`,
    },
    description: `Digital bostadshandbok för ${organization.name}`,
  };
}

export default async function OrganizationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const organization = await getOrganizationBySlug(params.slug);
  
  if (!organization) {
    notFound();
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              <Link href={`/${params.slug}`} className="hover:text-blue-600 transition">
                {organization.name}
              </Link>
            </h1>
            <p className="text-sm text-gray-500">Digital bostadshandbok</p>
          </div>
          
          {/* Lägg till meny här senare */}
        </div>
      </header>
      
      <main className="flex-grow bg-gray-50">
        {children}
      </main>
      
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">
                &copy; {new Date().getFullYear()} {organization.name}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Drivs av BRF-SaaS
              </p>
            </div>
            
            <div>
              <Link 
                href="/"
                className="text-sm text-gray-500 hover:text-blue-600 transition"
              >
                Hem
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 