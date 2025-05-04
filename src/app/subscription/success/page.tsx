import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Prenumeration aktiverad',
  description: 'Din prenumeration har aktiverats',
};

export default function SubscriptionSuccessPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <div className="rounded-full w-16 h-16 bg-green-100 p-2 flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h1 className="text-3xl font-bold mb-4">Tack för din prenumeration!</h1>
      
      <p className="text-lg text-gray-700 mb-8">
        Din prenumeration har aktiverats framgångsrikt. Du har nu tillgång till alla funktioner i din valda plan.
      </p>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-blue-800 mb-3">Din 30-dagars gratisperiod har börjat</h2>
        <p className="text-gray-700 mb-0">
          Du kommer inte att bli debiterad förrän efter din gratisperiod. Du kan när som helst ändra eller avsluta din prenumeration i inställningarna.
        </p>
      </div>
      
      <Link 
        href="/"
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md"
      >
        Gå till startsidan
      </Link>
    </div>
  );
} 