import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get current pathname and create breadcrumb
  const getCurrentPath = () => {
    if (typeof window === 'undefined') return { pathname: '', pageName: '' };
    
    const pathname = window.location.pathname;
    let pageName = '';
    
    if (pathname.includes('/terms')) {
      pageName = 'Användarvillkor';
    } else if (pathname.includes('/privacy')) {
      pageName = 'Integritetspolicy';
    } else if (pathname.includes('/cookies')) {
      pageName = 'Cookiepolicy';
    } else if (pathname.includes('/contact')) {
      pageName = 'Kontakt & Support';
    } else if (pathname.includes('/service-agreement')) {
      pageName = 'Tjänsteavtal';
    } else if (pathname.includes('/disclaimer')) {
      pageName = 'Ansvarsfriskrivning';
    } else if (pathname === '/legal') {
      pageName = 'Juridisk Information';
    } else {
      notFound();
    }
    
    return { pathname, pageName };
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Juridisk Information
            </h1>
            <nav className="flex flex-wrap gap-3">
              <Link 
                href="/legal" 
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Översikt
              </Link>
              <Link 
                href="/legal/terms" 
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Användarvillkor
              </Link>
              <Link 
                href="/legal/privacy" 
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Integritetspolicy
              </Link>
              <Link 
                href="/legal/cookies" 
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Cookiepolicy
              </Link>
              <Link 
                href="/legal/service-agreement" 
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Tjänsteavtal
              </Link>
              <Link 
                href="/legal/disclaimer" 
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Ansvarsfriskrivning
              </Link>
              <Link 
                href="/legal/contact" 
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Kontakt
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <div className="flex items-center">
                <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                  Handbok.org
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <Link href="/legal" className="ml-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                  Juridisk Information
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-2 text-sm font-medium text-gray-500" id="current-page">
                  {/* Will be populated via client-side JS */}
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      <main className="pb-16">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              <Link href="/legal/contact" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Kontakt</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                  <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                </svg>
              </Link>
            </div>
            <div className="mt-8 md:mt-0 md:order-1">
              <p className="text-center text-base text-gray-400">
                &copy; {new Date().getFullYear()} Handbok.org. Alla rättigheter förbehållna.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Client-side script to update the current page name in breadcrumb */}
      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', function() {
            const pathname = window.location.pathname;
            let pageName = '';
            
            if (pathname.includes('/terms')) {
              pageName = 'Användarvillkor';
            } else if (pathname.includes('/privacy')) {
              pageName = 'Integritetspolicy';
            } else if (pathname.includes('/cookies')) {
              pageName = 'Cookiepolicy';
            } else if (pathname.includes('/contact')) {
              pageName = 'Kontakt & Support';
            } else if (pathname.includes('/service-agreement')) {
              pageName = 'Tjänsteavtal';
            } else if (pathname.includes('/disclaimer')) {
              pageName = 'Ansvarsfriskrivning';
            } else if (pathname === '/legal') {
              pageName = 'Juridisk Information';
            }
            
            const currentPageElement = document.getElementById('current-page');
            if (currentPageElement && pageName) {
              currentPageElement.textContent = pageName;
            }
            
            // Highlight current page in the navigation
            const navLinks = document.querySelectorAll('nav a');
            navLinks.forEach(link => {
              if (link.getAttribute('href') === pathname) {
                link.classList.remove('text-gray-500');
                link.classList.add('text-blue-600', 'font-semibold');
              }
            });
          });
        `
      }} />
    </div>
  );
} 