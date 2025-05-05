import React from 'react';
import { SignInFormProps } from './SignInFormTypes';
import { useSignInFormState } from './useSignInFormState';
import { signInWithSupabase } from './utils/authUtils';
import { createBrowserClient } from '@/supabase-client';

// Import sub-components
import {
  NetworkStatusCheck,
  ErrorMessage,
  LoginForm,
  DebugToggle,
} from './components';

// Import handlers
import {
  handleSignIn as handleSignInFn,
  handleProxyLogin,
} from './handlers/signInHandlers';

/**
 * SignInForm Component
 *
 * Komponenten har delats upp i mindre komponenter för bättre underhållbarhet.
 * Logiken har flyttats till hooks och handlers.
 */
export const SignInForm: React.FC<SignInFormProps> = () => {
  // Använd custom hook för tillståndshantering
  const {
    isLoading,
    setIsLoading,
    email,
    setEmail,
    password,
    setPassword,
    errorMessage,
    setErrorMessage,
    networkStatus,
    debugMode,
    diagnosticInfo,
    setUser,
    router,
    redirectPath,
    toggleDebugMode,
  } = useSignInFormState();

  // Event handlers
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Initialize Supabase client
      const supabase = createBrowserClient();

      // Attempt to sign in
      const result = await signInWithSupabase(
        supabase,
        email,
        password
      );

      if (!result.success) {
        setErrorMessage(result.message || 'Inloggningen misslyckades av okänd anledning');
        setIsLoading(false);
        return;
      }

      // Success! Get session and user info
      if (!result.session) {
        setErrorMessage('Sessionen kunde inte skapas');
        setIsLoading(false);
        return;
      }

      // Redirect or handle successful login
      console.log('Inloggningen lyckades', result);

      // Force a reload to ensure the session is properly established
      window.location.href = '/';

    } catch (e) {
      console.error('Oväntat fel vid inloggning:', e);
      setErrorMessage(e instanceof Error ? e.message : 'Ett oväntat fel inträffade');
      setIsLoading(false);
    }
  };

  const handleProxyBasedLogin = () => {
    handleProxyLogin(
      email,
      password,
      setIsLoading,
      setErrorMessage,
      router,
      redirectPath,
      setUser
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Logga in på ditt konto
          </h2>
        </div>

        {/* Visa nätverksstatus och felmeddelanden */}
        <NetworkStatusCheck
          networkStatus={networkStatus}
          debugMode={debugMode}
          diagnosticInfo={diagnosticInfo}
          onRetry={() => {
            setErrorMessage(null);
            // Try proxy login by default if we've detected problems
            // with direct connection but proxy might work
            if (!networkStatus.directSupabase && networkStatus.proxySupabase) {
              handleProxyBasedLogin();
            } else {
              handleSignIn({ preventDefault: () => {} } as React.FormEvent);
            }
          }}
        />

        <ErrorMessage message={errorMessage} />

        {/* Inloggningsformulär */}
        <LoginForm
          email={email}
          password={password}
          isLoading={isLoading}
          onEmailChange={handleEmailChange}
          onPasswordChange={handlePasswordChange}
          onSubmit={handleSignIn}
          onProxyLogin={handleProxyBasedLogin}
          networkStatus={networkStatus}
        />

        {/* Debug-knapp */}
        <DebugToggle debugMode={debugMode} onToggle={toggleDebugMode} />
      </div>
    </div>
  );
};
