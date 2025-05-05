import React from 'react';
import Link from 'next/link';
import { Button } from '@mantine/core';
import { NetworkStatus } from '../SignInFormTypes';

interface LoginFormProps {
  email: string;
  password: string;
  isLoading: boolean;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onProxyLogin: () => void;
  networkStatus: NetworkStatus;
}

/**
 * LoginForm Component
 *
 * Hanterar formuläret för inloggning med e-post och lösenord.
 * Innehåller även alternativ för proxy-inloggning samt glömt lösenord.
 */
export const LoginForm: React.FC<LoginFormProps> = ({
  email,
  password,
  isLoading,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onProxyLogin,
  networkStatus
}) => {
  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      {/* E-post fält */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          E-post
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={onEmailChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="din@epost.se"
          disabled={isLoading}
        />
      </div>

      {/* Lösenord fält */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Lösenord
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={onPasswordChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Ditt lösenord"
          disabled={isLoading}
        />
      </div>

      {/* Inloggningsknapp */}
      <div>
        <button
          type="submit"
          disabled={isLoading || !networkStatus.directSupabase}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Loggar in...' : 'Logga in'}
        </button>
      </div>

      {/* Alternativt inloggningssätt via proxy om direktanslutning inte fungerar */}
      {(!networkStatus.directSupabase && networkStatus.proxySupabase) && (
        <div className="mt-3">
          <Button
            fullWidth
            variant="outline"
            onClick={onProxyLogin}
            disabled={isLoading}
          >
            Logga in via proxy
          </Button>
        </div>
      )}

      {/* Glömt lösenord länk */}
      <div className="text-sm text-center">
        <Link href="/forgot-password" className="text-blue-600 hover:underline">
          Glömt lösenord?
        </Link>
      </div>
    </form>
  );
};
