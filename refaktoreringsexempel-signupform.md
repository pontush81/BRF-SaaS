# Detaljerad plan för refaktorering av SignUpForm

Baserat på den lyckade refaktoreringen av `SignInForm` presenterar vi här en detaljerad plan för hur vi kan refaktorera `SignUpForm` med samma mönster.

## Nuvarande problem med SignUpForm

- Komponenten är stor (337 rader) och svårläst
- Blandning av UI och affärslogik
- Nätverksdiagnostik och formulärhantering blandas
- Supabase-klient skapas direkt i komponenten
- Svår att testa på grund av komplexitet

## Föreslagen struktur efter refaktorering

```
src/
 ├── components/
 │    ├── auth/
 │    │    ├── SignUpForm.tsx (huvudkomponent, endast UI och sammansättning)
 │    │    └── SignUpForm/
 │    │         ├── components/
 │    │         │    ├── PersonalInfoForm.tsx
 │    │         │    ├── OrganizationInfoForm.tsx
 │    │         │    ├── DebugToggle.tsx (återanvänd från SignInForm)
 │    │         │    └── NetworkStatusCheck.tsx (återanvänd från SignInForm)
 │    │         └── __tests__/
 │    │              └── SignUpForm.test.tsx
 │    └── diagnostics/
 │         └── NetworkDiagnosticPanel.tsx (återanvänd från SignInForm)
 ├── hooks/
 │    ├── useSignUp.ts (ny hook för registreringslogik)
 │    ├── useNetworkDiagnostics.ts (generaliserad från SignInForm)
 │    └── __tests__/
 │         └── useSignUp.test.tsx
 └── utils/
      └── slugify.ts (extraherad hjälpfunktion)
```

## 1. Skapa useSignUp-hook

```typescript
// src/hooks/useSignUp.ts
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/supabase-client';
import { useNetworkDiagnostics } from '@/hooks/useNetworkDiagnostics';
import { slugify } from '@/utils/slugify';
import { UserRole } from '@/lib/auth/roleUtils';

export interface UseSignUpProps {
  redirectPath?: string;
  isAdmin?: boolean;
  orgSlug?: string;
}

export interface UseSignUpReturn {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  name: string;
  setName: (name: string) => void;
  organizationName: string;
  setOrganizationName: (name: string) => void;
  organizationSlug: string;
  setOrganizationSlug: (slug: string) => void;
  isLoading: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  debug: string | null;
  networkStatus: NetworkStatus;
  handleSignUp: (e: React.FormEvent) => Promise<void>;
}

export function useSignUp({
  redirectPath,
  isAdmin = false,
  orgSlug = '',
}: UseSignUpProps = {}): UseSignUpReturn {
  // State-variabler för formulärfält
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [organizationSlug, setOrganizationSlug] = useState(orgSlug);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [debug, setDebug] = useState<string | null>(null);

  const router = useRouter();
  const { networkStatus, checkNetworkStatus } = useNetworkDiagnostics();

  // Uppdatera slug när organisationsnamnet ändras
  const handleOrganizationNameChange = (name: string) => {
    setOrganizationName(name);
    setOrganizationSlug(slugify(name));
  };

  // Huvudfunktion för registrering
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setDebug(null);

    try {
      // Validera formulärdata
      if (password.length < 8) {
        throw new Error('Lösenordet måste vara minst 8 tecken långt');
      }

      // Skapa Supabase-klient
      const supabase = createBrowserClient();

      // Logga för felsökning i dev-läge
      if (process.env.NODE_ENV === 'development') {
        console.log(
          'Försöker registrera användare med:',
          'Email:',
          email,
          'Namn:',
          name,
          'Admin:',
          isAdmin
        );
      }

      // Registrera användaren
      const signUpResult = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            isAdmin,
            organizationSlug: isAdmin ? organizationSlug : orgSlug,
          },
        },
      });

      // Kontrollera för fel
      if (signUpResult.error) {
        setDebug(JSON.stringify(signUpResult, null, 2));

        // Översätt vanliga felmeddelanden från Supabase
        if (signUpResult.error.message.includes('Email rate limit')) {
          throw new Error(
            'För många registreringsförsök med denna e-post. Vänta en stund och försök igen.'
          );
        }
        // ... andra felmeddelanden
        else {
          throw new Error(`Registreringsfel: ${signUpResult.error.message}`);
        }
      }

      // Skapa metadata för API anrop
      const userData = {
        email,
        name,
        role: isAdmin ? UserRole.ADMIN : UserRole.MEMBER,
        organizationName: isAdmin ? organizationName : null,
        organizationSlug: isAdmin ? organizationSlug : orgSlug,
      };

      // Spara användare och organisation i databasen
      try {
        const response = await fetch('/api/auth/create-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });

        const responseData = await response.json();

        if (!response.ok) {
          console.warn(
            'Fel vid skapande av användare i databasen:',
            responseData
          );
          // Fortsätt ändå eftersom autentiseringen har skapats
        }
      } catch (error: any) {
        console.error('Fel vid databasregistrering:', error);
        // Fortsätt ändå, eftersom autentiseringen har skapats
      }

      // Visa successmeddelande
      if (signUpResult.data?.user?.identities?.length === 0) {
        setSuccessMessage('Du har redan ett konto. Logga in istället.');
      } else {
        setSuccessMessage(
          'Registreringen lyckades! Kolla din e-post för att bekräfta ditt konto.'
        );
      }

      // Rensa formuläret
      setEmail('');
      setPassword('');
      setName('');
      setOrganizationName('');
      setOrganizationSlug('');
    } catch (error: any) {
      setErrorMessage(error?.message || 'Ett fel uppstod vid registrering');
      console.error('Registreringsfel:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    organizationName,
    setOrganizationName: handleOrganizationNameChange,
    organizationSlug,
    setOrganizationSlug,
    isLoading,
    errorMessage,
    successMessage,
    debug,
    networkStatus,
    handleSignUp,
  };
}
```

## 2. Extrahera sluggenerering till separat utility-funktion

```typescript
// src/utils/slugify.ts
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
```

## 3. Skapa separata komponenter

### PersonalInfoForm.tsx

```tsx
// src/components/auth/SignUpForm/components/PersonalInfoForm.tsx
import React from 'react';

interface PersonalInfoFormProps {
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  isLoading: boolean;
}

export function PersonalInfoForm({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  isLoading,
}: PersonalInfoFormProps) {
  return (
    <>
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Ditt namn
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          E-post
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Lösenord
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <p className="mt-1 text-xs text-gray-500">Minst 8 tecken</p>
      </div>
    </>
  );
}
```

### OrganizationInfoForm.tsx

```tsx
// src/components/auth/SignUpForm/components/OrganizationInfoForm.tsx
import React from 'react';

interface OrganizationInfoFormProps {
  organizationName: string;
  setOrganizationName: (name: string) => void;
  organizationSlug: string;
  setOrganizationSlug: (slug: string) => void;
  isLoading: boolean;
}

export function OrganizationInfoForm({
  organizationName,
  setOrganizationName,
  organizationSlug,
  setOrganizationSlug,
  isLoading,
}: OrganizationInfoFormProps) {
  return (
    <>
      <div>
        <label
          htmlFor="organizationName"
          className="block text-sm font-medium mb-1"
        >
          Föreningens namn
        </label>
        <input
          id="organizationName"
          type="text"
          value={organizationName}
          onChange={e => setOrganizationName(e.target.value)}
          required
          placeholder="T.ex. BRF Solsidan"
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
      </div>

      <div>
        <label
          htmlFor="organizationSlug"
          className="block text-sm font-medium mb-1"
        >
          Föreningens webbadress
        </label>
        <div className="flex items-center">
          <span className="bg-gray-100 px-3 py-2 rounded-l border border-gray-300 border-r-0 text-gray-500">
            https://
          </span>
          <input
            id="organizationSlug"
            type="text"
            value={organizationSlug}
            onChange={e => setOrganizationSlug(e.target.value)}
            required
            placeholder="din-forening"
            className="flex-grow px-3 py-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            disabled={isLoading}
          />
          <span className="bg-gray-100 px-3 py-2 rounded-r border border-gray-300 border-l-0 text-gray-500">
            .handbok.org
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Exempel: om du vill skapa en förening med adressen{' '}
          <strong>minförening.handbok.org</strong>, ange "minförening"
        </p>
      </div>
    </>
  );
}
```

## 4. Refaktorerad huvudkomponent

```tsx
// src/components/auth/SignUpForm.tsx
'use client';

import { useSignUp } from '@/hooks/useSignUp';
import Link from 'next/link';
import { PersonalInfoForm } from './SignUpForm/components/PersonalInfoForm';
import { OrganizationInfoForm } from './SignUpForm/components/OrganizationInfoForm';
import { NetworkStatusCheck } from './SignUpForm/components/NetworkStatusCheck';
import { NetworkDiagnosticPanel } from '../diagnostics/NetworkDiagnosticPanel';
import { DebugToggle } from './SignUpForm/components/DebugToggle';

interface SignUpFormProps {
  isAdmin?: boolean;
  orgSlug?: string;
}

export default function SignUpForm({
  isAdmin = false,
  orgSlug = '',
}: SignUpFormProps) {
  const {
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    organizationName,
    setOrganizationName,
    organizationSlug,
    setOrganizationSlug,
    isLoading,
    errorMessage,
    successMessage,
    debug,
    networkStatus,
    handleSignUp,
  } = useSignUp({ isAdmin, orgSlug });

  const [showDebug, setShowDebug] = useState(false);

  return (
    <div className="w-full">
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {/* Nätverksstatus och diagnostik */}
      <NetworkStatusCheck networkStatus={networkStatus} />

      {showDebug && debug && (
        <NetworkDiagnosticPanel diagnosticInfo={JSON.parse(debug)} />
      )}

      <form onSubmit={handleSignUp} className="space-y-4">
        {/* Personlig information */}
        <PersonalInfoForm
          name={name}
          setName={setName}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          isLoading={isLoading}
        />

        {/* Organisationsinformation (endast för admins) */}
        {isAdmin && (
          <OrganizationInfoForm
            organizationName={organizationName}
            setOrganizationName={setOrganizationName}
            organizationSlug={organizationSlug}
            setOrganizationSlug={setOrganizationSlug}
            isLoading={isLoading}
          />
        )}

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Registrerar...' : 'Registrera dig'}
        </button>

        {!isAdmin && !orgSlug && (
          <div className="mt-6 text-center text-sm text-gray-600">
            Letar du efter din förenings registreringssida?{' '}
            <Link
              href="/find-association"
              className="text-blue-600 hover:underline"
            >
              Hitta din förening här
            </Link>
          </div>
        )}

        {/* Debug toggle */}
        <DebugToggle showDebug={showDebug} setShowDebug={setShowDebug} />
      </form>
    </div>
  );
}
```

## 5. Skapa testerna

```tsx
// src/hooks/__tests__/useSignUp.test.tsx
import { renderHook, act } from '@testing-library/react';
import { useSignUp } from '../useSignUp';
import { createBrowserClient } from '@/supabase-client';

// Mocka moduler
jest.mock('@/supabase-client', () => ({
  createBrowserClient: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Mock för fetch
global.fetch = jest.fn();

describe('useSignUp hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mockad Supabase klient
    const mockSupabaseClient = {
      auth: {
        signUp: jest.fn(),
      },
    };
    (createBrowserClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });

  test('bör initialisera med korrekta standardvärden', () => {
    const { result } = renderHook(() => useSignUp());

    expect(result.current.email).toBe('');
    expect(result.current.password).toBe('');
    expect(result.current.name).toBe('');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.errorMessage).toBeNull();
    expect(result.current.successMessage).toBeNull();
  });

  test('bör hantera formuläruppdateringar', () => {
    const { result } = renderHook(() => useSignUp());

    act(() => {
      result.current.setEmail('test@example.com');
      result.current.setPassword('password123');
      result.current.setName('Test User');
    });

    expect(result.current.email).toBe('test@example.com');
    expect(result.current.password).toBe('password123');
    expect(result.current.name).toBe('Test User');
  });

  // Fler tester här...
});

// src/components/auth/SignUpForm/__tests__/SignUpForm.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignUpForm from '../../SignUpForm';
import { useSignUp } from '@/hooks/useSignUp';

// Mocka useSignUp hooken
jest.mock('@/hooks/useSignUp', () => ({
  useSignUp: jest.fn(),
}));

describe('SignUpForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Grundmock för useSignUp
    (useSignUp as jest.Mock).mockReturnValue({
      email: '',
      setEmail: jest.fn(),
      password: '',
      setPassword: jest.fn(),
      name: '',
      setName: jest.fn(),
      organizationName: '',
      setOrganizationName: jest.fn(),
      organizationSlug: '',
      setOrganizationSlug: jest.fn(),
      isLoading: false,
      errorMessage: null,
      successMessage: null,
      debug: null,
      networkStatus: {
        directSupabase: true,
        proxySupabase: true,
        checking: false,
      },
      handleSignUp: jest.fn(),
    });
  });

  test('renders personal info form fields', () => {
    render(<SignUpForm />);

    expect(screen.getByLabelText(/Ditt namn/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/E-post/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Lösenord/i)).toBeInTheDocument();
  });

  test('renders organization fields when isAdmin is true', () => {
    render(<SignUpForm isAdmin={true} />);

    expect(screen.getByLabelText(/Föreningens namn/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Föreningens webbadress/i)
    ).toBeInTheDocument();
  });

  test('does not render organization fields when isAdmin is false', () => {
    render(<SignUpForm isAdmin={false} />);

    expect(
      screen.queryByLabelText(/Föreningens namn/i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(/Föreningens webbadress/i)
    ).not.toBeInTheDocument();
  });

  // Fler tester här...
});
```

## 6. Skapa en Generisk useNetworkDiagnostics-hook

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
}

export function useNetworkDiagnostics(): UseNetworkDiagnosticsReturn {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    directSupabase: true,
    proxySupabase: true,
    checking: false,
    lastChecked: null,
  });

  /**
   * Kontrollerar nätverksstatus och uppdaterar state
   */
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
    }
  };

  /**
   * Hämtar diagnostikinformation från servern
   */
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
  };
}
```

## Implementationsplan

1. **Förberedelse**

   - Skapa de nya filerna och katalogerna
   - Identifiera och återanvänd befintliga komponenter och testkod

2. **Stegvis implementation**

   - Börja med att extrahera och skapa `slugify`-hjälpfunktionen
   - Implementera och testa `useNetworkDiagnostics`-hooken
   - Skapa `useSignUp`-hooken och testa den
   - Skapa de mindre UI-komponenterna
   - Sist, refaktorera huvudkomponenten

3. **Testning**

   - Skapa tester för varje ny komponent och hook
   - Se till att alla befintliga tester fortfarande fungerar

4. **Lansering**
   - Lansera refaktoreringen med viss överlappning för att säkerställa att allt fungerar
   - Dokumentera förändringarna och nya mönster för teamet
