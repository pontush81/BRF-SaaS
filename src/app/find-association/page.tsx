'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function FindAssociationPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [associations, setAssociations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const searchAssociations = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    if (!searchTerm || searchTerm.length < 2) {
      setErrorMessage('Var vänlig ange minst 2 tecken för att söka.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/organizations/search?query=${encodeURIComponent(searchTerm)}`);
      
      if (!response.ok) {
        throw new Error('Kunde inte söka efter föreningar');
      }
      
      const data = await response.json();
      setAssociations(data);
      
      if (data.length === 0) {
        setErrorMessage('Inga föreningar hittades. Prova ett annat sökord eller kontakta din förening.');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Ett fel uppstod vid sökningen');
      console.error('Sökfel:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToAssociation = (slug: string) => {
    const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'handbok.se';
    
    // I utveckling behöver vi hantera localhost
    const domain = window.location.hostname === 'localhost' 
      ? `${slug}.${appDomain}.localhost:${window.location.port}` 
      : `${slug}.${appDomain}`;
      
    window.location.href = window.location.protocol + '//' + domain;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Hitta din förening</h1>
          <p className="text-gray-600">
            Sök efter din bostadsrättsförening för att komma till rätt inloggningssida
          </p>
        </div>
        
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {errorMessage}
          </div>
        )}
        
        <form onSubmit={searchAssociations} className="mb-6">
          <div className="mb-4">
            <label htmlFor="search" className="block text-sm font-medium mb-1">
              Sök efter föreningens namn
            </label>
            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="T.ex. BRF Solsidan"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Söker...' : 'Sök förening'}
          </button>
        </form>
        
        {associations.length > 0 && (
          <div className="border-t pt-4">
            <h2 className="text-lg font-medium mb-3">Hittade föreningar</h2>
            <ul className="divide-y">
              {associations.map((assoc) => (
                <li key={assoc.id} className="py-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{assoc.name}</p>
                      <p className="text-sm text-gray-500">{assoc.slug}.handbok.se</p>
                    </div>
                    <button
                      onClick={() => goToAssociation(assoc.slug)}
                      className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 text-sm"
                    >
                      Gå till förening
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Är du administratör för en förening? {' '}
            <Link href="/register?type=admin" className="text-blue-600 hover:underline">
              Registrera din förening här
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 