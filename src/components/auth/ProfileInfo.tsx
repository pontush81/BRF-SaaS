'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Fragment } from 'react';
import { UserRole } from '@/lib/auth/roleUtils';
import Link from 'next/link';

export default function ProfileInfo() {
  const { user, session, isLoading, signOut, userRole, organization, dbUser } = useAuth();

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 mb-6"></div>
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Inte inloggad</h2>
        <p className="text-gray-600 mb-4">
          Du är inte inloggad. Vänligen logga in för att se din profil.
        </p>
        <Link 
          href="/login" 
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Logga in
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Din profil</h2>
      
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">E-post</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Användar-ID</p>
            <p className="font-medium">{user.id}</p>
          </div>
          {dbUser?.name && (
            <div>
              <p className="text-sm text-gray-500">Namn</p>
              <p className="font-medium">{dbUser.name}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-500">E-post verifierad</p>
            <p className="font-medium">
              {user.email_confirmed_at ? 'Ja' : 'Nej'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Roll och organisation */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Roll & Organisation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Användarroll</p>
            <p className="font-medium">
              {userRole === UserRole.ADMIN ? 'Administratör' : 
               userRole === UserRole.EDITOR ? 'Redaktör' : 
               userRole === UserRole.MEMBER ? 'Medlem' : 'Okänd roll'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Organisation</p>
            {organization ? (
              <p className="font-medium">{organization.name}</p>
            ) : (
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">Ingen organisation</span>
                <Link 
                  href="/join-organization" 
                  className="text-sm text-blue-600 hover:underline"
                >
                  Gå med i en BRF
                </Link>
              </div>
            )}
          </div>
          {organization && (
            <>
              <div>
                <p className="text-sm text-gray-500">Organisations-ID</p>
                <p className="font-medium">{organization.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">BRF-slug</p>
                <p className="font-medium">{organization.slug}</p>
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Sessions-information</h3>
        {session ? (
          <Fragment>
            <div className="text-sm text-gray-600 mb-1">
              Sessionen är giltig till:{' '}
              <span className="font-medium">
                {new Date(session.expires_at! * 1000).toLocaleString()}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Senast inloggad:{' '}
              <span className="font-medium">
                {new Date(user.last_sign_in_at || 0).toLocaleString()}
              </span>
            </div>
          </Fragment>
        ) : (
          <p>Ingen aktiv session hittades.</p>
        )}
      </div>
      
      <div className="flex flex-wrap gap-3">
        <button
          onClick={signOut}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Logga ut
        </button>
        <Link
          href="/profile/edit"
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
        >
          Redigera profil
        </Link>
        {!organization && (
          <Link
            href="/join-organization"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Gå med i en BRF
          </Link>
        )}
      </div>
    </div>
  );
} 