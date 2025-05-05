'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Demo-data
const DEMO_SECTIONS = [
  {
    id: 'welcome',
    title: 'Välkommen',
    pages: [
      {
        id: 'about',
        title: 'Om vår förening',
        content:
          '# Om Brf Exempel\n\nVälkommen till Bostadsrättsföreningen Exempel! Denna handbok är tänkt att vara ett stöd för dig som boende i vår förening. Här hittar du information om allt från ordningsregler till praktisk information om tvättstugan och sophantering.\n\n## Föreningens historia\n\nBrf Exempel bildades år 2005 och består av 35 lägenheter fördelade på två fastigheter. Byggnaderna uppfördes under 1950-talet och har renoverats kontinuerligt för att möta moderna krav på komfort och energieffektivitet.',
      },
      {
        id: 'contact',
        title: 'Kontaktuppgifter',
        content:
          '# Kontaktuppgifter\n\n## Styrelsen\n\nE-post: styrelsen@brfexempel.se\n\n### Styrelsens medlemmar\n\n- **Ordförande**: Anna Andersson, anna@brfexempel.se\n- **Kassör**: Erik Eriksson, erik@brfexempel.se\n- **Sekreterare**: Maria Månsson, maria@brfexempel.se\n- **Ledamot**: Peter Pettersson, peter@brfexempel.se\n\n## Felanmälan\n\nVid akuta fel under kontorstid: 08-123 45 67\nJour (kvällar och helger): 08-123 45 68\n\n## Förvaltning\n\nFastighetsförvaltare: Fastighetsservice AB\nKontaktperson: Johan Johansson\nTelefon: 08-987 65 43\nE-post: johan@fastighetsservice.se',
      },
    ],
  },
  {
    id: 'living',
    title: 'Boendeinformation',
    pages: [
      {
        id: 'rules',
        title: 'Ordningsregler',
        content:
          '# Ordningsregler för Brf Exempel\n\n## Allmänt\n\n1. Visa hänsyn till dina grannar. Höga ljud som kan störa bör undvikas mellan 22:00 och 07:00 på vardagar och mellan 23:00 och 09:00 på helger.\n\n2. Meddela gärna dina grannar i förväg om du planerar att ha fest eller utföra bullrande renoveringsarbeten.\n\n3. Trapphus och andra gemensamma utrymmen ska hållas fria från privata tillhörigheter för att underlätta städning och av brandsäkerhetsskäl.\n\n## Renovering\n\n1. Renoveringsarbeten som medför störande buller får endast utföras på vardagar mellan 08:00 och 20:00 samt helger mellan 10:00 och 18:00.\n\n2. Vid större renoveringar ska styrelsen informeras i förväg.\n\n3. För ingrepp i bärande konstruktion, vatten- eller elinstallationer krävs styrelsens godkännande.\n\n## Balkonger/Uteplatser\n\n1. Grillning med elgrill är tillåten på balkonger. Grillning med kol- eller gasolgrill är endast tillåten på föreningens gemensamma grillplats.\n\n2. Skaka inte mattor eller sängkläder från balkongen.\n\n3. Blomlådor ska hängas på insidan av balkongräcket.',
      },
      {
        id: 'laundry',
        title: 'Tvättstuga',
        content:
          '# Tvättstuga\n\n## Bokning\n\nTvättstugan bokas via bokningstavlan i entrén eller via vår digitala bokningsapp.\n\nVarje pass är 4 timmar och du får boka max 3 pass per vecka.\n\n## Öppettider\n\n- Måndag-Fredag: 07:00-22:00\n- Lördag-Söndag: 09:00-21:00\n\n## Ordningsregler\n\n1. Respektera bokade tider.\n\n2. Rengör alltid maskinerna efter användning. Torka av ytor och töm luddfiltret i torktumlaren.\n\n3. Sopa och torka av golvet när du är klar.\n\n4. Rapportera eventuella fel till styrelsen så snart som möjligt.\n\n5. Lämna inte kvar tvätt eller tvättmedel i tvättstugan när ditt pass är slut.\n\n## Utrustning\n\n- 3 tvättmaskiner\n- 1 grovtvättmaskin\n- 2 torktumlare\n- 1 torkskåp\n- Mangel',
      },
      {
        id: 'waste',
        title: 'Sophantering',
        content:
          '# Sophantering\n\n## Hushållssopor\n\nHushållssopor slängs i sopnedkastet på varje våningsplan eller i kärlen i miljörummet. Soppåsar ska vara väl förslutna.\n\n## Återvinningsstation\n\nI föreningens miljörum kan du sortera:\n\n- Pappersförpackningar\n- Plastförpackningar\n- Metallförpackningar\n- Glasförpackningar (färgat och ofärgat)\n- Tidningar\n- Batterier\n- Elektronik\n\n## Grovsopor\n\nGrovsopor får inte placeras i eller utanför miljörummet. Föreningen anordnar grovsopshämtning två gånger per år (vår och höst). Övrig tid hänvisas till kommunens återvinningscentral.\n\n## Farligt avfall\n\nFarligt avfall som färgrester, lösningsmedel, kemikalier och liknande ska lämnas till kommunens miljöstation eller återvinningscentral.',
      },
    ],
  },
  {
    id: 'documents',
    title: 'Dokument',
    pages: [
      {
        id: 'statutes',
        title: 'Stadgar',
        content:
          '# Stadgar för Brf Exempel\n\n*Detta är ett utdrag från föreningens stadgar för demonstrationssyfte.*\n\n## 1. Föreningens namn och ändamål\n\n§1 Föreningens namn är Bostadsrättsföreningen Exempel.\n\n§2 Föreningen har till ändamål att främja medlemmarnas ekonomiska intressen genom att i föreningens hus upplåta bostäder för permanent boende och lokaler åt medlemmarna till nyttjande utan begränsning i tiden.\n\n## 2. Medlemskap och överlåtelse av bostadsrätt\n\n§3 Medlemskap i föreningen kan beviljas fysisk person som övertar bostadsrätt i föreningens hus.\n\n§4 Överlåtelse av bostadsrätt ska ske genom skriftligt avtal mellan överlåtaren och förvärvaren. Förvärvarens medlemsansökan ska prövas av styrelsen.\n\n## 3. Avgifter till föreningen\n\n§5 För bostadsrätten utgående insats och årsavgift fastställs av styrelsen. Ändring av insats ska alltid beslutas av föreningsstämma.\n\n§6 Årsavgiften betalas månadsvis i förskott senast sista vardagen före varje kalendermånads början.\n\n## 4. Bostadsrättshavarens rättigheter och skyldigheter\n\n§7 Bostadsrättshavaren ska på egen bekostnad hålla lägenheten i gott skick. Detta gäller även mark, förråd, garage eller annat lägenhetskomplement som ingår i upplåtelsen.',
      },
      {
        id: 'annual-report',
        title: 'Årsredovisning',
        content:
          '# Årsredovisning 2023\n\n*Detta är en förenklad version av en årsredovisning för demonstrationssyfte.*\n\n## Förvaltningsberättelse\n\nStyrelsen för Brf Exempel, organisationsnummer 769000-0000, får härmed avge årsredovisning för räkenskapsåret 2023.\n\n### Fastigheten\n\nFöreningen äger fastigheten Exempelgatan 1 i Exempelstad. Byggnaden uppfördes 1955 och består av 35 lägenheter och 2 lokaler.\n\n### Väsentliga händelser under räkenskapsåret\n\n- Byte av tak på båda byggnaderna\n- Installation av laddstolpar för elbilar\n- Upprustning av gården\n\n## Ekonomisk översikt\n\n### Resultaträkning\n\n**Intäkter**\n- Årsavgifter: 2 450 000 kr\n- Hyresintäkter lokaler: 350 000 kr\n- Övriga intäkter: 125 000 kr\n- **Summa intäkter**: 2 925 000 kr\n\n**Kostnader**\n- Driftskostnader: 1 350 000 kr\n- Underhåll: 520 000 kr\n- Avskrivningar: 380 000 kr\n- Räntekostnader: 250 000 kr\n- **Summa kostnader**: 2 500 000 kr\n\n**Årets resultat**: 425 000 kr\n\n### Balansräkning\n\n**Tillgångar**\n- Fastighet: 45 000 000 kr\n- Likvida medel: 2 500 000 kr\n- Övriga tillgångar: 350 000 kr\n- **Summa tillgångar**: 47 850 000 kr\n\n**Skulder och eget kapital**\n- Fastighetslån: 30 000 000 kr\n- Övriga skulder: 450 000 kr\n- Eget kapital: 17 400 000 kr\n- **Summa skulder och eget kapital**: 47 850 000 kr',
      },
      {
        id: 'maintenance-plan',
        title: 'Underhållsplan',
        content:
          '# Underhållsplan 2023-2033\n\n*Detta är en förenklad underhållsplan för demonstrationssyfte.*\n\n## Planerade underhållsåtgärder\n\n### 2024\n- Fasadrenovering, etapp 1\n- Målning av trapphus, fastighet A\n- OVK (obligatorisk ventilationskontroll)\n\n**Budgeterad kostnad**: 1 200 000 kr\n\n### 2025\n- Fasadrenovering, etapp 2\n- Relining av avloppsstammar\n- Upprustning av hissar\n\n**Budgeterad kostnad**: 2 500 000 kr\n\n### 2026\n- Fönsterbyte, fastighet B\n- Upprustning av cykelrum\n\n**Budgeterad kostnad**: 1 800 000 kr\n\n### 2027\n- Renovering av tvättstuga\n- Upprustning av gästlägenhet\n\n**Budgeterad kostnad**: 700 000 kr\n\n### 2028-2033\n- Stambyte\n- Elstambyte\n- Renovering av balkonger\n- Uppgradering av värmesystem\n- Digitalisering av låssystem\n\n**Budgeterad kostnad**: 15 000 000 kr\n\n## Avsättning till underhållsfond\n\nFöreningen avsätter årligen 750 000 kr till underhållsfonden för att säkerställa att nödvändigt underhåll kan genomföras enligt plan.',
      },
    ],
  },
];

export default function DemoPage() {
  const [activeSection, setActiveSection] = useState(DEMO_SECTIONS[0]);
  const [activePage, setActivePage] = useState<
    (typeof DEMO_SECTIONS)[0]['pages'][0] | null
  >(DEMO_SECTIONS[0]?.pages?.[0] || null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleSectionClick = (section: (typeof DEMO_SECTIONS)[0]) => {
    setActiveSection(section);

    if (section.pages && section.pages.length > 0) {
      setActivePage(section.pages[0] || null);
    } else {
      setActivePage(null);
    }

    setShowMobileMenu(false);
  };

  const handlePageClick = (page: (typeof DEMO_SECTIONS)[0]['pages'][0]) => {
    setActivePage(page);
    setShowMobileMenu(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Demo header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 py-4 px-4 text-white sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Brf Exempel - Digital Handbok</h1>
            <div className="text-sm bg-yellow-500 text-blue-900 px-2 py-1 rounded-md font-medium">
              DEMO
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="text-white p-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/register"
              className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors"
            >
              Skapa din egen handbok
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-blue-50 border-b border-blue-100 overflow-y-auto">
          <div className="py-4 px-4">
            <div className="mb-4">
              <h2 className="font-semibold text-gray-700 mb-2">Sektioner</h2>
              <ul className="space-y-2">
                {DEMO_SECTIONS.map(section => (
                  <li key={section.id}>
                    <button
                      onClick={() => handleSectionClick(section)}
                      className={`w-full text-left px-3 py-2 rounded-md ${
                        activeSection?.id === section.id
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-blue-50'
                      }`}
                    >
                      {section.title}
                    </button>

                    {activeSection?.id === section.id && (
                      <ul className="mt-1 ml-4 space-y-1">
                        {section.pages.map(page => (
                          <li key={page.id}>
                            <button
                              onClick={() => handlePageClick(page)}
                              className={`w-full text-left px-3 py-1.5 rounded-md ${
                                activePage?.id === page.id
                                  ? 'bg-blue-100 text-blue-700 font-medium'
                                  : 'text-gray-600 hover:bg-blue-50'
                              }`}
                            >
                              {page.title}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/register"
              className="block bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors text-center"
            >
              Skapa din egen handbok
            </Link>
          </div>
        </div>
      )}

      <div className="flex-grow flex flex-col md:flex-row">
        {/* Sidebar - hidden on mobile */}
        <aside className="hidden md:block w-64 bg-gray-50 border-r p-4 overflow-y-auto">
          <nav>
            <ul className="space-y-6">
              {DEMO_SECTIONS.map(section => (
                <li key={section.id}>
                  <h2 className="font-semibold text-gray-700 mb-2">
                    {section.title}
                  </h2>
                  <ul className="space-y-1">
                    {section.pages.map(page => (
                      <li key={page.id}>
                        <button
                          onClick={() => {
                            setActiveSection(section);
                            setActivePage(page);
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded-md ${
                            activeSection?.id === section.id &&
                            activePage?.id === page.id
                              ? 'bg-blue-100 text-blue-700 font-medium'
                              : 'text-gray-600 hover:bg-blue-50'
                          }`}
                        >
                          {page.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-grow p-4 md:p-8 overflow-y-auto bg-white">
          {activePage && (
            <article className="max-w-3xl mx-auto prose prose-blue">
              <div className="mb-6">
                <h1>{activePage.title}</h1>
                {activePage.content.split('\n\n').map((paragraph, index) => {
                  if (paragraph.startsWith('# ')) {
                    // Remove the heading since we already have it above
                    return null;
                  } else if (paragraph.startsWith('## ')) {
                    return <h2 key={index}>{paragraph.substring(3)}</h2>;
                  } else if (paragraph.startsWith('### ')) {
                    return <h3 key={index}>{paragraph.substring(4)}</h3>;
                  } else if (paragraph.startsWith('- ')) {
                    return (
                      <ul key={index}>
                        {paragraph.split('\n').map((item, itemIndex) => (
                          <li key={itemIndex}>{item.substring(2)}</li>
                        ))}
                      </ul>
                    );
                  } else if (paragraph.match(/^\d+\. /)) {
                    return (
                      <ol key={index}>
                        {paragraph.split('\n').map((item, itemIndex) => {
                          const stripped = item.replace(/^\d+\. /, '');
                          return <li key={itemIndex}>{stripped}</li>;
                        })}
                      </ol>
                    );
                  } else if (paragraph.startsWith('*')) {
                    return (
                      <em key={index}>
                        {paragraph.substring(1, paragraph.length - 1)}
                      </em>
                    );
                  } else {
                    return <p key={index}>{paragraph}</p>;
                  }
                })}
              </div>
            </article>
          )}
        </main>
      </div>

      {/* Demo overlay */}
      <div className="fixed bottom-0 left-0 right-0 bg-blue-900 text-white p-4 flex justify-between items-center">
        <p className="text-sm md:text-base">
          Detta är en demonstration av den digitala handboken för
          bostadsrättsföreningar.
        </p>
        <Link
          href="/register"
          className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors whitespace-nowrap"
        >
          Skapa din egen
        </Link>
      </div>
    </div>
  );
}
