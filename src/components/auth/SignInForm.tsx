'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Definiera konstanter för Supabase direkt i komponenten för att undvika problem med miljövariabler
const SUPABASE_URL = 'https://lcckqvnwnrgvpnpavhyp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjY2txdm53bnJndnBucGF2aHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMzIyNzQsImV4cCI6MjA2MTcwODI3NH0.slMq0kzATuFHTX9mtEWiY80aLbSPSMbpzQs15dqg5Us';

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Hämta redirect-parametern från URL
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  // Skapa en egen Supabase-klient direkt i komponenten
  const createDirectSupabaseClient = () => {
    try {
      return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: 'supabase.auth.token',
        }
      });
    } catch (error) {
      console.error('Kunde inte skapa direkt Supabase-klient:', error);
      throw error;
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Använd den direkt skapade klienten
      let supabase;
      try {
        console.log('Skapar direkt Supabase-klient för inloggning...');
        supabase = createDirectSupabaseClient();
      } catch (error: any) {
        console.error('Kunde inte skapa Supabase-klient:', error);
        throw new Error('Kunde inte ansluta till autentiseringstjänsten. Kontrollera att applikationen är korrekt konfigurerad.');
      }
      
      console.log('Försöker logga in användare med e-post:', email);
      const signInResult = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInResult.error) {
        console.error('Inloggningsfel från Supabase:', signInResult.error);
        
        // Översätt vanliga felmeddelanden från Supabase
        if (signInResult.error.message.includes('Invalid login credentials')) {
          throw new Error('Felaktigt användarnamn eller lösenord');
        } else if (signInResult.error.message.includes('Email not confirmed')) {
          throw new Error('E-postadressen har inte bekräftats. Kontrollera din inkorg och bekräfta din e-post först.');
        } else if (signInResult.error.message.includes('Invalid API key')) {
          throw new Error('Autentiseringsfel: API-nyckel saknas eller är ogiltig. Kontakta administratören.');
        } else {
          throw new Error(`Inloggningsfel: ${signInResult.error.message}`);
        }
      }

      console.log('Inloggning lyckades!');
      // Inloggningen lyckades, omdirigera eller uppdatera UI
      setSuccessMessage('Inloggningen lyckades! Omdirigerar...');
      
      // Omdirigera till dashboard eller annan sida efter en kort fördröjning
      setTimeout(() => {
        window.location.href = redirectPath;
      }, 1000);
      
    } catch (error: any) {
      setErrorMessage(error?.message || 'Ett fel uppstod vid inloggning');
      console.error('Inloggningsfel:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
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
        <Link href="/forgot-password" className="text-blue-600 hover:underline">
          Glömt lösenord?
        </Link>
      </div>
    </div>
  );
} 