'use client';

import { useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase';

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Inloggningen lyckades, omdirigera eller uppdatera UI
      setSuccessMessage('Inloggningen lyckades! Omdirigerar...');
      // Omdirigera till dashboard eller annan sida
      window.location.href = '/dashboard';
    } catch (error: any) {
      setErrorMessage(error?.message || 'Ett fel uppstod vid inloggning');
      console.error('Inloggningsfel:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Logga in</h2>
      
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
      
      <form onSubmit={handleSignIn}>
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
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Loggar in...' : 'Logga in'}
        </button>
      </form>
      
      <div className="mt-4 text-sm text-center">
        <a href="/forgot-password" className="text-blue-600 hover:underline">
          Glömt lösenord?
        </a>
      </div>
      
      <div className="mt-6 border-t pt-4">
        <p className="text-sm text-center">
          Har du inget konto?{' '}
          <a href="/register" className="text-blue-600 hover:underline">
            Registrera dig
          </a>
        </p>
      </div>
    </div>
  );
} 