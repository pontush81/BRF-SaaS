import Link from 'next/link';

export default function SetupPage() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Supabase Setup Guide</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">1. Skapa ett Supabase-konto</h2>
        <p className="mb-4">Börja med att skapa ett konto på <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase.com</a>.</p>
        
        <h2 className="text-xl font-semibold mb-4 mt-8">2. Skapa ett nytt projekt</h2>
        <p className="mb-4">När du har loggat in, skapa ett nytt projekt med ett valfritt namn (t.ex. "brf-saas").</p>
        
        <h2 className="text-xl font-semibold mb-4 mt-8">3. Hitta dina projektvärden</h2>
        <p className="mb-4">Gå till Project Settings &gt; API i sidofältet. Där hittar du följande värden:</p>
        <ul className="list-disc pl-8 mb-4 space-y-2">
          <li><strong>Project URL</strong>: Detta är ditt <code className="bg-gray-100 px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code></li>
          <li><strong>Project API Keys &gt; anon public</strong>: Detta är din <code className="bg-gray-100 px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
          <li><strong>Project API Keys &gt; service_role secret</strong>: Detta är din <code className="bg-gray-100 px-1 py-0.5 rounded">SUPABASE_SERVICE_ROLE_KEY</code></li>
        </ul>
        
        <h2 className="text-xl font-semibold mb-4 mt-8">4. Uppdatera din .env.local-fil</h2>
        <p className="mb-4">Kopiera värdena från Supabase till din <code className="bg-gray-100 px-1 py-0.5 rounded">.env.local</code>-fil i projektets rotkatalog.</p>
        
        <div className="bg-gray-800 text-white p-4 rounded-md mb-6 overflow-x-auto">
          <pre>
            {`# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000`}
          </pre>
        </div>
        
        <h2 className="text-xl font-semibold mb-4 mt-8">5. Skapa databastabeller</h2>
        <p className="mb-4">Du kan skapa dina tabeller genom att använda Supabase UI eller genom migrations. För att använda UI:</p>
        <ol className="list-decimal pl-8 mb-4 space-y-2">
          <li>Gå till <strong>Table Editor</strong> i sidofältet</li>
          <li>Klicka på <strong>New Table</strong> för att skapa en ny tabell</li>
          <li>För varje tabell i vår databasschema, skapa motsvarande tabeller i Supabase</li>
        </ol>
        
        <h2 className="text-xl font-semibold mb-4 mt-8">6. Aktivera Row Level Security (RLS)</h2>
        <p className="mb-4">För multi-tenancy behöver vi konfigurera Row Level Security:</p>
        <ol className="list-decimal pl-8 mb-4 space-y-2">
          <li>Gå till <strong>Authentication &gt; Policies</strong> i sidofältet</li>
          <li>För varje tabell, aktivera RLS</li>
          <li>Skapa policies för att begränsa data baserat på organization_id</li>
        </ol>
      </div>
      
      <div className="flex justify-between">
        <Link
          href="/"
          className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
        >
          Tillbaka
        </Link>
        <Link
          href="/dashboard"
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          Gå till Dashboard
        </Link>
      </div>
    </div>
  );
} 