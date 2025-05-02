'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { UserRole } from '@/lib/auth/roleUtils';

// Definiera konstanter för Supabase direkt i komponenten för att undvika problem med miljövariabler
const SUPABASE_URL = 'https://lcckqvnwnrgvpnpavhyp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjY2txdm53bnJndnBucGF2aHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMzIyNzQsImV4cCI6MjA2MTcwODI3NH0.slMq0kzATuFHTX9mtEWiY80aLbSPSMbpzQs15dqg5Us';

interface SignUpFormProps {
  isAdmin?: boolean;
  orgSlug?: string;
}

export default function SignUpForm({ isAdmin = false, orgSlug = '' }: SignUpFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [organizationSlug, setOrganizationSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [initialOrgSlug] = useState(orgSlug);
  const [debug, setDebug] = useState<string | null>(null);
  
  // Om vi har ett orgsSlug från URL, använd det
  useEffect(() => {
    if (initialOrgSlug) {
      setOrganizationSlug(initialOrgSlug);
    }
  }, [initialOrgSlug]);
  
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
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setDebug(null);

    try {
      // Validera formulärdata
      if (password.length < 8) {
        throw new Error('Lösenordet måste vara minst 8 tecken långt');
      }
      
      // Använd den direkt skapade klienten istället för den från lib/supabase
      let supabase;
      try {
        // Logga för felsökning
        console.log('Skapar direkt Supabase-klient med:', 
                  'URL:', SUPABASE_URL, 
                  'Nyckel (första 10 tecken):', SUPABASE_ANON_KEY.substring(0, 10) + '...');
        
        supabase = createDirectSupabaseClient();
        
        // Verifiera att klienten har skapats korrekt
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Kunde inte verifiera Supabase-session:', sessionError);
        } else {
          console.log('Supabase-anslutning fungerande:', sessionData?.session ? 'Aktiv session' : 'Ingen session');
        }
      } catch (error: any) {
        console.error('Kunde inte skapa direkta Supabase-klienten:', error);
        setDebug(JSON.stringify({ error: 'Kunde inte skapa Supabase-klient', details: error }, null, 2));
        throw new Error('Kunde inte ansluta till autentiseringstjänsten. Kontrollera att applikationen är korrekt konfigurerad.');
      }
      
      // Logga innan registreringsförsök
      console.log('Försöker registrera användare med:', 
                'Email:', email, 
                'Namn:', name, 
                'Admin:', isAdmin);
                
      // Registrera användaren
      const signUpResult = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            isAdmin,
            organizationSlug: isAdmin ? organizationSlug : orgSlug,
          },
        },
      });
      
      // Logga resultatet för felsökning
      console.log('Registreringsresultat:', signUpResult);
      
      // Kontrollera för fel
      if (signUpResult.error) {
        setDebug(JSON.stringify(signUpResult, null, 2));
        
        // Översätt vanliga felmeddelanden från Supabase
        if (signUpResult.error.message.includes('Email rate limit')) {
          throw new Error('För många registreringsförsök med denna e-post. Vänta en stund och försök igen.');
        } else if (signUpResult.error.message.includes('User already registered')) {
          throw new Error('En användare med denna e-post finns redan registrerad. Försök logga in istället.');
        } else if (signUpResult.error.message.includes('Invalid API key')) {
          throw new Error('Autentiseringsfel: API-nyckel saknas eller är ogiltig. Kontakta administratören. [' + signUpResult.error.message + ']');
        } else {
          throw new Error(`Registreringsfel: ${signUpResult.error.message}`);
        }
      }

      // Skapa metadata för API anrop
      const userData = {
        email,
        name,
        role: isAdmin ? UserRole.ADMIN : UserRole.MEMBER,
        organizationName: isAdmin ? organizationName : null,
        organizationSlug: isAdmin ? organizationSlug : orgSlug,
      };
      
      // Spara användare och organisation i databasen
      try {
        const response = await fetch('/api/auth/create-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
        
        const responseData = await response.json();
        console.log('API-svar från create-user:', responseData);
        
        if (!response.ok) {
          console.warn('Fel vid skapande av användare i databasen:', responseData);
          // Fortsätt ändå eftersom autentiseringen har skapats
        }
      } catch (error: any) {
        console.error('Fel vid databasregistrering:', error);
        // Fortsätt ändå, eftersom autentiseringen har skapats
      }

      // Kontrollera om vi behöver bekräfta e-postadressen
      if (signUpResult.data?.user?.identities?.length === 0) {
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
      setOrganizationName('');
      setOrganizationSlug('');
      
    } catch (error: any) {
      setErrorMessage(error?.message || 'Ett fel uppstod vid registrering');
      console.error('Registreringsfel:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generera slug från organisationsnamn
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/å/g, 'a')
      .replace(/ä/g, 'a')
      .replace(/ö/g, 'o')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Uppdatera slug när organisationsnamnet ändras (endast för admins)
  const handleOrganizationNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setOrganizationName(name);
    setOrganizationSlug(generateSlug(name));
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
      
      {debug && process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded text-xs">
          <details>
            <summary className="cursor-pointer font-medium">Debug-information (endast utveckling)</summary>
            <pre className="mt-2 whitespace-pre-wrap">{debug}</pre>
          </details>
        </div>
      )}
      
      <form onSubmit={handleSignUp} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Ditt namn
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
        
        <div>
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
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Lösenord
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <p className="mt-1 text-xs text-gray-500">
            Minst 8 tecken
          </p>
        </div>
        
        {isAdmin && (
          <>
            <div>
              <label htmlFor="organizationName" className="block text-sm font-medium mb-1">
                Föreningens namn
              </label>
              <input
                id="organizationName"
                type="text"
                value={organizationName}
                onChange={handleOrganizationNameChange}
                required={isAdmin}
                placeholder="T.ex. BRF Solsidan"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="organizationSlug" className="block text-sm font-medium mb-1">
                Föreningens webbadress
              </label>
              <div className="flex items-center">
                <span className="bg-gray-100 px-3 py-2 rounded-l border border-gray-300 border-r-0 text-gray-500">
                  https://
                </span>
                <input
                  id="organizationSlug"
                  type="text"
                  value={organizationSlug}
                  onChange={(e) => setOrganizationSlug(e.target.value)}
                  required={isAdmin}
                  placeholder="din-forening"
                  className="flex-grow px-3 py-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  disabled={loading}
                />
                <span className="bg-gray-100 px-3 py-2 rounded-r border border-gray-300 border-l-0 text-gray-500">
                  .handbok.se
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Endast små bokstäver (a-z), siffror och bindestreck tillåtna
              </p>
            </div>
          </>
        )}
        
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Registrerar...' : 'Registrera dig'}
        </button>
      </form>
    </div>
  );
} 