import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kontakt & Support | Handbok.org',
  description: 'Kontakta Handbok.org för support, frågor eller feedback om vår tjänst för bostadsrättsföreningar',
  openGraph: {
    title: 'Kontakt & Support | Handbok.org',
    description: 'Kontakta Handbok.org för support, frågor eller feedback om vår tjänst för bostadsrättsföreningar',
    url: 'https://www.handbok.org/legal/contact',
    siteName: 'Handbok.org',
    locale: 'sv_SE',
    type: 'website',
  },
};

export default function ContactSupport() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="prose max-w-none">
        <h1 className="text-4xl font-bold mb-8">Kontakt & Support</h1>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Kundtjänst & Support</h2>
          <p className="mb-4">
            Vi är här för att hjälpa dig med alla frågor relaterade till vår tjänst. 
            Vårt supportteam svarar normalt inom 24 timmar på vardagar.
          </p>
          
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
            <h3 className="text-xl font-medium mb-3">Kontaktuppgifter</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="font-semibold w-20">E-post:</span> 
                <a href="mailto:support@handbok.org" className="text-blue-600 hover:underline">support@handbok.org</a>
              </li>
              <li className="flex items-start">
                <span className="font-semibold w-20">Telefon:</span> 
                <span>08-123 45 67 (vardagar 9-16)</span>
              </li>
            </ul>
          </div>
          
          <h3 className="text-xl font-semibold mb-3">Supportärenden</h3>
          <p className="mb-4">
            För snabbast hjälp, vänligen inkludera följande information när du kontaktar oss:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>Ditt namn och e-postadress som är kopplad till ditt konto</li>
            <li>Namnet på din bostadsrättsförening</li>
            <li>En detaljerad beskrivning av problemet eller frågan</li>
            <li>Skärmdumpar om tillämpligt</li>
            <li>Webbläsare och operativsystem du använder</li>
          </ul>
        </section>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Vanliga frågor (FAQ)</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Hur ändrar jag mitt lösenord?</h3>
              <p>
                Du kan ändra ditt lösenord genom att gå till din profilsida och klicka på "Ändra lösenord" 
                under säkerhetsinställningar. Om du har glömt ditt lösenord, klicka på "Glömt lösenord" 
                på inloggningssidan för att återställa det.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Hur lägger jag till fler användare i min förening?</h3>
              <p>
                Som administratör kan du bjuda in nya användare genom att gå till "Inställningar" {'>'}
                "Användare" och klicka på "Bjud in användare". Ange e-postadressen för den nya användaren 
                och välj deras behörighetsnivå. En inbjudan skickas automatiskt till den angivna e-postadressen.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Kan jag ändra min förenings URL/adress?</h3>
              <p>
                Ja, föreningsadministratörer kan ändra föreningens URL genom att gå till "Inställningar" {'>'}
                "Föreningsinformation" och uppdatera fältet "Föreningsadress". Observera att adressen måste 
                vara unik och endast kan innehålla bokstäver, siffror och bindestreck.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Hur avbryter jag min prenumeration?</h3>
              <p>
                För att avbryta din prenumeration, gå till "Inställningar" {'>'}
                "Fakturering & Prenumeration" och klicka på "Hantera prenumeration". Följ instruktionerna 
                för att avbryta. Observera att din tjänst förblir aktiv till slutet av den aktuella 
                faktureringsperioden.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Vilka filformat stöds för uppladdning?</h3>
              <p>
                Vi stöder en mängd olika filformat, inklusive men inte begränsat till: PDF, DOC, DOCX, XLS, 
                XLSX, PPT, PPTX, JPG, PNG, och GIF. Maximal filstorlek för uppladdning är 20 MB per fil.
              </p>
            </div>
          </div>
        </section>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Rapportera problem</h2>
          <p className="mb-4">
            Om du upptäcker buggar, fel eller säkerhetsproblem i vår tjänst, vänligen kontakta oss 
            omedelbart på <a href="mailto:security@handbok.org" className="text-blue-600 hover:underline">security@handbok.org</a>.
          </p>
          <p className="mb-4">
            Vi tar säkerhetsfrågor mycket seriöst och uppskattar din hjälp med att hålla vår tjänst säker och tillförlitlig.
          </p>
        </section>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Företagsinformation</h2>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-medium mb-3">Handbok AB</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="font-semibold w-28">Organisationsnr:</span> 
                <span>556123-4567</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold w-28">Adress:</span> 
                <div>
                  <p>Exempelgatan 123</p>
                  <p>123 45 Stockholm</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="font-semibold w-28">E-post:</span> 
                <a href="mailto:info@handbok.org" className="text-blue-600 hover:underline">info@handbok.org</a>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
} 