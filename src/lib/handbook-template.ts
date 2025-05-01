import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Standardmall för handboken som fylls i för nya organisationer
 */
export const handbookTemplate = [
  {
    title: "Välkommen",
    sortOrder: 1,
    pages: [
      {
        title: "Om din bostadsrättsförening",
        sortOrder: 1,
        content: `# Välkommen till din bostadsrättsförening

Detta är din digitala handbok som innehåller all information du behöver som boende i föreningen.

## Vad är en bostadsrättsförening?

En bostadsrättsförening är en ekonomisk förening som äger en eller flera fastigheter. Som medlem i föreningen äger du rätten att bo i din lägenhet, men det är föreningen som äger själva fastigheten.

## Ansvarsfördelning

Som bostadsrättshavare har du ansvar för underhållet av din lägenhet, medan föreningen ansvarar för gemensamma utrymmen och fastighetens yttre delar.

## Hur du använder denna handbok

Använd menyn till vänster för att navigera mellan olika avsnitt i handboken. Här hittar du information om:

- Föreningens regler och stadgar
- Praktisk information om boendet
- Kontaktuppgifter till styrelse och fastighetsskötare
- Och mycket mer!

Vi hoppas att du kommer trivas i din förening!`
      },
      {
        title: "Kontaktinformation",
        sortOrder: 2,
        content: `# Viktiga kontaktuppgifter

## Styrelsen

**E-post:** styrelsen@foreningennamn.se

### Styrelsens medlemmar
- Ordförande: [Namn]
- Sekreterare: [Namn]
- Kassör: [Namn]
- Ledamot: [Namn]
- Ledamot: [Namn]

## Fastighetsskötsel

**Företag:** [Företagsnamn]
**Telefon:** [Telefonnummer]
**Jour (akuta ärenden):** [Journummer]

## Felanmälan

Felanmälan görs via:
- E-post: felanmalan@foreningennamn.se
- Telefon: [Telefonnummer]
- Via formulär på föreningens hemsida

## Vid akuta situationer

### Vattenläcka, strömavbrott eller andra akuta ärenden:
Ring fastighetsskötseln på journumret: [Journummer]

### Brand, inbrott eller livshotande situationer:
Ring 112`
      }
    ]
  },
  {
    title: "Boendeinformation",
    sortOrder: 2,
    pages: [
      {
        title: "Allmänna ordningsregler",
        sortOrder: 1,
        content: `# Ordningsregler

För att alla boende ska trivas i vår förening har vi tillsammans tagit fram följande ordningsregler:

## Ljudnivå och störningar

- Visa hänsyn till dina grannar, särskilt mellan kl. 22:00 och 07:00.
- Informera gärna dina grannar i förväg om du planerar aktiviteter som kan orsaka störningar.
- Renovering och annat störande arbete får endast utföras vardagar mellan kl. 08:00 och 18:00 samt helger mellan kl. 10:00 och 16:00.

## Gemensamma utrymmen

- Håll trapphus fria från föremål av brandsäkerhetsskäl.
- Lämna inte sopor i trapphus eller källargångar.
- Rök inte i gemensamma utrymmen.
- Stäng alltid ytterdörrar och dörrar till källare och vind efter dig.

## Sopsortering

- Sortera dina sopor enligt anvisningarna i miljörummet.
- Grovavfall, elektronik och farligt avfall ska lämnas på kommunens återvinningscentral.

## Tvättstuga

- Boka tvättider enligt det bokningssystem som finns.
- Städa tvättstugan efter användning.
- Respektera bokade tider och avboka om du inte kan använda din tid.

## Balkonger och uteplatser

- Skaka inte mattor eller sängkläder från balkongen.
- Grillning på balkong är endast tillåten med elgrill.
- Blomlådor ska hängas på insidan av balkongen av säkerhetsskäl.

## Husdjur

- Håll husdjur kopplade i gemensamma utrymmen.
- Plocka upp efter ditt husdjur.
- Se till att ditt husdjur inte stör grannar.

Tack för att du respekterar dessa regler och bidrar till ett trevligt boende för alla!`
      },
      {
        title: "Tvättstuga",
        sortOrder: 2,
        content: `# Tvättstugan

## Placering
Tvättstugan är belägen [plats, t.ex. i källaren i port 12].

## Bokningssystem
Bokning görs via [bokningsmetod, t.ex. digitalt bokningssystem/bokningstavla].

## Öppettider
Tvättstugan kan användas mellan kl. 07:00 och 22:00 alla dagar.

## Regler

- Respektera bokade tider och avboka om du inte kan använda din tid.
- Tvättiden inkluderar städning, så planera att avsluta i god tid för att hinna städa.
- Om du inte har påbörjat din tvättid inom 30 minuter från starttid, får en annan boende använda tiden.

## Städning efter användning

- Torka av maskinerna utvändigt
- Rengör tvättmedelsfack
- Rensa luddfilter i torktumlaren
- Sopa och torka golvet
- Ta med dig allt tvättmedel och alla kläder

## Fel på maskiner
Om du upptäcker fel på någon maskin, vänligen anmäl detta till [kontaktperson/metod].

Tack för att du hjälper till att hålla tvättstugan i gott skick!`
      },
      {
        title: "Källare och förråd",
        sortOrder: 3,
        content: `# Källare och förråd

## Förråd

Varje lägenhet har ett tillhörande förråd märkt med lägenhetsnummer. Kontrollera med styrelsen om du är osäker på vilket förråd som tillhör din lägenhet.

### Viktigt att tänka på:

- Förvara inte värdefulla föremål i förrådet.
- Placera inte föremål direkt mot golvet på grund av risken för vattenskador.
- Förrådet ska vara låst med ett säkert lås.
- Brandfarliga vätskor får inte förvaras i förrådet.

## Cyklar och barnvagnar

Cyklar ska förvaras i cykelrummet eller på anvisade platser utomhus. Barnvagnar kan förvaras i barnvagnsrummet om sådant finns.

För allas säkerhet får barnvagnar och cyklar inte förvaras i trapphuset på grund av brandrisk och framkomlighet för räddningstjänst.

## Säkerhet

- Se till att dörrar till källare, förråd och cykelrum alltid är låsta efter dig.
- Rapportera omedelbart om du upptäcker skador, läckage eller andra problem i källarområdet.
- Förvara inte brandfarliga eller explosiva ämnen i förråd.

## Städning

Källargångar och gemensamma utrymmen städas regelbundet, men alla boende förväntas hålla ordning och inte lämna skräp eller föremål i gemensamma utrymmen.`
      }
    ]
  },
  {
    title: "Regler och stadgar",
    sortOrder: 3,
    pages: [
      {
        title: "Föreningens stadgar",
        sortOrder: 1,
        content: `# Föreningens stadgar

Nedan följer bostadsrättsföreningens stadgar. Dessa är de formella regler som styr föreningen och som alla medlemmar måste följa.

## §1 Föreningens namn
Föreningens namn är Bostadsrättsföreningen [Namn].

## §2 Föreningens ändamål
Föreningen har till ändamål att främja medlemmarnas ekonomiska intressen genom att i föreningens hus upplåta bostäder för permanent boende och lokaler till nyttjande utan begränsning i tiden. Upplåtelsen får även omfatta mark som ligger i anslutning till föreningens hus, om marken ska användas som komplement till bostadslägenhet eller lokal.

Bostadsrätt är den rätt i föreningen som en medlem har på grund av upplåtelsen. Medlem som innehar bostadsrätt kallas bostadsrättshavare.

## §3 Föreningens säte
Föreningens styrelse har sitt säte i [Kommun].

## §4 Medlemskap
Medlemskap i föreningen kan beviljas den som erhåller bostadsrätt genom upplåtelse av föreningen eller som övertar bostadsrätt i föreningens hus. 

## §5 Insats och avgifter
För bostadsrätten ska erläggas insats och årsavgift. Årsavgiften fördelas på bostadsrättslägenheterna i förhållande till lägenheternas andelstal.

[Fyll i resten av stadgarna här...]`
      },
      {
        title: "Renoveringsregler",
        sortOrder: 2,
        content: `# Renoveringsregler

## Ansökan om renovering

Innan du påbörjar större renoveringar som berör bärande konstruktioner, vatten, avlopp, el eller ventilation måste du ansöka om tillstånd från styrelsen. Detta görs via en särskild blankett som finns tillgänglig på föreningens hemsida eller kan erhållas från styrelsen.

### Renoveringar som kräver styrelsens godkännande:
- Bärande väggar (rivning eller förändring)
- Våtrumsrenovering (badrum, toalett, kök)
- El-installationer
- Vattenledningar och avlopp
- Ventilation
- Balkong/uteplats
- Fönsterbyten

### Renoveringar som inte kräver godkännande:
- Målning och tapetsering
- Byte av köksluckor utan ändring av stomme
- Byte av golv (om inte golvvärme installeras)
- Installation av garderober

## Tider för renovering
- Vardagar: 08:00-18:00
- Helger: 10:00-16:00
- Inga störande arbeten tillåts på helgdagar

## Hantverkare och behörighet
- Våtrumsarbeten ska utföras av behörig hantverkare med våtrumscertifikat.
- El-arbeten ska utföras av behörig elektriker.
- VVS-arbeten ska utföras av auktoriserad VVS-installatör.

## Byggavfall
Byggavfall får inte placeras i föreningens soprum utan ska transporteras till återvinningscentral av bostadsrättshavaren eller anlitad entreprenör.

## Uppföljning
När renoveringen är klar ska en slutanmälan göras till styrelsen. För vissa arbeten kan styrelsen kräva in intyg om fackmannamässigt utförande.

Tänk på att du som bostadsrättshavare ansvarar för de skador som kan uppstå på grund av renoveringen, både i din egen lägenhet och hos grannar.`
      }
    ]
  },
  {
    title: "Underhåll och skötsel",
    sortOrder: 4,
    pages: [
      {
        title: "Ansvarsfördelning",
        sortOrder: 1,
        content: `# Ansvarsfördelning för underhåll

Nedan följer en översikt över vem som ansvarar för vad gällande underhåll i fastigheten. För fullständiga detaljer, se föreningens stadgar.

## Bostadsrättshavaren ansvarar för:

### Ytskikt och inredning
- Väggar, tak och golv (ytskikt som tapeter, färg, golvbeläggning)
- Innerdörrar och dörrkarmar
- Fast inredning i kök och badrum (skåp, bänkar, vitvaror)
- Snickerier och lister

### VVS-installationer
- Kranar och blandare
- Handfat, toalettstol, badkar, duschkabin
- Tvättställ och bidé
- Golvbrunn (rengöring och underhåll av sil/klinkers kring brunnen)
- Vattenledningar och avloppsrör inne i lägenheten till anslutningspunkt

### El och ventilation
- Elledningar från lägenhetens elcentral
- Strömbrytare, vägguttag och säkringar
- Köksfläkt och ventilationsdon (rengöring)
- Brandvarnare

### Övrigt
- Balkong/uteplats (ytskikt, renhållning)
- Fönster och fönsterbänkar (insida)
- Innerglas i fönster och tätningslister
- Brevlåda och namnskylt

## Föreningen ansvarar för:

### Byggnadens struktur
- Bärande konstruktioner
- Fasad och yttertak
- Bjälklag
- Trappuppgångar och gemensamma utrymmen

### VVS och el
- Stamledningar för vatten, avlopp och el
- Värmesystem (radiatorer/element, termostater)
- Ventilationssystem (fläktar, kanaler)
- Gemensamma el-installationer

### Övrigt
- Fönster och balkongdörrar (yttre underhåll och karmar)
- Ytterdörr (utsida)
- Hissar
- Gemensamma lokaler och utrymmen
- Mark och trädgård

## Särskilda villkor
Vid osäkerhet om vem som ansvarar för en viss del, kontakta styrelsen för klargörande innan åtgärder vidtas.

Om en bostadsrättshavare misstänker fel eller skada som faller under föreningens ansvar, ska detta omgående anmälas till föreningen.`
      },
      {
        title: "Felanmälan",
        sortOrder: 2,
        content: `# Felanmälan

## Akuta fel
Vid akuta fel som vattenläckage, strömavbrott i hela lägenheten, stopp i avlopp med översvämningsrisk eller andra akuta situationer:

**Dagtid (vardagar 08:00-16:00):**
Kontakta föreningens fastighetsskötare på telefon: [Telefonnummer]

**Jourtid (kvällar och helger):**
Ring jouren på telefon: [Journummer]

OBS! Jourutryckningar är kostsamma. Använd endast jouren vid verkliga nödsituationer. Om felet bedöms vara bostadsrättshavarens ansvar eller inte akut kan du komma att debiteras för utryckningskostnaden.

## Icke-akuta fel
För fel som inte är akuta gör du felanmälan via:

1. **E-post:** felanmalan@foreningennamn.se
2. **Telefon:** [Telefonnummer] (vardagar 08:00-16:00)
3. **Webformulär:** Via föreningens hemsida [webbadress]

### Information som ska ingå i felanmälan:
- Namn och lägenhetsnummer
- Telefonnummer
- E-postadress
- Detaljerad beskrivning av felet
- Önskemål om tillträde till lägenheten (om detta behövs)

## Handläggningstid
Icke-akuta fel hanteras normalt inom 5 arbetsdagar. Vid större problem eller behov av specialkompetens kan det ta längre tid.

## Fel på gemensamma utrymmen
Fel i gemensamma utrymmen som trapphus, tvättstuga, källare, hiss, etc. anmäls på samma sätt som ovan.

## Observera
Fel som är bostadsrättshavarens ansvar enligt stadgarna måste åtgärdas och bekostas av bostadsrättshavaren själv.`
      }
    ]
  },
  {
    title: "Gemensamhetsanläggningar",
    sortOrder: 5,
    pages: [
      {
        title: "Gästlägenhet",
        sortOrder: 1,
        content: `# Gästlägenhet

## Om gästlägenheten
Föreningen har en gästlägenhet som medlemmar kan hyra för sina gäster. Lägenheten är utrustad med:

- 2 sängplatser (en dubbelsäng)
- Badrum med dusch
- Pentry
- TV
- Wifi

## Bokning
Gästlägenheten bokas via [bokningssystem/kontaktperson]. Bokning kan göras högst [antal] månader i förväg.

## Hyra
Hyran är för närvarande:
- 250 kr per natt
- Helgpris (fredag-söndag): 600 kr
- Veckopris (7 nätter): 1400 kr

Betalning sker via [betalningsmetod] senast [tidpunkt] innan tillträde.

## Regler
- Längsta bokningsperiod är 7 dagar i följd
- Rökning är inte tillåten
- Husdjur är inte tillåtna
- Lägenheten ska städas innan avresa
- Eventuella skador ska rapporteras omgående

## Tillträde och nyckel
Nyckel hämtas hos [person/plats] på ankomstdagen mellan kl. [tid] och [tid]. Nyckeln ska återlämnas senast kl. [tid] på avresedagen.

## Städning
Lägenheten ska lämnas i samma skick som den var vid ankomst. Detta innebär:
- Disk ska vara diskad och undanställd
- Golv ska vara sopade och torkade
- Badrum ska vara rengjort
- Soptunna ska vara tömd
- Sängkläder tas av och lämnas [instruktion]

Om städningen inte är godkänd kommer en städavgift på [belopp] kr att debiteras.`
      },
      {
        title: "Hobbyrum",
        sortOrder: 2,
        content: `# Hobbyrum

## Placering
Hobbyrummet är beläget [plats, t.ex. i källaren i port 14].

## Öppettider
Hobbyrummet kan användas mellan kl. 08:00 och 21:00 alla dagar.

## Utrustning
I hobbyrummet finns:
- Arbetsbänk
- Skruvstäd
- Grundläggande handverktyg
- Eluttag
- Vask med vatten

## Bokning
[Beskrivning av bokningssystem, om sådant finns]

## Regler

### Användning
- Hobbyrummet är endast till för mindre snickeri- och reparationsarbeten
- Städa efter dig och lämna rummet i samma skick som när du kom
- Rapportera trasiga verktyg till styrelsen
- Ta med eget förbrukningsmaterial (skruvar, spik, sandpapper etc.)

### Säkerhet
- Egna elverktyg ska vara i gott skick och CE-märkta
- Brandfarliga ämnen får inte användas eller förvaras i hobbyrummet
- Låt inte barn vistas i hobbyrummet utan vuxens tillsyn
- Lås alltid dörren när du lämnar rummet

### Miljö
- Sortera avfall enligt anvisningarna i rummet
- Farligt avfall (färg, lösningsmedel etc.) ska tas om hand och lämnas på miljöstation
- Spola inte ner färg, olja eller andra kemikalier i vasken

## Ansvar
Alla användare ansvarar för att städa efter sig och hantera utrustningen varsamt. Skador på utrustning eller lokal ska omedelbart rapporteras till styrelsen. Användare kan hållas ersättningsskyldiga för skador som uppkommit genom oaktsamhet.`
      }
    ]
  }
];

/**
 * Skapar standardinnehåll för en handbok
 * @param handbookId ID för handboken som ska fyllas med innehåll
 */
export async function createHandbookTemplate(handbookId: string) {
  try {
    // Skapa sektioner och sidor för handboken
    for (const section of handbookTemplate) {
      const createdSection = await prisma.section.create({
        data: {
          title: section.title,
          sortOrder: section.sortOrder,
          handbookId: handbookId,
        },
      });

      // Skapa sidor för sektionen
      if (section.pages && section.pages.length > 0) {
        for (const page of section.pages) {
          await prisma.page.create({
            data: {
              title: page.title,
              content: page.content,
              sortOrder: page.sortOrder,
              sectionId: createdSection.id,
            },
          });
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error creating handbook template:', error);
    return { success: false, error };
  }
} 