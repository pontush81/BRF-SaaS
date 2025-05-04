'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@/supabase-client';

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

// Mer robust hjälpfunktion för att testa Supabase-anslutning via proxy
const checkSupabaseViaProxy = async (): Promise<{reachable: boolean, error?: string, details?: any}> => {
  try {
    console.log(`Testar Supabase-anslutning via proxy...`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // Öka timeout till 8 sekunder
    
    // Anropa vår health-endpoint med detaljerade fel
    const response = await fetch('/api/supabase-proxy/health?verbose=true', {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache, no-store',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Debug': 'true'
      }
    });
    
    clearTimeout(timeoutId);
    
    // Logga råsvaret för debugging
    const responseText = await response.text();
    console.log(`Proxy health check raw response (${responseText.length} chars):`, 
      responseText.length > 200 ? responseText.substring(0, 200) + '...' : responseText);
    
    // Försök parsa JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error(`Kunde inte parsa proxy-svar som JSON:`, e);
      return { 
        reachable: false, 
        error: `Invalid response: ${responseText.substring(0, 100)}`, 
        details: { parseError: e instanceof Error ? e.message : String(e) }
      };
    }
    
    if (!response.ok) {
      console.error(`Proxy health check gav felstatus: ${response.status}`, data);
      return { 
        reachable: false, 
        error: `Proxy error: ${response.status}`, 
        details: data 
      };
    }
    
    console.log(`Proxy health check resultat:`, data);
    
    // Kontrollera om Supabase är nåbar via proxy
    if (data.supabase && data.supabase.reachable === true) {
      console.log(`Supabase är nåbar via proxy`);
      return { reachable: true, details: data };
    } else {
      // Extrahera mer detaljerad felinformation
      const errorMessage = data.supabase?.error || 'Okänt fel';
      const statusCode = data.supabase?.status || 'okänd status';
      
      console.error(`Supabase är inte nåbar via proxy: ${errorMessage} (Status: ${statusCode})`, data.supabase);
      
      return { 
        reachable: false, 
        error: `${errorMessage} (Status: ${statusCode})`, 
        details: data.supabase 
      };
    }
  } catch (error) {
    console.error(`Proxy-anslutningstest misslyckades:`, error);
    
    // Mer detaljerad debugging av nätverksfel
    let errorDetails = {};
    if (error instanceof Error) {
      errorDetails = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        // För fetch-relaterade fel
        cause: error.cause ? String(error.cause) : undefined
      };
      
      // Specialhantering för timeout
      if (error.name === 'AbortError') {
        return { 
          reachable: false, 
          error: 'Timeout vid anslutning till proxy (8s)', 
          details: errorDetails
        };
      }
    }
    
    return { 
      reachable: false, 
      error: error instanceof Error ? error.message : 'Okänt fel',
      details: errorDetails
    };
  }
};

// Hjälpfunktion för att hämta detaljerad serverdiagnostik
const getServerDiagnostics = async (): Promise<any> => {
  try {
    console.log('Hämtar server-diagnostik...');
    
    const response = await fetch('/api/supabase-proxy/debug', {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store'
      }
    });
    
    if (!response.ok) {
      console.error(`Server-diagnostik misslyckades: ${response.status}`);
      return { error: `Status ${response.status}` };
    }
    
    const data = await response.json();
    console.log('Server-diagnostik:', data);
    return data;
  } catch (error) {
    console.error('Server-diagnostik fel:', error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
};

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [detailedError, setDetailedError] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [supabaseUrl, setSupabaseUrl] = useState<string>('');
  const [networkStatus, setNetworkStatus] = useState<string>('checking');
  const [proxyStatus, setProxyStatus] = useState<string>('unknown');
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null);
  
  // Hämta redirect-parametern från URL
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectPath = searchParams.get('redirect') || '/dashboard';
  
  // Kontrollera nätverksanslutning
  useEffect(() => {
    const checkNetwork = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        
        if (!url) {
          setNetworkStatus('error');
          return;
        }
        
        // Kontrollera först en allmän anslutning
        const canReachGoogle = await checkConnectivity('https://www.google.com');
        
        if (!canReachGoogle) {
          setNetworkStatus('no-internet');
          return;
        }

        // I produktionsmiljö, kontrollera via proxy
        if (process.env.NODE_ENV === 'production') {
          const proxyCheck = await checkSupabaseViaProxy();
          if (proxyCheck.reachable) {
            setNetworkStatus('online');
            setProxyStatus('working');
          } else {
            setNetworkStatus('proxy-error');
            setProxyStatus('failed');
            console.error('Proxy error:', proxyCheck.error);
            
            // Spara detaljerad felinformation för debugging
            setDetailedError(proxyCheck.details);
            
            // Hämta ytterligare diagnostik om proxy-fel
            try {
              const diagnostics = await getServerDiagnostics();
              setDiagnosticInfo(diagnostics);
            } catch (e) {
              console.error('Kunde inte hämta serverdiagnostik:', e);
            }
          }
          return;
        }
        
        // I utveckling, testa direkt Supabase-anslutning också
        try {
          const baseUrl = new URL(url);
          // Försök först via proxy (även i utveckling)
          const proxyCheck = await checkSupabaseViaProxy();
          if (proxyCheck.reachable) {
            setNetworkStatus('online');
            setProxyStatus('working');
            return;
          }
          
          // Om proxy-kontroll misslyckades, spara detaljer
          setDetailedError(proxyCheck.details);
          
          // Fallback till direkt anslutning i utveckling
          const isReachable = await checkConnectivity(`${baseUrl.origin}`);
          setNetworkStatus(isReachable ? 'online' : 'unreachable');
          setProxyStatus('not-used');
        } catch (e) {
          console.error('Ogiltigt Supabase URL-format:', url);
          setNetworkStatus('invalid-url');
        }
      } catch (e) {
        console.error('Anslutningskontroll misslyckades:', e);
        setNetworkStatus('error');
      }
    };
    
    checkNetwork();
  }, []);
  
  // Logga miljövariabler vid laddning
  useEffect(() => {
    // Visa Supabase-URL (men maskera den delvis av säkerhetsskäl)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    if (url) {
      setSupabaseUrl(url.substring(0, 20) + '...');
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
      setSupabaseUrl('SAKNAS!');
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
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Kontrollera nätverksstatus först
      if (networkStatus !== 'online' && networkStatus !== 'checking') {
        // Specialhantering för Supabase-anslutningsfel
        if (networkStatus === 'unreachable' || networkStatus === 'proxy-error') {
          setErrorMessage('Anslutningsproblem till Supabase. Försöker med proxy-baserad inloggning...');
          await attemptProxyBasedLogin();
          return;
        }
        
        if (networkStatus === 'no-internet') {
          throw new Error('Ingen internetanslutning. Kontrollera din uppkoppling.');
        } else if (networkStatus === 'invalid-url') {
          throw new Error('Ogiltig Supabase-URL konfiguration.');
        }
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
      
      // Om vi får ett felmeddelande relaterat till autentisering eller nätverk, försök igen med proxy-baserad metod
      if (error.message && (error.message.includes('auth') || error.message.includes('fetch') || error.message.includes('network') || error.message.includes('unreachable'))) {
        await attemptProxyBasedLogin();
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Hjälpfunktion för att försöka logga in via proxyn när normal inloggning misslyckas
  const attemptProxyBasedLogin = async () => {
    try {
      setLoading(true);
      setErrorMessage('Försöker proxy-baserad inloggning...');
      setDetailedError(null);
      
      console.log('Utför proxy health check före inloggningsförsök...');
      
      // Kontrollera att proxy-hälsokontrollen fungerar
      const proxyHealth = await checkSupabaseViaProxy();
      console.log('Proxy health check resultat:', proxyHealth);
      
      if (!proxyHealth.reachable) {
        // Spara detaljerad felinformation
        setDetailedError(proxyHealth.details);
        
        // Hämta mer server-diagnostik för felsökning
        try {
          console.log('Hämtar server-diagnostik vid fel...');
          const diagnostics = await getServerDiagnostics();
          setDiagnosticInfo(diagnostics);
          console.log('Server-diagnostik:', diagnostics);
        } catch (diagError) {
          console.error('Kunde inte hämta server-diagnostik:', diagError);
        }
        
        // Kastande av felet har flyttats utanför try-blocket för server-diagnostik
        throw new Error(`Kunde inte nå Supabase via proxy: ${proxyHealth.error || 'Okänt fel'}`);
      }
      
      // I utvecklingsläge, använd mock direkt
      if (process.env.NODE_ENV !== 'production') {
        console.log('Använder utvecklingsläge-mockad inloggning via proxy');
        
        // Sätt mock-cookies
        document.cookie = `sb-access-token=mock-token; path=/; max-age=${60*60*24}; SameSite=Lax`;
        document.cookie = `sb-refresh-token=mock-refresh; path=/; max-age=${60*60*24*30}; SameSite=Lax`;
        document.cookie = 'supabase-dev-auth=true; path=/; max-age=86400; SameSite=Lax';
        
        setSuccessMessage('Utvecklingsläge: Mock-inloggning lyckades! Omdirigerar...');
        
        // Använd direkt omladdning
        setTimeout(() => {
          window.location.href = redirectPath;
        }, 1000);
        
        return;
      }
      
      // För produktion, använd en fetch via proxyn direkt
      try {
        console.log('Utför proxy-baserad inloggning via /api/supabase-proxy/auth/v1/token');
        
        // Försök med direkta anropet först
        const response = await fetch('/api/supabase-proxy/auth/v1/token?grant_type=password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Supabase-Proxy': 'true'
          },
          body: JSON.stringify({
            email,
            password,
            grant_type: 'password'
          })
        });
        
        // Logga rå-svaret för debugging
        const responseText = await response.text();
        console.log(`Auth API raw response (${responseText.length} chars):`, 
          responseText.length > 200 ? responseText.substring(0, 200) + '...' : responseText);
        
        // Försök parsa som JSON
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.error('Kunde inte parsa auth-svar som JSON:', e);
          throw new Error(`Ogiltigt format på svar: ${responseText.substring(0, 100)}`);
        }
        
        if (!response.ok) {
          console.error('Auth API svarade med felstatus:', response.status, data);
          
          // Spara detaljerad felinformation
          setDetailedError(data);
          
          throw new Error(data.error_description || data.error || `Felaktig status: ${response.status}`);
        }
        
        // Sätt cookies manuellt från proxy-svaret
        if (data.access_token && data.refresh_token) {
          document.cookie = `sb-access-token=${data.access_token}; path=/; max-age=${60*60*24}; SameSite=Lax`;
          document.cookie = `sb-refresh-token=${data.refresh_token}; path=/; max-age=${60*60*24*30}; SameSite=Lax`;
          
          // Synka med server
          try {
            console.log('Synkroniserar session med servern...');
            
            const syncResponse = await fetch('/api/auth/session', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                accessToken: data.access_token, 
                refreshToken: data.refresh_token 
              }),
            });
            
            if (!syncResponse.ok) {
              console.error('Server session sync misslyckades:', await syncResponse.text());
            } else {
              console.log('Server session sync slutförd:', syncResponse.status);
            }
          } catch (syncError) {
            console.error('Kunde inte synkronisera server session:', syncError);
          }
          
          setSuccessMessage('Inloggningen lyckades via proxy! Omdirigerar...');
          
          // Använd direkt omladdning med kort fördröjning
          setTimeout(() => {
            window.location.href = redirectPath;
          }, 1000);
        } else {
          throw new Error('Fick inget access token från proxy-inloggningen');
        }
      } catch (proxyError) {
        console.error('Proxy inloggningsfel:', proxyError);
        
        // Om vi inte redan har satt detaljerad felinformation
        if (!detailedError) {
          setDetailedError({
            error: proxyError instanceof Error ? proxyError.message : String(proxyError),
            stack: proxyError instanceof Error ? proxyError.stack : undefined
          });
        }
        
        throw new Error(`Proxy inloggning misslyckades: ${proxyError instanceof Error ? proxyError.message : 'Okänt fel'}`);
      }
    } catch (error) {
      console.error('Proxy-baserad inloggning misslyckades:', error);
      setErrorMessage(`Alla inloggningsförsök misslyckades. ${error instanceof Error ? error.message : 'Kontrollera dina uppgifter och försök igen.'}`);
    } finally {
      setLoading(false);
    }
  };

  // Visar olika statusmeddelanden baserat på nätverkstillstånd
  const getNetworkMessage = () => {
    switch (networkStatus) {
      case 'checking':
        return 'Kontrollerar anslutning...';
      case 'online':
        return 'Anslutning OK' + (proxyStatus === 'working' ? ' (via proxy)' : '');
      case 'no-internet':
        return 'Ingen internetanslutning';
      case 'unreachable':
        return 'Kan inte nå Supabase-servern';
      case 'proxy-error':
        return 'Fel vid anslutning via proxy';
      case 'invalid-url':
        return 'Ogiltig server-konfiguration';
      case 'error':
        return 'Fel vid kontroll av anslutning';
      default:
        return '';
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
    <form onSubmit={handleSignIn} className="space-y-6">
      <div className="text-xs text-center space-y-1">
        {supabaseUrl && (
          <div className={`${networkStatus === 'online' ? 'text-gray-400' : 'text-red-400'}`}>
            Server: {supabaseUrl}
          </div>
        )}
        <div className={`${
          networkStatus === 'online' ? 'text-green-500' : 
          networkStatus === 'checking' ? 'text-gray-400' : 'text-red-500'
        }`}>
          {getNetworkMessage()}
        </div>
        
        {/* Visa proxy-status om tillgänglig */}
        {proxyStatus !== 'unknown' && (
          <div className={`text-xs ${proxyStatus === 'working' ? 'text-green-500' : 'text-amber-500'}`}>
            Proxy: {proxyStatus === 'working' ? 'Tillgänglig' : 
                   proxyStatus === 'not-used' ? 'Ej används' : 'Ej tillgänglig'}
          </div>
        )}
        
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
            
            {detailedError && (
              <div className="mb-2">
                <div className="font-medium text-red-500">Fel:</div>
                <pre className="whitespace-pre-wrap break-words text-xs">
                  {JSON.stringify(detailedError, null, 2)}
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

      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 my-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={loading || networkStatus === 'no-internet'}
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