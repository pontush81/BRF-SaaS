import SignInForm from '@/components/auth/SignInForm';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase';

export const metadata: Metadata = {
  title: 'Logga in | BRF-SaaS',
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
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">BRF-SaaS</h1>
        <p className="text-gray-600">
          Logga in för att hantera din bostadsrättsförening
        </p>
      </div>
      
      <SignInForm />
    </div>
  );
} 