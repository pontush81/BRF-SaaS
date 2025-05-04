import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getServerSideUser } from '@/supabase-server';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import ClientDashboard from '@/components/dashboard/ClientDashboard';

export const metadata: Metadata = {
  title: 'Dashboard - BRF Handbok',
  description: 'Din översikt över BRF-portalen',
};

// Ingen caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Dashboard() {
  try {
    // Hämta användarens session och information från server
    const cookieStore = cookies();
    const user = await getServerSideUser(cookieStore);
    
    console.log("[DASHBOARD] Session check:", { 
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email
    });
    
    // Omdirigera till login om användaren inte är inloggad
    if (!user || !user.email) {
      console.log("[DASHBOARD] Ingen användare hittades, omdirigerar till login");
      redirect('/login');
    }
    
    // Kontrollera om vi är i development mode och använder mock-användare
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isMockUser = isDevelopment && user.id.includes('mock');
    
    let dbUser = null;
    let defaultOrganization = null;
    
    if (!isMockUser) {
      // För icke-mock-användare: Hämta användarinformation från databasen
      dbUser = await prisma.user.findUnique({
        where: { email: user.email },
        include: {
          organizations: {
            include: {
              organization: true,
            },
            where: {
              isDefault: true,
            },
          },
        },
      });
      
      if (!dbUser) {
        console.log("[DASHBOARD] Användare hittades inte i databasen");
        
        if (isDevelopment) {
          // I utvecklingsmiljö skapar vi en testanvändare om den inte finns
          console.log("[DASHBOARD] Skapar testanvändare eftersom vi är i utvecklingsmiljö");
          try {
            // Skapa testanvändaren
            dbUser = await prisma.user.create({
              data: {
                id: user.id,
                email: user.email,
                name: 'Utvecklingsanvändare',
              },
            });
          } catch (dbError) {
            console.error("[DASHBOARD] Fel vid försök att skapa testanvändare:", dbError);
          }
        } else {
          // I produktionsmiljö, omdirigera till login
          redirect('/login');
        }
      } else {
        console.log("[DASHBOARD] Användare hittad:", {
          id: dbUser.id,
          name: dbUser.name,
          organizations: dbUser.organizations.length
        });
        
        // Hämta användarens standardorganisation
        defaultOrganization = dbUser.organizations[0]?.organization;
      }
    } else {
      console.log("[DASHBOARD] Använder mock-användare i utvecklingsläge");
      
      // För mock-användare i utvecklingsläge: Skapa en tillfällig struktur
      // med testdata istället för att söka i databasen
      try {
        // Försök hitta test-organisationen
        const testOrg = await prisma.organization.findFirst({
          where: { slug: 'test-brf' },
        });
        
        if (testOrg) {
          defaultOrganization = testOrg;
          console.log("[DASHBOARD] Hittade test-organisation:", testOrg.name);
        } else {
          // Om ingen test-organisation finns, skapa en
          defaultOrganization = {
            id: 'mock-org-id',
            name: 'Test BRF (Mock)',
            slug: 'test-brf-mock',
          };
          console.log("[DASHBOARD] Använder mock-organisation");
        }
        
        // Skapa en mock-användare
        dbUser = {
          id: user.id,
          name: 'Utvecklare (Mock)',
          email: user.email,
        };
      } catch (error) {
        console.error("[DASHBOARD] Fel vid hämtning av testorganisation:", error);
        defaultOrganization = {
          id: 'mock-org-id',
          name: 'Test BRF (Mock)',
          slug: 'test-brf-mock',
        };
        
        dbUser = {
          id: user.id,
          name: 'Utvecklare (Mock)',
          email: user.email,
        };
      }
    }
    
    // Om användaren inte har en organisation, visa förenklad vy
    if (!defaultOrganization) {
      console.log("[DASHBOARD] Ingen standardorganisation hittades");
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h1 className="text-2xl font-bold mb-4">Välkommen till BRF Handbok</h1>
            <p className="mb-4">Du är inloggad men inte kopplad till någon organisation.</p>
            <Link href="/create-organization" className="bg-blue-600 text-white px-4 py-2 rounded">
              Skapa organisation
            </Link>
          </div>
        </div>
      );
    }
    
    let bulletins = [];
    let documents = [];
    let activities = [];
    
    // Försök hämta data om vi inte använder mock-användare
    if (!isMockUser) {
      try {
        // Kontrollera om Bulletin-modellen finns
        const hasBulletinModel = !!prisma.bulletin;
        const hasActivityModel = !!prisma.activity;
        
        // Hämta meddelanden om modellen finns
        if (hasBulletinModel) {
          bulletins = await prisma.bulletin.findMany({
            where: { organizationId: defaultOrganization.id },
            orderBy: { createdAt: 'desc' },
            take: 5,
          }).catch(() => []);
        }
      
        // Hämta dokument
        documents = await prisma.document.findMany({
          where: { organizationId: defaultOrganization.id },
          orderBy: { updatedAt: 'desc' },
          take: 5,
        }).catch(() => []);
      
        // Hämta aktiviteter om modellen finns
        if (hasActivityModel) {
          activities = await prisma.activity.findMany({
            where: { organizationId: defaultOrganization.id },
            orderBy: { timestamp: 'desc' },
            take: 10,
          }).catch(() => []);
        }
      } catch (dataError) {
        console.error("[DASHBOARD] Fel vid hämtning av data:", dataError);
      }
    } else {
      // För mock-användare, skapa tillfällig mock-data
      bulletins = [
        { id: 'mock-1', title: 'Välkommen till dashboard', createdAt: new Date() },
        { id: 'mock-2', title: 'Mock-bulletin för utveckling', createdAt: new Date() }
      ];
      
      documents = [
        { id: 'doc-1', title: 'Testdokument 1', updatedAt: new Date() },
        { id: 'doc-2', title: 'Testdokument 2', updatedAt: new Date() }
      ];
    }
    
    // Visa dashboard
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Add client component for auth debugging */}
        <ClientDashboard />
        
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Välkommen {dbUser?.name || "medlem"}</h2>
            <p className="text-gray-600">
              Du är inloggad i {defaultOrganization.name}
              {isMockUser && <span className="text-amber-600 block mt-2">(Utvecklingsläge)</span>}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Statistik</h2>
            <p className="text-gray-600">
              Dokument: {documents.length}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Notifieringar</h2>
            <p className="text-gray-600">
              Du har inga nya notifieringar
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Meddelanden</h2>
            {bulletins.length > 0 ? (
              <ul className="divide-y">
                {bulletins.map((bulletin) => (
                  <li key={bulletin.id} className="py-2">
                    <p className="font-medium">{bulletin.title}</p>
                    <p className="text-sm text-gray-600">{new Date(bulletin.createdAt).toLocaleDateString()}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">Inga meddelanden att visa</p>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Dokument</h2>
            {documents.length > 0 ? (
              <ul className="divide-y">
                {documents.map((document) => (
                  <li key={document.id} className="py-2">
                    <Link href={`/documents/${document.id}`} className="text-blue-600 hover:underline">
                      {document.title}
                    </Link>
                    <p className="text-sm text-gray-600">{new Date(document.updatedAt).toLocaleDateString()}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">Inga dokument att visa</p>
            )}
          </div>
        </div>
        
        <div className="mt-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Aktiviteter</h2>
            {activities && activities.length > 0 ? (
              <ul className="divide-y">
                {activities.map((activity) => (
                  <li key={activity.id} className="py-2">
                    <p>{activity.description || 'Aktivitet'}</p>
                    <p className="text-sm text-gray-600">{new Date(activity.timestamp || Date.now()).toLocaleDateString()}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">Inga aktiviteter att visa</p>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("[DASHBOARD] Unexpected error:", error);
    
    // I utvecklingsläge, visa ett felmeddelande istället för att omdirigera
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h1 className="text-2xl font-bold mb-4 text-red-600">Utvecklingsfel</h1>
            <p className="mb-4">Ett fel uppstod i dashboard-sidan:</p>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {error instanceof Error ? error.message : 'Okänt fel'}
            </pre>
            <div className="mt-4">
              <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded">
                Tillbaka till inloggning
              </Link>
            </div>
          </div>
        </div>
      );
    }
    
    // I produktion, omdirigera till login med felmeddelande
    redirect('/login?error=unexpected');
  }
} 