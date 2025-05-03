import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Juridisk Information | Handbok.org',
  description: 'Juridisk information för Handbok.org - användarvillkor, integritetspolicy, cookiepolicy och kontaktinformation',
  openGraph: {
    title: 'Juridisk Information | Handbok.org',
    description: 'Juridisk information för Handbok.org - användarvillkor, integritetspolicy, cookiepolicy och kontaktinformation',
    url: 'https://www.handbok.org/legal',
    siteName: 'Handbok.org',
    locale: 'sv_SE',
    type: 'website',
  },
};

export default function LegalHub() {
  const legalDocuments = [
    {
      title: 'Användarvillkor (ToS)',
      description: 'Vad du erbjuder, hur man får använda tjänsten, ansvarsfrihet, begränsningar',
      path: '/legal/terms',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: 'Integritetspolicy (GDPR)',
      description: 'Hur du hanterar personuppgifter (även e-post och inloggning räknas)',
      path: '/legal/privacy',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      title: 'Cookiepolicy',
      description: 'Om du använder spårning, t.ex. Google Analytics, behöver du informera om detta',
      path: '/legal/cookies',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
    },
    {
      title: 'Tjänsteavtal',
      description: 'Avtal för bostadsrättsföreningar med tjänstevillkor, priser och ansvarsfördelning',
      path: '/legal/service-agreement',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: 'Ansvarsfriskrivning',
      description: 'Information om innehållsansvar och användning av mallarna i tjänsten',
      path: '/legal/disclaimer',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    {
      title: 'Support- och kontaktinfo',
      description: 'Hur föreningen kontaktar dig vid problem',
      path: '/legal/contact',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="container max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Juridisk Information</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Här hittar du all juridisk information relaterad till Handbok.org. Det är viktigt att du läser 
          och förstår dessa dokument innan du använder vår tjänst.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-10 text-center">
        <p className="text-amber-800 font-medium text-lg">
          Denna handbok är ett stödverktyg och ersätter inte juridisk rådgivning. Informationen bör anpassas 
          till föreningens stadgar, avtal och rutiner.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {legalDocuments.map((doc, index) => (
          <Link 
            href={doc.path} 
            key={index}
            className="flex flex-col h-full bg-white rounded-lg shadow-md transition-transform hover:shadow-lg hover:-translate-y-1 border border-gray-200 overflow-hidden"
          >
            <div className="flex items-center p-6 border-b border-gray-100">
              <div className="mr-4 flex-shrink-0">
                {doc.icon}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{doc.title}</h2>
              </div>
            </div>
            <div className="p-6 flex-grow">
              <p className="text-gray-600">{doc.description}</p>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <span className="text-blue-600 font-medium">Läs mer {'→'}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
        <h2 className="text-2xl font-semibold mb-4">Behöver du mer hjälp?</h2>
        <p className="mb-6">
          Om du har ytterligare frågor om våra juridiska dokument eller behöver klargöranden, 
          är du välkommen att kontakta vårt supportteam.
        </p>
        <Link 
          href="/legal/contact" 
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Kontakta oss
        </Link>
      </div>
    </div>
  );
} 