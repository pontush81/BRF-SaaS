import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ansvarsfriskrivning | Handbok.org',
  description: 'Ansvarsfriskrivning för Handbok.org - information om innehållsansvar och användning av mallarna',
  openGraph: {
    title: 'Ansvarsfriskrivning | Handbok.org',
    description: 'Ansvarsfriskrivning för Handbok.org - information om innehållsansvar och användning av mallarna',
    url: 'https://www.handbok.org/legal/disclaimer',
    siteName: 'Handbok.org',
    locale: 'sv_SE',
    type: 'website',
  },
};

export default function DisclaimerPage() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="prose max-w-none">
        <h1 className="text-4xl font-bold mb-8">Ansvarsfriskrivning och innehållsansvar</h1>
        
        <div className="mb-8">
          <p className="text-sm text-gray-500">Senast uppdaterad: {new Date().toLocaleDateString('sv-SE')}</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-amber-800 mb-4">Viktig information</h2>
          <p className="text-amber-800 font-medium">
            Denna handbok är ett stödverktyg och ersätter inte juridisk rådgivning. Informationen bör anpassas 
            till föreningens stadgar, avtal och rutiner.
          </p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Innehållsansvar</h2>
          <p>
            Handbok.org tillhandahåller en teknisk plattform som möjliggör för bostadsrättsföreningar att 
            skapa, hantera och dela information och dokument. Vi erbjuder mallar och riktlinjer som stöd, 
            men det faktiska innehållet i handboken skapas, anpassas och kontrolleras helt av respektive 
            förening och dess användare.
          </p>
          <p className="mt-4">
            Varje bostadsrättsförening ansvarar därför fullt ut för:
          </p>
          <ul className="list-disc pl-6 mb-4 mt-2">
            <li>Riktigheten i den information som förs in i handboken</li>
            <li>Att anpassa mallarna till föreningens specifika förhållanden</li>
            <li>Att säkerställa att innehållet överensstämmer med föreningens stadgar</li>
            <li>Att innehållet följer gällande lagar och regler</li>
            <li>Beslut som fattas baserat på information i handboken</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Mallar och standarddokument</h2>
          <p>
            De mallar och standarddokument som tillhandahålls via Handbok.org är utformade för att 
            fungera som utgångspunkt och stöd i föreningens arbete. De är baserade på allmän praxis och 
            vanligt förekommande rutiner, men tar inte hänsyn till specifika förhållanden i enskilda föreningar.
          </p>
          <p className="mt-4">
            Vi rekommenderar starkt att:
          </p>
          <ul className="list-disc pl-6 mb-4 mt-2">
            <li>Mallarna granskas och anpassas av styrelsen innan de används</li>
            <li>Juridiskt viktiga dokument alltid granskas av en fackman med kunskap inom relevant område</li>
            <li>Föreningens stadgar alltid beaktas vid anpassning av mallarna</li>
            <li>Föreningens tidigare beslut och rutiner dokumenteras korrekt</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Ansvarsfriskrivning</h2>
          <p>
            Handbok.org tar inget ansvar för:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Konsekvenser av beslut som fattas baserat på information i handboken</li>
            <li>Felaktigheter eller brister i föreningens anpassade innehåll</li>
            <li>Ekonomisk eller juridisk skada som uppstår till följd av användning av mallarna</li>
            <li>Tvister som kan uppstå mellan föreningar och deras medlemmar eller tredje part</li>
            <li>Bristande efterlevnad av lagar och regler i föreningens verksamhet</li>
          </ul>
          <p className="mt-4">
            Våra mallar och vår plattform ersätter inte professionell rådgivning från juridiska experter, 
            ekonomer, revisorer eller andra fackpersoner. Vid osäkerhet rekommenderar vi alltid att 
            föreningen konsulterar relevanta experter inom respektive område.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Begränsningar i tjänsten</h2>
          <p>
            Handbok.org ansvarar för att tillhandahålla en fungerande plattform enligt vårt tjänsteavtal, 
            men vi kan inte garantera att:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Mallarna är fullständigt uppdaterade med alla senaste lagändringar</li>
            <li>Informationen är anpassad till varje förenings unika förhållanden</li>
            <li>Plattformen kan anpassas för varje tänkbar situation som kan uppstå i en bostadsrättsförening</li>
            <li>Tjänsten uppfyller alla specifika krav som enskilda föreningar kan ha</li>
          </ul>
          <p className="mt-4">
            Vi strävar kontinuerligt efter att förbättra våra mallar och vår tjänst, men användarna 
            behöver alltid använda eget omdöme och expertis för att anpassa innehållet till sina specifika 
            behov och förhållanden.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Tips för ansvarsfull användning</h2>
          <p>
            För att maximera nyttan av Handbok.org samtidigt som riskerna minimeras rekommenderar vi:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Att utse dedikerade personer i styrelsen med ansvar för handbokens innehåll</li>
            <li>Att regelbundet granska och uppdatera innehållet</li>
            <li>Att tydligt dokumentera när och av vem ändringar har gjorts</li>
            <li>Att konsultera experter vid juridiskt eller ekonomiskt viktiga beslut</li>
            <li>Att införa en rutin för årlig översyn av handbokens innehåll</li>
            <li>Att inkludera en egen ansvarsfriskrivning i handboken som informerar användare om begränsningarna</li>
          </ul>
        </section>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Sammanfattning</h2>
          <p className="mb-4">
            Handbok.org tillhandahåller en teknisk plattform och mallar som stöd för bostadsrättsföreningar, 
            men ansvaret för innehållet och användningen av informationen ligger alltid hos föreningen själv.
          </p>
          <p className="font-medium">
            Denna handbok är ett stödverktyg och ersätter inte juridisk rådgivning. Informationen bör anpassas 
            till föreningens stadgar, avtal och rutiner.
          </p>
        </div>

        <p>
          Om du har frågor kring innehållsansvar eller hur mallarna bör användas, kontakta oss gärna via 
          <a href="mailto:support@handbok.org" className="text-blue-600 hover:underline"> support@handbok.org</a>.
        </p>
      </div>
    </div>
  );
} 