import { Metadata } from 'next'
import { getCurrentUserServer } from '@/lib/auth/server-utils'
import { redirect } from 'next/navigation'
import JoinOrganizationForm from '@/app/join-organization/JoinOrganizationForm'

export const metadata: Metadata = {
  title: 'Gå med i en förening | BRF-SaaS',
  description: 'Anslut dig till din bostadsrättsförenings digitala handbok',
}

export default async function JoinOrganizationPage() {
  const user = await getCurrentUserServer()
  
  // Om användaren inte är inloggad, omdirigera till inloggningssidan
  if (!user) {
    redirect('/login?redirect=/join-organization')
  }
  
  // Om användaren redan har en organisation, omdirigera till dashboard
  if (user.organization) {
    redirect('/dashboard')
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pt-12 pb-24 px-4">
      <div className="max-w-lg mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Gå med i en förening</h1>
          <p className="text-gray-600">
            Anslut dig till din bostadsrättsförenings digitala handbok
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow">
          <JoinOrganizationForm />
        </div>
        
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Behöver du hjälp? Kontakta din förening för mer information.</p>
          <p className="mt-2">
            <a href="/" className="text-blue-600 hover:underline">
              Tillbaka till startsidan
            </a>
          </p>
        </div>
      </div>
    </div>
  )
} 