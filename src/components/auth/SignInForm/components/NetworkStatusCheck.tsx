import React from 'react';
import { Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

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
}

/**
 * Visar statusinformation om nätverksanslutning för inloggning
 */
export const NetworkStatusCheck: React.FC<NetworkStatusCheckProps> = ({
  networkStatus,
  debugMode,
  diagnosticInfo
}) => {
  // Visa inget om allt fungerar eller om vi fortfarande kollar
  if ((networkStatus.proxySupabase && networkStatus.directSupabase) || networkStatus.checking) {
    return null;
  }

  return (
    <>
      {!networkStatus.proxySupabase && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Anslutningsproblem"
          color="orange"
          className="mb-4"
        >
          Vi kunde inte ansluta till vår inloggningstjänst. Kontrollera din internetanslutning och försök igen.

          {debugMode && networkStatus.error && (
            <div className="mt-2 text-xs">
              <strong>Felmeddelande:</strong> {networkStatus.error}
              {networkStatus.detailedError && (
                <div className="mt-1"><strong>Detaljer:</strong> {networkStatus.detailedError}</div>
              )}
            </div>
          )}
        </Alert>
      )}

      {debugMode && diagnosticInfo && (
        <div className="mb-4 p-3 bg-gray-100 text-xs font-mono rounded overflow-x-auto">
          <strong>Diagnostik:</strong>
          <pre>{JSON.stringify(diagnosticInfo, null, 2)}</pre>
        </div>
      )}
    </>
  );
};
