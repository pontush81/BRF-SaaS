import SignInForm from '@/components/auth/SignInForm';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Logga in | BRF Handbok',
  description: 'Logga in på ditt konto för att hantera din bostadsrättsförening',
};

// Definiera cachestrategin för denna sida
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Använd inga cachade värden

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Kontrollera om användaren redan är inloggad
  try {
    const supabase = createServerClient();
    const { data } = await supabase.auth.getSession();

    if (data.session) {
      // Om användaren redan är inloggad, skicka till dashboard
      redirect('/dashboard');
    }
  } catch (error) {
    console.error('Error checking session:', error);
    // Fortsätt till inloggningssidan även om vi inte kunde kontrollera sessionen
  }

  // Hämta redirect URL om den finns
  const redirectTo = searchParams.redirect || '/dashboard';
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Logga in på BRF Handbok</h1>
          <p className="text-gray-600">
            För administratörer av föreningar
          </p>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-1">Är du medlem i en förening?</p>
          <div className="flex justify-center gap-4 mt-2">
            <p className="text-gray-600">
              Du bör logga in direkt på din förenings webbadress 
              <br />
              <span className="font-mono text-sm">(dinförening.handbok.se)</span>
            </p>
          </div>
          <div className="mt-4">
            <Link href="/find-association" className="text-blue-600 hover:text-blue-800 font-medium">
              Hitta din förening →
            </Link>
          </div>
        </div>
        
        <SignInForm />
        
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Representerar du en bostadsrättsförening? {' '}
            <Link href="/register?type=admin" className="text-blue-600 hover:underline">
              Registrera din förening här
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 