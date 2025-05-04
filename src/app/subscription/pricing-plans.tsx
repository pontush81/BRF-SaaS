'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { PLAN_PRICES } from '@/lib/stripe';

type PlanType = 'BASIC' | 'STANDARD' | 'PREMIUM';
type BillingInterval = 'monthly' | 'yearly';
type PaymentMethod = 'invoice' | 'card';

interface PricingPlan {
  id: PlanType;
  name: string;
  description: string;
  features: string[];
  popular?: boolean;
}

interface OrganizationInfo {
  name: string;
  address: string;
  postalCode: string;
  city: string;
  orgNumber: string;
}

const plans: PricingPlan[] = [
  {
    id: 'BASIC',
    name: 'Bas',
    description: 'Grundläggande funktioner för mindre föreningar',
    features: [
      'Digital föreningshandbok',
      'Upp till 25 bostäder',
      'Grundläggande dokumenthantering',
      'E-postnotifieringar',
    ],
  },
  {
    id: 'STANDARD',
    name: 'Standard',
    description: 'Komplett paket för medelstora föreningar',
    features: [
      'Allt i Bas-paketet',
      'Upp till 100 bostäder',
      'Avancerad dokumenthantering',
      'Ärendehantering',
      'Förbättrad sökning',
    ],
    popular: true,
  },
  {
    id: 'PREMIUM',
    name: 'Premium',
    description: 'Fullt utrustat för större föreningar',
    features: [
      'Allt i Standard-paketet',
      'Obegränsat antal bostäder',
      'Prioriterad support',
      'API-tillgång',
      'Anpassad domän',
      'White-label möjligheter',
    ],
  },
];

export default function PricingPlans() {
  const [loading, setLoading] = useState<PlanType | null>(null);
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('yearly');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('invoice');
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [orgInfo, setOrgInfo] = useState<OrganizationInfo>({
    name: '',
    address: '',
    postalCode: '',
    city: '',
    orgNumber: '',
  });
  
  const router = useRouter();
  const { toast } = useToast();

  // Detect environment for debugging
  const isDev = process.env.NODE_ENV === 'development';
  const isStaging = process.env.APP_ENV === 'staging';
  const isProd = process.env.NODE_ENV === 'production' && process.env.APP_ENV !== 'staging';

  const handlePlanSelect = (plan: PlanType) => {
    setSelectedPlan(plan);
    if (paymentMethod === 'invoice') {
      setShowInvoiceForm(true);
    } else {
      handleCardPayment(plan);
    }
  };

  const handleCardPayment = async (plan: PlanType) => {
    try {
      setLoading(plan);

      // Get current organization ID from context or localStorage
      // This is a placeholder - you need to implement how you get the current organization
      const organizationId = localStorage.getItem('currentOrganizationId');
      
      if (!organizationId) {
        toast({
          title: 'Fel',
          description: 'Ingen aktiv organisation hittades',
          variant: 'destructive',
        });
        return;
      }

      // Create checkout session for card payment
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId,
          planType: plan,
          billingInterval,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Något gick fel');
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Ingen checkout-URL returnerades');
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      toast({
        title: 'Fel',
        description: error instanceof Error ? error.message : 'Något gick fel',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const handleInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlan) return;
    
    try {
      setLoading(selectedPlan);
      
      // Get current organization ID
      const organizationId = localStorage.getItem('currentOrganizationId');
      
      if (!organizationId) {
        toast({
          title: 'Fel',
          description: 'Ingen aktiv organisation hittades',
          variant: 'destructive',
        });
        return;
      }
      
      // Create invoice subscription
      const response = await fetch('/api/stripe/invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId,
          planType: selectedPlan,
          billingInterval,
          organizationInfo: orgInfo,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Något gick fel');
      }
      
      // Redirect to success page
      router.push('/subscription/success?method=invoice');
      
    } catch (error) {
      console.error('Failed to create invoice subscription:', error);
      toast({
        title: 'Fel',
        description: error instanceof Error ? error.message : 'Något gick fel',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
      setShowInvoiceForm(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOrgInfo(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-8">
      {/* Payment method and billing interval toggle */}
      <div className="flex flex-col sm:flex-row justify-center gap-8 mb-10">
        <div className="bg-white p-4 rounded-md shadow">
          <h3 className="text-lg font-semibold mb-2">Betalningsmetod</h3>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === 'invoice'}
                onChange={() => setPaymentMethod('invoice')}
                className="mr-2"
              />
              Faktura (rekommenderat för BRF)
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === 'card'}
                onChange={() => setPaymentMethod('card')}
                className="mr-2"
              />
              Kortbetalning
            </label>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-md shadow">
          <h3 className="text-lg font-semibold mb-2">Betalningsintervall</h3>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="billingInterval" 
                checked={billingInterval === 'yearly'}
                onChange={() => setBillingInterval('yearly')}
                className="mr-2"
              />
              Årsvis (spara 2 månader)
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="billingInterval"
                checked={billingInterval === 'monthly'}
                onChange={() => setBillingInterval('monthly')}
                className="mr-2"
              />
              Månadsvis
            </label>
          </div>
        </div>
      </div>
      
      {/* Invoice form modal */}
      {showInvoiceForm && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-bold mb-4">Fakturauppgifter</h2>
            <p className="mb-4 text-gray-600">
              Ange faktureringsinformation för er bostadsrättsförening. 
              Fakturan kommer att skickas inom 24 timmar med 30 dagars betalningsvillkor.
            </p>
            
            <form onSubmit={handleInvoiceSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Föreningens namn</label>
                <input
                  type="text"
                  name="name"
                  value={orgInfo.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Organisationsnummer</label>
                <input
                  type="text"
                  name="orgNumber"
                  value={orgInfo.orgNumber}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                  placeholder="XXXXXX-XXXX"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Adress</label>
                <input
                  type="text"
                  name="address"
                  value={orgInfo.address}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Postnummer</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={orgInfo.postalCode}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Ort</label>
                  <input
                    type="text"
                    name="city"
                    value={orgInfo.city}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowInvoiceForm(false)}
                  className="px-4 py-2 border rounded"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  disabled={loading !== null}
                  className={`px-4 py-2 rounded text-white ${
                    loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loading ? 'Bearbetar...' : 'Skapa faktura'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Pricing plans */}
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-lg shadow-md overflow-hidden ${
              plan.popular ? 'ring-2 ring-blue-500' : 'border'
            }`}
          >
            {plan.popular && (
              <div className="bg-blue-500 text-white text-center py-1 text-sm font-medium">
                Populäraste valet
              </div>
            )}
            
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
              <p className="mt-1 text-gray-600">{plan.description}</p>
              
              <div className="mt-4 flex items-baseline">
                <span className="text-3xl font-extrabold text-gray-900">
                  {billingInterval === 'yearly' 
                    ? PLAN_PRICES[plan.id].yearly
                    : PLAN_PRICES[plan.id].monthly}
                </span>
                <span className="ml-1 text-xl font-medium text-gray-500">
                  kr/{billingInterval === 'yearly' ? 'år' : 'mån'}
                </span>
              </div>
              
              {billingInterval === 'yearly' && (
                <p className="text-sm text-green-600 mt-1">
                  Spara {Math.round((1 - PLAN_PRICES[plan.id].yearly / (PLAN_PRICES[plan.id].monthly * 12)) * 100)}% jämfört med månadsbetalning
                </p>
              )}
              
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex">
                    <svg className="h-5 w-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => handlePlanSelect(plan.id)}
                disabled={loading !== null}
                className={`mt-8 w-full py-3 px-4 rounded-md font-medium text-white ${
                  loading === plan.id
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading === plan.id ? 'Bearbetar...' : `Välj ${paymentMethod === 'invoice' ? 'med faktura' : 'med kort'}`}
              </button>

              <p className="mt-2 text-xs text-gray-500 text-center">
                Inkluderar 30 dagars gratis provperiod
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 