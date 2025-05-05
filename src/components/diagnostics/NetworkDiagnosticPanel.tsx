'use client';

import { useState, useEffect } from 'react';
import { Button } from '@mantine/core';
import { IconBug } from '@tabler/icons-react';
import {
  NetworkStatus,
  getServerDiagnostics,
} from '@/utils/network-diagnostics';

interface NetworkDiagnosticPanelProps {
  networkStatus: NetworkStatus;
  initialDiagnosticInfo?: any;
}

/**
 * Komponent som visar nätverksdiagnostik och detaljerad felsökningsinformation
 */
export default function NetworkDiagnosticPanel({
  networkStatus,
  initialDiagnosticInfo = null,
}: NetworkDiagnosticPanelProps) {
  const [debugMode, setDebugMode] = useState(false);
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(
    initialDiagnosticInfo
  );

  // Funktion för att visa/dölja detaljerad felsökning
  const toggleDebugMode = () => {
    setDebugMode(!debugMode);

    if (!debugMode && !diagnosticInfo) {
      // Hämta diagnostik första gången användaren aktiverar debug-läge
      getServerDiagnostics().then(data => setDiagnosticInfo(data));
    }
  };

  return (
    <div className="text-xs text-center space-y-1">
      {process.env.NEXT_PUBLIC_SUPABASE_URL && (
        <div
          className={`${networkStatus.directSupabase ? 'text-gray-400' : 'text-red-400'}`}
        >
          Server:{' '}
          {process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 20) + '...'}
        </div>
      )}
      <div
        className={`${
          networkStatus.directSupabase
            ? 'text-green-500'
            : networkStatus.checking
              ? 'text-gray-400'
              : 'text-red-500'
        }`}
      >
        {networkStatus.checking
          ? 'Kontrollerar anslutning...'
          : networkStatus.directSupabase
            ? 'Anslutning OK'
            : networkStatus.proxySupabase
              ? 'Anslutning OK (via proxy)'
              : 'Anslutningsproblem'}
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
              {document.cookie
                .split(';')
                .map(c => c.trim())
                .join('\n')}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
