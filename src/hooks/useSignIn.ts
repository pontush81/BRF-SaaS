import { useState, useEffect } from 'react';
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

  // Kontrollera nätverksstatus när komponenten laddas
  useEffect(() => {
    checkNetworkStatus();
  }, []);

  /**
   * Huvudfunktion för inloggning
   */
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    // Logga miljöinformation
    console.log('Inloggningsförsök', {
      environment: process.env.NODE_ENV,
      deploymentEnv: process.env.NEXT_PUBLIC_DEPLOYMENT_ENV || 'not set',
      email: email.substring(0, 3) + '...',
      supabaseUrlConfig: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 10) + '...' || 'saknas',
      redirectTo: finalRedirectPath
    });

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
      document.cookie =
        'auth-status=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      document.cookie =
        'staging-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';

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

      // Bestäm cookie-domain baserat på miljö
      let domain = undefined;
      const isProduction = process.env.NODE_ENV === 'production';
      const isStaging = isProduction && process.env.NEXT_PUBLIC_DEPLOYMENT_ENV === 'staging';

      if (isProduction) {
        // För staging, använd auto-detekterad domän
        if (isStaging) {
          // Extrahera basdomänen från host
          const hostname = window.location.hostname;
          const hostParts = hostname.split('.');
          if (hostParts.length >= 2) {
            // För staging.handbok.org -> använd handbok.org
            domain = hostParts.slice(hostParts.length - 2).join('.');
          } else {
            domain = hostname;
          }
          console.log('Använde auto-detekterad domän för staging:', domain);
        } else {
          domain = process.env.NEXT_PUBLIC_APP_DOMAIN || undefined;
        }
        console.log('Använder cookie domain:', domain);
      }

      // Säkerhetsinställningar för cookies
      // I staging-miljö, sätt inte secure-flaggan om vi inte använder HTTPS
      const isSecure = isProduction &&
                       window.location.protocol === 'https:' &&
                       !isStaging;

      console.log('Cookie säkerhet:', {
        isProduction,
        isStaging,
        isSecure,
        domain,
        protocol: window.location.protocol,
        hostname: window.location.hostname
      });

      // Skapa gemensamma cookie-inställningar
      const cookieSettings = {
        path: '/',
        maxAge: 60 * 60 * 24,
        sameSite: 'Lax',
        secure: isSecure,
        domain: domain
      };

      // Sätt access token (1 dag livstid)
      document.cookie = `sb-access-token=${accessToken}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax${isSecure ? '; Secure' : ''}${domain ? `; Domain=${domain}` : ''}`;

      // Sätt refresh token (30 dagar livstid)
      document.cookie = `sb-refresh-token=${refreshToken}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax${isSecure ? '; Secure' : ''}${domain ? `; Domain=${domain}` : ''}`;

      // Sätt en särskild status-cookie som är läsbar av klientskript
      document.cookie = `auth-status=authenticated; path=/; max-age=${60 * 60 * 24}; SameSite=Lax${isSecure ? '; Secure' : ''}${domain ? `; Domain=${domain}` : ''}`;

      // Särskild flagga för staging-miljö
      if (isStaging) {
        document.cookie = `staging-auth=true; path=/; max-age=${60 * 60 * 24}; SameSite=Lax${isSecure ? '; Secure' : ''}${domain ? `; Domain=${domain}` : ''}`;
        console.log('Staging auth cookie satt');
      }

      // Sätt även i äldre format för kompatibilitet
      if (projectRef) {
        const sessionStr = JSON.stringify({
          access_token: accessToken,
          refresh_token: refreshToken,
          user: signInResult.data.user,
          expires_at: session.expires_at,
        });

        document.cookie = `sb-${projectRef}-auth-token=${encodeURIComponent(sessionStr)}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax${isSecure ? '; Secure' : ''}${domain ? `; Domain=${domain}` : ''}`;
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
        const sessionResponse = await fetch('/api/auth/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            accessToken,
            refreshToken,
          }),
        });

        if (!sessionResponse.ok) {
          console.error('Session sync error:', await sessionResponse.text());
        } else {
          const responseData = await sessionResponse.json();
          console.log('Session sync response:', responseData);
        }
      } catch (syncError) {
        console.error('Kunde inte synkronisera server session:', syncError);
      }

      // Kort fördröjning innan omdirigering för att säkerställa att cookies har sparats
      console.log(`Omdirigerar till ${finalRedirectPath} om 1 sekund...`);
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
        'Försöker alternativ inloggningsmetod via proxy...'
      );

      // Skicka autentiseringsförfrågan till vår API-proxy
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || 'Kunde inte autentisera via proxy'
        );
      }

      const data = await response.json();

      if (!data.session) {
        throw new Error('Ingen session returnerades från proxy-inloggning');
      }

      setUser(data.user);

      // Cookies sätts automatiskt av API:t
      console.log(
        'Inloggning via proxy lyckades, omdirigerar till dashboard...'
      );
      setTimeout(() => {
        window.location.href = finalRedirectPath;
      }, 1000);
    } catch (error) {
      console.error('Proxy-inloggningsfel:', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Ett fel uppstod vid proxy-inloggning'
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Kontrollerar nätverksstatus för Supabase
   */
  const checkNetworkStatus = async () => {
    try {
      setNetworkStatus(prev => ({ ...prev, checking: true }));

      const directCheck = await checkConnectivity(
        process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      );

      let proxyCheck = false;

      if (!directCheck) {
        proxyCheck = await checkSupabaseViaProxy();
      }

      setNetworkStatus({
        directSupabase: directCheck,
        proxySupabase: proxyCheck,
        checking: false,
        lastChecked: new Date(),
        error: !directCheck
          ? 'Problem med direkt anslutning till Supabase.'
          : null,
      });

      // Om det finns problem med direktanslutning, försök hämta diagnostik
      if (!directCheck) {
        try {
          const diagnostics = await getServerDiagnostics();
          console.log('Server diagnostik:', diagnostics);
        } catch (e) {
          console.error('Kunde inte hämta serverdiagnostik:', e);
        }
      }
    } catch (error) {
      console.error('Nätverksstatuskontroll misslyckades:', error);
      setNetworkStatus({
        directSupabase: false,
        proxySupabase: false,
        checking: false,
        lastChecked: new Date(),
        error: 'Kunde inte kontrollera nätverksstatus.',
      });
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
