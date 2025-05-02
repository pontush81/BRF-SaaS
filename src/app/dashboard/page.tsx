import { Metadata } from 'next';
import { getCurrentUser, UserRole, hasRole } from '@/lib/auth/roleUtils';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Dashboard - BRF Handbok',
  description: 'Din personliga dashboard för BRF-handboken',
};

export default async function Dashboard() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Hämta information om organisationen om användaren är kopplad till en
  const organization = user.organization;

  // Om användaren är admin eller editor, visa relevanta länkar
  const isAdmin = hasRole(user, UserRole.ADMIN);
  const isEditor = hasRole(user, UserRole.EDITOR);

  // Hämta data beroende på tillhörighet
  let handbook = null;
  let documents = [];
  let properties = [];

  if (organization) {
    // Hämta data om organisationen
    [handbook, documents, properties] = await Promise.all([
      // Hämta handboksinformation
      prisma.handbook.findUnique({
        where: { organizationId: organization.id },
        include: {
          sections: {
            orderBy: { sortOrder: 'asc' },
            include: { 
              pages: { 
                orderBy: { sortOrder: 'asc' },
                take: 5 
              } 
            },
            take: 3
          }
        }
      }),
      // Hämta senaste dokumenten
      prisma.document.findMany({
        where: { organizationId: organization.id },
        orderBy: { updatedAt: 'desc' },
        take: 5
      }),
      // Hämta fastigheter
      prisma.property.findMany({
        where: { organizationId: organization.id },
        include: { units: { take: 3 } },
        take: 3
      })
    ]);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {organization ? (
        <>
          {/* Admin/Editor-länkar */}
          {(isAdmin || isEditor) && (
            <div className="mb-8 bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h2 className="text-lg font-medium text-blue-800 mb-3">
                Du är {isAdmin ? 'administratör' : 'redaktör'} för {organization.name}
              </h2>
              <div className="flex flex-wrap gap-3">
                {isAdmin && (
                  <Link href="/admin" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm">
                    Administrera BRF
                  </Link>
                )}
                {(isAdmin || isEditor) && (
                  <Link href="/editor" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm">
                    Redigera innehåll
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Handbok */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2">
              <div className="bg-white p-6 rounded-lg shadow-sm h-full">
                <h2 className="text-xl font-semibold mb-4">
                  {handbook?.title || `${organization.name} Handbok`}
                </h2>
                <p className="text-gray-600 mb-6">
                  {handbook?.description || 'Din BRFs digitala handbok med all viktig information samlad på ett ställe.'}
                </p>

                {handbook?.sections && handbook.sections.length > 0 ? (
                  <div className="space-y-4">
                    {handbook.sections.map((section) => (
                      <div key={section.id} className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 border-b">
                          <h3 className="font-medium">{section.title}</h3>
                        </div>
                        <ul className="divide-y">
                          {section.pages.map((page) => (
                            <li key={page.id} className="px-4 py-2 hover:bg-gray-50">
                              <Link href={`/handbook/${section.id}/${page.id}`} className="text-blue-600 hover:underline">
                                {page.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                        {section.pages.length === 0 && (
                          <p className="px-4 py-2 text-gray-500 italic text-sm">
                            Inga sidor i denna sektion
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Handboken har inte konfigurerats än.</p>
                    <Link href="/handbook" className="text-blue-600 hover:underline">
                      Utforska hela handboken
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {/* Senaste Dokument */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold mb-3">Senaste dokument</h2>
                {documents.length > 0 ? (
                  <ul className="divide-y">
                    {documents.map((doc) => (
                      <li key={doc.id} className="py-2">
                        <Link href={`/documents/${doc.id}`} className="text-blue-600 hover:underline block">
                          {doc.title}
                        </Link>
                        <p className="text-xs text-gray-500">
                          {new Date(doc.updatedAt).toLocaleDateString('sv-SE')} • {doc.category}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">Inga dokument tillgängliga</p>
                )}
                <div className="mt-3 pt-3 border-t">
                  <Link href="/documents" className="text-blue-600 hover:underline text-sm">
                    Visa alla dokument
                  </Link>
                </div>
              </div>

              {/* Snabblänkar */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold mb-3">Snabblänkar</h2>
                <ul className="space-y-2">
                  <li>
                    <Link href="/profile" className="text-blue-600 hover:underline">
                      Min profil
                    </Link>
                  </li>
                  <li>
                    <Link href="/handbook" className="text-blue-600 hover:underline">
                      Handbok
                    </Link>
                  </li>
                  <li>
                    <Link href="/documents" className="text-blue-600 hover:underline">
                      Dokument
                    </Link>
                  </li>
                  <li>
                    <Link href="/issues" className="text-blue-600 hover:underline">
                      Felanmälan
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </>
      ) : (
        // Användaren är inte kopplad till en organisation
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-100 mb-8">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">
            Du är inte ansluten till någon bostadsrättsförening
          </h2>
          <p className="text-yellow-700 mb-4">
            För att få åtkomst till din förenings handbok behöver du kopplas till rätt organisation.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/join-organization" className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm">
              Anslut till en förening
            </Link>
            <Link href="/register?type=admin" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm">
              Registrera en ny förening
            </Link>
          </div>
        </div>
      )}

      {/* Information nedan visas alltid */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Din profil</h2>
        <div className="mb-6">
          <p className="mb-1">
            <span className="font-medium">Namn:</span> {user.name || 'Ej angivet'}
          </p>
          <p className="mb-1">
            <span className="font-medium">E-post:</span> {user.email}
          </p>
          <p>
            <span className="font-medium">Roll:</span>{' '}
            {user.role === UserRole.ADMIN
              ? 'Administratör'
              : user.role === UserRole.EDITOR
              ? 'Redaktör'
              : 'Medlem'}
          </p>
        </div>
        <Link href="/profile" className="text-blue-600 hover:underline">
          Redigera profil
        </Link>
      </div>
    </div>
  );
} 