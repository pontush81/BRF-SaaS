import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@/supabase-client';
import {
  checkConnectivity,
  checkSupabaseViaProxy,
  getServerDiagnostics,
  NetworkStatus,
} from '@/utils/network-diagnostics';
import { useAuth } from '@/contexts/AuthContext';

export interface UseSignInProps {
  redirectPath?: string;
}

export interface UseSignInReturn {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  isLoading: boolean;
  errorMessage: string | null;
  networkStatus: NetworkStatus;
  handleSignIn: (e: React.FormEvent) => Promise<void>;
  attemptProxyBasedLogin: () => Promise<void>;
}

export function useSignIn({
  redirectPath,
}: UseSignInProps = {}): UseSignInReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    directSupabase: true,
    proxySupabase: true,
    checking: false,
    lastChecked: null,
  });

  const { setUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Hämta redirect-parametern från URL om ingen angetts
  const finalRedirectPath =
    redirectPath || searchParams.get('redirect') || '/dashboard';

  /**
   * Huvudfunktion för inloggning
   */
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Kontrollera nätverksstatus först
      if (
        networkStatus.directSupabase === false &&
        networkStatus.proxySupabase === false
      ) {
        setErrorMessage(
          'Anslutningsproblem till Supabase. Försöker med proxy-baserad inloggning...'
        );
        await attemptProxyBasedLogin();
        return;
      }

      if (networkStatus.directSupabase === false) {
        throw new Error('Ingen direkt anslutning till Supabase');
      }

      // Använd den delade browser-klienten
      console.log('Skapar Supabase-klient för inloggning...');
      const supabase = createBrowserClient();

      console.log('Försöker logga in användare med e-post:', email);

      // Först, rensa eventuella befintliga sessioner för att undvika konflikt
      console.log('Rensar befintlig session innan inloggning');
      await supabase.auth.signOut();

      // Rensar också cookies manuellt för att säkerställa att gamla tokens tas bort
      document.cookie =
        'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      document.cookie =
        'sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      document.cookie =
        'sb-provider-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';

      // Rensa även cookies enligt äldre namnmönster
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      let projectRef = null;

      try {
        if (supabaseUrl) {
          const urlObject = new URL(supabaseUrl);
          const hostParts = urlObject.hostname.split('.');
          projectRef = hostParts.length > 0 ? hostParts[0] : null;
        }
      } catch (e) {
        console.error('Fel vid parsning av Supabase URL:', e);
      }

      if (projectRef) {
        console.log(
          'Rensar äldre Supabase cookies med projektref:',
          projectRef
        );
        document.cookie = `sb-${projectRef}-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
      }

      // Logga vilket projekt vi försöker ansluta till
      console.log('Ansluter till Supabase projekt:', projectRef || 'Okänt');

      // Försök logga in med säkrare felhantering
      console.log('Anropar supabase.auth.signInWithPassword');
      let signInResult;

      try {
        signInResult = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      } catch (authError) {
        console.error('Fel vid anrop till Supabase Auth API:', authError);

        // Testa nätverksanslutningen igen om anropet misslyckades
        const urlTest = await checkConnectivity('https://www.google.com');
        if (!urlTest) {
          throw new Error(
            'Nätverksanslutningen avbröts under inloggningen. Kontrollera din uppkoppling.'
          );
        }

        // Om det finns en actual HTTP response i error, logga den
        if (authError instanceof Error && (authError as any).response) {
          console.error('HTTP Svarsdetaljer:', (authError as any).response);
        }

        throw new Error(
          'Kunde inte ansluta till autentiseringsservern. Vänligen försök igen senare.'
        );
      }

      // Lägg till loggning av resultatet
      console.log('Inloggningsresultat:', {
        success: !!signInResult.data.session,
        error: signInResult.error?.message,
        userId: signInResult.data.user?.id,
        sessionExpires: signInResult.data.session?.expires_at,
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
      document.cookie = `sb-access-token=${accessToken}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;

      // Sätt refresh token
      document.cookie = `sb-refresh-token=${refreshToken}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;

      // Sätt även i äldre format för kompatibilitet
      if (projectRef) {
        const sessionStr = JSON.stringify({
          access_token: accessToken,
          refresh_token: refreshToken,
          user: signInResult.data.user,
          expires_at: session.expires_at,
        });

        document.cookie = `sb-${projectRef}-auth-token=${encodeURIComponent(sessionStr)}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
      }

      // Om vi är i utvecklingsmiljö, sätt också server-auth-cookie
      if (process.env.NODE_ENV !== 'production') {
        console.log('Sätter development auth cookie');
        document.cookie =
          'supabase-dev-auth=true; path=/; max-age=86400; SameSite=Lax';
      }

      // Kontrollera att cookies faktiskt sattes
      console.log('Kontrollerar att cookies sattes:');
      const allCookies = document.cookie.split(';').map(c => c.trim());
      console.log('Cookies efter inloggning:', allCookies);

      setUser(signInResult.data.user);

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
            refreshToken,
          }),
        });
      } catch (syncError) {
        console.error('Kunde inte synkronisera server session:', syncError);
      }

      // Kort fördröjning innan omdirigering för att säkerställa att cookies har sparats
      setTimeout(() => {
        // Använd direkt omladdning istället för router för att säkerställa att alla cookies laddas
        window.location.href = finalRedirectPath;
      }, 1000);
    } catch (error: any) {
      console.error('Inloggningsfel:', error);
      setErrorMessage(error.message || 'Ett fel uppstod vid inloggning');

      // Om vi får ett felmeddelande relaterat till autentisering eller nätverk, försök igen med proxy-baserad metod
      if (
        error.message &&
        (error.message.includes('auth') ||
          error.message.includes('fetch') ||
          error.message.includes('network') ||
          error.message.includes('unreachable'))
      ) {
        await attemptProxyBasedLogin();
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Försöker logga in via proxy när normal inloggning misslyckas med DNS-fel
   */
  const attemptProxyBasedLogin = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(
        'Provar att logga in via proxy... detta kan ta lite tid.'
      );

      // Först kontrollera om proxyn fungerar
      const proxyStatus = await checkSupabaseViaProxy();
      if (!proxyStatus.reachable) {
        throw new Error(
          `Kunde inte nå Supabase via proxy: ${proxyStatus.error || 'Okänt fel'}`
        );
      }

      // I development-läge kan vi använda en mock-inloggning
      if (process.env.NODE_ENV === 'development') {
        console.log('MOCK LOGIN via proxy in development mode');
        const mockUser = {
          id: 'mock-user-id',
          email: email,
          user_metadata: { name: 'Test User' },
        };

        // Simulera inloggning
        setUser(mockUser as any);

        // Lagra sessionsinformation i localStorage för att simulera session
        localStorage.setItem(
          'supabase.auth.token',
          JSON.stringify({
            currentSession: {
              access_token: 'mock-token',
              user: mockUser,
            },
          })
        );

        router.push('/dashboard');
        return;
      }

      // I produktion: gör en fetch-förfrågan till proxy-endpunkten
      // Använda 'auth/v1/token' istället för 'rest/v1/auth/token'
      console.log('Attempting proxy login via auth/v1/token endpoint');
      const response = await fetch('/api/proxy/auth/v1/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          grant_type: 'password',
        }),
        credentials: 'include', // Viktigt för att hantera cookies
      });

      console.log('Proxy login response status:', response.status);

      // Förbättrad felhantering för att undvika JSON-parser fel
      if (!response.ok) {
        let errorMessage = `Server responded with status ${response.status}`;

        try {
          // Försök parse:a JSON om det finns
          const responseText = await response.text();
          if (responseText && responseText.trim()) {
            try {
              const errorData = JSON.parse(responseText);
              errorMessage =
                errorData.error || errorData.message || errorMessage;
            } catch (e) {
              // Om vi inte kan parse:a JSON, använd texten direkt
              errorMessage = responseText.substring(0, 100); // Begränsa längden
            }
          }
        } catch (e) {
          console.error('Error reading response:', e);
        }

        throw new Error(errorMessage);
      }

      // Säker JSON parsning
      let authData;
      try {
        const responseText = await response.text();
        authData = responseText ? JSON.parse(responseText) : null;

        if (!authData) {
          throw new Error('Tomt svar från servern');
        }
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        // @ts-ignore - Safely handle jsonError which could be unknown
        const errorMessage =
          jsonError instanceof Error
            ? // @ts-ignore - Accessing message on jsonError which might be unknown
              jsonError.message
            : 'Okänt fel vid tolkning av serverns svar';
        throw new Error(`Kunde inte tolka serverns svar: ${errorMessage}`);
      }

      // Uppdatera session manuellt
      if (authData.user && authData.session) {
        setUser(authData.user);

        // Synkronisera med Supabase klient via localStorage
        localStorage.setItem(
          'supabase.auth.token',
          JSON.stringify({
            currentSession: authData.session,
          })
        );

        router.push(finalRedirectPath);
      } else {
        throw new Error(
          'Inloggning via proxy lyckades, men ingen användare returnerades'
        );
      }
    } catch (error) {
      console.error('Proxy login error:', error);
      setErrorMessage(
        `Kunde inte logga in via proxy: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Kontrollerar nätverksstatus och uppdaterar state
   */
  const checkNetworkStatus = async () => {
    setNetworkStatus(prev => ({ ...prev, checking: true }));

    try {
      // Kontrollera anslutning via proxy
      const proxyStatus = await checkSupabaseViaProxy();

      setNetworkStatus({
        directSupabase: true, // Vi antar direkt anslutning är ok tills vi vet annat
        proxySupabase: proxyStatus.reachable,
        checking: false,
        lastChecked: new Date(),
        error: proxyStatus.error,
        detailedError: proxyStatus.details,
      });

      return proxyStatus;
    } catch (error) {
      console.error('Error checking network status:', error);
      setNetworkStatus({
        directSupabase: false,
        proxySupabase: false,
        checking: false,
        lastChecked: new Date(),
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error checking network',
      });

      return {
        status: 'error' as const,
        reachable: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    errorMessage,
    networkStatus,
    handleSignIn,
    attemptProxyBasedLogin,
  };
}
