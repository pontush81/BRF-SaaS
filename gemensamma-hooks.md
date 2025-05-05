# Förslag på gemensamma hooks för BRF-SaaS

Följande hooks kan implementeras för att eliminera duplicerad logik och göra koden mer underhållbar över hela projektet.

## 1. `useNetworkDiagnostics`

Generalisera nätverksdiagnostiken från SignInForm-refaktoreringen.

```typescript
// src/hooks/useNetworkDiagnostics.ts
import { useState } from 'react';
import {
  checkConnectivity,
  checkSupabaseViaProxy,
  getServerDiagnostics,
  NetworkStatus,
} from '@/utils/network-diagnostics';

export interface UseNetworkDiagnosticsReturn {
  networkStatus: NetworkStatus;
  checkNetworkStatus: () => Promise<{
    status: 'ok' | 'error';
    reachable: boolean;
    error?: string;
  }>;
  getDiagnosticInfo: () => Promise<any>;
  isChecking: boolean;
}

export function useNetworkDiagnostics(): UseNetworkDiagnosticsReturn {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    directSupabase: true,
    proxySupabase: true,
    checking: false,
    lastChecked: null,
  });

  const [isChecking, setIsChecking] = useState(false);

  const checkNetworkStatus = async () => {
    setIsChecking(true);
    setNetworkStatus(prev => ({ ...prev, checking: true }));

    try {
      // Kontrollera anslutning via proxy
      const proxyStatus = await checkSupabaseViaProxy();

      setNetworkStatus({
        directSupabase: true, // Vi antar direkt anslutning tills vi vet annat
        proxySupabase: proxyStatus.reachable,
        checking: false,
        lastChecked: new Date(),
        error: proxyStatus.error,
        detailedError: proxyStatus.details,
      });

      return proxyStatus;
    } catch (error) {
      console.error('Error checking network status:', error);
      setNetworkStatus({
        directSupabase: false,
        proxySupabase: false,
        checking: false,
        lastChecked: new Date(),
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error checking network',
      });

      return {
        status: 'error' as const,
        reachable: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    } finally {
      setIsChecking(false);
    }
  };

  const getDiagnosticInfo = async () => {
    try {
      return await getServerDiagnostics();
    } catch (error) {
      console.error('Error getting diagnostic info:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  };

  return {
    networkStatus,
    checkNetworkStatus,
    getDiagnosticInfo,
    isChecking,
  };
}
```

## 2. `useSupabase`

Centralisera Supabase-operationer för att undvika att skapa klienter direkt i komponenter.

```typescript
// src/hooks/useSupabase.ts
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/supabase-client';
import {
  SupabaseClient,
  User,
  Session,
  Provider,
  AuthResponse,
} from '@supabase/supabase-js';

export interface UseSupabaseReturn {
  supabase: SupabaseClient;
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: Error | null;

  // Auth metoder
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (
    email: string,
    password: string,
    userData?: Record<string, any>
  ) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;

  // Cookies-hantering
  syncSessionCookies: (session: Session) => Promise<void>;
}

export function useSupabase(): UseSupabaseReturn {
  const [client] = useState(() => createBrowserClient());
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialisera och hämta session vid komponent-mount
  useEffect(() => {
    async function initialize() {
      setIsLoading(true);
      try {
        // Hämta användarinformation
        const { data, error } = await client.auth.getUser();

        if (error) {
          throw error;
        }

        if (data.user) {
          setUser(data.user);

          // Hämta session separat
          const sessionResult = await client.auth.getSession();
          setSession(sessionResult.data.session);
        }
      } catch (err) {
        console.error('Error initializing Supabase client:', err);
        setError(
          err instanceof Error
            ? err
            : new Error('Unknown error initializing Supabase')
        );
      } finally {
        setIsLoading(false);
      }
    }

    initialize();

    // Sätt upp auth state change listener
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state changed:', event);

      setUser(newSession?.user || null);
      setSession(newSession);
    });

    // Städa upp subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [client]);

  // Logga in med e-post och lösenord
  const signIn = async (
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    try {
      // Rensa eventuella befintliga sessioner först
      await client.auth.signOut();

      // Gör inloggningsförsök
      const response = await client.auth.signInWithPassword({
        email,
        password,
      });

      if (response.error) {
        throw response.error;
      }

      if (response.data.session) {
        // Synkronisera cookies
        await syncSessionCookies(response.data.session);
      }

      return response;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  // Registrera ny användare
  const signUp = async (
    email: string,
    password: string,
    userData?: Record<string, any>
  ): Promise<AuthResponse> => {
    try {
      const response = await client.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (response.error) {
        throw response.error;
      }

      return response;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  // Logga ut
  const signOut = async (): Promise<void> => {
    try {
      await client.auth.signOut();
      setUser(null);
      setSession(null);

      // Rensa cookies
      document.cookie =
        'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      document.cookie =
        'sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  // Uppdatera session
  const refreshSession = async (): Promise<void> => {
    try {
      const { data, error } = await client.auth.refreshSession();

      if (error) {
        throw error;
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.user);
      }
    } catch (error) {
      console.error('Refresh session error:', error);
      throw error;
    }
  };

  // Synkronisera cookies för server-side auth
  const syncSessionCookies = async (session: Session): Promise<void> => {
    try {
      // Sätt access token
      document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;

      // Sätt refresh token
      document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;

      // Anropa server-side endpoint för session-synkronisering
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
        }),
      });
    } catch (error) {
      console.error('Error syncing session cookies:', error);
      throw error;
    }
  };

  return {
    supabase: client,
    user,
    session,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    refreshSession,
    syncSessionCookies,
  };
}
```

## 3. `useForm`

Generisk hook för formulärhantering med validering, state management, och felhantering.

```typescript
// src/hooks/useForm.ts
import { useState, useCallback } from 'react';

export type ValidationResult = {
  isValid: boolean;
  errors: Record<string, string>;
};

export type FormValidatorFn<T> = (
  values: T,
  fieldName?: keyof T
) => ValidationResult;

export interface UseFormOptions<T> {
  initialValues: T;
  onSubmit?: (values: T) => Promise<void> | void;
  validator?: FormValidatorFn<T>;
  validateOnChange?: boolean;
}

export interface UseFormReturn<T> {
  values: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  resetForm: () => void;
  validateForm: () => boolean;
  validateField: (field: keyof T) => boolean;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  onSubmit,
  validator,
  validateOnChange = false,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<keyof T>>(new Set());

  // Funktion för att sätta ett fältvärde
  const setFieldValue = useCallback(
    (field: keyof T, value: any) => {
      setValues(prev => ({ ...prev, [field]: value }));
      setIsDirty(true);

      // Lägg till fältet som rört (touched)
      setTouchedFields(prev => new Set(prev).add(field));

      // Validera direkt om det är aktiverat
      if (validateOnChange && validator) {
        const validationResult = validator(
          { ...values, [field]: value },
          field
        );

        setErrors(prev => ({
          ...prev,
          [field]: validationResult.errors[field as string] || '',
        }));
      }
    },
    [values, validator, validateOnChange]
  );

  // Funktion för att sätta ett fältfel
  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  // Hantera input-ändringar automatiskt
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type, checked } = e.target;
      const fieldValue = type === 'checkbox' ? checked : value;

      setFieldValue(name as keyof T, fieldValue);
    },
    [setFieldValue]
  );

  // Validera hela formuläret
  const validateForm = useCallback((): boolean => {
    if (!validator) return true;

    const validationResult = validator(values);
    setErrors(validationResult.errors);

    return validationResult.isValid;
  }, [validator, values]);

  // Validera ett enskilt fält
  const validateField = useCallback(
    (field: keyof T): boolean => {
      if (!validator) return true;

      const validationResult = validator(values, field);

      setErrors(prev => ({
        ...prev,
        [field]: validationResult.errors[field as string] || '',
      }));

      return !validationResult.errors[field as string];
    },
    [validator, values]
  );

  // Hantera formulärinskickning
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validera hela formuläret
      const isValid = validateForm();

      if (!isValid || !onSubmit) {
        return;
      }

      try {
        setIsSubmitting(true);
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
        // Här kan vi hantera formulärfel på lämpligt sätt
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateForm, onSubmit]
  );

  // Återställ formuläret
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setIsDirty(false);
    setTouchedFields(new Set());
  }, [initialValues]);

  // Beräkna isValid baserat på errors
  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    isSubmitting,
    isValid,
    isDirty,
    setFieldValue,
    setFieldError,
    handleChange,
    handleSubmit,
    resetForm,
    validateForm,
    validateField,
  };
}
```

## 4. `useErrorHandling`

En hook för konsekvent felhantering i hela applikationen.

```typescript
// src/hooks/useErrorHandling.ts
import { useState, useCallback } from 'react';

export type ErrorType = 'auth' | 'network' | 'api' | 'validation' | 'unknown';

export interface ErrorInfo {
  message: string;
  type: ErrorType;
  code?: string;
  details?: any;
  timestamp: Date;
}

export interface UseErrorHandlingOptions {
  logToConsole?: boolean;
  logToService?: boolean;
  translateErrors?: boolean;
  defaultMessage?: string;
}

export interface UseErrorHandlingReturn {
  error: ErrorInfo | null;
  setError: (
    err: Error | string | null,
    type?: ErrorType,
    details?: any
  ) => void;
  clearError: () => void;
  errorMessage: string | null;
  hasError: boolean;
}

// Hjälpfunktion för att bestämma feltyp baserat på felmeddelande
const determineErrorType = (error: Error | string): ErrorType => {
  const message = typeof error === 'string' ? error : error.message;

  if (
    message.includes('auth') ||
    message.includes('password') ||
    message.includes('email') ||
    message.includes('token')
  ) {
    return 'auth';
  }

  if (
    message.includes('network') ||
    message.includes('unreachable') ||
    message.includes('fetch') ||
    message.includes('connectivity')
  ) {
    return 'network';
  }

  if (
    message.includes('api') ||
    message.includes('request') ||
    message.includes('response') ||
    message.includes('server')
  ) {
    return 'api';
  }

  if (
    message.includes('validation') ||
    message.includes('required') ||
    message.includes('invalid')
  ) {
    return 'validation';
  }

  return 'unknown';
};

// Översätt felmeddelanden till användarvänliga meddelanden
const translateError = (error: ErrorInfo): string => {
  // Beroende på typ av fel, översätt till användarvänligt meddelande
  switch (error.type) {
    case 'auth':
      if (error.message.includes('credentials')) {
        return 'Ogiltiga inloggningsuppgifter. Kontrollera e-post och lösenord.';
      }
      if (error.message.includes('token')) {
        return 'Din session har gått ut. Vänligen logga in igen.';
      }
      return 'Ett autentiseringsfel uppstod. Vänligen försök igen.';

    case 'network':
      return 'Nätverksfel. Kontrollera din internetanslutning och försök igen.';

    case 'api':
      return 'Ett fel uppstod vid kommunikation med servern. Vänligen försök igen senare.';

    case 'validation':
      return 'Vänligen kontrollera dina inmatningar och försök igen.';

    case 'unknown':
    default:
      return 'Ett oväntat fel uppstod. Vänligen försök igen senare.';
  }
};

export function useErrorHandling({
  logToConsole = true,
  logToService = false,
  translateErrors = true,
  defaultMessage = 'Ett fel uppstod. Vänligen försök igen.',
}: UseErrorHandlingOptions = {}): UseErrorHandlingReturn {
  const [error, setErrorState] = useState<ErrorInfo | null>(null);

  // Loggningsfunktion
  const logError = useCallback(
    (errorInfo: ErrorInfo) => {
      if (logToConsole) {
        console.error('Error:', errorInfo);
      }

      if (logToService) {
        // Här kan vi integrera med en extern loggnings-service
        // t.ex. Sentry, LogRocket, etc.
        try {
          fetch('/api/log-error', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(errorInfo),
          });
        } catch (e) {
          console.error('Failed to log error to service:', e);
        }
      }
    },
    [logToConsole, logToService]
  );

  // Sätt ett fel
  const setError = useCallback(
    (err: Error | string | null, type?: ErrorType, details?: any) => {
      if (err === null) {
        setErrorState(null);
        return;
      }

      // Skapa ErrorInfo-objekt
      const errorMessage =
        typeof err === 'string' ? err : err.message || defaultMessage;
      const errorType = type || determineErrorType(err);

      const errorInfo: ErrorInfo = {
        message: errorMessage,
        type: errorType,
        code:
          typeof err === 'object' && 'code' in err
            ? (err as any).code
            : undefined,
        details,
        timestamp: new Date(),
      };

      // Logga felet
      logError(errorInfo);

      // Uppdatera state
      setErrorState(errorInfo);
    },
    [defaultMessage, logError]
  );

  // Rensa fel
  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  // Returnera användarmeddelande
  const errorMessage = error
    ? translateErrors
      ? translateError(error)
      : error.message
    : null;

  return {
    error,
    setError,
    clearError,
    errorMessage,
    hasError: error !== null,
  };
}
```

## 5. `useAuth` (Konsoliderad version)

En hook som ersätter både nuvarande `AuthContext` och `SessionContext`.

```typescript
// src/hooks/useAuth.ts
import { useSupabase } from './useSupabase';
import { useCallback, useState, useEffect } from 'react';
import { UserRole } from '@/lib/auth/roleUtils';
import { Organization } from '@/types/organization';

export interface DatabaseUser {
  id: string;
  email: string;
  name: string | null;
  organizations: Organization[];
  role?: UserRole | null;
  defaultOrganization?: Organization | null;
  currentOrganization?: Organization | null;
}

export interface UseAuthReturn {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: DatabaseUser | null;
  userRole: UserRole | null;
  organizations: Organization[];
  currentOrganization: Organization | null;
  error: Error | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  switchOrganization: (orgId: string) => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const {
    user: supabaseUser,
    isLoading: isSupabaseLoading,
    signIn,
    signOut,
    error: supabaseError,
  } = useSupabase();

  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<DatabaseUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] =
    useState<Organization | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Hämta användardata från API
  const fetchUserData = useCallback(
    async (orgId?: string) => {
      if (!supabaseUser) {
        setUser(null);
        setUserRole(null);
        setOrganizations([]);
        setCurrentOrganization(null);
        return;
      }

      try {
        setIsLoading(true);

        // Skapa URL med optional orgId
        const url = new URL('/api/auth/current-user', window.location.origin);
        if (orgId) {
          url.searchParams.set('orgId', orgId);
        }

        const response = await fetch(url.toString());

        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.statusText}`);
        }

        const data = await response.json();
        setUser(data);
        setUserRole((data.role as UserRole) || null);
        setOrganizations(data.organizations || []);
        setCurrentOrganization(data.currentOrganization || null);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(
          err instanceof Error
            ? err
            : new Error('Unknown error fetching user data')
        );
      } finally {
        setIsLoading(false);
      }
    },
    [supabaseUser]
  );

  // Uppdatera användardata när supabaseUser ändras
  useEffect(() => {
    if (!isSupabaseLoading) {
      fetchUserData();
    }
  }, [fetchUserData, isSupabaseLoading, supabaseUser]);

  // Loginfunktion
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await signIn(email, password);

        if (response.error) {
          throw response.error;
        }

        await fetchUserData();
      } catch (err) {
        console.error('Login error:', err);
        setError(err instanceof Error ? err : new Error('Unknown login error'));
        throw err;
      }
    },
    [signIn, fetchUserData]
  );

  // Logoutfunktion
  const logout = useCallback(async () => {
    try {
      await signOut();
      setUser(null);
      setUserRole(null);
      setOrganizations([]);
      setCurrentOrganization(null);
    } catch (err) {
      console.error('Logout error:', err);
      setError(err instanceof Error ? err : new Error('Unknown logout error'));
      throw err;
    }
  }, [signOut]);

  // Uppdatera användardata
  const refreshUserData = useCallback(async () => {
    await fetchUserData();
  }, [fetchUserData]);

  // Kontrollera om användaren har en specifik roll
  const hasRole = useCallback(
    (role: UserRole): boolean => {
      if (!userRole) return false;

      // Admin har alla roller
      if (userRole === UserRole.ADMIN) return true;

      // Editor har editor och member
      if (userRole === UserRole.EDITOR) {
        return role === UserRole.EDITOR || role === UserRole.MEMBER;
      }

      // Member har bara member
      return userRole === role;
    },
    [userRole]
  );

  // Byt organisation
  const switchOrganization = useCallback(
    async (orgId: string) => {
      await fetchUserData(orgId);
    },
    [fetchUserData]
  );

  // Kombinera fel från Supabase
  useEffect(() => {
    if (supabaseError) {
      setError(supabaseError);
    }
  }, [supabaseError]);

  return {
    isLoading: isLoading || isSupabaseLoading,
    isAuthenticated: !!supabaseUser && !!user,
    user,
    userRole,
    organizations,
    currentOrganization,
    error,
    login,
    logout,
    refreshUserData,
    hasRole,
    switchOrganization,
  };
}
```

## Implementationsplan

1. **Stegvis implementation**:

   - Börja med de enklare hooks som `useNetworkDiagnostics` och `useForm`
   - Implementera sedan `useErrorHandling`
   - Skapa `useSupabase` som centraliserar Supabase-interaktioner
   - Till sist, konsolidera auth-logiken i den nya `useAuth`-hooken

2. **Testning**:

   - Skapa omfattande tester för varje hook
   - Implementera stegvis och testa varje komponent efter refaktorering

3. **Dokumentation**:
   - Dokumentera varje hook med tydliga exempel
   - Skapa ett mönsterbibliotek för teamet att följa

Genom att implementera dessa hooks kan vi avsevärt reducera kodduplicering och förbättra kodens kvalitet.
