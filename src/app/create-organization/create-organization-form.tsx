'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateOrganizationForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [domain, setDomain] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Generera slug från namn
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/å/g, 'a')
      .replace(/ä/g, 'a')
      .replace(/ö/g, 'o')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    
    // Automatiskt generera slug om användaren inte redigerat sluggen själv
    if (!slug || slug === generateSlug(name)) {
      setSlug(generateSlug(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      // Validera fält
      if (!name) {
        throw new Error('Namn är obligatoriskt');
      }
      
      if (!slug) {
        throw new Error('Slug är obligatoriskt');
      }
      
      // Förbered data för API-anrop
      const formData = {
        name,
        slug,
        domain: domain || null
      };
      
      // Skapa organisationen via API
      const response = await fetch('/api/organization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      // Hantera respons
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Något gick fel. Försök igen.');
      }
      
      const data = await response.json();
      
      // Visa framgångsmeddelande och dirigera om
      setSuccess(true);
      
      // Omdirigera till den nya organisationens sida efter 2 sekunder
      setTimeout(() => {
        router.push(`/${data.slug}`);
      }, 2000);
      
    } catch (error) {
      console.error('Error creating organization:', error);
      setError(error instanceof Error ? error.message : 'Något gick fel');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-md">
          Föreningen skapades framgångsrikt! Du kommer att omdirigeras.
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Föreningens namn *
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={handleNameChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="t.ex. Bostadsrättsföreningen Exempel"
            disabled={isSubmitting || success}
            required
          />
        </div>
        
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
            Slug / subdomän *
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              https://
            </span>
            <input
              type="text"
              name="slug"
              id="slug"
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="din-forening"
              required
              pattern="^[a-z0-9]+(-[a-z0-9]+)*$"
              title="Använd endast små bokstäver, siffror och bindestreck. Bindestreck kan inte vara i början eller slutet."
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              .handbok.org
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Detta blir er unika URL för handboken
          </p>
        </div>
        
        <div>
          <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-1">
            Anpassad domän (valfritt)
          </label>
          <input
            id="domain"
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="t.ex. handbok.minforening.se"
            disabled={isSubmitting || success}
          />
          <p className="mt-1 text-sm text-gray-500">
            Lämna tomt om ni endast vill använda subdomänen
          </p>
        </div>
      </div>
      
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting || success}
          className={`w-full py-3 px-4 rounded-md font-medium text-white ${
            isSubmitting || success
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Skapar förening...' : 'Skapa förening'}
        </button>
      </div>
      
      <div className="text-sm text-gray-500 mt-4">
        <p>* Obligatoriska fält</p>
      </div>
    </form>
  );
} 