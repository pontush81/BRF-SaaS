import { notFound } from 'next/navigation';
import { getOrganizationBySlug } from '@/lib/organizations';
import { getHandbookByOrgId } from '@/lib/handbooks';
import Link from 'next/link';
import { Suspense } from 'react';
import { Metadata, ResolvingMetadata } from 'next';

// CSS-klasser för markdown-rendering
const markdownClasses = 'prose prose-slate max-w-none prose-headings:scroll-mt-28 prose-headings:font-semibold prose-a:font-semibold prose-a:underline prose-pre:bg-slate-900';

interface Page {
  id: string;
  title: string;
  content: string | null;
}

interface Section {
  id: string;
  title: string;
  pages: Page[];
}

interface SectionProps {
  title: string;
  pages: Page[];
}

// Komponent för en sektion i handboken
function HandbookSection({ title, pages }: SectionProps) {
  if (!pages || pages.length === 0) return null;
  
  return (
    <div className="mb-16">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="space-y-12">
        {pages.map((page) => (
          <div key={page.id} className="border-b pb-8 last:border-b-0">
            <h3 className="text-xl font-semibold mb-4">{page.title}</h3>
            <div
              className={markdownClasses}
              dangerouslySetInnerHTML={{ __html: page.content?.replace(/\n/g, '<br>') || '' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Ladda metadata för sidan
export async function generateMetadata(
  { params }: { params: { slug: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const organization = await getOrganizationBySlug(params.slug);
  
  if (!organization) {
    return {
      title: 'Förening hittades inte',
      description: 'Den begärda föreningen kunde inte hittas.'
    };
  }
  
  const handbook = await getHandbookByOrgId(organization.id);
  
  return {
    title: `${organization.name} | Bostadshandbok`,
    description: `Digital bostadshandbok för ${organization.name}`,
    openGraph: {
      title: `${organization.name} | Bostadshandbok`,
      description: `Digital bostadshandbok för ${organization.name}`,
      type: 'website',
    },
  };
}

// Huvudkomponent för handbokssidan
export default async function OrganizationHandbookPage({ params }: { params: { slug: string } }) {
  const organization = await getOrganizationBySlug(params.slug);
  
  if (!organization) {
    notFound();
  }
  
  const handbook = await getHandbookByOrgId(organization.id);
  
  if (!handbook) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Handbok saknas</h1>
        <p className="text-gray-600 mb-8">
          Ingen handbok har skapats för denna förening ännu.
        </p>
      </div>
    );
  }
  
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-12">
        <h1 className="text-3xl font-bold mb-2">{handbook.title}</h1>
        <p className="text-gray-600">
          Senast uppdaterad: {new Date(handbook.updatedAt).toLocaleDateString('sv-SE')}
        </p>
      </header>
      
      <Suspense fallback={<div>Laddar innehåll...</div>}>
        <div className="mb-16">
          {handbook.sections && handbook.sections.length > 0 ? (
            handbook.sections.map((section: Section) => (
              <HandbookSection 
                key={section.id}
                title={section.title}
                pages={section.pages}
              />
            ))
          ) : (
            <p className="text-gray-600 italic">
              Denna handbok har inga sektioner ännu.
            </p>
          )}
        </div>
      </Suspense>
      
      <footer className="mt-16 text-center border-t pt-8">
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} {organization.name}
        </p>
      </footer>
    </main>
  );
} 