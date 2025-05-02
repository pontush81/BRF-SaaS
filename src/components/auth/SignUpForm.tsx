'use client';

import { useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { UserRole } from '@/lib/auth/roleUtils';

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
  
  // Om vi har ett orgsSlug från URL, använd det
  useState(() => {
    if (orgSlug) {
      setOrganizationSlug(orgSlug);
    }
  });
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const supabase = createBrowserSupabaseClient();
      
      // Registrera användaren
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            isAdmin, // Spara användarroll i metadata
            organizationSlug: isAdmin ? organizationSlug : orgSlug,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
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
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Kunde inte skapa användare i databasen');
        }
      } catch (error: any) {
        console.error('Fel vid databasregistrering:', error);
        // Fortsätt ändå, eftersom autentiseringen har skapats
      }

      // Kontrollera om vi behöver bekräfta e-postadressen
      if (data?.user?.identities?.length === 0) {
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <span className="bg-gray-100 px-3 py-2 rounded-r border border-gray-300 border-l-0 text-gray-500">
                  .handbok.se
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Detta blir din förenings adress för handboken
              </p>
            </div>
          </>
        )}
        
        {!isAdmin && orgSlug && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Förening
            </label>
            <div className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded text-gray-700">
              {orgSlug}.handbok.se
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Du registreras som medlem i denna förening
            </p>
          </div>
        )}
        
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
            minLength={6}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <p className="mt-1 text-xs text-gray-500">
            Minst 6 tecken långt
          </p>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Skapar konto...' : 'Skapa konto'}
        </button>
      </form>
    </div>
  );
} 