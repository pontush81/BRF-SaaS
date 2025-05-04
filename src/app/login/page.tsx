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
  // Förbered en eventuell felsträng för visning
  let hasErrorParam = false;
  if (searchParams.error) {
    hasErrorParam = true;
    console.log('[Login] Error parameter found:', searchParams.error);
  }
  
  try {
    // Kontrollera om användaren redan är inloggad med getServerSideUser
    const cookieStore = cookies();
    const user = await getServerSideUser(cookieStore);
    
    // Logga cookies för debugging, men undvik att visa hela värdet
    try {
      const allCookies = cookieStore.getAll();
      const sanitizedCookies = allCookies.map(c => {
        // Visa bara början av värdet för säkerhet
        const valuePreview = c.value ? `${c.value.substring(0, 5)}...` : 'empty';
        return `${c.name}=${valuePreview}`;
      }).join(', ');
      console.log("[Login] Cookies:", sanitizedCookies);
    } catch (cookieErr) {
      console.error('[Login] Error logging cookies:', cookieErr);
    }
    
    console.log('[Login] Session check:', { 
      hasUser: !!user,
      userId: user?.id ? `${user.id.substring(0, 8)}...` : null,
      email: user?.email ? `${user.email.substring(0, 3)}...` : null,
      hasErrorParam
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
      
      redirect(redirectTo);
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
    </div>
  );
} 