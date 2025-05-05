import { UserRole } from './auth/roleUtils';

/**
 * Typ för att hantera Supabase's SelectQueryError
 * Används för att hantera fall där userData kan vara antingen data eller ett fel
 */

// Interface för användardata från supabase
export interface UserData {
  role: UserRole;
  organizationId: string;
  [key: string]: any; // För andra egenskaper som kan finnas
}

// Interface för select-datarespons
export interface SupabaseQueryData<T> {
  data: T | null;
  error: any;
}

/**
 * Säker åtkomst av userData även när det kan vara ett SelectQueryError
 * Används i API routes för att undvika TypeScript fel med SelectQueryError
 *
 * @param result - Svaret från supabase query
 * @param property - Egenskapen att hämta
 * @param defaultValue - Standardvärde om inget värde hittas
 * @returns Det säkra värdet eller defaultValue
 */
export function safeGet<T, K extends keyof T>(
  result: { data: T | null; error: any },
  property: K,
  defaultValue: T[K]
): T[K] {
  // Om det finns ett fel eller ingen data, returnera standardvärdet
  if (result.error || !result.data) {
    return defaultValue;
  }

  // Annars returnera det faktiska värdet
  return result.data[property] !== undefined
    ? result.data[property]
    : defaultValue;
}

/**
 * Säker typkonvertering av userData från Supabase
 * Konverterar resultatet till UserData-interfacen
 */
export function safeUserData(result: {
  data: any;
  error: any;
}): UserData | null {
  if (result.error || !result.data) {
    return null;
  }

  // Returnera data med försäkrad typning
  return {
    role: result.data.role as UserRole,
    organizationId: result.data.organizationId,
    ...result.data,
  };
}
