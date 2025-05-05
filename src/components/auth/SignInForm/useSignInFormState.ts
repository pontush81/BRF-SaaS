import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { NetworkStatus, SupabaseConnectionCheckResult } from './SignInFormTypes';
import { checkSupabaseViaProxy, getServerDiagnostics } from './utils/networkUtils';

/**
 * Custom hook för SignInForm state management
 */
export const useSignInFormState = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    directSupabase: true,
    proxySupabase: true,
    checking: false,
    lastChecked: null
  });
  const [debugMode, setDebugMode] = useState(false);
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null);

  const { setUser } = useAuth();
  const router = useRouter();

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

  const toggleDebugMode = () => {
    setDebugMode(prev => !prev);
  };

  return {
    isLoading,
    setIsLoading,
    email,
    setEmail,
    password,
    setPassword,
    errorMessage,
    setErrorMessage,
    networkStatus,
    setNetworkStatus,
    debugMode,
    setDebugMode,
    diagnosticInfo,
    setDiagnosticInfo,
    setUser,
    router,
    redirectPath,
    toggleDebugMode
  };
};
