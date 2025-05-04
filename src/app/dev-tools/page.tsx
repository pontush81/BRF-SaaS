'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { isMockModeEnabled, enableMockMode, disableMockMode } from '@/lib/mock-control';
import { getEnvironment, Environment } from '@/lib/env';

export default function DevTools() {
  const [mockAuthEnabled, setMockAuthEnabled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [cookieSet, setCookieSet] = useState(false);
  const [dbConnectionStatus, setDbConnectionStatus] = useState<'unknown' | 'connected' | 'failed'>('unknown');
  const [mockModeEnabled, setMockModeEnabled] = useState(false);

  // Kontrollera om vi är i utvecklingsmiljö
  const isDevelopment = getEnvironment() === Environment.DEVELOPMENT;

  useEffect(() => {
    if (!isDevelopment) {
      // Om vi inte är i utvecklingsmiljö, visa en varning
      console.error('Dev Tools page should only be accessed in development environment');
      return;
    }

    // Kontrollera om mock auth är aktiverad
    if (typeof window !== 'undefined') {
      setMockAuthEnabled(!!window.__mockAuthEnabled);
      setIsLoggedIn(!!window.__mockUser);
      setUserInfo(window.__mockUser);
      
      // Kontrollera om dev-cookie är satt
      const hasCookie = document.cookie.includes('supabase-dev-auth=true');
      setCookieSet(hasCookie);
      
      // Kontrollera om mock mode är aktiverad
      setMockModeEnabled(isMockModeEnabled());
    }
    
    // Testa databasanslutning
    async function checkDbConnection() {
      try {
        const response = await fetch('/api/dev/check-db-connection');
        const data = await response.json();
        setDbConnectionStatus(data.connected ? 'connected' : 'failed');
      } catch (error) {
        console.error('Failed to check DB connection:', error);
        setDbConnectionStatus('failed');
      }
    }
    
    checkDbConnection();
  }, [isDevelopment]);

  // Aktivera/inaktivera mock-läge globalt
  const toggleMockMode = () => {
    if (mockModeEnabled) {
      disableMockMode();
      setMockModeEnabled(false);
    } else {
      enableMockMode();
      setMockModeEnabled(true);
    }
  };

  // Aktivera mock-autentisering på server-sidan
  const setServerAuthCookie = () => {
    // Sätt en cookie som servern kommer att läsa för att simulera autentisering
    document.cookie = 'supabase-dev-auth=true; path=/';
    setCookieSet(true);
  };

  // Ta bort server-auth-cookie
  const removeServerAuthCookie = () => {
    document.cookie = 'supabase-dev-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    setCookieSet(false);
  };

  // Skapa en mock-användare på klientsidan
  const mockClientLogin = () => {
    if (typeof window !== 'undefined' && window.__mockAuthEnabled) {
      window.__mockUser = {
        id: '12345-mock-user-id',
        email: 'dev@example.com',
        app_metadata: {},
        user_metadata: { name: 'Utvecklaren' },
        aud: 'authenticated',
        created_at: new Date().toISOString()
      };
      setIsLoggedIn(true);
      setUserInfo(window.__mockUser);
    }
  };

  // Logga ut mock-användaren på klientsidan
  const mockClientLogout = () => {
    if (typeof window !== 'undefined') {
      window.__mockUser = null;
      setIsLoggedIn(false);
      setUserInfo(null);
    }
  };
  
  // Återställ lokal databas
  const resetDatabase = async () => {
    if (confirm('Detta kommer att återställa din lokala databas och fylla den med testdata. Är du säker?')) {
      try {
        const response = await fetch('/api/dev/reset-database', {
          method: 'POST',
        });
        const data = await response.json();
        alert(data.success ? 'Databas återställd!' : 'Fel vid återställning av databas');
      } catch (error) {
        console.error('Failed to reset database:', error);
        alert('Ett fel uppstod vid återställning av databasen');
      }
    }
  };

  if (!isDevelopment) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Dev Tools</h1>
        <div className="bg-red-100 p-4 rounded-md text-red-700">
          <p>Denna sida är endast tillgänglig i utvecklingsmiljö.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Utvecklarverktyg</h1>
      
      <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 mb-8">
        <h2 className="text-lg font-semibold mb-2">⚠️ Endast för utvecklingsmiljö</h2>
        <p>Dessa verktyg är endast avsedda för utveckling och testsyften.</p>
      </div>
      
      {/* Globalt mock-läge */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border">
        <h2 className="text-xl font-semibold mb-3">Mock-läge</h2>
        <div className="flex items-center mb-4">
          <div className={`w-4 h-4 rounded-full mr-2 ${mockModeEnabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <span>Globalt mock-läge är <strong>{mockModeEnabled ? 'aktiverat' : 'inaktiverat'}</strong></span>
        </div>
        <button 
          onClick={toggleMockMode}
          className={`px-4 py-2 rounded-md font-medium ${
            mockModeEnabled 
              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
        >
          {mockModeEnabled ? 'Inaktivera' : 'Aktivera'} mock-läge
        </button>
        <p className="mt-3 text-sm text-gray-600">
          Detta styr om applikationen ska använda mockad data eller ansluta till riktiga API:er.
        </p>
      </div>
      
      {/* Databasanslutning */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border">
        <h2 className="text-xl font-semibold mb-3">Databas</h2>
        <div className="flex items-center mb-4">
          <div className={`w-4 h-4 rounded-full mr-2 ${
            dbConnectionStatus === 'connected' ? 'bg-green-500' : 
            dbConnectionStatus === 'failed' ? 'bg-red-500' : 'bg-gray-300'
          }`}></div>
          <span>Databasanslutning: <strong>
            {dbConnectionStatus === 'connected' ? 'Ansluten' : 
             dbConnectionStatus === 'failed' ? 'Misslyckades' : 'Kontrollerar...'}
          </strong></span>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={resetDatabase}
            className="px-4 py-2 bg-amber-100 text-amber-700 rounded-md hover:bg-amber-200 font-medium"
          >
            Återställ lokal databas
          </button>
        </div>
        <p className="mt-3 text-sm text-gray-600">
          Detta kommer att återställa din lokala databas och fylla den med testdata.
        </p>
      </div>
      
      {/* Autentisering */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border">
        <h2 className="text-xl font-semibold mb-3">Autentisering</h2>
        
        {/* Klientautentisering */}
        <h3 className="font-medium mb-2">Klientsidans autentisering</h3>
        <div className="flex items-center mb-4">
          <div className={`w-4 h-4 rounded-full mr-2 ${isLoggedIn ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <span>Inloggad på klientsidan: <strong>{isLoggedIn ? 'Ja' : 'Nej'}</strong></span>
        </div>
        <div className="flex space-x-3 mb-6">
          {!isLoggedIn ? (
            <button 
              onClick={mockClientLogin} 
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 font-medium"
              disabled={!mockAuthEnabled}
            >
              Simulera inloggning
            </button>
          ) : (
            <button 
              onClick={mockClientLogout}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 font-medium"
            >
              Simulera utloggning
            </button>
          )}
        </div>
        
        {/* Serverautentisering */}
        <h3 className="font-medium mb-2">Serversidans autentisering</h3>
        <div className="flex items-center mb-4">
          <div className={`w-4 h-4 rounded-full mr-2 ${cookieSet ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <span>Auth-cookie aktiv: <strong>{cookieSet ? 'Ja' : 'Nej'}</strong></span>
        </div>
        <div className="flex space-x-3">
          {!cookieSet ? (
            <button 
              onClick={setServerAuthCookie}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 font-medium"
            >
              Sätt auth-cookie
            </button>
          ) : (
            <button 
              onClick={removeServerAuthCookie}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 font-medium"
            >
              Ta bort auth-cookie
            </button>
          )}
        </div>
      </div>
      
      {/* User Info */}
      {userInfo && (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border">
          <h2 className="text-xl font-semibold mb-3">Användarinfo</h2>
          <pre className="bg-gray-50 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(userInfo, null, 2)}
          </pre>
        </div>
      )}
      
      {/* Länkar */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-3">Verktyg</h2>
        <ul className="space-y-2">
          <li>
            <Link href="/" className="text-blue-600 hover:underline">
              ← Tillbaka till hemsidan
            </Link>
          </li>
          <li>
            <a 
              href="http://localhost:5555" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Prisma Studio (om igång)
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
} 