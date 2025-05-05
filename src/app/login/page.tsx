import SignInForm from '@/components/auth/SignInForm';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getServerSideUser } from '@/supabase-server';

export const metadata: Metadata = {
  title: 'Logga in | BRF Handbok',
  description: 'Logga in på ditt konto för att hantera din bostadsrättsförening',
};

// Använd inga cachade värden
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Visa miljövariablinformation för felsökning
  console.log('[Login] Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    DEPLOYMENT_ENV: process.env.DEPLOYMENT_ENV || 'not set',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    SUPABASE_URL_EXISTS: !!process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_URL_EXISTS: !!process.env.NEXT_PUBLIC_SUPABASE_URL
  });

  // Förbered en eventuell felsträng för visning
  let hasErrorParam = false;
  if (searchParams.error) {
    hasErrorParam = true;
    console.log('[Login] Error parameter found:', searchParams.error);
  }

  try {
    // Kontrollera om användaren redan är inloggad med getServerSideUser
    const cookieStore = cookies();

    // Logga cookies för debugging
    try {
      const allCookies = cookieStore.getAll();
      console.log("[Login] Available cookies:", allCookies.map(c => c.name));

      // Visa om vi har tokens
      const hasAccessToken = !!cookieStore.get('sb-access-token');
      const hasRefreshToken = !!cookieStore.get('sb-refresh-token');
      const hasStagingAuth = !!cookieStore.get('staging-auth');
      console.log("[Login] Auth tokens:", {
        hasAccessToken,
        hasRefreshToken,
        hasStagingAuth
      });
    } catch (cookieErr) {
      console.error('[Login] Error logging cookies:', cookieErr);
    }

    // Kontrollera om vi är i staging-miljö
    const isStaging = process.env.NODE_ENV === 'production' && process.env.DEPLOYMENT_ENV === 'staging';

    // Hämta användaren om det finns cookies
    let user = null;
    try {
      user = await getServerSideUser(cookieStore);

      // I staging-miljö, om vi har staging-auth cookie men ingen användare i sessionen
      // ska vi redirecta till dashboard ändå för att testa om den fungerar
      if (isStaging && !user && cookieStore.get('staging-auth') && !hasErrorParam) {
        console.log('[Login] Staging auth cookie found, redirecting to dashboard for testing');
        return redirect('/dashboard');
      }
    } catch (userErr) {
      console.error('[Login] Error getting server side user:', userErr);
    }

    console.log('[Login] Session check:', {
      hasUser: !!user,
      userId: user?.id ? `${user.id.substring(0, 8)}...` : null,
      email: user?.email ? `${user.email.substring(0, 3)}...` : null,
      hasErrorParam,
      isStaging
    });

    // Om det finns en felparameter eller om vi redan försöker logga in igen,
    // låt användaren försöka logga in på nytt även om vi har en session
    if (user && !hasErrorParam) {
      // Om användaren redan är inloggad, skicka till dashboard
      // eller till den sida som angetts i redirect-parametern
      console.log('[Login] User already logged in, redirecting to dashboard');

      // Hämta redirect URL om den finns
      const redirectTo = typeof searchParams.redirect === 'string'
        ? searchParams.redirect
        : '/dashboard';

      return redirect(redirectTo);
    }
  } catch (error) {
    console.error('[Login] Error checking session:', error);
    // Fortsätt till inloggningssidan även om vi inte kunde kontrollera sessionen
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="px-6 py-8">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
              Logga in till BRF Handbok
            </h2>

            <SignInForm />

            <div className="mt-8 text-center text-sm">
              <p className="text-gray-600">
                Har du inte ett konto? {' '}
                <a href="/register" className="text-blue-600 hover:underline">
                  Registrera dig
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} BRF Handbok - Alla rättigheter förbehållna</p>
      </div>

      {/* Visa miljöinformation i icke-produktionsmiljöer eller staging */}
      {process.env.NODE_ENV !== 'production' || process.env.DEPLOYMENT_ENV === 'staging' ? (
        <div className="mt-4 p-2 bg-yellow-100 rounded text-xs max-w-md">
          <p>Miljö: {process.env.NODE_ENV} / {process.env.DEPLOYMENT_ENV || 'default'}</p>
          {process.env.DEPLOYMENT_ENV === 'staging' && (
            <p className="font-bold">Staging-miljö - cookies kan ha annorlunda säkerhetsinställningar</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
