'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase';

export default function AuthTest() {
  const [status, setStatus] = useState('Testar anslutning...');
  const [details, setDetails] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [url, setUrl] = useState('');
  
  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createBrowserSupabaseClient();
        
        // Försök hämta autentiseringsstatus
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setStatus('Fel vid anslutning till Supabase');
          setDetails(JSON.stringify(error, null, 2));
          return;
        }
        
        setStatus('Anslutning lyckades!');
        setDetails(`Session: ${data.session ? 'Aktiv' : 'Ingen aktiv session'}`);
        
        // Hämta API-inställningar
        const config = (supabase as any).supabaseUrl;
        const key = (supabase as any).supabaseKey;
        
        setUrl(config || 'Kunde inte hämta URL');
        setApiKey(key ? `${key.substring(0, 15)}...` : 'Kunde inte hämta nyckel');
        
      } catch (error) {
        setStatus('Exception vid anslutning till Supabase');
        setDetails(JSON.stringify(error, null, 2));
      }
    }
    
    checkAuth();
  }, []);
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Supabase Anslutningstest</h1>
      
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Status: {status}</h2>
        {details && (
          <pre className="bg-gray-100 p-3 rounded overflow-auto">
            {details}
          </pre>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded">
          <h3 className="font-medium mb-2">Supabase URL</h3>
          <p className="break-all">{url || 'Laddas...'}</p>
        </div>
        
        <div className="p-4 border rounded">
          <h3 className="font-medium mb-2">API-nyckel (dold)</h3>
          <p>{apiKey || 'Laddas...'}</p>
        </div>
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Manuell implementering</h3>
        <p className="mb-2">Om testet misslyckas kan du prova att:</p>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Kontrollera projektets status i Supabase-dashboarden</li>
          <li>Verifiera att API-nycklarna är korrekta i .env.local</li>
          <li>Uppdatera till de senaste versionerna av Supabase-paketen</li>
          <li>Kontrollera CORS-inställningarna i Supabase-projektet</li>
        </ol>
      </div>
    </div>
  );
} 