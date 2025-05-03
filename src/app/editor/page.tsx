import { Metadata } from 'next'
import { getCurrentUserServer, UserRole, hasRole } from '@/lib/auth/roleUtils'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import Link from 'next/link'

// Definiera typer för section och page för att åtgärda TypeScript-fel
interface Page {
  id: string;
  title: string;
  sortOrder: number;
}

interface Section {
  id: string;
  title: string;
  sortOrder: number;
  pages: Page[];
}

export const metadata: Metadata = {
  title: 'Redaktör Dashboard - BRF Handbok',
  description: 'Redigera innehåll i din BRF-handbok',
}

export default async function EditorDashboard() {
  const user = await getCurrentUserServer()
  
  // Säkerhetskontroll (yttre lager, middleware är första försvarslinjen)
  if (!user || (!hasRole(user, UserRole.ADMIN) && !hasRole(user, UserRole.EDITOR))) {
    redirect('/dashboard')
  }
  
  // Hämta relevant data
  const organization = user.organization
  
  if (!organization) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Redaktör Dashboard</h1>
        <div className="bg-yellow-50 p-4 border border-yellow-300 rounded mb-6">
          <p className="text-yellow-800">
            Du behöver vara kopplad till en organisation för att redigera innehåll.
          </p>
        </div>
      </div>
    )
  }
  
  // Hämta data
  const handbook = await prisma.handbook.findUnique({
    where: { organizationId: organization.id },
    include: {
      sections: {
        include: {
          pages: true
        },
        orderBy: {
          sortOrder: 'asc'
        }
      }
    }
  })
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Redaktör Dashboard</h1>
      
      {/* Handbook Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{handbook?.title || 'BRF Handbok'}</h2>
          <Link href="/editor/handbook/settings" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
            Redigera inställningar
          </Link>
        </div>
        <p className="text-gray-600 mb-4">{handbook?.description || 'Ingen beskrivning'}</p>
        
        {/* Sektioner och sidor */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">Sektioner och sidor</h3>
            <Link href="/editor/handbook/section/new" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              + Lägg till sektion
            </Link>
          </div>
          
          {handbook?.sections && handbook.sections.length > 0 ? (
            <div className="space-y-4">
              {handbook.sections.map((section: Section) => (
                <div key={section.id} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                    <h4 className="font-medium">{section.title}</h4>
                    <div className="flex space-x-2">
                      <Link href={`/editor/handbook/section/${section.id}`} className="text-blue-600 hover:text-blue-800 text-sm">
                        Redigera
                      </Link>
                      <Link href={`/editor/handbook/section/${section.id}/page/new`} className="text-green-600 hover:text-green-800 text-sm">
                        + Sida
                      </Link>
                    </div>
                  </div>
                  
                  {section.pages && section.pages.length > 0 ? (
                    <ul className="divide-y">
                      {section.pages.map((page: Page) => (
                        <li key={page.id} className="px-4 py-3 flex justify-between items-center hover:bg-gray-50">
                          <span>{page.title}</span>
                          <Link href={`/editor/handbook/section/${section.id}/page/${page.id}`} className="text-blue-600 hover:text-blue-800 text-sm">
                            Redigera
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-3 text-gray-500 text-sm italic">
                      Inga sidor har lagts till i denna sektion
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded text-center">
              <p className="text-gray-600 mb-3">Din handbok har inga sektioner ännu</p>
              <Link href="/editor/handbook/section/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                Skapa din första sektion
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Quick Links */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Snabblänkar</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Gå till dashboard
          </Link>
          <Link href={`https://${organization.slug}.handbok.org`} className="text-blue-600 hover:underline">
            Visa offentlig portal
          </Link>
          <Link href="/editor/documents" className="text-blue-600 hover:underline">
            Hantera dokument
          </Link>
        </div>
      </div>
    </div>
  )
} 