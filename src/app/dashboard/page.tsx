import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | BRF-SaaS',
  description: 'Hantera din bostadsrättsförening',
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Statistik-kort */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Sammanfattning</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Lägenheter</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Dokument</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ärenden</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Medlemmar</p>
                <p className="text-2xl font-bold">36</p>
              </div>
            </div>
          </div>
          
          {/* Senaste aktivitet */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Senaste aktivitet</h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">Dokument</span>
                <p className="ml-2 text-sm">Årsredovisning 2023 uppladdad</p>
              </li>
              <li className="flex items-start">
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">Ärende</span>
                <p className="ml-2 text-sm">Felanmälan garage löst</p>
              </li>
              <li className="flex items-start">
                <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-0.5 rounded">Medlem</span>
                <p className="ml-2 text-sm">Ny medlem tillagd: Anna Andersson</p>
              </li>
              <li className="flex items-start">
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded">Handbok</span>
                <p className="ml-2 text-sm">Sida "Flyttregler" uppdaterad</p>
              </li>
            </ul>
          </div>
          
          {/* Kommande händelser */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Kommande händelser</h2>
            <ul className="space-y-3">
              <li className="border-l-4 border-blue-500 pl-3 py-1">
                <p className="font-medium">Styrelsemöte</p>
                <p className="text-sm text-gray-500">25 juni, 18:00 - 20:00</p>
              </li>
              <li className="border-l-4 border-green-500 pl-3 py-1">
                <p className="font-medium">Trädgårdsdag</p>
                <p className="text-sm text-gray-500">2 juli, 10:00 - 14:00</p>
              </li>
              <li className="border-l-4 border-red-500 pl-3 py-1">
                <p className="font-medium">Underhåll av hissar</p>
                <p className="text-sm text-gray-500">15 juli, 08:00 - 12:00</p>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Snabblänkar */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <a href="/dashboard/documents" className="bg-white p-4 rounded-lg shadow-sm flex items-center hover:shadow-md transition-shadow border border-gray-100">
            <svg className="w-6 h-6 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Dokument</span>
          </a>
          <a href="/dashboard/issues" className="bg-white p-4 rounded-lg shadow-sm flex items-center hover:shadow-md transition-shadow border border-gray-100">
            <svg className="w-6 h-6 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <span>Ärenden</span>
          </a>
          <a href="/dashboard/members" className="bg-white p-4 rounded-lg shadow-sm flex items-center hover:shadow-md transition-shadow border border-gray-100">
            <svg className="w-6 h-6 mr-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>Medlemmar</span>
          </a>
          <a href="/dashboard/handbook" className="bg-white p-4 rounded-lg shadow-sm flex items-center hover:shadow-md transition-shadow border border-gray-100">
            <svg className="w-6 h-6 mr-3 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Handbok</span>
          </a>
        </div>
      </div>
    </div>
  );
} 