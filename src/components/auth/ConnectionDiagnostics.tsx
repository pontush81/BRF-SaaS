'use client';

import React, { useState, useEffect } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  AlertTriangle,
  CheckCircle,
  WifiOff,
  RefreshCw,
} from 'lucide-react';
import {
  checkConnectivity,
  checkSupabaseViaProxy,
  getServerDiagnostics,
} from '@/utils/network-diagnostics';

interface ConnectionDiagnosticsProps {
  visible: boolean;
  onRetry?: () => void;
}

export function ConnectionDiagnostics({
  visible,
  onRetry,
}: ConnectionDiagnosticsProps) {
  const [checking, setChecking] = useState(false);
  const [diagnostics, setDiagnostics] = useState<{
    directConnection: boolean | null;
    proxyConnection: boolean | null;
    dnsWorking: boolean | null;
    error: string | null;
    detailedError: string | null;
  }>({
    directConnection: null,
    proxyConnection: null,
    dnsWorking: null,
    error: null,
    detailedError: null,
  });

  // Kontrollera om vi redan har en känd DNS-felpåståelse
  useEffect(() => {
    if (typeof window !== 'undefined' && window.__hasDnsFailure === true) {
      setDiagnostics(prev => ({
        ...prev,
        dnsWorking: false,
        directConnection: false,
      }));
    }
  }, []);

  useEffect(() => {
    if (visible) {
      runDiagnostics();
    }
  }, [visible]);

  const runDiagnostics = async () => {
    setChecking(true);
    setDiagnostics({
      directConnection: null,
      proxyConnection: null,
      dnsWorking: null,
      error: null,
      detailedError: null,
    });

    try {
      // Check if we can reach common services (to verify general internet connectivity)
      const hasInternet = await checkConnectivity('https://www.google.com');

      // Try the Supabase URL directly (will likely fail if DNS issues exist)
      const directSupabase = await checkConnectivity(
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
          'https://lhoyrmbqcjbvlxshlyqm.supabase.co'
      );

      // Try connecting via our proxy endpoint
      const proxyResponse = await checkSupabaseViaProxy();

      // Get detailed server diagnostics
      const serverDiagnostics = await getServerDiagnostics();

      // Determine if DNS is the likely issue
      const isDnsIssue = !directSupabase && proxyResponse.reachable;

      // Uppdatera global DNS-status
      if (typeof window !== 'undefined') {
        window.__hasDnsFailure = isDnsIssue;
        console.log(`[ConnectionDiagnostics] Setting global DNS failure flag to: ${isDnsIssue}`);
      }

      setDiagnostics({
        directConnection: directSupabase,
        proxyConnection: proxyResponse.reachable,
        dnsWorking: !isDnsIssue,
        error: isDnsIssue
          ? 'DNS upplösning misslyckades'
          : proxyResponse.error || null,
        detailedError: JSON.stringify(
          {
            proxyResponse,
            serverDiagnostics,
            hasInternet,
            dnsFailureFlag: typeof window !== 'undefined' ? window.__hasDnsFailure : 'N/A'
          },
          null,
          2
        ),
      });
    } catch (error) {
      setDiagnostics({
        ...diagnostics,
        error:
          error instanceof Error
            ? error.message
            : 'Ett okänt fel uppstod vid konnektivitetstest',
        detailedError:
          error instanceof Error ? error.stack || '' : String(error),
      });
    } finally {
      setChecking(false);
    }
  };

  // Funktion för att försöka logga in via proxy
  const handleProxyLogin = () => {
    // Aktivera proxy-läge genom att sätta den globala flaggan
    if (typeof window !== 'undefined') {
      window.__hasDnsFailure = true;
      console.log('[ConnectionDiagnostics] Enabled proxy mode for authentication');
    }

    // Försök logga in igen om onRetry finns
    if (onRetry) {
      onRetry();
    }
  };

  if (!visible) return null;

  const hasDnsIssue = diagnostics.dnsWorking === false;
  const hasConnectionIssue =
    !diagnostics.directConnection && !diagnostics.proxyConnection;
  const hasProxyButNoDirect =
    !diagnostics.directConnection && diagnostics.proxyConnection;

  return (
    <div className="space-y-4 my-6 bg-gray-50 p-4 rounded-md border border-gray-200">
      <h3 className="text-lg font-medium">Anslutningsdiagnostik</h3>

      {checking ? (
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Kontrollerar anslutningen...</span>
        </div>
      ) : (
        <>
          {hasDnsIssue && (
            <Alert variant="default">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <AlertTitle>DNS-problem upptäckt</AlertTitle>
              <AlertDescription>
                Din webbläsare kan inte lösa Supabase-domänen. Detta kan bero
                på:
                <ul className="list-disc pl-5 mt-2">
                  <li>Problem med din DNS-server</li>
                  <li>Brandväggsregler som blockerar åtkomst</li>
                  <li>VPN- eller proxy-inställningar</li>
                </ul>
                <p className="mt-2">
                  Använd gärna automatisk proxy för att kringgå problemet.
                </p>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleProxyLogin}
                  className="mt-2"
                >
                  Använd proxy för inloggning
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {hasConnectionIssue && (
            <Alert variant="destructive">
              <WifiOff className="h-4 w-4" />
              <AlertTitle>Anslutningsproblem</AlertTitle>
              <AlertDescription>
                Vi kunde inte ansluta till servern alls. Kontrollera din
                internetanslutning och försök igen.
              </AlertDescription>
            </Alert>
          )}

          {hasProxyButNoDirect && !hasDnsIssue && (
            <Alert variant="default">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <AlertTitle>Begränsad anslutning</AlertTitle>
              <AlertDescription>
                Direktanslutning till Supabase misslyckades, men
                proxy-anslutning fungerar. Du bör kunna logga in via proxyn.
              </AlertDescription>
            </Alert>
          )}

          {diagnostics.directConnection && diagnostics.proxyConnection && (
            <Alert variant="default">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle>Anslutningen fungerar</AlertTitle>
              <AlertDescription>
                Både direkt och proxy-anslutningen till Supabase fungerar
                korrekt. Om du fortfarande har problem med inloggning,
                kontrollera dina inloggningsuppgifter.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={runDiagnostics}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Kör diagnostik igen
            </Button>
            {onRetry && (
              <Button variant="default" size="sm" onClick={onRetry}>
                Försök logga in igen
              </Button>
            )}
          </div>

          {diagnostics.error && (
            <details className="mt-4 text-xs">
              <summary className="cursor-pointer">
                Visa tekniska detaljer
              </summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-40">
                {diagnostics.error}
                {diagnostics.detailedError &&
                  `\n\n${diagnostics.detailedError}`}
              </pre>
            </details>
          )}
        </>
      )}
    </div>
  );
}
