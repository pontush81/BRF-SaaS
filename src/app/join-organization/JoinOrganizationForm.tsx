'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function JoinOrganizationForm() {
  const { dbUser, refreshSession } = useAuth();
  const [orgSlug, setOrgSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!dbUser?.id) {
      setError('Du måste vara inloggad för att gå med i en förening');
      setLoading(false);
      return;
    }

    if (!orgSlug.trim()) {
      setError('Var god ange en förening');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/organizations/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: dbUser.id,
          organizationSlug: orgSlug.trim().toLowerCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ett fel uppstod');
      }

      setSuccess('Du har anslutit dig till föreningen! Omdirigerar...');
      
      // Uppdatera användarinformation
      await refreshSession();
      
      // Vänta en stund och omdirigera till dashboard
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 2000);

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ett oväntat fel uppstod');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 p-3 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="orgSlug" className="block text-sm font-medium text-gray-700 mb-1">
            Föreningens webbadress
          </label>
          <div className="flex items-center">
            <span className="bg-gray-100 px-3 py-2 rounded-l border border-gray-300 border-r-0 text-gray-500">
              https://
            </span>
            <input
              id="orgSlug"
              type="text"
              value={orgSlug}
              onChange={(e) => setOrgSlug(e.target.value)}
              placeholder="din-forening"
              className="flex-1 px-3 py-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 block sm:text-sm rounded-none"
              disabled={loading}
            />
            <span className="bg-gray-100 px-3 py-2 rounded-r border border-gray-300 border-l-0 text-gray-500">
              .handbok.se
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Exempel: om din förening har adressen minbrf.handbok.se, ange "minbrf"
          </p>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Ansluter...' : 'Anslut till föreningen'}
        </button>
      </form>
    </div>
  );
} 