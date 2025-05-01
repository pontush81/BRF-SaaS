'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function CreateOrganizationPage() {
  const [organizationName, setOrganizationName] = useState('');
  const [slug, setSlug] = useState('');
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const { currentUser } = useAuth();

  // Hjälpfunktion för att skapa en slug från organisationens namn
  const generateSlug = (name: string) => {
    return name
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')     // Ersätt mellanslag med -
      .replace(/å/g, 'a')       // Ersätt svenska tecken
      .replace(/ä/g, 'a')
      .replace(/ö/g, 'o')
      .replace(/[^\w-]+/g, '')  // Ta bort icke-ord tecken
      .replace(/--+/g, '-');    // Ersätt flera - med en
  };

  // Uppdatera slug när organisationens namn ändras
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setOrganizationName(name);
    setSlug(generateSlug(name));
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!currentUser) {
      setError('Du måste vara inloggad för att skapa en organisation');
      setLoading(false);
      return;
    }

    if (!organizationName) {
      setError('Organisationens namn är obligatoriskt');
      setLoading(false);
      return;
    }

    try {
      // Hämta token för autentisering
      const token = await currentUser.getIdToken();

      // Skicka API-anrop för att skapa organisation
      const response = await fetch('/api/organization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: organizationName,
          slug,
          domain: domain || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Något gick fel vid skapande av organisation');
      }

      setSuccess(`Organisation skapad! Du kan nu besöka: ${slug}.handbok.se`);
      
      // Omdirigera efter 2 sekunder
      setTimeout(() => {
        router.push(`/dashboard/organizations/${data.organization.id}`);
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Något gick fel vid skapande av organisation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Skapa en ny organisation</h1>
      
      <form onSubmit={handleCreateOrganization} className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-6">
          <label htmlFor="organizationName" className="block text-gray-700 text-sm font-semibold mb-2">
            Organisationens namn *
          </label>
          <input
            id="organizationName"
            type="text"
            className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={organizationName}
            onChange={handleNameChange}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Detta är namnet på din organisation (t.ex. "Brf Gulmåran")
          </p>
        </div>

        <div className="mb-6">
          <label htmlFor="slug" className="block text-gray-700 text-sm font-semibold mb-2">
            Slug / Subdomän
          </label>
          <div className="flex items-center">
            <input
              id="slug"
              type="text"
              className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
            <span className="ml-2 text-gray-600">.handbok.se</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Detta kommer att vara din organisations unika URL
          </p>
        </div>

        <div className="mb-6">
          <label htmlFor="domain" className="block text-gray-700 text-sm font-semibold mb-2">
            Egen domän (valfritt)
          </label>
          <input
            id="domain"
            type="text"
            className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="t.ex. handbok.dinförening.se"
          />
          <p className="text-xs text-gray-500 mt-1">
            Om du vill använda en egen domän kan du ange den här
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 rounded text-red-700 text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-3 bg-green-50 rounded text-green-700 text-sm">
            {success}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
          >
            {loading ? 'Skapar...' : 'Skapa organisation'}
          </button>
        </div>
      </form>
    </div>
  );
} 