'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import SignOutButton from './auth/SignOutButton';
import { UserRole } from '@/lib/auth/roleUtils';
import OrganizationSwitcher from './OrganizationSwitcher';

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isLoading, userRole, hasRole, organization } = useAuth();
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isLinkActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                BRF Handbok
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-6">
              <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isLinkActive('/')
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Hem
              </Link>

              {/* Visa dashboard-länk endast för inloggade användare */}
              {user && (
                <Link
                  href="/dashboard"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isLinkActive('/dashboard')
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Dashboard
                </Link>
              )}
              
              {/* Visa adminlänk för användare med admin-roll */}
              {hasRole(UserRole.ADMIN) && (
                <Link
                  href="/admin"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isLinkActive('/admin')
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Administration
                </Link>
              )}
              
              {/* Visa editor-länk för användare med admin eller editor-roller */}
              {hasRole(UserRole.EDITOR) && (
                <Link
                  href="/editor"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isLinkActive('/editor')
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Redigera innehåll
                </Link>
              )}

              <Link
                href="/om-oss"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isLinkActive('/om-oss')
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Om oss
              </Link>

              <Link
                href="/kontakt"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isLinkActive('/kontakt')
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Kontakt
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {isLoading ? (
              <div className="px-3 py-1 rounded-md bg-gray-100 animate-pulse w-20 h-8"></div>
            ) : user ? (
              <>
                <OrganizationSwitcher />
                <Link 
                  href="/profile" 
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <span className="mr-2">{user.email}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </Link>
                <SignOutButton className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-md text-sm font-medium">
                  Logga ut
                </SignOutButton>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logga in
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Registrera
                </Link>
              </>
            )}
          </div>

          {/* Mobil-meny-knapp */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Öppna huvudmenyn</span>
              {isMobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobil-meny */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            href="/"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              isLinkActive('/')
                ? 'border-blue-500 text-blue-700 bg-blue-50'
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Hem
          </Link>

          {user && (
            <Link
              href="/dashboard"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isLinkActive('/dashboard')
                  ? 'border-blue-500 text-blue-700 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Dashboard
            </Link>
          )}
          
          {hasRole(UserRole.ADMIN) && (
            <Link
              href="/admin"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isLinkActive('/admin')
                  ? 'border-blue-500 text-blue-700 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Administration
            </Link>
          )}
          
          {hasRole(UserRole.EDITOR) && (
            <Link
              href="/editor"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isLinkActive('/editor')
                  ? 'border-blue-500 text-blue-700 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Redigera innehåll
            </Link>
          )}

          <Link
            href="/om-oss"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              isLinkActive('/om-oss')
                ? 'border-blue-500 text-blue-700 bg-blue-50'
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Om oss
          </Link>

          <Link
            href="/kontakt"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              isLinkActive('/kontakt')
                ? 'border-blue-500 text-blue-700 bg-blue-50'
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Kontakt
          </Link>
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          {isLoading ? (
            <div className="px-4 py-3">
              <div className="bg-gray-100 animate-pulse w-full h-8 rounded-md"></div>
            </div>
          ) : user ? (
            <div>
              <div className="px-4 py-3">
                <div className="text-base font-medium text-gray-800">{user.email}</div>
                {userRole && (
                  <div className="text-sm font-medium text-gray-500">
                    {userRole === UserRole.ADMIN ? 'Administratör' : 
                     userRole === UserRole.EDITOR ? 'Redaktör' : 'Medlem'}
                    {organization && ` - ${organization.name}`}
                  </div>
                )}
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Din profil
                </Link>
                <div className="px-4 py-2">
                  <SignOutButton className="w-full text-left text-base font-medium text-red-600">
                    Logga ut
                  </SignOutButton>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-3 space-y-1 px-4">
              <Link
                href="/login"
                className="block px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md"
              >
                Logga in
              </Link>
              <Link
                href="/register"
                className="block px-3 py-2 text-base font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-md"
              >
                Registrera
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
} 