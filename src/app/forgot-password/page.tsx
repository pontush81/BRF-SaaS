import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Återställ lösenord | BRF-SaaS',
  description: 'Återställ lösenordet för ditt BRF-SaaS konto',
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">BRF-SaaS</h1>
        <p className="text-gray-600">
          Återställ lösenordet för ditt konto
        </p>
      </div>
      
      <ForgotPasswordForm />
    </div>
  );
} 