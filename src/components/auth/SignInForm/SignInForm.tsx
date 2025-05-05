import React from 'react';
import { SignInFormProps } from './SignInFormTypes';
import { useSignInFormState } from './useSignInFormState';

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

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    handleSignInFn(
      email,
      password,
      setIsLoading,
      setErrorMessage,
      router,
      redirectPath,
      setUser
    );
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
