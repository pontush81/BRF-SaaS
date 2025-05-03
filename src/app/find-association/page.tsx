'use client';

import { useState } from 'react';
import Link from 'next/link';

// Define the organization type
interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export default function FindAssociationPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [associations, setAssociations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noResults, setNoResults] = useState(false);

  const searchAssociations = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm || searchTerm.length < 2) {
      setError('Sökfrågan måste vara minst 2 tecken');
      return;
    }

    setLoading(true);
    setError(null);
    setNoResults(false);
    
    try {
      const response = await fetch(`/api/organizations/search?query=${encodeURIComponent(searchTerm)}`);
      
      if (!response.ok) {
        throw new Error('Något gick fel vid sökningen');
      }
      
      const data = await response.json();
      
      setAssociations(data);
      setNoResults(data.length === 0);
    } catch (err) {
      setError('Kunde inte söka efter föreningar. Försök igen senare.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const goToAssociation = (slug: string) => {
    // Get current hostname and adapt for local vs production
    const hostname = window.location.hostname;
    let baseUrl;
    
    if (hostname === 'localhost') {
      baseUrl = `http://${slug}.localhost:3000`;
    } else {
      // Extract domain without subdomain
      const parts = hostname.split('.');
      const domain = parts.length > 1 ? parts.slice(parts.length - 2).join('.') : hostname;
      baseUrl = `https://${slug}.${domain}`;
    }
    
    window.location.href = `${baseUrl}/login`;
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold text-center mb-8">Hitta din förening</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Sök efter din bostadsrättsförening</h2>
        <p className="mb-6 text-gray-600">
          Ange namnet på din bostadsrättsförening för att hitta rätt webbadress för inloggning.
        </p>
        
        <form onSubmit={searchAssociations} className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="T.ex. BRF Solsidan"
              className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Sök efter bostadsrättsförening"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md font-medium disabled:bg-blue-400"
            >
              {loading ? 'Söker...' : 'Sök'}
            </button>
          </div>
        </form>
        
        {error && (
          <div className="p-4 mb-6 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {noResults && (
          <div className="p-4 mb-6 bg-yellow-100 text-yellow-800 rounded-md">
            Inga föreningar hittades. Försök med en annan sökfråga eller kontakta din förening.
          </div>
        )}
        
        {associations.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Hittade föreningar:</h3>
            <ul className="divide-y divide-gray-200">
              {associations.map((association) => (
                <li key={association.id} className="py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div>
                      <h4 className="font-medium">{association.name}</h4>
                      <p className="text-sm text-gray-500">Webbadress: {association.slug}.handbok.se</p>
                    </div>
                    <button
                      onClick={() => goToAssociation(association.slug)}
                      className="mt-2 sm:mt-0 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm font-medium"
                    >
                      Gå till föreningen
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="bg-gray-100 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Är du administratör?</h2>
        <p className="mb-4 text-gray-600">
          Om du är administratör och behöver registrera din förening, kan du göra det här:
        </p>
        <Link 
          href="/register?type=admin" 
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium"
        >
          Registrera förening
        </Link>
      </div>
    </div>
  );
} 