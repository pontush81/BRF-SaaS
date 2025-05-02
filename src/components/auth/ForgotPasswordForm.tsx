'use client';

import { useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const supabase = createBrowserSupabaseClient();
      
      // URL för återställning, denna sida måste hantera "?token=" parametern
      const resetPasswordURL = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetPasswordURL,
      });

      if (error) {
        throw error;
      }

      setSuccessMessage(
        'Instruktioner för att återställa ditt lösenord har skickats till din e-post.'
      );
      setEmail('');
    } catch (error: any) {
      setErrorMessage(error?.message || 'Ett fel uppstod vid återställning av lösenord');
      console.error('Lösenordsåterställningsfel:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Återställ lösenord</h2>
      
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
      
      <form onSubmit={handleResetPassword}>
        <div className="mb-6">
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
          <p className="mt-1 text-xs text-gray-500">
            Ange din e-postadress så skickar vi instruktioner för att återställa ditt lösenord.
          </p>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Skickar...' : 'Skicka återställningslänk'}
        </button>
      </form>
      
      <div className="mt-6 border-t pt-4">
        <p className="text-sm text-center">
          Kom du ihåg ditt lösenord?{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            Logga in
          </a>
        </p>
      </div>
    </div>
  );
} 