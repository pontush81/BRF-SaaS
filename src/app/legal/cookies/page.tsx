import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookiepolicy | Handbok.org',
  description: 'Cookiepolicy för Handbok.org - information om hur vi använder cookies på vår webbplats',
  openGraph: {
    title: 'Cookiepolicy | Handbok.org',
    description: 'Cookiepolicy för Handbok.org - information om hur vi använder cookies på vår webbplats',
    url: 'https://www.handbok.org/legal/cookies',
    siteName: 'Handbok.org',
    locale: 'sv_SE',
    type: 'website',
  },
};

export default function CookiePolicy() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="prose max-w-none">
        <h1 className="text-4xl font-bold mb-8">Cookiepolicy</h1>
        
        <div className="mb-8">
          <p className="text-sm text-gray-500">Senast uppdaterad: {new Date().toLocaleDateString('sv-SE')}</p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Inledning</h2>
          <p>
            Handbok.org ("vi", "oss", "vår") använder cookies och liknande tekniker på vår webbplats. 
            Denna cookiepolicy förklarar hur och varför vi använder cookies, vilka typer av cookies 
            vi använder, och hur du kan hantera dina preferenser gällande cookies.
          </p>
          <p>
            Genom att fortsätta använda vår webbplats godkänner du vår användning av cookies enligt 
            denna cookiepolicy. Om du inte accepterar användningen av cookies kan du inaktivera dem 
            genom att ändra inställningarna i din webbläsare, men det kan påverka din upplevelse 
            av webbplatsen.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Vad är cookies?</h2>
          <p>
            Cookies är små textfiler som placeras på din dator eller mobila enhet när du besöker 
            en webbplats. Cookies används allmänt för att få webbplatser att fungera mer effektivt, 
            för att förbättra användarupplevelsen, och för att tillhandahålla information till ägarna 
            av webbplatsen.
          </p>
          <p>
            Cookies kan vara "permanenta" eller "temporära" (sessionsbaserade). En permanent cookie 
            lagras av webbläsaren och förblir giltig till dess angivna utgångsdatum, om den inte 
            raderas av användaren före utgångsdatumet. En sessionsbaserad cookie upphör när 
            webbläsarsessionen avslutas, när användaren stänger webbläsaren.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Typer av cookies vi använder</h2>
          <p>
            Vi använder följande typer av cookies på vår webbplats:
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">3.1. Nödvändiga cookies</h3>
          <p>
            Dessa cookies är väsentliga för att du ska kunna använda grundläggande funktioner på 
            vår webbplats, såsom inloggning och säker användning av våra tjänster. Dessa cookies 
            samlar inte in information som kan användas för marknadsföringsändamål.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">3.2. Funktionella cookies</h3>
          <p>
            Dessa cookies gör det möjligt för oss att komma ihåg val du gör på webbplatsen (som 
            ditt användarnamn, språk eller region) och tillhandahålla förbättrade, mer personliga 
            funktioner. Informationen som samlas in av dessa cookies kan vara anonymiserad och de 
            kan inte spåra din webbaktivitet på andra webbplatser.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">3.3. Prestanda- och analysbaserade cookies</h3>
          <p>
            Vi använder cookies för att analysera hur besökare använder vår webbplats, för att 
            förbättra dess prestanda och funktion. Dessa cookies hjälper oss att förstå hur 
            besökare interagerar med vår webbplats genom att samla in anonym information.
          </p>
          <p>
            Vi använder Google Analytics, som är ett analysverktyg från Google som hjälper oss att 
            förstå hur användare interagerar med webbplatsen. Google Analytics använder cookies för 
            att samla information om användning av webbplatsen. Denna information lagras på Googles 
            servrar i USA. Google kan överföra denna information till tredje part om det krävs 
            enligt lag eller om tredje part behandlar informationen för Googles räkning.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">3.4. Marknadsföringscookies</h3>
          <p>
            Dessa cookies används för att visa annonser som är mer relevanta för dig och dina 
            intressen. De kan också användas för att begränsa hur många gånger du ser en annons 
            och för att mäta effektiviteten av annonsering. De placeras av annonsörer och 
            annonsrelaterade tjänster som vi använder, såsom sociala medietjänster.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Tredjepartscookies</h2>
          <p>
            Förutom våra egna cookies, kan vi också använda olika tredjepartscookies för att 
            rapportera webbplatsanvändningsstatistik, leverera annonser, med mera. Dessa cookies 
            kan spåra din användning av vår webbplats samt andra webbplatser. Exempel på 
            tredjepartstjänster som kan placera cookies på vår webbplats inkluderar:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Google Analytics (för trafikanalys)</li>
            <li>Google Ads (för annonsering)</li>
            <li>Facebook Pixel (för annonsering och spårning av konvertering)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Hur du hanterar cookies</h2>
          <p>
            Du kan hantera dina preferenser för cookies på flera sätt:
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">5.1. Genom vår cookiehanterare</h3>
          <p>
            När du besöker vår webbplats första gången visas ett cookiemeddelande där du kan välja 
            vilka typer av cookies du godkänner. Du kan när som helst ändra dina preferenser genom 
            att klicka på "Cookieinställningar" längst ner på vår webbplats.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">5.2. Genom dina webbläsarinställningar</h3>
          <p>
            De flesta webbläsare låter dig visa, radera och blockera cookies från webbplatser. 
            Observera att om du tar bort eller blockerar cookies, kan din upplevelse av vår webbplats 
            försämras, eftersom vissa funktioner kanske inte fungerar korrekt.
          </p>
          <p>
            För information om hur du hanterar cookies i din webbläsare, besök:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Chrome: <a href="https://support.google.com/chrome/answer/95647" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">https://support.google.com/chrome/answer/95647</a></li>
            <li>Safari: <a href="https://support.apple.com/sv-se/guide/safari/sfri11471/mac" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">https://support.apple.com/sv-se/guide/safari/sfri11471/mac</a></li>
            <li>Firefox: <a href="https://support.mozilla.org/sv-SE/kb/aktivera-och-inaktivera-cookies-webbplatser-installningar" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">https://support.mozilla.org/sv-SE/kb/aktivera-och-inaktivera-cookies-webbplatser-installningar</a></li>
            <li>Microsoft Edge: <a href="https://support.microsoft.com/sv-se/microsoft-edge/ta-bort-cookies-i-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">https://support.microsoft.com/sv-se/microsoft-edge/ta-bort-cookies-i-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09</a></li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Ändringar av denna cookiepolicy</h2>
          <p>
            Vi kan uppdatera denna cookiepolicy från tid till annan för att återspegla, till exempel, 
            ändringar i de cookies vi använder eller av andra skäl. Vi uppmuntrar dig att regelbundet 
            granska denna cookiepolicy för att hålla dig informerad om vår användning av cookies.
          </p>
          <p>
            Senaste uppdateringen av denna policy gjordes på det datum som visas i början av detta 
            dokument.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Kontakt</h2>
          <p>
            Om du har frågor om vår användning av cookies eller denna cookiepolicy, vänligen kontakta oss på:
          </p>
          <p>E-post: privacy@handbok.org</p>
        </section>
      </div>
    </div>
  );
} 