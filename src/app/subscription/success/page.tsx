'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const method = searchParams.get('method');

  useEffect(() => {
    // Ta bort organizationId från localStorage eftersom det inte längre behövs
    try {
      localStorage.removeItem('currentOrganizationId');
    } catch (error) {
      console.warn('Could not access localStorage, continuing anyway:', error);
    }
  }, []);

  return (
    <div className="container mx-auto max-w-3xl py-10 px-6">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Tack för din prenumeration!</h1>
        
        {method === 'invoice' ? (
          <div className="mb-6 text-lg text-gray-700">
            <p>Din faktura kommer att skickas inom 24 timmar.</p>
            <p className="mt-2">När fakturan är betald kommer din prenumeration att aktiveras automatiskt.</p>
          </div>
        ) : (
          <div className="mb-6 text-lg text-gray-700">
            <p>Din betalning har genomförts och din prenumeration är nu aktiv.</p>
            <p className="mt-2">Du kan nu börja använda alla funktioner i BRF-handboken.</p>
          </div>
        )}
        
        <Link href="/dashboard">
          <button className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors">
            Gå till dashboard
          </button>
        </Link>
      </div>
    </div>
  );
} 