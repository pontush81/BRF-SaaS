'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/supabase-client';
import { useRouter } from 'next/navigation';

export default function SignOutPage() {
  const [message, setMessage] = useState('Loggar ut...');
  const router = useRouter();

  useEffect(() => {
    async function logout() {
      try {
        // Skapa Supabase-klient
        const supabase = createBrowserClient();

        // Logga ut användaren
        await supabase.auth.signOut();

        // Rensa alla cookies relaterade till autentisering
        document.cookie =
          'supabase-dev-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

        // Radera alla localStorage-nycklar relaterade till Supabase
        try {
          localStorage.removeItem('sb-refresh-token');
          localStorage.removeItem('sb-access-token');
          localStorage.removeItem('supabase.auth.token');
        } catch (e) {
          console.error('Kunde inte rensa localStorage:', e);
        }

        // Sätt ett framgångsmeddelande
        setMessage('Du har loggats ut. Omdirigerar...');

        // Vänta och omdirigera till inloggningssidan
        setTimeout(() => {
          // Använd window.location.href för att säkerställa fullständig omladdning
          window.location.href = '/login';
        }, 1000);
      } catch (error) {
        console.error('Fel vid utloggning:', error);
        setMessage('Något gick fel vid utloggning. Försök igen.');
      }
    }

    logout();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="px-6 py-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Loggar ut</h2>

            <p className="text-gray-600 mb-4">{message}</p>

            <div className="mt-6">
              <button
                onClick={() => (window.location.href = '/login')}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Tillbaka till inloggning
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
