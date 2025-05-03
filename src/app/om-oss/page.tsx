import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Om oss | BRF Handbok',
  description: 'Lär känna teamet bakom BRF Handbok - den digitala lösningen för moderna bostadsrättsföreningar. Vår vision, historia och värderingar.',
  keywords: 'BRF Handbok, om oss, bostadsrättsförening, digital handbok, historia, team',
};

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Om BRF Handbok</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Vår vision</h2>
        <p className="mb-4">
          BRF Handbok föddes ur en enkel idé: att förenkla arbetet för styrelser i bostadsrättsföreningar och förbättra informationsflödet till boende. Vi tror på att digital transformation kan göra föreningslivet enklare, mer transparent och mer effektivt.
        </p>
        <p className="mb-4">
          Vår mission är att leverera den bästa digitala plattformen för bostadsrättsföreningar, där all viktig information samlas på ett ställe, lättillgänglig för alla som behöver den.
        </p>
        <p className="mb-4">
          Vi strävar efter att hjälpa föreningar att:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Förenkla administrationen och styrelsearbetet</li>
          <li>Förbättra kommunikationen med boende</li>
          <li>Säkert lagra och dela viktiga dokument</li>
          <li>Skapa en digital gemenskap i föreningen</li>
        </ul>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Vår historia</h2>
        <div className="space-y-6">
          <div className="flex">
            <div className="mr-4 flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-semibold">2022</span>
              </div>
            </div>
            <div>
              <h3 className="font-medium">Idén föds</h3>
              <p className="text-gray-600">
                Efter år av frustration i olika bostadsrättsföreningar insåg grundarna behovet av en digital lösning för att hantera dokumentation och kommunikation.
              </p>
            </div>
          </div>
          
          <div className="flex">
            <div className="mr-4 flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-semibold">2023</span>
              </div>
            </div>
            <div>
              <h3 className="font-medium">Lansering av BRF Handbok</h3>
              <p className="text-gray-600">
                Efter månader av utveckling och tester med pilotföreningar lanserades den första versionen av BRF Handbok.
              </p>
            </div>
          </div>
          
          <div className="flex">
            <div className="mr-4 flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-semibold">2024</span>
              </div>
            </div>
            <div>
              <h3 className="font-medium">Expansion och nya funktioner</h3>
              <p className="text-gray-600">
                Tjänsten fortsätter att växa med fler funktioner och förbättringar baserat på feedback från användare. Vi är nu stolta över att serva hundratals föreningar i hela Sverige.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Teamet</h2>
        <p className="mb-6">
          Bakom BRF Handbok står ett dedikerat team med erfarenhet från både bostadsrättsföreningar och mjukvaruutveckling. Vi kombinerar teknisk expertis med djup förståelse för föreningars behov.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full mb-4"></div>
            <h3 className="font-medium">Anna Svensson</h3>
            <p className="text-gray-600">VD & Medgrundare</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full mb-4"></div>
            <h3 className="font-medium">Johan Lindberg</h3>
            <p className="text-gray-600">Teknisk chef & Medgrundare</p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link href="/kontakt" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
          Kontakta oss
        </Link>
      </div>
    </main>
  );
} 