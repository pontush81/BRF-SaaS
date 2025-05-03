import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Integritetspolicy | Handbok.org',
  description: 'Integritetspolicy för Handbok.org - så hanterar vi dina personuppgifter',
  openGraph: {
    title: 'Integritetspolicy | Handbok.org',
    description: 'Integritetspolicy för Handbok.org - så hanterar vi dina personuppgifter',
    url: 'https://www.handbok.org/legal/privacy',
    siteName: 'Handbok.org',
    locale: 'sv_SE',
    type: 'website',
  },
};

export default function PrivacyPolicy() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="prose max-w-none">
        <h1 className="text-4xl font-bold mb-8">Integritetspolicy</h1>
        
        <div className="mb-8">
          <p className="text-sm text-gray-500">Senast uppdaterad: {new Date().toLocaleDateString('sv-SE')}</p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Inledning</h2>
          <p>
            Handbok.org ("vi", "oss", "vår") värnar om din personliga integritet. Denna integritetspolicy 
            förklarar hur vi samlar in, använder, delar och skyddar information i samband med vår 
            webbplats, tjänster och applikationer (gemensamt "Tjänsten").
          </p>
          <p>
            Genom att använda Tjänsten godkänner du insamlandet och användningen av information i enlighet 
            med denna policy. Om du inte samtycker till vår integritetspolicy, vänligen avstå från att 
            använda vår Tjänst.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Personuppgiftsansvarig</h2>
          <p>
            Handbok.org är personuppgiftsansvarig för behandlingen av dina personuppgifter enligt 
            denna integritetspolicy.
          </p>
          <p>Kontaktuppgifter:</p>
          <p>E-post: privacy@handbok.org</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Vilka personuppgifter vi samlar in</h2>
          <p>
            Vi samlar in olika typer av information för att tillhandahålla och förbättra vår Tjänst.
          </p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">3.1. Information du tillhandahåller</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Registreringsinformation: När du skapar ett konto samlar vi in information som namn, e-postadress, lösenord och telefonnummer.</li>
            <li>Profilinformation: Information som du lägger till i din profil, såsom din titel, roll i bostadsrättsföreningen, profilbild, etc.</li>
            <li>Innehåll: Information och dokument som du laddar upp, skapar eller delar via Tjänsten.</li>
            <li>Kommunikation: När du kontaktar vår support, skickar förfrågningar eller på annat sätt kommunicerar med oss.</li>
            <li>Betalningsinformation: Om du prenumererar på våra betalda tjänster, samlar vi in betalningsinformation som krävs för att behandla din betalning.</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">3.2. Information som samlas in automatiskt</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Användningsinformation: Vi registrerar hur du interagerar med vår Tjänst, inklusive vilka funktioner du använder och hur ofta.</li>
            <li>Enhetsinformation: Vi kan samla in information om enheten du använder för att komma åt Tjänsten, inklusive IP-adress, webbläsartyp, operativsystem, etc.</li>
            <li>Cookies och liknande tekniker: Vi använder cookies och liknande tekniker för att spåra aktivitet på vår Tjänst och lagra viss information. Se vår cookiepolicy för mer information.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Hur vi använder dina personuppgifter</h2>
          <p>
            Vi använder de insamlade uppgifterna för olika ändamål, inklusive att:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Tillhandahålla, underhålla och förbättra vår Tjänst</li>
            <li>Skapa och administrera ditt konto</li>
            <li>Verifiera din identitet</li>
            <li>Möjliggöra kommunikation med andra användare</li>
            <li>Skicka administrativa meddelanden, som uppdateringar, säkerhetsvarningar och supportmeddelanden</li>
            <li>Skicka marknadsföring och erbjudanden om du har samtyckt till det</li>
            <li>Förhindra, identifiera och åtgärda tekniska problem, bedrägerier eller säkerhetsproblem</li>
            <li>Uppfylla rättsliga skyldigheter</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Rättslig grund för behandling</h2>
          <p>
            Vi behandlar dina personuppgifter med följande rättsliga grunder:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Avtal:</strong> För att fullgöra vårt avtal med dig när du använder vår Tjänst.</li>
            <li><strong>Berättigat intresse:</strong> När behandlingen ligger i vårt legitima intresse och inte åsidosätts av dina rättigheter.</li>
            <li><strong>Rättslig skyldighet:</strong> För att uppfylla våra rättsliga skyldigheter.</li>
            <li><strong>Samtycke:</strong> I vissa fall behandlar vi dina uppgifter baserat på ditt samtycke.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Delning av personuppgifter</h2>
          <p>
            Vi delar endast dina personuppgifter i följande situationer:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Med tjänsteleverantörer:</strong> Vi kan anlita tredjepartsleverantörer för att utföra tjänster å våra vägnar, såsom hosting, fakturering, kundtjänst, etc.</li>
            <li><strong>Med andra användare:</strong> När du delar information med andra användare i din bostadsrättsförening.</li>
            <li><strong>För att skydda rättigheter:</strong> Om det är nödvändigt för att undersöka, förhindra eller vidta åtgärder mot olagliga aktiviteter.</li>
            <li><strong>Med myndigheter:</strong> Om vi är skyldiga att lämna ut uppgifter enligt lag.</li>
            <li><strong>Vid en företagsöverlåtelse:</strong> Om vi är inblandade i en fusion, förvärv eller försäljning av alla eller en del av våra tillgångar.</li>
          </ul>
          <p>
            Vi säljer inte, hyr ut eller delar dina personuppgifter med tredje part för deras marknadsföringsändamål utan ditt uttryckliga samtycke.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Hur länge vi lagrar dina uppgifter</h2>
          <p>
            Vi behåller dina personuppgifter endast så länge som är nödvändigt för de ändamål som anges i denna integritetspolicy, 
            så länge som krävs för att tillhandahålla Tjänsten, eller så länge som krävs enligt lag.
          </p>
          <p>
            När du raderar ditt konto, kommer vi att ta bort dina personuppgifter från våra aktiva databaser men 
            kan behålla vissa uppgifter i arkiv för att uppfylla rättsliga skyldigheter, förhindra bedrägerier, 
            lösa tvister eller för andra berättigade intressen.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Dina rättigheter</h2>
          <p>
            Enligt dataskyddsförordningen (GDPR) har du följande rättigheter avseende dina personuppgifter:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Rätt till tillgång:</strong> Du har rätt att få bekräftelse på om vi behandlar dina personuppgifter och i så fall få tillgång till dessa uppgifter.</li>
            <li><strong>Rätt till rättelse:</strong> Du har rätt att begära att vi korrigerar felaktiga personuppgifter om dig.</li>
            <li><strong>Rätt till radering:</strong> Du har rätt att begära att vi raderar dina personuppgifter under vissa omständigheter.</li>
            <li><strong>Rätt till begränsning av behandling:</strong> Du har rätt att begära att vi begränsar behandlingen av dina personuppgifter under vissa omständigheter.</li>
            <li><strong>Rätt till dataportabilitet:</strong> Du har rätt att få ut dina personuppgifter i ett strukturerat, allmänt använt och maskinläsbart format.</li>
            <li><strong>Rätt att göra invändningar:</strong> Du har rätt att göra invändningar mot behandling av dina personuppgifter under vissa omständigheter.</li>
            <li><strong>Rätt att återkalla samtycke:</strong> Om vi behandlar dina uppgifter baserat på samtycke, har du rätt att när som helst återkalla ditt samtycke.</li>
          </ul>
          <p>
            För att utöva dina rättigheter, vänligen kontakta oss via privacy@handbok.org. Vi kommer att svara på din begäran 
            inom en månad, men vi kan behöva förlänga denna period med ytterligare två månader om nödvändigt.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Dataskydd</h2>
          <p>
            Vi vidtar lämpliga tekniska och organisatoriska åtgärder för att skydda dina personuppgifter mot 
            oavsiktlig förlust och obehörig åtkomst, användning, ändring och avslöjande.
          </p>
          <p>
            Trots våra ansträngningar kan vi inte garantera att obehöriga tredje parter aldrig kommer att 
            kunna besegra våra säkerhetsåtgärder. Vi kan därför inte garantera säkerheten för information 
            som du delar med oss.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Internationella överföringar</h2>
          <p>
            Dina personuppgifter kan överföras till och behandlas i länder utanför EU/EES. I sådana fall 
            vidtar vi lämpliga skyddsåtgärder för att säkerställa att dina uppgifter skyddas i enlighet 
            med denna integritetspolicy och tillämplig dataskyddslagstiftning.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Ändringar av denna integritetspolicy</h2>
          <p>
            Vi kan uppdatera vår integritetspolicy från tid till annan. Vi kommer att meddela dig om väsentliga 
            ändringar genom att publicera den nya integritetspolicyn på denna sida och, om nödvändigt, meddela 
            dig via e-post.
          </p>
          <p>
            Vi rekommenderar att du regelbundet granskar denna integritetspolicy för eventuella ändringar. 
            Ändringar av denna integritetspolicy träder i kraft när de publiceras på denna sida.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. Kontakt</h2>
          <p>
            Om du har frågor om denna integritetspolicy eller vill utöva dina rättigheter, vänligen kontakta oss på:
          </p>
          <p>E-post: privacy@handbok.org</p>
          <p>
            Du har också rätt att lämna in ett klagomål till Integritetsskyddsmyndigheten (www.imy.se) om 
            du anser att vår behandling av dina personuppgifter inte följer dataskyddslagstiftningen.
          </p>
        </section>
      </div>
    </div>
  );
} 