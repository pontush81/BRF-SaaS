'use client';

import { useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase';

export default function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const supabase = createBrowserSupabaseClient();
      
      // Registrera användaren
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name, // Spara användarens namn i user_metadata
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      // Kontrollera om vi behöver bekräfta e-postadressen
      if (data?.user?.identities?.length === 0) {
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
    } catch (error: any) {
      setErrorMessage(error?.message || 'Ett fel uppstod vid registrering');
      console.error('Registreringsfel:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Registrera konto</h2>
      
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
      
      <form onSubmit={handleSignUp}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Namn
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            E-post
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Lösenord
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <p className="mt-1 text-xs text-gray-500">
            Minst 6 tecken långt
          </p>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Skapar konto...' : 'Skapa konto'}
        </button>
      </form>
      
      <div className="mt-6 border-t pt-4">
        <p className="text-sm text-center">
          Har du redan ett konto?{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            Logga in
          </a>
        </p>
      </div>
    </div>
  );
} 