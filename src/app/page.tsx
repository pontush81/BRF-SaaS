import Link from 'next/link';
import Image from 'next/image';
import { HeroImage } from '@/components/HeroImage';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Den digitala handboken för din bostadsrättsförening
              </h1>
              <p className="text-xl text-gray-700">
                Samla all viktig information på ett ställe och gör den tillgänglig för alla medlemmar.
                Enkelt att administrera, säkert att använda.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link 
                  href="/demo"
                  className="bg-white text-blue-600 font-medium px-6 py-3 rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors text-center"
                >
                  Se demo
                </Link>
                <Link 
                  href="#pricing"
                  className="bg-blue-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center"
                >
                  Se våra paket
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="rounded-lg bg-white shadow-xl overflow-hidden">
                <HeroImage />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Fördelar med en digital handbok</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="text-blue-600 text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2">Alltid tillgänglig</h3>
              <p className="text-gray-700">Tillgänglig dygnet runt på alla enheter - datorer, surfplattor och mobiler.</p>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="text-blue-600 text-4xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold mb-2">Enkel att uppdatera</h3>
              <p className="text-gray-700">Uppdatera information direkt och alla medlemmar får tillgång till den senaste versionen.</p>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="text-blue-600 text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Sökbar</h3>
              <p className="text-gray-700">Hitta snabbt den information du söker med effektiv sökfunktion.</p>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="text-blue-600 text-4xl mb-4">🌐</div>
              <h3 className="text-xl font-semibold mb-2">Egen domän</h3>
              <p className="text-gray-700">Få en egen subdomän eller använd er egen domän för handboken.</p>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="text-blue-600 text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2">Säker</h3>
              <p className="text-gray-700">Säker inloggning och möjlighet att styra vem som kan se vilken information.</p>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="text-blue-600 text-4xl mb-4">📁</div>
              <h3 className="text-xl font-semibold mb-2">Dokumentbibliotek</h3>
              <p className="text-gray-700">Ladda upp och organisera dokument såsom protokoll, stadgar och policys.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">Så här fungerar det</h2>
          <p className="text-center text-gray-700 mb-12 max-w-2xl mx-auto">
            Att komma igång med er digitala handbok är enkelt och går snabbt
          </p>
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">Välj paket</h3>
              <p className="text-gray-700">Välj det paket som passar er förenings storlek och behov.</p>
            </div>
            
            <div className="flex-1 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">Registrera</h3>
              <p className="text-gray-700">Skapa ett konto och registrera er förening för att få er egen handbok.</p>
            </div>
            
            <div className="flex-1 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">Fyll med innehåll</h3>
              <p className="text-gray-700">Använd vår mall eller skapa eget innehåll för er handbok.</p>
            </div>
            
            <div className="flex-1 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">4</div>
              <h3 className="text-xl font-semibold mb-2">Dela med medlemmar</h3>
              <p className="text-gray-700">Bjud in medlemmar som enkelt kan nå handboken via mobil eller dator.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">Prispaket</h2>
          <p className="text-center text-gray-700 mb-12 max-w-2xl mx-auto">
            Välj det paket som passar er förening bäst. Alla paket inkluderar obegränsad åtkomst för alla medlemmar.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Basic */}
            <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="bg-gray-50 p-6 border-b">
                <h3 className="text-xl font-bold mb-2">Bas</h3>
                <div className="text-4xl font-bold mb-2">999 kr<span className="text-lg font-normal text-gray-600">/år</span></div>
                <p className="text-gray-600">För mindre föreningar</p>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Digital handbok</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Upp till 20 lägenheter</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Egen subdomän</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Grundläggande mallar</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>1 GB dokumentlagring</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <Link 
                    href="/register?plan=basic"
                    className="block w-full bg-blue-600 text-white text-center font-medium py-3 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Kom igång
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Standard */}
            <div className="border rounded-lg overflow-hidden shadow-lg relative">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-3 py-1 rounded-bl-lg font-medium">
                POPULÄR
              </div>
              <div className="bg-blue-50 p-6 border-b">
                <h3 className="text-xl font-bold mb-2">Standard</h3>
                <div className="text-4xl font-bold mb-2">1 999 kr<span className="text-lg font-normal text-gray-600">/år</span></div>
                <p className="text-gray-600">För medelstora föreningar</p>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Digital handbok</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Upp till 50 lägenheter</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Egen subdomän eller domän</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Alla mallar</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>5 GB dokumentlagring</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Ärendehantering</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <Link 
                    href="/register?plan=standard"
                    className="block w-full bg-blue-600 text-white text-center font-medium py-3 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Kom igång
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Premium */}
            <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="bg-gray-50 p-6 border-b">
                <h3 className="text-xl font-bold mb-2">Premium</h3>
                <div className="text-4xl font-bold mb-2">2 999 kr<span className="text-lg font-normal text-gray-600">/år</span></div>
                <p className="text-gray-600">För större föreningar</p>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Digital handbok</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Obegränsat antal lägenheter</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Egen domän med SSL</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Alla mallar + skräddarsydd</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>20 GB dokumentlagring</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Ärendehantering</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Prioriterad support</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <Link 
                    href="/register?plan=premium"
                    className="block w-full bg-blue-600 text-white text-center font-medium py-3 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Kom igång
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Behöver du ett anpassat paket för din förening?</p>
            <Link 
              href="/contact"
              className="text-blue-600 font-medium hover:underline"
            >
              Kontakta oss för offert
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <h2 className="text-3xl font-bold mb-6">Redo att förenkla hanteringen av din förening?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Börja med en 30-dagars gratis testperiod och upptäck fördelarna med en digital handbok.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register"
              className="bg-white text-blue-600 font-medium px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Starta gratis testperiod
            </Link>
            <Link 
              href="/demo"
              className="bg-transparent text-white font-medium px-8 py-3 rounded-lg border border-white hover:bg-blue-700 transition-colors"
            >
              Se demo
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Vanliga frågor</h2>
          
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-xl font-semibold mb-2">Hur lång tid tar det att komma igång?</h3>
              <p className="text-gray-700">Du kan skapa er digitala handbok på bara några minuter. Med våra mallar kan ni ha ett grundinnehåll klart samma dag.</p>
            </div>
            
            <div className="border-b pb-4">
              <h3 className="text-xl font-semibold mb-2">Kan vi migrera från en befintlig pappershandbok?</h3>
              <p className="text-gray-700">Ja, vi kan hjälpa till med migrering från befintliga handböcker. Kontakta oss för mer information och prisuppgift.</p>
            </div>
            
            <div className="border-b pb-4">
              <h3 className="text-xl font-semibold mb-2">Hur säker är informationen?</h3>
              <p className="text-gray-700">Vi använder branschledande säkerhetslösningar för att skydda er data. All information lagras i Sverige och följer GDPR.</p>
            </div>
            
            <div className="border-b pb-4">
              <h3 className="text-xl font-semibold mb-2">Kan vi byta paket senare?</h3>
              <p className="text-gray-700">Ja, ni kan när som helst uppgradera till ett större paket. Nedgradering kan göras vid förnyelse av prenumerationen.</p>
            </div>
            
            <div className="border-b pb-4">
              <h3 className="text-xl font-semibold mb-2">Vad händer efter testperioden?</h3>
              <p className="text-gray-700">Efter 30-dagarsperioden kan ni välja att fortsätta med en betald prenumeration eller avsluta. Vi skickar en påminnelse innan perioden löper ut.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
