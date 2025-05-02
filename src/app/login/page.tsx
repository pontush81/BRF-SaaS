import SignInForm from '@/components/auth/SignInForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Logga in | BRF-SaaS',
  description: 'Logga in på ditt konto för att hantera din bostadsrättsförening',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">BRF-SaaS</h1>
        <p className="text-gray-600">
          Logga in för att hantera din bostadsrättsförening
        </p>
      </div>
      
      <SignInForm />
    </div>
  );
} 