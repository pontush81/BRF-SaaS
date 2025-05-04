import { cookies } from 'next/headers';
import { getServerSideUser } from '@/supabase-server';
import { createBrowserClient } from '@/supabase-client';
import Link from 'next/link';

export default async function AuthTestPage() {
  // Server Component Code
  const cookieStore = cookies();
  const serverUser = await getServerSideUser(cookieStore);
  
  // Server-render the initial state
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Authentication Test Page</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-3">Server-Side Authentication</h2>
        
        {serverUser ? (
          <div className="bg-green-50 p-4 rounded-md border border-green-200">
            <p className="text-green-800 font-medium">✅ Inloggad på server-sidan</p>
            <p className="mt-2">User ID: {serverUser.id}</p>
            <p>Email: {serverUser.email}</p>
          </div>
        ) : (
          <div className="bg-red-50 p-4 rounded-md border border-red-200">
            <p className="text-red-800 font-medium">❌ Inte inloggad på server-sidan</p>
            <p className="mt-2">Servern kunde inte hitta någon giltig session.</p>
          </div>
        )}
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-3">Session Information</h2>
        <p className="mb-3">Denna information samlas in från servern:</p>
        
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-4">
          <h3 className="font-medium mb-2">Server Environment</h3>
          <p>NODE_ENV: {process.env.NODE_ENV}</p>
          <p>Mock Auth: {process.env.NODE_ENV === 'development' ? 'Available' : 'Disabled'}</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h3 className="font-medium mb-2">Available Cookies</h3>
          {cookies().getAll().length > 0 ? (
            <ul className="list-disc pl-5">
              {cookies().getAll().map((cookie) => (
                <li key={cookie.name}>
                  {cookie.name}: {cookie.value ? '✓ (has value)' : '✗ (empty)'}
                </li>
              ))}
            </ul>
          ) : (
            <p>No cookies found</p>
          )}
        </div>
      </div>
      
      <div className="flex gap-4">
        <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Gå till inloggning
        </Link>
        <Link href="/dashboard" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          Gå till dashboard
        </Link>
      </div>
    </div>
  );
} 