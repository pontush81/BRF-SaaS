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

    // Kontrollera om vi är i staging miljö
    const isStaging = process.env.NODE_ENV === 'production' && process.env.DEPLOYMENT_ENV === 'staging';
    console.log('Dashboard: Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      DEPLOYMENT_ENV: process.env.DEPLOYMENT_ENV || 'not set',
      isStaging
    });

    // Get the user from the server-side
    const cookieStore = cookies();

    // Logga tillgängliga cookies för felsökning
    try {
      const allCookies = cookieStore.getAll();
      console.log('Dashboard: Available cookies:', allCookies.map(c => c.name));

      // Kontrollera om vi har särskilda cookies
      const hasAccessToken = !!cookieStore.get('sb-access-token');
      const hasRefreshToken = !!cookieStore.get('sb-refresh-token');
      const hasStagingAuth = !!cookieStore.get('staging-auth');
      const hasAuthStatus = !!cookieStore.get('auth-status');

      console.log('Dashboard: Auth tokens:', {
        hasAccessToken,
        hasRefreshToken,
        hasStagingAuth,
        hasAuthStatus
      });

      // För staging miljö, om vi har staging-auth cookie men ingen annan autentisering,
      // tillåt åtkomst till dashboard för testning
      if (isStaging && hasStagingAuth) {
        console.log('Dashboard: Using staging auth cookie for authentication');

        // Om vi inte har några tokens men har staging-auth, använd en mock-användare
        // Notera att vi redan är på dashboard, så vi behöver inte redirecta igen
        if (!hasAccessToken || !hasRefreshToken) {
          const mockUser = {
            id: 'staging-user-id',
            email: 'staging@example.com',
          };

          // Fortsätt med dashboard-rendering med mock-användare
          return (
            <div className="max-w-4xl mx-auto px-4 py-8">
              <div className="mb-6 p-4 bg-yellow-100 rounded-lg border border-yellow-300">
                <h2 className="text-lg font-semibold text-yellow-800">Staging-miljö</h2>
                <p className="text-sm text-yellow-700">
                  Du använder staging-miljön med en mock-användare.
                  Detta är endast för testning av gränssnittet.
                </p>
              </div>

              <h1 className="text-3xl font-bold mb-6">
                Välkommen till din dashboard (Staging)
              </h1>

              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Din profil (Staging Mock)</h2>
                <div className="space-y-2">
                  <p>
                    <strong>Användar-ID:</strong> {mockUser.id}
                  </p>
                  <p>
                    <strong>E-post:</strong> {mockUser.email}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Staging-test</h2>
                <p>
                  Denna sida visas eftersom du har en staging-auth cookie,
                  men ingen giltig Supabase-session.
                </p>
                <div className="mt-4">
                  <a href="/login" className="px-4 py-2 bg-blue-600 text-white rounded">
                    Gå tillbaka till inloggning
                  </a>
                </div>
              </div>
            </div>
          );
        }
      }
    } catch (error) {
      console.error('Dashboard: Error checking cookies:', error);
    }

    // Försök hämta användaren från servern
    let user = null;
    try {
      user = await getServerSideUser(cookieStore);
    } catch (authError) {
      console.error('Dashboard: Error getting server-side user:', authError);

      // Kontrollera om vi har staging-auth för att hantera staging-fall
      const hasStagingAuth = !!cookieStore.get('staging-auth');

      // I staging-miljön med staging-auth, visa mockad dashboard istället för att redirecta
      if (isStaging && hasStagingAuth) {
        console.log('Dashboard: Staging auth cookie found, showing mock dashboard');
        const mockUser = {
          id: 'staging-user-id',
          email: 'staging@example.com',
        };

        return (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-6 p-4 bg-yellow-100 rounded-lg border border-yellow-300">
              <h2 className="text-lg font-semibold text-yellow-800">Staging-miljö</h2>
              <p className="text-sm text-yellow-700">
                Du använder staging-miljön med en mock-användare.
                Detta är endast för testning av gränssnittet.
              </p>
            </div>

            <h1 className="text-3xl font-bold mb-6">
              Välkommen till din dashboard (Staging Mock)
            </h1>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Din profil (Staging Mock)</h2>
              <div className="space-y-2">
                <p>
                  <strong>Användar-ID:</strong> {mockUser.id}
                </p>
                <p>
                  <strong>E-post:</strong> {mockUser.email}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Staging-test</h2>
              <p>
                Denna sida visas trots autentiseringsfel eftersom du har en staging-auth cookie.
                Detta används för att testa gränssnittet i staging-miljön.
              </p>
              <div className="mt-4">
                <a href="/login" className="px-4 py-2 bg-blue-600 text-white rounded">
                  Gå tillbaka till inloggning
                </a>
              </div>
            </div>
          </div>
        );
      }

      // Om vi är i staging och det är ett autentiseringsfel, visa ett mer användbart felmeddelande
      if (isStaging) {
        return (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-red-100 p-4 rounded-lg border border-red-300 mb-6">
              <h2 className="text-lg font-semibold text-red-800">Staging Authentication Error</h2>
              <p className="text-sm text-red-700">
                Det uppstod ett problem med autentiseringen i staging-miljön.
                Detta kan bero på cookie-inställningar eller sessionshantering.
              </p>
              <pre className="mt-2 text-xs bg-red-50 p-2 rounded overflow-auto">
                {String(authError)}
              </pre>
            </div>
            <div className="mt-4">
              <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded">
                Försök logga in igen
              </Link>
            </div>
          </div>
        );
      }

      // I andra miljöer, redirecta till login
      return redirect('/login?error=auth-error');
    }

    // If no user is found, redirect to login
    // VIKTIGT: I staging-miljö med staging-auth har vi redan hanterat detta ovan
    if (!user) {
      // Kolla igen om vi har staging-auth för att undvika oändlig redirect-loop
      const hasStagingAuth = !!cookieStore.get('staging-auth');

      if (isStaging && hasStagingAuth) {
        console.log('Dashboard: No user but staging auth cookie found, showing mock dashboard');
        const mockUser = {
          id: 'staging-user-id',
          email: 'staging@example.com',
        };

        return (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-6 p-4 bg-yellow-100 rounded-lg border border-yellow-300">
              <h2 className="text-lg font-semibold text-yellow-800">Staging-miljö (Mock)</h2>
              <p className="text-sm text-yellow-700">
                Du använder staging-miljön med en mock-användare.
                Detta är endast för testning av gränssnittet.
              </p>
            </div>

            <h1 className="text-3xl font-bold mb-6">
              Välkommen till din dashboard (Staging Mock)
            </h1>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Din profil (Mock)</h2>
              <div className="space-y-2">
                <p>
                  <strong>Användar-ID:</strong> {mockUser.id}
                </p>
                <p>
                  <strong>E-post:</strong> {mockUser.email}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Staging-test</h2>
              <p>
                Denna sida visas eftersom du har en staging-auth cookie,
                men ingen giltig Supabase-session.
              </p>
              <div className="mt-4">
                <a href="/login" className="px-4 py-2 bg-blue-600 text-white rounded">
                  Gå tillbaka till inloggning
                </a>
              </div>
            </div>
          </div>
        );
      }

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
        {isStaging && (
          <div className="mb-6 p-4 bg-yellow-100 rounded-lg border border-yellow-300">
            <h2 className="text-lg font-semibold text-yellow-800">Staging-miljö</h2>
            <p className="text-sm text-yellow-700">
              Du använder den begränsade staging-miljön.
            </p>
          </div>
        )}

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

    // Kontrollera om vi är i staging-miljö
    const isStaging = process.env.NODE_ENV === 'production' && process.env.DEPLOYMENT_ENV === 'staging';
    if (isStaging) {
      return (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-100 p-4 rounded-lg border border-red-300 mb-6">
            <h2 className="text-lg font-semibold text-red-800">Staging Error</h2>
            <p className="text-sm text-red-700">
              Ett fel uppstod i staging-miljön. Detta kan hjälpa med felsökning:
            </p>
            <pre className="mt-2 text-xs bg-red-50 p-2 rounded overflow-auto">
              {String(error)}
            </pre>
          </div>
          <div className="mt-4">
            <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded">
              Försök logga in igen
            </Link>
          </div>
        </div>
      );
    }

    // In production, redirect to login
    return redirect('/login?error=unexpected');
  }
}
