import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import SignUpForm from '@/components/auth/SignUpForm';
import { createServerClient } from '@/lib/supabase';

export const metadata: Metadata = {
  title: 'Registrera konto - BRF Handbok',
  description: 'Skapa ett nytt konto för att få tillgång till BRF-handboken',
};

export default async function Register({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Kontrollera om användaren redan är inloggad
  const supabase = createServerClient();
  const { data } = await supabase.auth.getSession();

  if (data.session) {
    redirect('/dashboard');
  }

  // Få registreringstyp från query-parametrar
  const registrationType = searchParams.type || 'member';
  const orgSlug = searchParams.org || '';
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-6 rounded-lg shadow-md">
        {registrationType === 'admin' ? (
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold">Registrera som BRF-admin</h1>
              <p className="mt-2 text-gray-600">
                Skapa ett konto för att köpa BRF-handboken till din förening
              </p>
            </div>
            <SignUpForm isAdmin={true} />
          </>
        ) : (
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold">Registrera som medlem</h1>
              <p className="mt-2 text-gray-600">
                Skapa ett konto för att ansluta till din BRFs handbok
              </p>
            </div>
            <SignUpForm isAdmin={false} orgSlug={orgSlug as string} />
          </>
        )}
        
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          {registrationType === 'admin' ? (
            <p className="text-sm text-gray-600">
              Är du boende i en BRF som redan använder tjänsten?{' '}
              <a href="/register?type=member" className="text-blue-600 hover:underline">
                Registrera som medlem istället
              </a>
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Representerar du en bostadsrättsförening?{' '}
              <a href="/register?type=admin" className="text-blue-600 hover:underline">
                Registrera som BRF-admin istället
              </a>
            </p>
          )}
        </div>
      </div>
      
      <div className="mt-8">
        <p className="text-center text-gray-500 text-sm">
          Har du redan ett konto?{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            Logga in
          </a>
        </p>
      </div>
    </div>
  );
} 