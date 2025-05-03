import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import SignUpForm from '@/components/auth/SignUpForm';
import { createServerClient } from '@/lib/supabase';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Registrera konto - BRF Handbok',
  description: 'Skapa ett nytt konto för att få tillgång till BRF-handboken',
};

// Definiera cachestrategin för denna sida
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Använd inga cachade värden

export default async function Register({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Kontrollera om användaren redan är inloggad
  try {
    const supabase = createServerClient();
    const { data } = await supabase.auth.getSession();

    if (data.session) {
      redirect('/dashboard');
    }
  } catch (error) {
    console.error('Error checking session:', error);
    // Fortsätt till registreringssidan även om vi inte kunde kontrollera sessionen
  }

  // Få registreringstyp från query-parametrar
  const registrationType = searchParams.type || 'admin'; // Ändrat default till admin
  const orgSlug = searchParams.org || '';
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-6 rounded-lg shadow-md">
        {registrationType === 'admin' ? (
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold">Registrera din förening</h1>
              <p className="mt-2 text-gray-600">
                Skapa ett administratörskonto för att köpa BRF-handboken till din förening
              </p>
            </div>
            <SignUpForm isAdmin={true} />
          </>
        ) : (
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold">Registrera som föreningsmedlem</h1>
              {orgSlug ? (
                <p className="mt-2 text-gray-600">
                  Skapa ett medlemskonto för föreningen <strong>{orgSlug}</strong>
                </p>
              ) : (
                <div className="mt-2 p-3 bg-yellow-50 text-yellow-700 rounded-md">
                  <p className="font-medium">Viktigt information</p>
                  <p className="text-sm mt-1">
                    Du bör registrera dig direkt på din förenings webbplats: 
                    <strong>dinförening.handbok.org</strong>
                  </p>
                  <p className="text-sm mt-1">
                    Be din styrelse om den korrekta webbadressen om du är osäker.
                  </p>
                  <p className="text-sm mt-2">
                    <Link href="/find-association" className="text-yellow-700 hover:underline font-medium">
                      Hitta din förenings webbplats här →
                    </Link>
                  </p>
                </div>
              )}
            </div>
            {registrationType === 'member' && !orgSlug && (
              <div className="mb-6 p-4 bg-yellow-50 text-yellow-700 rounded">
                <p className="font-medium">OBS! Du registrerar dig på huvudplattformen</p>
                <p className="text-sm mt-1">
                  Medlemmar bör registrera sig direkt på sin förenings webbplats, inte här på huvudplattformen.
                </p>
                <p className="text-sm mt-2">
                  <Link href="/find-association" className="text-blue-600 hover:text-blue-800 font-medium">
                    Hitta din förenings webbplats här →
                  </Link>
                </p>
              </div>
            )}
            <SignUpForm isAdmin={false} orgSlug={orgSlug as string} />
          </>
        )}
        
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          {registrationType === 'admin' ? (
            <p className="text-sm text-gray-600">
              Är du redan medlem i en förening som använder tjänsten?{' '}
              <Link href={orgSlug ? `https://${orgSlug}.handbok.org/login` : `/login`} className="text-blue-600 hover:underline">
                Logga in här
              </Link>
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Representerar du en bostadsrättsförening?{' '}
              <Link href="/register?type=admin" className="text-blue-600 hover:underline">
                Registrera din förening här
              </Link>
            </p>
          )}
        </div>
      </div>
      
      <div className="mt-8">
        <p className="text-center text-gray-500 text-sm">
          Har du redan ett konto?{' '}
          <Link href={orgSlug ? `https://${orgSlug}.handbok.org/login` : `/login`} className="text-blue-600 hover:underline">
            Logga in
          </Link>
        </p>
      </div>
    </div>
  );
} 