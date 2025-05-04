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
    console.log("[DASHBOARD] Entering dashboard page");
    
    // Hämta användarens session och information från server
    const cookieStore = cookies();
    
    // Logga cookies för debugging
    try {
      const allCookies = cookieStore.getAll();
      console.log(`[DASHBOARD] Found ${allCookies.length} cookies`);
      for (const cookie of allCookies) {
        console.log(`[DASHBOARD] Cookie: ${cookie.name}`);
      }
    } catch (e) {
      console.error("[DASHBOARD] Error logging cookies:", e);
    }
    
    console.log("[DASHBOARD] Before getServerSideUser");
    const user = await getServerSideUser(cookieStore);
    console.log("[DASHBOARD] After getServerSideUser");
    
    console.log("[DASHBOARD] Session check:", { 
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email
    });
    
    // Omdirigera till login om användaren inte är inloggad
    if (!user || !user.email) {
      console.log("[DASHBOARD] Ingen användare hittades, omdirigerar till login");
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h1 className="text-2xl font-bold mb-4 text-red-600">Inte inloggad</h1>
            <p className="mb-4">Du behöver logga in för att visa denna sida.</p>
            <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded">
              Gå till inloggning
            </Link>
          </div>
        </div>
      );
    }
    
    // Förenklad dashboard för felsökning
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Add client component for auth debugging */}
        <ClientDashboard />
        
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
          <div className="bg-green-50 border border-green-200 p-4 rounded-md">
            <p className="text-green-800 font-medium">Du är inloggad! 🎉</p>
            <p className="mt-2">E-post: {user.email}</p>
            <p>Användar-ID: {user.id}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Snabblänkar</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/profile" className="text-blue-600 hover:underline">Min profil</Link>
              </li>
              <li>
                <Link href="/" className="text-blue-600 hover:underline">Hem</Link>
              </li>
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Tips</h2>
            <p className="text-gray-600">
              Detta är en förenklad dashboard för felsökning. När inloggningen fungerar kommer full funktionalitet att aktiveras.
            </p>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("[DASHBOARD] Unexpected error:", error);
    
    // Visa felmeddelande istället för att omdirigera
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Något gick fel</h1>
          <p className="mb-4">Ett fel uppstod i dashboard-sidan:</p>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {error instanceof Error ? error.message : 'Okänt fel'}
            {error instanceof Error && error.stack ? `\n${error.stack}` : ''}
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
} 