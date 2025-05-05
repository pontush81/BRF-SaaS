import { Suspense } from 'react';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';

// Dynamically import the client component with no SSR
const PricingPlans = dynamic(() => import('./pricing-plans'), { ssr: false });

export const metadata: Metadata = {
  title: 'Prenumerera på BRF-SaaS',
  description: 'Välj en prenumerationsplan som passar din bostadsrättsförening',
};

// Loading fallback component
function LoadingPricingPlans() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Prenumerationsplaner
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          Laddar tillgängliga prenumerationsplaner...
        </p>
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Prenumerationsplaner
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          Välj den plan som passar din bostadsrättsförening bäst
        </p>
      </div>

      <div className="mt-12">
        <Suspense fallback={<LoadingPricingPlans />}>
          <PricingPlans />
        </Suspense>
      </div>
    </div>
  );
}
