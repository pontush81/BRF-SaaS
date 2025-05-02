import { Metadata } from 'next'
import { getCurrentUser, UserRole, hasRole } from '@/lib/auth/roleUtils'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Admin Dashboard - BRF Handbok',
  description: 'Administrera BRF-portalens innehåll och användare',
}

export default async function AdminDashboard() {
  const user = await getCurrentUser()
  
  // Säkerhetskontroll (yttre lager, middleware är första försvarslinjen)
  if (!user || !hasRole(user, UserRole.ADMIN)) {
    redirect('/dashboard')
  }
  
  // Hämta relevant data
  const organization = user.organization
  
  if (!organization) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <div className="bg-yellow-50 p-4 border border-yellow-300 rounded mb-6">
          <p className="text-yellow-800">
            Du behöver vara kopplad till en organisation för att administrera innehåll.
          </p>
        </div>
      </div>
    )
  }
  
  // Hämta data för organisationen
  const [userCount, subscriptionData, documentCount] = await Promise.all([
    // Antal användare i organisationen
    prisma.user.count({ 
      where: { organizationId: organization.id } 
    }),
    // Prenumerationsinformation
    prisma.subscription.findUnique({
      where: { organizationId: organization.id }
    }),
    // Antal dokument
    prisma.document.count({
      where: { organizationId: organization.id }
    })
  ])
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      
      {/* Organisation Info */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-2">Organisation: {organization.name}</h2>
        <p className="text-gray-600 mb-4">Subdomän: {organization.slug}.handbok.se</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded">
            <h3 className="font-medium text-blue-800">Användare</h3>
            <p className="text-2xl">{userCount}</p>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <h3 className="font-medium text-green-800">Prenumeration</h3>
            <p className="text-lg">{subscriptionData?.planType || 'Ingen'}</p>
            <p className="text-sm">{subscriptionData?.status || 'Inaktiv'}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded">
            <h3 className="font-medium text-purple-800">Dokument</h3>
            <p className="text-2xl">{documentCount}</p>
          </div>
        </div>
      </div>
      
      {/* Huvudlänkar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link href="/admin/handbook" className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold mb-2">Hantera handbok</h2>
          <p className="text-gray-600">Redigera sektioner och sidor i handboken</p>
        </Link>
        
        <Link href="/admin/users" className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold mb-2">Hantera användare</h2>
          <p className="text-gray-600">Lägg till och hantera boende</p>
        </Link>
        
        <Link href="/admin/documents" className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold mb-2">Dokument</h2>
          <p className="text-gray-600">Ladda upp och hantera föreningsdokument</p>
        </Link>
        
        <Link href="/admin/properties" className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold mb-2">Fastigheter</h2>
          <p className="text-gray-600">Administrera fastigheter och lägenheter</p>
        </Link>
        
        <Link href="/admin/subscription" className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold mb-2">Prenumeration</h2>
          <p className="text-gray-600">Hantera fakturering och prenumerationsplan</p>
        </Link>
        
        <Link href="/admin/settings" className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold mb-2">Inställningar</h2>
          <p className="text-gray-600">Konfigurera din organisations inställningar</p>
        </Link>
      </div>
      
      {/* Quick Links */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Snabblänkar</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Gå till dashboard
          </Link>
          <Link href={`https://${organization.slug}.handbok.se`} className="text-blue-600 hover:underline">
            Visa offentlig portal
          </Link>
        </div>
      </div>
    </div>
  )
} 