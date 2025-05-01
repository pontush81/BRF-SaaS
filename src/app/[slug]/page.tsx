import Link from 'next/link';
import { getOrganizationBySlugCached } from '@/lib/organizations';
import { PrismaClient } from '@prisma/client';

// Instansiera Prisma-klienten
const prisma = new PrismaClient();

// Hämta sektioner och sidor för en handbok
async function getHandbookContent(handbookId: string) {
  try {
    const sections = await prisma.section.findMany({
      where: { handbookId },
      orderBy: { sortOrder: 'asc' },
      include: {
        pages: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });
    return sections;
  } catch (error) {
    console.error('Error fetching handbook content:', error);
    return [];
  }
}

interface OrganizationPageProps {
  params: {
    slug: string;
  };
}

export default async function OrganizationPage({ params }: OrganizationPageProps) {
  const { slug } = params;
  const organization = await getOrganizationBySlugCached(slug);
  
  // Hämta handboksinnehåll
  let sections = [];
  if (organization?.handbook) {
    sections = await getHandbookContent(organization.handbook.id);
  }
  
  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {organization?.handbook?.title || `${organization?.name} Handbok`}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {organization?.handbook?.description || 'Digital handbok för er bostadsrättsförening'}
        </p>
      </div>
      
      <div className="border-t border-gray-200">
        <div className="px-4 py-5 sm:p-6">
          {sections.length > 0 ? (
            <div className="space-y-8">
              {sections.map((section) => (
                <div key={section.id} className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">{section.title}</h3>
                  
                  {section.pages.length > 0 ? (
                    <ul className="space-y-2">
                      {section.pages.map((page) => (
                        <li key={page.id} className="bg-white shadow-sm rounded-md">
                          <Link href={`/${slug}/page/${page.id}`} className="block px-4 py-3 hover:bg-gray-50">
                            <div className="text-sm font-medium text-blue-600">{page.title}</div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Inga sidor tillagda ännu.</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Välkommen till er digitala handbok</h3>
              <p className="text-sm text-gray-600 mb-6">
                Handboken håller på att skapas. Snart kommer ni att kunna se allt innehåll här.
              </p>
              <p className="text-xs text-gray-500">
                Kontakta supporten om ni har några frågor.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 