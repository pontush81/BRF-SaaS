'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@/supabase-client';

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [supabaseUrl, setSupabaseUrl] = useState<string>('');
  
  // Hämta redirect-parametern från URL
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectPath = searchParams.get('redirect') || '/dashboard';
  
  // Logga miljövariabler vid laddning
  useEffect(() => {
    // Visa Supabase-URL (men maskera den delvis av säkerhetsskäl)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    if (url) {
      setSupabaseUrl(url.substring(0, 20) + '...');
      console.log('Supabase URL:', url.substring(0, 20) + '...');
    } else {
      console.error('NEXT_PUBLIC_SUPABASE_URL saknas');
      setSupabaseUrl('SAKNAS!');
    }
    
    console.log('Environment:', process.env.NODE_ENV);
  }, []);
  
  // Check for error parameter in URL
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      if (error === 'unexpected') {
        setErrorMessage('Ett oväntat fel inträffade. Försök igen.');
      } else if (error === 'auth-check-failed') {
        setErrorMessage('Sessionsverifiering misslyckades. Logga in igen.');
      } else {
        setErrorMessage(`Inloggningsfel: ${error}`);
      }
    }
  }, [searchParams]);

  // Test för att se om det finns några Supabase-cookies redan vid laddning
  useEffect(() => {
    const checkCookies = () => {
      const allCookies = document.cookie.split(';').map(c => c.trim());
      const supabaseCookies = allCookies.filter(c => 
        c.startsWith('sb-') || c.includes('supabase')
      );
      
      console.log('Befintliga Supabase-cookies vid laddning:', supabaseCookies);
    };
    
    checkCookies();
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Använd den delade browser-klienten
      console.log('Skapar Supabase-klient för inloggning...');
      const supabase = createBrowserClient();
      
      console.log('Försöker logga in användare med e-post:', email);
      
      // Först, rensa eventuella befintliga sessioner för att undvika konflikt
      console.log('Rensar befintlig session innan inloggning');
      await supabase.auth.signOut();
      
      // Rensar också cookies manuellt för att säkerställa att gamla tokens tas bort
      document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      document.cookie = 'sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      document.cookie = 'sb-provider-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      
      // Rensa även cookies enligt äldre namnmönster
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const hostParts = supabaseUrl ? new URL(supabaseUrl).hostname.split('.') : [];
      const projectRef = hostParts.length > 0 ? hostParts[0] : null;
      
      if (projectRef) {
        console.log('Rensar äldre Supabase cookies med projektref:', projectRef);
        document.cookie = `sb-${projectRef}-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
      }
      
      // Försök logga in
      console.log('Anropar supabase.auth.signInWithPassword');
      const signInResult = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      // Lägg till loggning av resultatet
      console.log('Inloggningsresultat:', {
        success: !!signInResult.data.session,
        error: signInResult.error?.message,
        userId: signInResult.data.user?.id,
        sessionExpires: signInResult.data.session?.expires_at
      });
      
      if (signInResult.error) {
        throw new Error(signInResult.error.message);
      }

      if (!signInResult.data.session) {
        throw new Error('Ingen session skapades vid inloggning');
      }

      // För säkerhets skull, sätt Supabase-cookies manuellt
      const session = signInResult.data.session;
      const accessToken = session.access_token;
      const refreshToken = session.refresh_token;
      
      console.log('Sätter cookies manuellt...');
      
      // Sätt access token
      document.cookie = `sb-access-token=${accessToken}; path=/; max-age=${60*60*24}; SameSite=Lax`;
      
      // Sätt refresh token
      document.cookie = `sb-refresh-token=${refreshToken}; path=/; max-age=${60*60*24*30}; SameSite=Lax`;
      
      // Sätt även i äldre format för kompatibilitet
      if (projectRef) {
        const sessionStr = JSON.stringify({
          access_token: accessToken,
          refresh_token: refreshToken,
          user: signInResult.data.user,
          expires_at: session.expires_at
        });
        
        document.cookie = `sb-${projectRef}-auth-token=${encodeURIComponent(sessionStr)}; path=/; max-age=${60*60*24}; SameSite=Lax`;
      }
      
      // Om vi är i utvecklingsmiljö, sätt också server-auth-cookie
      if (process.env.NODE_ENV === 'development') {
        console.log('Sätter development auth cookie');
        document.cookie = 'supabase-dev-auth=true; path=/; max-age=86400; SameSite=Lax';
      }

      // Kontrollera att cookies faktiskt sattes
      console.log('Kontrollerar att cookies sattes:');
      const allCookies = document.cookie.split(';').map(c => c.trim());
      console.log('Cookies efter inloggning:', allCookies);

      setSuccessMessage('Inloggningen lyckades! Omdirigerar...');
      
      // Anropa session endpoint för att synkronisera server-side session
      try {
        console.log('Synkroniserar server-side session');
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            accessToken, 
            refreshToken 
          }),
        });
      } catch (syncError) {
        console.error('Kunde inte synkronisera server session:', syncError);
      }
      
      // Kort fördröjning innan omdirigering för att säkerställa att cookies har sparats
      setTimeout(() => {
        // Använd direkt omladdning istället för router för att säkerställa att alla cookies laddas
        window.location.href = redirectPath;
      }, 1000);
      
    } catch (error: any) {
      console.error('Inloggningsfel:', error);
      setErrorMessage(error.message || 'Ett fel uppstod vid inloggning');
      
      // Om vi får ett felmeddelande relaterat till autentisering, försök igen med en annan metod
      if (error.message && error.message.includes('auth')) {
        try {
          setErrorMessage('Provar alternativ inloggningsmetod...');
          
          const supabase = createBrowserClient();
          
          // Rensa befintlig session
          await supabase.auth.signOut();
          
          // Använd email/password login
          const { data, error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (loginError) throw loginError;
          
          if (data && data.session) {
            // Sätt cookies manuellt
            const session = data.session;
            document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${60*60*24}; SameSite=Lax`;
            document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=${60*60*24*30}; SameSite=Lax`;
            
            // Sätt cookie manuellt i utvecklingsmiljö
            if (process.env.NODE_ENV === 'development') {
              document.cookie = 'supabase-dev-auth=true; path=/; max-age=86400; SameSite=Lax';
            }
            
            setSuccessMessage('Inloggningen lyckades med alternativ metod! Omdirigerar...');
            
            // Använd direkt omladdning
            setTimeout(() => {
              window.location.href = redirectPath;
            }, 1000);
          }
        } catch (retryError) {
          console.error('Andra inloggningsförsöket misslyckades:', retryError);
          setErrorMessage('Båda inloggningsförsöken misslyckades. Kontrollera dina uppgifter och försök igen.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-6">
      {supabaseUrl && (
        <div className="text-xs text-gray-400 text-center">
          Ansluten till: {supabaseUrl}
        </div>
      )}
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          E-post
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="din@epost.se"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Lösenord
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Ditt lösenord"
        />
      </div>

      {errorMessage && (
        <div className="text-red-600 text-sm">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="text-green-600 text-sm">
          {successMessage}
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Loggar in...' : 'Logga in'}
        </button>
      </div>

      <div className="text-sm text-center">
        <Link href="/forgot-password" className="text-blue-600 hover:underline">
          Glömt lösenord?
        </Link>
      </div>
    </form>
  );
} 