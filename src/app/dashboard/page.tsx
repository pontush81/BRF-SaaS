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
    console.log('Dashboard: Checking user authentication');

    // Get the user from the server-side
    const cookieStore = cookies();
    const user = await getServerSideUser(cookieStore);

    // If no user is found, redirect to login
    if (!user) {
      console.log('Dashboard: No user found, redirecting to login');
      return redirect('/login?error=auth-check-failed');
    }

    console.log('Dashboard: User authenticated:', {
      id: user.id,
      email: user.email,
    });

    // Check if the user is in an organization
    let organization = null;
    try {
      organization = await prisma.organization.findFirst({
        where: {
          users: {
            some: {
              userId: user.id,
            },
          },
        },
      });

      console.log(
        'Dashboard: Organization:',
        organization ? organization.name : 'None'
      );
    } catch (dbError) {
      console.error('Error finding organization:', dbError);
      // Continue without organization info - temporärt ändrat till alla miljöer
      // if (process.env.NODE_ENV !== 'development') {
      //   throw dbError;
      // }
    }

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">
          Välkommen till din dashboard
        </h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Din profil</h2>
          <div className="space-y-2">
            <p>
              <strong>Användar-ID:</strong> {user.id}
            </p>
            <p>
              <strong>E-post:</strong> {user.email}
            </p>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-2 bg-yellow-100 rounded text-sm">
                <p className="font-semibold">Development Mode</p>
                <p>User details are being mocked for development</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Din förening</h2>
          {organization ? (
            <div className="space-y-2">
              <p>
                <strong>Namn:</strong> {organization.name}
              </p>
              <p>
                <strong>Domän:</strong> {organization.domain || 'Inte angiven'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p>Du är inte ansluten till någon förening än.</p>
              <div className="flex gap-4">
                <Link
                  href="/create-organization"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Skapa en förening
                </Link>
                <Link
                  href="/join-organization"
                  className="inline-block px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Gå med i en förening
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Snabbåtkomst</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/settings/billing"
              className="p-4 border rounded hover:bg-gray-50 flex items-center gap-3"
            >
              <span className="text-xl">💰</span>
              <div>
                <h3 className="font-medium">Fakturering</h3>
                <p className="text-sm text-gray-600">
                  Hantera din prenumeration
                </p>
              </div>
            </Link>

            <Link
              href="/editor"
              className="p-4 border rounded hover:bg-gray-50 flex items-center gap-3"
            >
              <span className="text-xl">📝</span>
              <div>
                <h3 className="font-medium">Handboken</h3>
                <p className="text-sm text-gray-600">
                  Redigera föreningens handbok
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Dashboard error:', error);
    // In development, show the error details
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 text-red-600">Error</h1>
          <div className="bg-red-50 p-4 rounded border border-red-200">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
          <div className="mt-4">
            <Link href="/login" className="text-blue-600 hover:underline">
              Gå till inloggning
            </Link>
          </div>
        </div>
      );
    }

    // In production, redirect to login
    return redirect('/login?error=unexpected');
  }
}
