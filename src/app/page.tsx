import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8">
      <div className="max-w-5xl w-full">
        {/* Hero Section */}
        <section className="py-12 md:py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
            BRF-SaaS
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-10">
            En komplett SaaS-plattform för hantering av bostadsrättsföreningar
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Kom igång
            </Link>
            <Link 
              href="/login"
              className="px-6 py-3 bg-white hover:bg-gray-100 text-blue-600 font-medium rounded-lg border border-blue-200 transition-colors"
            >
              Logga in
            </Link>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-12 md:py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Funktioner</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              title="Multi-tenant arkitektur"
              description="Hantera flera bostadsrättsföreningar i samma plattform med isolerad data."
              icon="🏢"
            />
            <FeatureCard 
              title="Säker autentisering"
              description="Använd modern autentisering med behörighetshantering för olika roller."
              icon="🔒"
            />
            <FeatureCard 
              title="Ekonomihantering"
              description="Håll koll på fakturor, budget och ekonomiska rapporter för föreningen."
              icon="💰"
            />
            <FeatureCard 
              title="Medlemshantering"
              description="Enkel hantering av medlemmar, kontaktinformation och kommunikation."
              icon="👥"
            />
            <FeatureCard 
              title="Dokument & ärenden"
              description="Lagra och dela dokument samt hantera ärenden i föreningen."
              icon="📄"
            />
            <FeatureCard 
              title="Automatiserade rapporter"
              description="Schemalägg och skapa automatiska rapporter för styrelse och medlemmar."
              icon="📊"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string, description: string, icon: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
