'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

export default function AuthDebug() {
  const { user, isLoading, userRole, organization, session } = useAuth();
  const [showDetails, setShowDetails] = useState(false);
  
  // Check for cookie in browser environment
  const [hasMockCookie, setHasMockCookie] = useState(false);
  
  // Check for Supabase auth in localStorage
  const [hasLocalStorage, setHasLocalStorage] = useState(false);
  
  // Effect to check browser-specific data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasMockCookie(document.cookie.includes('supabase-dev-auth=true'));
      
      try {
        const hasToken = !!localStorage.getItem('supabase.auth.token') || 
                         !!localStorage.getItem('sb-refresh-token') ||
                         !!localStorage.getItem('sb-access-token');
        setHasLocalStorage(hasToken);
      } catch (e) {
        console.error('Failed to check localStorage:', e);
      }
    }
  }, []);
  
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'production') {
    return null; // Hide in production
  }
  
  return (
    <div className="bg-gray-100 border border-gray-300 p-4 rounded-md mb-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-700">Auth Debug</h3>
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs bg-gray-200 px-2 py-1 rounded"
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
      </div>
      
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
        <div>Status: {isLoading ? 'Loading...' : user ? 'Logged in' : 'Not logged in'}</div>
        <div>Mock Cookie: {hasMockCookie ? 'Yes' : 'No'}</div>
        <div>LocalStorage: {hasLocalStorage ? 'Yes' : 'No'}</div>
        <div>User Role: {userRole || 'None'}</div>
      </div>
      
      {showDetails && (
        <div className="mt-4 text-xs">
          <h4 className="font-medium mb-1">User Data:</h4>
          <pre className="bg-gray-200 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify({ 
              user: user ? {
                id: user.id,
                email: user.email,
                created_at: user.created_at
              } : null,
              session: session ? {
                expires_at: session.expires_at,
                access_token: session.access_token ? '***' : null
              } : null,
              organization,
              userRole
            }, null, 2)}
          </pre>
          
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => {
                document.cookie = 'supabase-dev-auth=true; path=/; max-age=86400';
                window.location.reload();
              }}
              className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
            >
              Set Mock Cookie
            </button>
            
            <button
              onClick={() => {
                document.cookie = 'supabase-dev-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                window.location.reload();
              }}
              className="bg-red-500 text-white px-2 py-1 rounded text-xs"
            >
              Clear Auth Cookies
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 