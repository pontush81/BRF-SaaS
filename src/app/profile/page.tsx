import ProfileInfo from '@/components/auth/ProfileInfo';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Min profil | BRF-SaaS',
  description: 'Hantera din profilinformation och kontoinställningar',
};

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Min profil</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidopanel med navigationslänkar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="font-medium text-lg mb-3">Konto</h2>
              <nav>
                <ul className="space-y-1">
                  <li>
                    <a 
                      href="/profile" 
                      className="block px-3 py-2 rounded-md bg-blue-50 text-blue-700 font-medium"
                    >
                      Profil
                    </a>
                  </li>
                  <li>
                    <a 
                      href="/profile/security" 
                      className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Säkerhet
                    </a>
                  </li>
                  <li>
                    <a 
                      href="/profile/notifications" 
                      className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Notifieringar
                    </a>
                  </li>
                </ul>
              </nav>
              
              <h2 className="font-medium text-lg mt-6 mb-3">Organisation</h2>
              <nav>
                <ul className="space-y-1">
                  <li>
                    <a 
                      href="/organization/settings" 
                      className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Inställningar
                    </a>
                  </li>
                  <li>
                    <a 
                      href="/organization/members" 
                      className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Medlemmar
                    </a>
                  </li>
                  <li>
                    <a 
                      href="/organization/subscription" 
                      className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Prenumeration
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
          
          {/* Huvudinnehåll */}
          <div className="md:col-span-2">
            <ProfileInfo />
          </div>
        </div>
      </div>
    </div>
  );
} 