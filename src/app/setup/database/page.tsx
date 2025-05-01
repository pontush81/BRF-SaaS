'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, Database, Loader2 } from 'lucide-react';

type Status = 'idle' | 'loading' | 'success' | 'error';
type StatusData = { message: string; error?: string };

export default function DatabaseSetupPage() {
  const [checkStatus, setCheckStatus] = useState<Status>('idle');
  const [checkData, setCheckData] = useState<StatusData | null>(null);
  
  const [seedStatus, setSeedStatus] = useState<Status>('idle');
  const [seedData, setSeedData] = useState<StatusData | null>(null);
  
  async function checkConnection() {
    setCheckStatus('loading');
    try {
      const response = await fetch('/api/db-check');
      const data = await response.json();
      
      if (response.ok) {
        setCheckStatus('success');
      } else {
        setCheckStatus('error');
      }
      
      setCheckData(data);
    } catch (error) {
      setCheckStatus('error');
      setCheckData({ 
        message: 'Kunde inte kontakta API:et',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  async function seedDatabase() {
    setSeedStatus('loading');
    try {
      const response = await fetch('/api/db-check', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSeedStatus('success');
      } else {
        setSeedStatus('error');
      }
      
      setSeedData(data);
    } catch (error) {
      setSeedStatus('error');
      setSeedData({ 
        message: 'Kunde inte kontakta API:et',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Databas konfiguration</h1>
      
      <div className="grid gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Databasanslutning</CardTitle>
            <CardDescription>
              Kontrollera anslutningen till PostgreSQL-databasen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              För att verifiera att databasanslutningen fungerar korrekt, klicka på knappen nedan. 
              Detta kommer att testa anslutningen till databasen som är konfigurerad i .env-filen.
            </p>
            
            {checkStatus === 'success' && (
              <Alert className="bg-green-50 border-green-200 mb-4">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Anslutning framgångsrik</AlertTitle>
                <AlertDescription className="text-green-700">
                  {checkData?.message}
                </AlertDescription>
              </Alert>
            )}
            
            {checkStatus === 'error' && (
              <Alert className="bg-red-50 border-red-200 mb-4">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Anslutning misslyckades</AlertTitle>
                <AlertDescription className="text-red-700">
                  {checkData?.message}
                  {checkData?.error && (
                    <div className="mt-2 p-2 bg-red-100 rounded text-sm font-mono">
                      {checkData.error}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={checkConnection} 
              disabled={checkStatus === 'loading'}
              className="flex items-center gap-2"
            >
              {checkStatus === 'loading' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              Kontrollera databasanslutning
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Skapa grunddata</CardTitle>
            <CardDescription>
              Skapa en exempelorganisation med handboksmall
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              För att starta med en exempelorganisation och handboksmall, klicka på knappen nedan.
              Detta kommer att skapa en demo-organisation med en grundläggande handbok.
            </p>
            
            {seedStatus === 'success' && (
              <Alert className="bg-green-50 border-green-200 mb-4">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Data skapad</AlertTitle>
                <AlertDescription className="text-green-700">
                  {seedData?.message}
                </AlertDescription>
              </Alert>
            )}
            
            {seedStatus === 'error' && (
              <Alert className="bg-red-50 border-red-200 mb-4">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Kunde inte skapa data</AlertTitle>
                <AlertDescription className="text-red-700">
                  {seedData?.message}
                  {seedData?.error && (
                    <div className="mt-2 p-2 bg-red-100 rounded text-sm font-mono">
                      {seedData.error}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={seedDatabase} 
              disabled={seedStatus === 'loading' || checkStatus !== 'success'}
              className="flex items-center gap-2"
            >
              {seedStatus === 'loading' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              Skapa grunddata
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-6 p-4 border rounded bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">Nästa steg</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Kontrollera att databasanslutningen fungerar</li>
          <li>Skapa grunddata med exempelorganisation och handboksmall</li>
          <li>Gå till <a href="/" className="text-blue-600 hover:underline">startsidan</a> för att se resultatet</li>
          <li>För att hantera organisationen, gå till <a href="/admin/organizations" className="text-blue-600 hover:underline">administratörspanelen</a></li>
        </ul>
      </div>
    </div>
  );
} 