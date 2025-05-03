import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Kontakta oss | BRF Handbok',
  description: 'Kontakta oss med frågor om BRF Handbok. Vi hjälper dig att komma igång med den digitala lösningen för din bostadsrättsförening.',
  keywords: 'BRF, kontakt, bostadsrättsförening, digital handbok, support',
};

export default function ContactPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Kontakta oss</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Vi hjälper dig</h2>
        <p className="mb-4">
          Har du frågor om BRF Handbok eller behöver hjälp med att komma igång? Vi finns här för att hjälpa dig och din förening.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mt-8">
          <div>
            <h3 className="text-lg font-medium mb-3">Kontaktinformation</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">📧</span>
                <span>E-post: <a href="mailto:info@handbok.org" className="text-blue-600 hover:underline">info@handbok.org</a></span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">📱</span>
                <span>Telefon: 08-123 45 67</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">🏢</span>
                <span>
                  Adress: BRF Handbok AB<br />
                  Storgatan 1<br />
                  123 45 Stockholm
                </span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-3">Kundtjänst</h3>
            <p className="mb-2">
              Vår kundtjänst är öppen vardagar mellan 09:00-17:00.
            </p>
            <p className="mb-4">
              Vi strävar efter att svara på alla e-postförfrågningar inom 24 timmar under arbetsdagar.
            </p>
            <Link href="/register?type=admin" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Registrera din förening
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Vanliga frågor</h2>
        <div className="space-y-4">
          <details className="border-b pb-2">
            <summary className="font-medium cursor-pointer">Hur kommer vi igång med BRF Handbok?</summary>
            <p className="mt-2 text-gray-600">
              För att komma igång, registrera din förening via vårt registreringsformulär. Efter registrering får ni tillgång till ett startkit med all information ni behöver.
            </p>
          </details>
          
          <details className="border-b pb-2">
            <summary className="font-medium cursor-pointer">Vad kostar tjänsten?</summary>
            <p className="mt-2 text-gray-600">
              Vi erbjuder olika prisplaner beroende på föreningens storlek och behov. Kontakta oss för ett skräddarsytt erbjudande.
            </p>
          </details>
          
          <details className="border-b pb-2">
            <summary className="font-medium cursor-pointer">Kan vi testa tjänsten innan vi bestämmer oss?</summary>
            <p className="mt-2 text-gray-600">
              Ja, vi erbjuder en kostnadsfri testperiod på 30 dagar för alla föreningar.
            </p>
          </details>
          
          <details className="border-b pb-2">
            <summary className="font-medium cursor-pointer">Hur hanterar ni data och personuppgifter?</summary>
            <p className="mt-2 text-gray-600">
              Vi tar dataskydd på största allvar och följer GDPR-regelverket. Läs mer i vår integritetspolicy.
            </p>
          </details>
        </div>
        <div className="mt-6 text-center">
          <Link href="/faq" className="text-blue-600 hover:underline">Se alla vanliga frågor</Link>
        </div>
      </div>
    </main>
  );
} 