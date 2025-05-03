import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getCurrentUserServer } from '@/lib/auth/roleUtils';
import { redirect } from 'next/navigation';
import { HeroImage } from '@/components/HeroImage';

export const metadata: Metadata = {
  title: 'BRF Handbok - Den digitala lösningen för bostadsrättsföreningar',
  description: 'Förenkla hanteringen av din bostadsrättsförening med vår digitala handbok. Samlad information, dokument och kommunikation på ett ställe.',
  keywords: 'BRF, bostadsrättsförening, digital handbok, förvaltning, styrelsearbete, boendeinformation',
  openGraph: {
    title: 'BRF Handbok - Den digitala lösningen för bostadsrättsföreningar',
    description: 'Förenkla hanteringen av din bostadsrättsförening med vår digitala handbok. Samlad information, dokument och kommunikation på ett ställe.',
    type: 'website',
    url: 'https://handbok.se',
  },
};

export default async function Home() {
  const user = await getCurrentUserServer();

  // If user is logged in and has an organization, redirect to subdomain
  if (user?.organization?.slug) {
    const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'handbok.se';
    const subdomain = `${user.organization.slug}.${appDomain}`;
    redirect(`https://${subdomain}/dashboard`);
  }

  return (
    <main>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-blue-900">
                Digital lösning för moderna bostadsrättsföreningar
              </h1>
              <p className="text-lg md:text-xl text-gray-700 mb-8">
                Samla all information på ett ställe. Förenkla styrelsearbetet och förbättra kommunikationen med alla boende.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register?type=admin" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg text-center transition-colors">
                  Registrera din förening
                </Link>
                <Link href="/features" className="bg-white hover:bg-gray-50 text-blue-600 font-medium py-3 px-6 rounded-lg border border-blue-200 text-center transition-colors">
                  Upptäck funktioner
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                <Image 
                  src="https://placehold.co/600x400/e6f2ff/1e40af?text=BRF+Handbok" 
                  alt="BRF Handbok plattform" 
                  width={600} 
                  height={400}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Fördelar för din bostadsrättsförening</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Egen subdomän</h3>
              <p className="text-gray-600">
                Varje förening får en egen subdomän (dinförening.handbok.se) för enkel åtkomst till innehållet.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Dokumenthantering</h3>
              <p className="text-gray-600">
                Ladda upp och organisera viktiga dokument som årsredovisningar, stadgar och protokoll.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Hantera roller</h3>
              <p className="text-gray-600">
                Administrera användarrättigheter enkelt. Styrelse, redaktörer och medlemmar får anpassad åtkomst.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Redo att förenkla arbetet i din förening?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Skapa ett konto idag och ta det första steget mot en bättre föreningsadministration.
          </p>
          <Link href="/register?type=admin" className="bg-white hover:bg-gray-100 text-blue-600 font-medium py-3 px-8 rounded-lg inline-block transition-colors">
            Registrera din förening
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Vad säger våra kunder</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="italic text-gray-600 mb-4">
                "Sedan vi började använda den digitala handboken har kommunikationen i föreningen förbättrats markant. Nyinflyttade får tillgång till all information direkt."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                <div>
                  <p className="font-medium">Anna Karlsson</p>
                  <p className="text-sm text-gray-500">Ordförande, BRF Sjöutsikten</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="italic text-gray-600 mb-4">
                "Att ha all dokumentation samlad på ett ställe med sökmöjligheter har sparat oss enormt mycket tid. Styrelsearbetet har blivit mycket effektivare."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                <div>
                  <p className="font-medium">Per Johansson</p>
                  <p className="text-sm text-gray-500">Sekreterare, BRF Parkbacken</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
