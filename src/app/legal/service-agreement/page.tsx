import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tjänsteavtal | Handbok.org',
  description: 'Tjänsteavtal för bostadsrättsföreningar som använder Handbok.org - villkor, pris och ansvar',
  openGraph: {
    title: 'Tjänsteavtal | Handbok.org',
    description: 'Tjänsteavtal för bostadsrättsföreningar som använder Handbok.org - villkor, pris och ansvar',
    url: 'https://www.handbok.org/legal/service-agreement',
    siteName: 'Handbok.org',
    locale: 'sv_SE',
    type: 'website',
  },
};

export default function ServiceAgreement() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="prose max-w-none">
        <h1 className="text-4xl font-bold mb-8">Tjänsteavtal för bostadsrättsföreningar</h1>
        
        <div className="mb-8">
          <p className="text-sm text-gray-500">Senast uppdaterad: {new Date().toLocaleDateString('sv-SE')}</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
          <p className="text-amber-800 font-medium">
            Denna handbok är ett stödverktyg och ersätter inte juridisk rådgivning. Informationen bör anpassas 
            till föreningens stadgar, avtal och rutiner.
          </p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Inledning</h2>
          <p>
            Detta tjänsteavtal ("Avtalet") ingås mellan Handbok.org ("Leverantören") och den 
            bostadsrättsförening som prenumererar på tjänsten ("Föreningen"). Avtalet reglerar 
            användningen av den digitala plattformen Handbok.org ("Tjänsten").
          </p>
          <p>
            Genom att acceptera detta avtal bekräftar Föreningen att den har läst, förstått och 
            samtycker till att vara bunden av villkoren i detta avtal.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Tjänstebeskrivning</h2>
          <p>
            Handbok.org tillhandahåller en digital plattform där Föreningen kan skapa, hantera 
            och dela information och dokument relevanta för föreningens verksamhet och medlemmar.
          </p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">2.1 Följande ingår i tjänsten:</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Tillgång till en digital handbok för föreningens information och dokumentation</li>
            <li>Möjlighet att skapa och organisera innehåll i ett hierarkiskt system</li>
            <li>Stöd för uppladdning och lagring av dokument (upp till avtalad lagringskapacitet)</li>
            <li>Användarhantering med olika behörighetsnivåer</li>
            <li>Säker inloggning för alla användare</li>
            <li>Automatisk säkerhetskopiering av all information</li>
            <li>Support via e-post under kontorstid</li>
            <li>Kontinuerliga uppdateringar och förbättringar av plattformen</li>
            <li>Tillgång till mallbaserade dokument och guider</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">2.2 Tjänstenivåer</h3>
          <p>
            Handbok.org erbjuder följande tjänstenivåer:
          </p>
          <div className="overflow-x-auto mt-4 mb-6">
            <table className="min-w-full divide-y divide-gray-300 border">
              <thead>
                <tr className="bg-gray-50">
                  <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-gray-900">Funktion</th>
                  <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-gray-900">Bas</th>
                  <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-gray-900">Standard</th>
                  <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-gray-900">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                <tr>
                  <td className="py-2 px-4 text-sm text-gray-900">Antal användare</td>
                  <td className="py-2 px-4 text-sm text-gray-500">Max 10</td>
                  <td className="py-2 px-4 text-sm text-gray-500">Max 50</td>
                  <td className="py-2 px-4 text-sm text-gray-500">Obegränsat</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 text-sm text-gray-900">Lagringskapacitet</td>
                  <td className="py-2 px-4 text-sm text-gray-500">5 GB</td>
                  <td className="py-2 px-4 text-sm text-gray-500">20 GB</td>
                  <td className="py-2 px-4 text-sm text-gray-500">50 GB</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 text-sm text-gray-900">Support</td>
                  <td className="py-2 px-4 text-sm text-gray-500">E-post</td>
                  <td className="py-2 px-4 text-sm text-gray-500">E-post & telefon</td>
                  <td className="py-2 px-4 text-sm text-gray-500">Prioriterad support</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 text-sm text-gray-900">Anpassningsbar design</td>
                  <td className="py-2 px-4 text-sm text-gray-500">Begränsad</td>
                  <td className="py-2 px-4 text-sm text-gray-500">Standard</td>
                  <td className="py-2 px-4 text-sm text-gray-500">Fullständig</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 text-sm text-gray-900">Backup-frekvens</td>
                  <td className="py-2 px-4 text-sm text-gray-500">Daglig</td>
                  <td className="py-2 px-4 text-sm text-gray-500">Daglig</td>
                  <td className="py-2 px-4 text-sm text-gray-500">Realtid</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Detaljerade beskrivningar av varje tjänstenivås funktionalitet finns på vår prissättningssida.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Priser och betalning</h2>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">3.1 Priser</h3>
          <p>
            Aktuella priser för olika tjänstenivåer finns på vår webbplats. Priser anges exklusive 
            moms och baseras på tjänstenivå och avtalets längd.
          </p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">3.2 Betalningsmodell</h3>
          <p>
            Betalning kan göras månadsvis eller årsvis enligt följande villkor:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Månadsvis betalning:</strong> Faktureras i förskott den första dagen i varje månad.</li>
            <li><strong>Årsvis betalning:</strong> Faktureras i förskott för hela perioden med 10% rabatt på totalpriset.</li>
          </ul>
          <p>
            Betalningsvillkor är 30 dagar netto från fakturadatum. Vid försenad betalning utgår 
            dröjsmålsränta enligt räntelagen samt påminnelseavgift.
          </p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">3.3 Prisändringar</h3>
          <p>
            Leverantören förbehåller sig rätten att ändra priser. Prisändringar meddelas skriftligen 
            minst 60 dagar i förväg och träder i kraft vid nästa förlängningsperiod. Vid väsentliga 
            prisökningar har Föreningen rätt att säga upp avtalet innan prisändringen träder i kraft.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Avtalstid och uppsägning</h2>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">4.1 Avtalstid</h3>
          <p>
            Avtalet gäller från det datum då Föreningen registrerar sig för Tjänsten och löper 
            initialt under 12 månader om inte annat avtalats skriftligen. Därefter förlängs avtalet 
            automatiskt med 12 månader i taget om det inte sägs upp.
          </p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">4.2 Uppsägning</h3>
          <p>
            Uppsägning ska ske skriftligen senast 3 månader före avtalsperiodens utgång. 
            Vid utebliven uppsägning förlängs avtalet automatiskt enligt punkt 4.1.
          </p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">4.3 Konsekvenser vid uppsägning</h3>
          <p>
            Vid avtalets upphörande gäller följande:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Föreningens tillgång till Tjänsten upphör vid avtalsperiodens slut.</li>
            <li>Föreningen ges möjlighet att exportera all information och alla dokument under en period av 30 dagar efter avtalets upphörande.</li>
            <li>Efter denna 30-dagarsperiod raderas all Föreningens data permanent från Tjänsten.</li>
            <li>Leverantören tillhandahåller på begäran en komplett kopia av all Föreningens data i ett standardiserat format mot en administrativ avgift.</li>
          </ul>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">4.4 Förtida uppsägning</h3>
          <p>
            Båda parter har rätt att säga upp avtalet med omedelbar verkan om den andra parten:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Väsentligt bryter mot avtalet och inte rättar till bristen inom 30 dagar efter skriftlig anmaning.</li>
            <li>Försätts i konkurs, inleder företagsrekonstruktion, träder i likvidation eller annars kan anses vara på obestånd.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Parternas ansvar</h2>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">5.1 Leverantörens ansvar</h3>
          <p>
            Leverantören ansvarar för:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Att Tjänsten är tillgänglig enligt avtalad tillgänglighet (99,5% tillgänglighet per månad, exklusive planerat underhåll).</li>
            <li>Att Tjänsten underhålls och uppdateras regelbundet.</li>
            <li>Att säkerhetskopiering sker enligt avtalad tjänstenivå.</li>
            <li>Att personuppgifter hanteras i enlighet med dataskyddsförordningen (GDPR) och gällande personuppgiftsbiträdesavtal.</li>
            <li>Att teknisk support tillhandahålls enligt avtalad tjänstenivå.</li>
            <li>Att vidta rimliga åtgärder för att skydda Föreningens data mot obehörig åtkomst.</li>
            <li>Att upprätthålla och uppdatera plattformens grundläggande funktioner.</li>
          </ul>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">5.2 Föreningens ansvar</h3>
          <p>
            Föreningen ansvarar för:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Att användare inom föreningen följer användarvillkoren för Tjänsten.</li>
            <li>Att inte lagra olagligt, stötande eller på annat sätt olämpligt material i Tjänsten.</li>
            <li>Att upprätthålla sekretess för inloggningsuppgifter och omedelbart meddela Leverantören om misstänkt säkerhetsöverträdelse.</li>
            <li>Att utse en eller flera administratörer som hanterar föreningens konto.</li>
            <li>Att korrekt information finns i Tjänsten och att Föreningens innehåll överensstämmer med gällande lagar och regler.</li>
            <li>Att betala avtalade avgifter i tid.</li>
            <li>Att anpassa mallarna till föreningens specifika förhållanden.</li>
          </ul>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">5.3 Ansvarsbegränsning</h3>
          <p>
            Leverantören ansvarar inte för:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Riktigheten i det innehåll som Föreningen eller dess användare skapar i Tjänsten.</li>
            <li>Beslut som Föreningens styrelse fattar baserat på information i Tjänsten.</li>
            <li>Skada som uppstår på grund av felaktig användning av Tjänsten.</li>
            <li>Indirekta skador såsom förlorad vinst, förlorad omsättning, förlust av data eller tredjepartskrav.</li>
            <li>Driftstörningar orsakade av force majeure-händelser såsom naturkatastrofer, arbetskonflikt, krig, myndighetsåtgärd eller liknande.</li>
          </ul>
          <p>
            Leverantörens totala skadeståndsansvar är begränsat till ett belopp motsvarande de avgifter 
            som Föreningen betalat under de senaste 12 månaderna före skadans uppkomst.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Innehållsansvar och mallar</h2>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">6.1 Mallbaserad lösning</h3>
          <p>
            Handbok.org tillhandahåller en mallbaserad lösning där styrelsen kan anpassa innehållet 
            efter föreningens specifika behov. Det är viktigt att förstå att:
          </p>
          <p className="bg-amber-50 p-4 border-l-4 border-amber-500 my-4 font-medium">
            Denna handbok är ett stödverktyg och ersätter inte juridisk rådgivning. Informationen bör anpassas 
            till föreningens stadgar, avtal och rutiner.
          </p>
          <p>
            Mallarna och dokumenten är utformade för att ge en utgångspunkt och fungera som stöd i 
            föreningens arbete, men måste alltid granskas och anpassas av styrelsen innan de används.
          </p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">6.2 Föreningens innehållsansvar</h3>
          <p>
            Föreningen ansvarar fullt ut för det innehåll som skapas, ändras eller publiceras i Tjänsten, inklusive:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Riktigheten i all information som förs in i handboken</li>
            <li>Anpassning av mallar till föreningens specifika förhållanden</li>
            <li>Säkerställande att innehållet överensstämmer med föreningens stadgar</li>
            <li>Att innehållet följer gällande lagar och regler</li>
            <li>Beslut som fattas baserat på information i handboken</li>
          </ul>
          <p>
            Föreningen bekräftar att de förstår att mallarna måste anpassas till föreningens specifika 
            förhållanden och att Leverantören inte ansvarar för konsekvenserna av beslut som tas baserat 
            på Tjänstens innehåll.
          </p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">6.3 Leverantörens begränsade innehållsansvar</h3>
          <p>
            Leverantören ansvarar för:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Att grundmallarna är utformade enligt allmän praxis</li>
            <li>Att uppdatera plattformen och grundmallar vid betydande lagändringar som påverkar bostadsrättsföreningar generellt</li>
            <li>Att tillhandahålla användarvänliga verktyg för anpassning av innehållet</li>
          </ul>
          <p>
            Leverantören garanterar dock inte att mallarna är fullständigt uppdaterade med alla 
            lagändringar eller att de är anpassade till varje förenings unika behov och förhållanden.
          </p>
          <p>
            För mer detaljerad information om innehållsansvar, se vår särskilda 
            <a href="/legal/disclaimer" className="text-blue-600 hover:underline"> ansvarsfriskrivning</a>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Driftsäkerhet och backup</h2>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">7.1 Tillgänglighet</h3>
          <p>
            Leverantören garanterar en tillgänglighet på 99,5% per månad, exklusive planerat underhåll. 
            Planerat underhåll aviseras minst 48 timmar i förväg och utförs normalt under kvällar och helger.
          </p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">7.2 Backuper</h3>
          <p>
            All data säkerhetskopieras enligt följande:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Dagliga backuper som sparas i 30 dagar.</li>
            <li>Veckovisa backuper som sparas i 3 månader.</li>
            <li>Månatliga backuper som sparas i 12 månader.</li>
          </ul>
          <p>
            Backuper lagras krypterat på geografiskt åtskilda servrar inom EU. Återställning från 
            backup kan göras på begäran och är kostnadsfri en gång per kvartal. Ytterligare 
            återställningar debiteras enligt gällande prislista.
          </p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">7.3 Datasäkerhet</h3>
          <p>
            Leverantören vidtar följande åtgärder för att skydda Föreningens data:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>All data krypteras både vid lagring och överföring.</li>
            <li>Serverplattformen uppdateras regelbundet med säkerhetsuppdateringar.</li>
            <li>Penetrationstester genomförs minst en gång per år av oberoende säkerhetsexperter.</li>
            <li>Åtkomstkontroller och autentiseringsmekanismer övervakas kontinuerligt.</li>
            <li>All personlig data hanteras i enlighet med GDPR.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Support och kundtjänst</h2>
          <p>
            Support tillhandahålls enligt följande:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>E-postsupport:</strong> Tillgänglig helgfria vardagar mellan 09:00 och 17:00.</li>
            <li><strong>Telefonsupport:</strong> Tillgänglig för Standard- och Premium-kunder helgfria vardagar mellan 09:00 och 16:00.</li>
            <li><strong>Svarstider:</strong> E-post besvaras normalt inom 24 timmar under arbetsdagar. Prioriterade ärenden för Premium-kunder besvaras normalt inom 4 timmar under kontorstid.</li>
          </ul>
          <p>
            Kontaktuppgifter till support finns på vår webbplats samt under "Kontakt & Support" i Tjänsten.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Ändringar i avtalet</h2>
          <p>
            Leverantören förbehåller sig rätten att ändra villkoren i detta avtal. Väsentliga 
            ändringar meddelas Föreningen skriftligen minst 60 dagar innan ändringarna träder i kraft. 
            Om Föreningen inte accepterar ändringarna har Föreningen rätt att säga upp avtalet innan 
            ändringarna träder i kraft, varvid avtalet upphör vid tidpunkten för ändringarnas ikraftträdande.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Tvist</h2>
          <p>
            Tvist angående tolkning eller tillämpning av detta avtal ska avgöras enligt svensk 
            lag i svensk allmän domstol med Stockholms tingsrätt som första instans.
          </p>
        </section>

        <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200">
          <h2 className="text-2xl font-semibold mb-4">Kontakta oss</h2>
          <p className="mb-4">
            Om du har frågor om detta tjänsteavtal, vänligen kontakta oss på:
          </p>
          <p>E-post: <a href="mailto:avtal@handbok.org" className="text-blue-600 hover:underline">avtal@handbok.org</a></p>
          <p>Telefon: 08-123 45 67</p>
        </div>
      </div>
    </div>
  );
} 