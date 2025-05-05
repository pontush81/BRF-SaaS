import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getServerSideUser } from '@/supabase-server';
import SignUpForm from '@/components/auth/SignUpForm';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Organization } from '@prisma/client';

export const metadata: Metadata = {
  title: 'Registrera konto - BRF Handbok',
  description: 'Skapa ett nytt konto för att få tillgång till BRF-handboken',
};

// Ingen caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: {
    type?: string;
    invite?: string;
    organization?: string;
  };
}) {
  // Kontrollera session
  const cookieStore = cookies();
  const user = await getServerSideUser(cookieStore);

  // Om användaren är inloggad, skicka till dashboard
  if (user) {
    console.log(
      '[REGISTER] Användare redan inloggad, omdirigerar till dashboard'
    );
    redirect('/dashboard');
  }

  // Hämta parametrar från URL
  const type = searchParams.type || 'user';
  const inviteToken = searchParams.invite;
  const organizationSlug = searchParams.organization;

  // Hämta inbjudningsdetaljer om token finns
  let invitation: any = null;
  let organization: Organization | null = null;

  if (inviteToken) {
    console.log('[REGISTER] Söker inbjudan med token:', inviteToken);

    try {
      // @ts-ignore - Invitation model will be available after Prisma generation
      invitation = await prisma.invitation.findUnique({
        where: { token: inviteToken },
        include: { organization: true },
      });

      if (invitation) {
        organization = invitation.organization;
        console.log(
          '[REGISTER] Inbjudan hittad för:',
          invitation.email,
          'till organisation:',
          organization?.name
        );
      } else {
        console.log(
          '[REGISTER] Ingen giltig inbjudan hittades för token:',
          inviteToken
        );
      }
    } catch (error) {
      console.error('[REGISTER] Fel vid sökning efter inbjudan:', error);
    }
  } else if (organizationSlug) {
    console.log('[REGISTER] Söker organisation med slug:', organizationSlug);

    organization = await prisma.organization.findUnique({
      where: { slug: organizationSlug },
    });

    if (organization) {
      console.log('[REGISTER] Organisation hittad:', organization.name);
    } else {
      console.log(
        '[REGISTER] Ingen organisation hittad med slug:',
        organizationSlug
      );
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            {type === 'admin'
              ? 'Registrera din bostadsrättsförening'
              : invitation
                ? `Anslut till ${organization ? organization.name : 'organisation'}`
                : 'Skapa ett konto'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Eller{' '}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              logga in om du redan har ett konto
            </Link>
          </p>
        </div>

        <SignUpForm
          isAdmin={type === 'admin'}
          orgSlug={organizationSlug || ''}
        />
      </div>
    </div>
  );
}
