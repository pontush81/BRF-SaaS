import { Metadata } from 'next';
import PricingPlans from './pricing-plans';

export const metadata: Metadata = {
  title: 'Prenumerera på BRF-SaaS',
  description: 'Välj en prenumerationsplan som passar din bostadsrättsförening',
};

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
        <PricingPlans />
      </div>
    </div>
  );
} 