'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@/supabase-client';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, Button } from '@mantine/core';
import { IconAlertCircle, IconBug } from '@tabler/icons-react';

// Hjälpfunktion för att testa nätverksanslutning
const checkConnectivity = async (url: string): Promise<boolean> => {
  try {
    console.log(`Testar anslutning till ${url}...`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      mode: 'no-cors', // För att kringgå CORS på enkel förfrågan
      cache: 'no-store' // Förhindra caching
    });
    
    clearTimeout(timeoutId);
    console.log(`Anslutningstest gav status: ${response.status}`);
    return true;
  } catch (error) {
    console.error(`Anslutningstest misslyckades:`, error);
    return false;
  }
};

/**
 * Kontrollerar Supabase-anslutningen via proxy.
 * Detta hjälper oss att diagnostisera nätverks- och DNS-relaterade problem.
 */
const checkSupabaseViaProxy = async (): Promise<{ 
  status: 'ok' | 'error' | 'timeout'; 
  reachable: boolean; 
  details?: string; 
  error?: string 
}> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // Längre timeout
    
    console.log("Checking Supabase connectivity via proxy...");
    
    const start = Date.now();
    const response = await fetch('/api/proxy/health?verbose=true', {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache, no-store'
      }
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - start;
    
    // Logga rårespons för debugging
    const responseText = await response.text();
    console.log(`Proxy health check raw response (${responseTime}ms):`, responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse proxy health response:", e);
      return { 
        status: 'error', 
        reachable: false, 
        error: `Parsing error: ${e instanceof Error ? e.message : String(e)}`,
        details: `Invalid JSON: ${responseText.substring(0, 100)}...` 
      };
    }
    
    if (data.reachable) {
      return { 
        status: 'ok', 
        reachable: true,
        details: `Connected in ${responseTime}ms`
      };
    } else {
      return { 
        status: 'error', 
        reachable: false, 
        error: data.error || 'Unknown proxy error',
        details: data.data ? JSON.stringify(data.data) : undefined
      };
    }
  } catch (error) {
    console.error("Proxy health check error:", error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return { status: 'timeout', reachable: false, error: 'Timeout checking proxy' };
    }
    
    return { 
      status: 'error', 
      reachable: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
};

/**
 * Hämtar server-diagnostik för att felsöka problem
 */
const getServerDiagnostics = async (): Promise<any> => {
  try {
    const response = await fetch('/api/proxy/debug', {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store'
      }
    });
    
    if (!response.ok) {
      return { error: `Server responded with status ${response.status}` };
    }
    
    return await response.json();
  } catch (error) {
    return { 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
};

export default function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [networkStatus, setNetworkStatus] = useState<{
    directSupabase: boolean;
    proxySupabase: boolean;
    checking: boolean;
    lastChecked: Date | null;
    error?: string;
    detailedError?: string;
  }>({
    directSupabase: true,
    proxySupabase: true,
    checking: false,
    lastChecked: null
  });
  const [debugMode, setDebugMode] = useState(false);
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null);

  const { setUser } = useAuth();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  // Hämta redirect-parametern från URL
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';
  
  // Kontrollera nätverksstatus
  useEffect(() => {
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
          detailedError: proxyStatus.details
        });
        
        if (!proxyStatus.reachable) {
          console.warn("Supabase is not reachable via proxy:", proxyStatus.error);
          
          // Om proxy-kontrollen misslyckas, hämta server-diagnostik
          const diagnostics = await getServerDiagnostics();
          setDiagnosticInfo(diagnostics);
        }
      } catch (error) {
        console.error("Error checking network status:", error);
        setNetworkStatus({
          directSupabase: false,
          proxySupabase: false,
          checking: false,
          lastChecked: new Date(),
          error: error instanceof Error ? error.message : "Unknown error checking network"
        });
      }
    };
    
    checkNetworkStatus();
  }, []);
  
  // Logga miljövariabler vid laddning
  useEffect(() => {
    // Visa Supabase-URL (men maskera den delvis av säkerhetsskäl)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    if (url) {
      console.log('Supabase URL:', url.substring(0, 20) + '...');
      
      try {
        const urlObject = new URL(url);
        console.log('URL-delar:', {
          protocol: urlObject.protocol,
          hostname: urlObject.hostname,
          projectRef: urlObject.hostname.split('.')[0]
        });
      } catch (e) {
        console.error('Kunde inte parsa URL:', e);
      }
    } else {
      console.error('NEXT_PUBLIC_SUPABASE_URL saknas');
    }
    
    console.log('Environment:', process.env.NODE_ENV);
    console.log('User Agent:', navigator.userAgent);
    console.log('Vercel URL:', process.env.NEXT_PUBLIC_VERCEL_URL || 'N/A');
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
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Kontrollera nätverksstatus först
      if (networkStatus.directSupabase === false && networkStatus.proxySupabase === false) {
        setErrorMessage('Anslutningsproblem till Supabase. Försöker med proxy-baserad inloggning...');
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
      document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      document.cookie = 'sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      document.cookie = 'sb-provider-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      
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
        console.log('Rensar äldre Supabase cookies med projektref:', projectRef);
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
          password
        });
      } catch (authError) {
        console.error('Fel vid anrop till Supabase Auth API:', authError);
        
        // Testa nätverksanslutningen igen om anropet misslyckades
        const urlTest = await checkConnectivity('https://www.google.com');
        if (!urlTest) {
          throw new Error('Nätverksanslutningen avbröts under inloggningen. Kontrollera din uppkoppling.');
        }
        
        // Om det finns en actual HTTP response i error, logga den
        if (authError instanceof Error && (authError as any).response) {
          console.error('HTTP Svarsdetaljer:', (authError as any).response);
        }
        
        throw new Error('Kunde inte ansluta till autentiseringsservern. Vänligen försök igen senare.');
      }
      
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
      if (process.env.NODE_ENV !== 'production') {
        console.log('Sätter development auth cookie');
        document.cookie = 'supabase-dev-auth=true; path=/; max-age=86400; SameSite=Lax';
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
      
      // Om vi får ett felmeddelande relaterat till autentisering eller nätverk, försök igen med proxy-baserad metod
      if (error.message && (error.message.includes('auth') || error.message.includes('fetch') || error.message.includes('network') || error.message.includes('unreachable'))) {
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
      setErrorMessage("Provar att logga in via proxy... detta kan ta lite tid.");
      
      // Först kontrollera om proxyn fungerar
      const proxyStatus = await checkSupabaseViaProxy();
      if (!proxyStatus.reachable) {
        throw new Error(`Kunde inte nå Supabase via proxy: ${proxyStatus.error || 'Okänt fel'}`);
      }
      
      // I development-läge kan vi använda en mock-inloggning
      if (process.env.NODE_ENV === 'development') {
        console.log("MOCK LOGIN via proxy in development mode");
        const mockUser = { 
          id: 'mock-user-id', 
          email: email,
          user_metadata: { name: 'Test User' }
        };
        
        // Simulera inloggning
        setUser(mockUser as any);
        
        // Lagra sessionsinformation i localStorage för att simulera session
        localStorage.setItem('supabase.auth.token', JSON.stringify({
          currentSession: {
            access_token: 'mock-token',
            user: mockUser
          }
        }));
        
        router.push('/dashboard');
        return;
      }
      
      // I produktion: gör en fetch-förfrågan till proxy-endpunkten
      // Använda 'auth/v1/token' istället för 'rest/v1/auth/token'
      console.log('Attempting proxy login via auth/v1/token endpoint');
      const response = await fetch('/api/proxy/auth/v1/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          grant_type: 'password'
        }),
        credentials: 'include'  // Viktigt för att hantera cookies
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
              errorMessage = errorData.error || errorData.message || errorMessage;
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
        const errorMessage = jsonError instanceof Error 
          // @ts-ignore - Accessing message on jsonError which might be unknown
          ? jsonError.message 
          : 'Okänt fel vid tolkning av serverns svar';
        throw new Error(`Kunde inte tolka serverns svar: ${errorMessage}`);
      }
      
      // Uppdatera session manuellt
      if (authData.user && authData.session) {
        setUser(authData.user);
        
        // Synkronisera med Supabase klient via localStorage
        localStorage.setItem('supabase.auth.token', JSON.stringify({
          currentSession: authData.session
        }));
        
        router.push('/dashboard');
      } else {
        throw new Error('Inloggning via proxy lyckades, men ingen användare returnerades');
      }
    } catch (error) {
      console.error("Proxy login error:", error);
      setErrorMessage(`Kunde inte logga in via proxy: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Funktion för att visa/dölja detaljerad felsökning
  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
    
    if (!debugMode && !diagnosticInfo) {
      // Hämta diagnostik första gången användaren aktiverar debug-läge
      getServerDiagnostics().then(data => setDiagnosticInfo(data));
    }
  };

  return (
    <div className="w-full mt-8">
      <form
        className="space-y-4"
        ref={formRef}
        onSubmit={handleSignIn}
        method="post"
      >
        <div className="text-xs text-center space-y-1">
          {process.env.NEXT_PUBLIC_SUPABASE_URL && (
            <div className={`${networkStatus.directSupabase ? 'text-gray-400' : 'text-red-400'}`}>
              Server: {process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 20) + '...'}
            </div>
          )}
          <div className={`${
            networkStatus.directSupabase ? 'text-green-500' : 
            networkStatus.checking ? 'text-gray-400' : 'text-red-500'
          }`}>
            {networkStatus.checking ? 'Kontrollerar anslutning...' : networkStatus.directSupabase ? 'Anslutning OK' : networkStatus.proxySupabase ? 'Anslutning OK (via proxy)' : 'Anslutningsproblem'}
          </div>
          
          {/* Debug-knapp */}
          <button 
            type="button" 
            onClick={toggleDebugMode} 
            className="text-xs text-blue-500 hover:underline focus:outline-none mt-2"
          >
            {debugMode ? 'Dölj diagnostik' : 'Visa diagnostik'}
          </button>
          
          {/* Detaljerad diagnostik i debug-läge */}
          {debugMode && (
            <div className="text-left bg-gray-50 p-2 mt-2 rounded text-xs overflow-auto max-h-60">
              <div className="font-semibold mb-1">Diagnostik:</div>
              
              {networkStatus.detailedError && (
                <div className="mb-2">
                  <div className="font-medium text-red-500">Fel:</div>
                  <pre className="whitespace-pre-wrap break-words text-xs">
                    {networkStatus.detailedError}
                  </pre>
                </div>
              )}
              
              {diagnosticInfo && (
                <div>
                  <div className="font-medium text-blue-500">Server info:</div>
                  <pre className="whitespace-pre-wrap break-words text-xs">
                    {JSON.stringify(diagnosticInfo, null, 2)}
                  </pre>
                </div>
              )}
              
              <div className="mt-2">
                <div className="font-medium">Cookies:</div>
                <pre className="whitespace-pre-wrap break-words text-xs">
                  {document.cookie.split(';').map(c => c.trim()).join('\n')}
                </pre>
              </div>
            </div>
          )}
        </div>
        
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

        {/* Visa nätverksstatus */}
        {(!networkStatus.directSupabase || !networkStatus.proxySupabase) && (
          <Alert
            color="yellow"
            title="Anslutningsproblem"
            icon={<IconAlertCircle size={16} />}
          >
            <div className="text-sm">
              {networkStatus.error && (
                <p className="font-medium">{networkStatus.error}</p>
              )}
              <p>
                Statusuppdatering: Supabase-servern är 
                {networkStatus.proxySupabase 
                  ? ' nåbar via proxy.' 
                  : ' inte nåbar. Detta kan orsaka inloggningsproblem.'}
              </p>
              <div className="mt-2 flex">
                <Button 
                  size="xs" 
                  variant="subtle"
                  onClick={() => setDebugMode(!debugMode)}
                  leftSection={<IconBug size={14} />}
                >
                  {debugMode ? "Dölj diagnostik" : "Visa diagnostik"}
                </Button>
              </div>
            </div>
          </Alert>
        )}
        
        {/* Felmeddelande */}
        {errorMessage && !networkStatus.checking && (
          <Alert
            color="red"
            title="Inloggning misslyckades"
            icon={<IconAlertCircle size={16} />}
          >
            {errorMessage}
          </Alert>
        )}

        <div>
          <button
            type="submit"
            disabled={isLoading || !networkStatus.directSupabase}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Loggar in...' : 'Logga in'}
          </button>
        </div>

        <div className="text-sm text-center">
          <Link href="/forgot-password" className="text-blue-600 hover:underline">
            Glömt lösenord?
          </Link>
        </div>
      </form>
    </div>
  );
} 