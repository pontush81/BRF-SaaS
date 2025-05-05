/**
 * SignInForm Types
 */

export interface SignInFormProps {
  // Denna komponent tar inga props, men vi behåller interfacet för framtida utökningar
}

/**
 * Nätverksstatustyp för att spåra anslutningsstatus
 */
export interface NetworkStatus {
  directSupabase: boolean;
  proxySupabase: boolean;
  checking: boolean;
  lastChecked: Date | null;
  error?: string;
  detailedError?: string;
}

/**
 * Resultat från supabasa anslutningskontroll
 */
export interface SupabaseConnectionCheckResult {
  status: 'ok' | 'error' | 'timeout';
  reachable: boolean;
  details?: string;
  error?: string;
}
