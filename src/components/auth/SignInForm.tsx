'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Alert } from '@mantine/core';
import { IconAlertCircle, IconBug } from '@tabler/icons-react';
import { useSignIn } from '@/hooks/useSignIn';
import { checkSupabaseCookies } from '@/utils/network-diagnostics';
import NetworkDiagnosticPanel from '@/components/diagnostics/NetworkDiagnosticPanel';

export default function SignInForm() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    errorMessage,
    networkStatus,
    handleSignIn,
  } = useSignIn();

  const formRef = useRef<HTMLFormElement>(null);
  const searchParams = useSearchParams();

  // Kontrollera efter URL-error parameter
  useEffect(() => {
    // Säkerhetscheck för testmiljö där searchParams kan vara null
    if (!searchParams) return;

    const error = searchParams.get('error');
    if (error === 'unexpected') {
      console.error('Unexpected error detected in URL parameters');
    } else if (error === 'auth-check-failed') {
      console.error('Auth check failed detected in URL parameters');
    } else if (error) {
      console.error(`Login error detected in URL: ${error}`);
    }
  }, [searchParams]);

  // Logga miljövariabler vid laddning
  useEffect(() => {
    // Visa Supabase-URL (men maskera den delvis av säkerhetsskäl)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    if (url) {
      console.log('Supabase URL:', url.substring(0, 20) + '...');

      try {
        const urlObject = new URL(url);
        console.log('URL-delar:', {
          protocol: urlObject.protocol,
          hostname: urlObject.hostname,
          projectRef: urlObject.hostname.split('.')[0],
        });
      } catch (e) {
        console.error('Kunde inte parsa URL:', e);
      }
    } else {
      console.error('NEXT_PUBLIC_SUPABASE_URL saknas');
    }

    console.log('Environment:', process.env.NODE_ENV);
    console.log('User Agent:', navigator.userAgent);
    console.log('Vercel URL:', process.env.NEXT_PUBLIC_VERCEL_URL || 'N/A');
  }, []);

  // Test för att se om det finns några Supabase-cookies redan vid laddning
  useEffect(() => {
    checkSupabaseCookies();
  }, []);

  return (
    <div className="w-full mt-8" data-testid="sign-in-form">
      <form
        className="space-y-4"
        ref={formRef}
        onSubmit={handleSignIn}
        method="post"
      >
        <h2 className="text-2xl font-bold mb-6">Sign In</h2>

        <NetworkDiagnosticPanel networkStatus={networkStatus} />

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            E-post
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="din@epost.se"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Lösenord
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Ditt lösenord"
          />
        </div>

        {/* Visa nätverksstatus */}
        {(!networkStatus.directSupabase || !networkStatus.proxySupabase) && (
          <Alert
            color="yellow"
            title="Anslutningsproblem"
            icon={<IconAlertCircle size={16} />}
          >
            <div className="text-sm">
              {networkStatus.error && (
                <p className="font-medium">{networkStatus.error}</p>
              )}
              <p>
                Statusuppdatering: Supabase-servern är
                {networkStatus.proxySupabase
                  ? ' nåbar via proxy.'
                  : ' inte nåbar. Detta kan orsaka inloggningsproblem.'}
              </p>
            </div>
          </Alert>
        )}

        {/* Felmeddelande */}
        {errorMessage && !networkStatus.checking && (
          <Alert
            color="red"
            title="Inloggning misslyckades"
            icon={<IconAlertCircle size={16} />}
          >
            {errorMessage}
          </Alert>
        )}

        <div>
          <button
            type="submit"
            disabled={isLoading || !networkStatus.directSupabase}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? (
              <span data-testid="loading-spinner">Loggar in...</span>
            ) : (
              'Logga in'
            )}
          </button>
        </div>

        <div className="text-sm text-center">
          <Link
            href="/forgot-password"
            className="text-blue-600 hover:underline"
          >
            Glömt lösenord?
          </Link>
        </div>
      </form>
    </div>
  );
}
