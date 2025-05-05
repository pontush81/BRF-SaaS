import React, { useState } from 'react';
import { Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { ConnectionDiagnostics } from '@/components/auth/ConnectionDiagnostics';

interface NetworkStatusCheckProps {
  networkStatus: {
    directSupabase: boolean;
    proxySupabase: boolean;
    checking: boolean;
    lastChecked: Date | null;
    error?: string;
    detailedError?: string;
  };
  debugMode: boolean;
  diagnosticInfo: any;
  onRetry?: () => void;
}

/**
 * Visar statusinformation om nätverksanslutning för inloggning
 */
export const NetworkStatusCheck: React.FC<NetworkStatusCheckProps> = ({
  networkStatus,
  debugMode,
  diagnosticInfo,
  onRetry,
}) => {
  const [showAdvancedDiagnostics, setShowAdvancedDiagnostics] = useState(false);

  // Visa inget om allt fungerar eller om vi fortfarande kollar
  if (
    (networkStatus.proxySupabase && networkStatus.directSupabase) ||
    networkStatus.checking
  ) {
    return null;
  }

  const hasConnectionIssue =
    !networkStatus.proxySupabase && !networkStatus.directSupabase;

  return (
    <>
      {!networkStatus.proxySupabase && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Anslutningsproblem"
          color="orange"
          className="mb-4"
        >
          Vi kunde inte ansluta till vår inloggningstjänst. Kontrollera din
          internetanslutning och försök igen.
          <button
            onClick={() => setShowAdvancedDiagnostics(true)}
            className="text-blue-600 hover:underline text-sm mt-2 block"
          >
            Kör diagnostik
          </button>
          {debugMode && networkStatus.error && (
            <div className="mt-2 text-xs">
              <strong>Felmeddelande:</strong> {networkStatus.error}
              {networkStatus.detailedError && (
                <div className="mt-1">
                  <strong>Detaljer:</strong> {networkStatus.detailedError}
                </div>
              )}
            </div>
          )}
        </Alert>
      )}

      <ConnectionDiagnostics
        visible={showAdvancedDiagnostics}
        onRetry={onRetry}
      />

      {debugMode && diagnosticInfo && (
        <div className="mb-4 p-3 bg-gray-100 text-xs font-mono rounded overflow-x-auto">
          <strong>Diagnostik:</strong>
          <pre>{JSON.stringify(diagnosticInfo, null, 2)}</pre>
        </div>
      )}
    </>
  );
};
