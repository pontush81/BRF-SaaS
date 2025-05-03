import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Användarvillkor | Handbok.org',
  description: 'Användarvillkor för Handbok.org - din digitala handbok för bostadsrättsföreningar',
  openGraph: {
    title: 'Användarvillkor | Handbok.org',
    description: 'Användarvillkor för Handbok.org - din digitala handbok för bostadsrättsföreningar',
    url: 'https://www.handbok.org/legal/terms',
    siteName: 'Handbok.org',
    locale: 'sv_SE',
    type: 'website',
  },
};

export default function TermsOfService() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="prose max-w-none">
        <h1 className="text-4xl font-bold mb-8">Användarvillkor</h1>
        
        <div className="mb-8">
          <p className="text-sm text-gray-500">Senast uppdaterad: {new Date().toLocaleDateString('sv-SE')}</p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Inledning</h2>
          <p>
            Välkommen till Handbok.org. Dessa användarvillkor reglerar din användning av vår tjänst, 
            inklusive vår webbplats, funktioner och applikationer (gemensamt kallat "Tjänsten").
          </p>
          <p>
            Genom att använda Tjänsten accepterar du att vara bunden av dessa villkor. Om du inte 
            accepterar villkoren får du inte använda Tjänsten.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Tjänstebeskrivning</h2>
          <p>
            Handbok.org erbjuder en digital plattform för bostadsrättsföreningar att skapa, hantera 
            och dela information och dokument. Tjänsten är utformad för att förenkla administrationen 
            av bostadsrättsföreningar och förbättra kommunikationen mellan styrelse och medlemmar.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Registrering och användarkonton</h2>
          <p>
            För att använda Tjänsten måste du skapa ett användarkonto. Du är ansvarig för att hålla 
            ditt lösenord säkert och för all aktivitet som sker under ditt konto. Du måste omedelbart 
            meddela oss om eventuellt obehörig användning av ditt konto.
          </p>
          <p>
            Du bekräftar att den information du tillhandahåller är korrekt, fullständig och aktuell. 
            Felaktig, ofullständig eller inaktuell information kan leda till att ditt konto avslutas.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Avgifter och betalning</h2>
          <p>
            Handbok.org erbjuder både kostnadsfria och betalda tjänster. För betalda tjänster 
            godkänner du att betala alla avgifter enligt prissättningen för den tjänst du prenumererar på.
          </p>
          <p>
            Betalningar görs i förskott och återbetalas inte om du väljer att avsluta din prenumeration 
            innan prenumerationsperioden har löpt ut, om inte annat anges i dessa villkor.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Användning av Tjänsten</h2>
          <p>
            Du får endast använda Tjänsten för lagliga ändamål och i enlighet med dessa villkor. 
            Du godkänner att inte:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Kringgå, avaktivera eller på annat sätt störa säkerhetsfunktioner i Tjänsten</li>
            <li>Använda Tjänsten på ett sätt som skulle kunna skada, avaktivera eller överbelasta systemet</li>
            <li>Använda automatiserade skript för att samla in information från Tjänsten</li>
            <li>Använda Tjänsten för att distribuera skadlig kod eller för att genomföra dataintrång</li>
            <li>Använda Tjänsten för att sprida olagligt, stötande eller olämpligt innehåll</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Immateriella rättigheter</h2>
          <p>
            Tjänsten och dess ursprungliga innehåll, funktioner och funktionalitet ägs av 
            Handbok.org och är skyddade av internationella upphovsrätts-, varumärkes-, patent- 
            och andra immaterialrättsliga lagar.
          </p>
          <p>
            Det innehåll som du laddar upp till Tjänsten förblir din egendom, men du ger oss 
            en licens att använda, modifiera, visa och distribuera detta innehåll i samband med 
            tillhandahållandet av Tjänsten.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Ansvarsbegränsning</h2>
          <p>
            Handbok.org tillhandahåller Tjänsten "i befintligt skick" och "som tillgänglig" 
            utan några garantier, uttryckliga eller underförstådda.
          </p>
          <p>
            Vi garanterar inte att Tjänsten kommer att vara oavbruten, säker eller felfri. 
            Du använder Tjänsten på egen risk.
          </p>
          <p>
            I den utsträckning som tillåts enligt lag, ska Handbok.org inte vara ansvarigt för 
            några direkta, indirekta, tillfälliga, särskilda eller följdskador som uppstår på 
            grund av användning av Tjänsten.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Uppsägning</h2>
          <p>
            Vi kan avsluta eller stänga av ditt konto och tillgång till Tjänsten omedelbart, 
            utan förvarning eller ansvar, om du bryter mot dessa användarvillkor.
          </p>
          <p>
            Vid uppsägning upphör din rätt att använda Tjänsten omedelbart, och du bör avhålla 
            dig från att fortsätta försöka få tillgång till Tjänsten.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Ändringar av villkoren</h2>
          <p>
            Vi förbehåller oss rätten att när som helst ändra eller ersätta dessa villkor. Den 
            senaste versionen av villkoren kommer alltid att finnas tillgänglig på vår webbplats.
          </p>
          <p>
            Din fortsatta användning av Tjänsten efter sådana ändringar utgör ditt samtycke till 
            de nya villkoren.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Tillämplig lag</h2>
          <p>
            Dessa villkor regleras och tolkas i enlighet med svensk lag, utan hänsyn till dess 
            lagvalsregler.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Kontaktinformation</h2>
          <p>
            Om du har frågor om dessa användarvillkor, vänligen kontakta oss på:
          </p>
          <p>E-post: support@handbok.org</p>
        </section>
      </div>
    </div>
  );
} 