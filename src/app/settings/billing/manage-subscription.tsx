'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface ManageSubscriptionProps {
  organizationId: string;
  hasActiveSubscription: boolean;
}

export default function ManageSubscription({ 
  organizationId, 
  hasActiveSubscription 
}: ManageSubscriptionProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleManageSubscription = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId,
          returnUrl: window.location.href,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Något gick fel');
      }
      
      // Redirect to Stripe customer portal
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Ingen portal-URL returnerades');
      }
    } catch (error) {
      console.error('Failed to create portal session:', error);
      toast({
        title: 'Fel',
        description: error instanceof Error ? error.message : 'Kunde inte öppna portalen',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border p-6 space-y-4">
      <h2 className="text-xl font-semibold">Prenumerationshantering</h2>
      
      {hasActiveSubscription ? (
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Använd kundportalen för att hantera din prenumeration, uppdatera betalningsinformation 
            eller se tidigare fakturor.
          </p>
          
          <button
            onClick={handleManageSubscription}
            disabled={loading}
            className={`px-4 py-2 rounded text-white ${
              loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Laddar...' : 'Hantera prenumeration'}
          </button>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Du har ingen aktiv prenumeration. Välj en prenumerationsplan för att komma igång.
          </p>
          
          <a
            href="/subscription"
            className="inline-block px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700"
          >
            Visa planer
          </a>
        </div>
      )}
    </div>
  );
} 