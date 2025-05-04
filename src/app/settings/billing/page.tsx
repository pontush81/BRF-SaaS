import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { createServerClient } from '@/supabase-server';
import { hasActiveSubscription } from '@/lib/stripe';
import ManageSubscription from './manage-subscription';

export const metadata: Metadata = {
  title: 'Betalning & Fakturering',
  description: 'Hantera din prenumeration och fakturering',
};

async function getCurrentOrganization() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }
  
  // Get organizations the user belongs to
  const { data: userOrgs } = await supabase
    .from('user_organization')
    .select('organization_id, is_default')
    .eq('user_id', user.id);
  
  if (!userOrgs || userOrgs.length === 0) {
    return null;
  }
  
  // Find default organization or use first
  const defaultOrg = userOrgs.find(org => org.is_default) || userOrgs[0];
  
  // Get organization details
  const { data: organization } = await supabase
    .from('organization')
    .select('*')
    .eq('id', defaultOrg.organization_id)
    .single();
  
  return organization;
}

export default async function BillingPage() {
  const organization = await getCurrentOrganization();
  
  if (!organization) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Betalning & Fakturering</h1>
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md text-yellow-800">
          Ingen förening hittad. Du behöver vara kopplad till en förening för att hantera betalningar.
        </div>
      </div>
    );
  }
  
  // Check subscription status
  const isSubscribed = await hasActiveSubscription(organization.id);
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Betalning & Fakturering</h1>
      
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Förening</h2>
        <div className="bg-white rounded-lg border p-4">
          <p className="font-medium">{organization.name}</p>
          <p className="text-sm text-gray-500">{organization.slug}.handbok.org</p>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Prenumerationsstatus</h2>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${isSubscribed ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span>{isSubscribed ? 'Aktiv' : 'Inaktiv'}</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {isSubscribed 
              ? 'Din prenumeration är aktiv och du har tillgång till alla funktioner.'
              : 'Du har inte en aktiv prenumeration för närvarande.'}
          </p>
        </div>
      </div>
      
      <ManageSubscription 
        organizationId={organization.id} 
        hasActiveSubscription={isSubscribed} 
      />
    </div>
  );
} 