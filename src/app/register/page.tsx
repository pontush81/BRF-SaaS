'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  
  useEffect(() => {
    // Hämta plan från URL-parametern
    const planFromUrl = searchParams?.get('plan');
    if (planFromUrl) {
      setSelectedPlan(planFromUrl);
    }
  }, [searchParams]);
  
  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Registrera er förening</h1>
      
      {/* Stegindikator */}
      <div className="mb-12">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">1</div>
            <span className="text-sm mt-2 font-medium">Välj paket</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200 mx-2">
            <div className={`h-full bg-blue-600 ${selectedPlan ? 'w-full' : 'w-0'} transition-all duration-500`}></div>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${selectedPlan ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>2</div>
            <span className="text-sm mt-2 font-medium">Föreningsinformation</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200 mx-2"></div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center font-semibold">3</div>
            <span className="text-sm mt-2 font-medium">Betalning</span>
          </div>
        </div>
      </div>
      
      {!selectedPlan ? (
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold mb-8 text-center">Välj paket för er förening</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Baspaket */}
            <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" 
                 onClick={() => setSelectedPlan('basic')}>
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
                  <button 
                    className="block w-full bg-blue-600 text-white text-center font-medium py-3 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Välj
                  </button>
                </div>
              </div>
            </div>
            
            {/* Standardpaket */}
            <div className="border rounded-lg overflow-hidden shadow-lg relative cursor-pointer"
                 onClick={() => setSelectedPlan('standard')}>
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
                  <button 
                    className="block w-full bg-blue-600 text-white text-center font-medium py-3 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Välj
                  </button>
                </div>
              </div>
            </div>
            
            {/* Premiumpaket */}
            <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                 onClick={() => setSelectedPlan('premium')}>
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
                  <button 
                    className="block w-full bg-blue-600 text-white text-center font-medium py-3 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Välj
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm border">
          <h2 className="text-2xl font-semibold mb-6">Föreningsinformation</h2>
          <p className="mb-6 text-gray-600">
            Du har valt <span className="font-medium">{selectedPlan === 'basic' ? 'Bas' : selectedPlan === 'standard' ? 'Standard' : 'Premium'}</span>-paketet.{' '}
            <button 
              onClick={() => setSelectedPlan(null)} 
              className="text-blue-600 underline"
            >
              Ändra
            </button>
          </p>
          
          <form className="space-y-6">
            {/* Föreningsinformation */}
            <div>
              <h3 className="text-lg font-medium mb-4">Föreningen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label htmlFor="org-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Föreningsnamn *
                  </label>
                  <input
                    id="org-name"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Brf Exempel"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="org-number" className="block text-sm font-medium text-gray-700 mb-1">
                    Organisationsnummer *
                  </label>
                  <input
                    id="org-number"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="769000-0000"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="num-units" className="block text-sm font-medium text-gray-700 mb-1">
                    Antal lägenheter *
                  </label>
                  <input
                    id="num-units"
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="1"
                    min="1"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="org-slug" className="block text-sm font-medium text-gray-700 mb-1">
                    Önskad subdomän *
                  </label>
                  <div className="flex">
                    <input
                      id="org-slug"
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-l-md"
                      placeholder="exempel"
                      required
                    />
                    <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      .handbok.se
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Kontaktperson */}
            <div>
              <h3 className="text-lg font-medium mb-4">Kontaktperson</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Namn *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1">
                    E-post *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label htmlFor="contact-role" className="block text-sm font-medium text-gray-700 mb-1">
                    Roll i föreningen *
                  </label>
                  <select
                    id="contact-role"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Välj roll</option>
                    <option value="chairman">Ordförande</option>
                    <option value="treasurer">Kassör</option>
                    <option value="secretary">Sekreterare</option>
                    <option value="board_member">Styrelseledamot</option>
                    <option value="other">Annan</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="pt-4 flex flex-col md:flex-row gap-4 justify-end">
              <button
                type="button"
                onClick={() => setSelectedPlan(null)}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Tillbaka
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Fortsätt till betalning
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Trygghetsinformation */}
      <div className="mt-16 max-w-3xl mx-auto">
        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium mb-4">Köp med trygghet</h3>
          <ul className="space-y-2">
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>30 dagars gratis testperiod – ingen bindningstid</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Säker betalning med Stripe</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Personligt stöd och hjälp med uppsättning</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>All data lagras säkert enligt GDPR</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
} 