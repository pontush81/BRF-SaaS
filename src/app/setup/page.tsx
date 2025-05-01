'use client';

import React, { useState } from 'react';
import Link from 'next/link';

type Status = 'idle' | 'loading' | 'success' | 'error';
type StatusData = { message: string; error?: string };

export default function SetupPage() {
  const [dbStatus, setDbStatus] = useState<Status>('idle');
  const [dbMessage, setDbMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  async function checkDatabase() {
    setDbStatus('loading');
    try {
      const response = await fetch('/api/db-check');
      const data = await response.json();
      
      if (response.ok) {
        setDbStatus('success');
        setDbMessage(data.message || 'Databasanslutningen fungerar!');
      } else {
        setDbStatus('error');
        setError(data.error || 'Ett fel uppstod vid kontroll av databasen');
      }
    } catch (err) {
      setDbStatus('error');
      setError(err instanceof Error ? err.message : 'Ett oväntat fel uppstod');
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">BRF-SaaS Setup</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Databaskonfiguration</h2>
        <p className="mb-4">
          Kontrollera att databasen är korrekt konfigurerad i din .env-fil:
        </p>
        
        <pre className="bg-gray-100 p-4 rounded mb-4 overflow-x-auto text-sm">
          <code>DATABASE_URL="postgresql://postgres:postgres@localhost:5432/brf_saas?schema=public"</code>
        </pre>
        
        <p className="mb-4">
          Du behöver ha PostgreSQL installerat på din dator, eller du kan 
          använda en molndatabas som Supabase.
        </p>
        
        <div className="mt-6">
          <button 
            onClick={checkDatabase} 
            disabled={dbStatus === 'loading'}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {dbStatus === 'loading' ? 'Kontrollerar...' : 'Kontrollera databasanslutning'}
          </button>
          
          {dbStatus === 'success' && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
              <p className="text-green-800">{dbMessage}</p>
            </div>
          )}
          
          {dbStatus === 'error' && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-red-800">Fel: {error}</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Nästa steg</h2>
        <p className="mb-4">
          När din databas är konfigurerad kan du köra följande kommandon för att initiera databasen:
        </p>
        
        <pre className="bg-gray-100 p-4 rounded mb-6 overflow-x-auto text-sm">
          <code>npx prisma migrate dev</code>
        </pre>
        
        <p className="mb-2">
          Efter att databasen är konfigurerad, kan du:
        </p>
        
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li>Starta applikationen med <code>npm run dev</code></li>
          <li>Skapa din första bostadsrättsförening via <Link href="/create-organization" className="text-blue-600 hover:underline">Skapa förening</Link></li>
          <li>Utforska API:erna för att hantera föreningar och deras handböcker</li>
        </ul>
      </div>
    </div>
  );
} 