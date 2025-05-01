import Link from 'next/link';

export default function FirebaseSetupPage() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Firebase Setup Guide</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">1. Skapa ett Firebase-konto</h2>
        <p className="mb-4">Börja med att skapa ett konto på <a href="https://firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Firebase</a> om du inte redan har ett.</p>
        
        <h2 className="text-xl font-semibold mb-4 mt-8">2. Skapa ett nytt projekt</h2>
        <p className="mb-4">När du har loggat in, skapa ett nytt projekt med ett valfritt namn (t.ex. "brf-saas").</p>
        
        <h2 className="text-xl font-semibold mb-4 mt-8">3. Lägg till en webbapp</h2>
        <ol className="list-decimal pl-8 mb-4 space-y-2">
          <li>Klicka på webbappsikonen på projektöversiktssidan.</li>
          <li>Ge appen ett smeknamn (t.ex. "BRF-SaaS Web").</li>
          <li>Klicka på "Registrera app".</li>
          <li>Du kommer då att se din Firebase-konfiguration.</li>
        </ol>
        
        <h2 className="text-xl font-semibold mb-4 mt-8">4. Kopiera konfigurationsvärdena</h2>
        <p className="mb-4">Kopiera följande värden från din Firebase-konfiguration till din <code className="bg-gray-100 px-1 py-0.5 rounded">.env.local</code>-fil:</p>
        <ul className="list-disc pl-8 mb-4 space-y-2">
          <li><strong>apiKey</strong>: Detta är ditt <code className="bg-gray-100 px-1 py-0.5 rounded">NEXT_PUBLIC_FIREBASE_API_KEY</code></li>
          <li><strong>authDomain</strong>: Detta är din <code className="bg-gray-100 px-1 py-0.5 rounded">NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</code></li>
          <li><strong>projectId</strong>: Detta är ditt <code className="bg-gray-100 px-1 py-0.5 rounded">NEXT_PUBLIC_FIREBASE_PROJECT_ID</code></li>
          <li><strong>storageBucket</strong>: Detta är din <code className="bg-gray-100 px-1 py-0.5 rounded">NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET</code></li>
          <li><strong>messagingSenderId</strong>: Detta är ditt <code className="bg-gray-100 px-1 py-0.5 rounded">NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID</code></li>
          <li><strong>appId</strong>: Detta är ditt <code className="bg-gray-100 px-1 py-0.5 rounded">NEXT_PUBLIC_FIREBASE_APP_ID</code></li>
          <li><strong>measurementId</strong>: Detta är ditt <code className="bg-gray-100 px-1 py-0.5 rounded">NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID</code></li>
        </ul>
        
        <div className="bg-gray-800 text-white p-4 rounded-md mb-6 overflow-x-auto">
          <pre>{`# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id`}</pre>
        </div>
        
        <h2 className="text-xl font-semibold mb-4 mt-8">5. Aktivera autentiseringsmetoder</h2>
        <p className="mb-4">För att aktivera e-post/lösenord-autentisering:</p>
        <ol className="list-decimal pl-8 mb-4 space-y-2">
          <li>Gå till "Authentication" i sidofältet</li>
          <li>Klicka på "Get started" om det är första gången</li>
          <li>Klicka på fliken "Sign-in method"</li>
          <li>Klicka på "Email/Password" och aktivera det</li>
          <li>Klicka på "Save"</li>
        </ol>
        
        <h2 className="text-xl font-semibold mb-4 mt-8">6. Konfigurera Firestore</h2>
        <p className="mb-4">För att skapa en databas:</p>
        <ol className="list-decimal pl-8 mb-4 space-y-2">
          <li>Gå till "Firestore Database" i sidofältet</li>
          <li>Klicka på "Create database"</li>
          <li>Välj "Start in production mode" (eller testläge om du föredrar det)</li>
          <li>Välj en plats som är nära dina användare (ex. europe-west1)</li>
          <li>Klicka på "Enable"</li>
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