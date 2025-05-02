import { Metadata } from 'next'
import { getCurrentUser } from '@/lib/auth/roleUtils'
import { redirect } from 'next/navigation'
import JoinOrganizationForm from './JoinOrganizationForm'

export const metadata: Metadata = {
  title: 'Anslut till en förening - BRF Handbok',
  description: 'Anslut till din bostadsrättsförening för att få tillgång till handboken',
}

export default async function JoinOrganizationPage() {
  const user = await getCurrentUser()
  
  // Omdirigera till dashboard om användaren inte är inloggad
  if (!user) {
    redirect('/login?redirect=/join-organization')
  }
  
  // Om användaren redan är kopplad till en organisation, omdirigera till dashboard
  if (user.organization) {
    redirect('/dashboard')
  }
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-4">Anslut till en förening</h1>
        <p className="text-gray-600 mb-6">
          Ange din bostadsrättsförenings webbadress (slug) för att ansluta dig till din förening.
          Detta ger dig tillgång till föreningens handbok och dokument.
        </p>
        
        <JoinOrganizationForm userId={user.id} />
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Vet du inte vilken webbadress din förening har? 
            Kontakta styrelsen i din bostadsrättsförening för information.
          </p>
        </div>
      </div>
    </div>
  )
} 