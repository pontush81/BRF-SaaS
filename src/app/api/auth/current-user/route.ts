import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { UserRole } from '@/lib/auth/roleUtils';

// Definiera interface för organisation och användarorganisation
interface Organization {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  role: UserRole;
  isDefault: boolean;
}

// Interface för användarorganisationsrelation från Prisma
interface UserOrganizationWithOrg {
  organization: {
    id: string;
    name: string;
    slug: string;
    domain: string | null;
  };
  role: string;
  isDefault: boolean;
}

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  try {
    // Verifierar att användaren är autentiserad
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
    }
    
    // Hämta användarinformation från databasen
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        organizations: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
                domain: true,
              },
            },
          },
        },
      },
    });
    
    if (!dbUser) {
      return NextResponse.json({ error: 'Användare hittades inte' }, { status: 404 });
    }

    // Konvertera organizationUsers till enklare format för klienten
    const organizations: Organization[] = dbUser.organizations.map((orgUser: UserOrganizationWithOrg) => ({
      id: orgUser.organization.id,
      name: orgUser.organization.name,
      slug: orgUser.organization.slug,
      domain: orgUser.organization.domain,
      role: orgUser.role as UserRole,
      isDefault: orgUser.isDefault,
    }));

    // Hitta standard-organisationen (om det finns)
    const defaultOrg = organizations.find((org: Organization) => org.isDefault) || organizations[0] || null;
    
    // Hämta current organization från URL query parameter om det finns
    const url = new URL(request.url);
    const currentOrgId = url.searchParams.get('orgId');
    
    // Använd angiven org om den finns och användaren tillhör den, annars default
    const currentOrganization = currentOrgId 
      ? organizations.find((org: Organization) => org.id === currentOrgId) || defaultOrg
      : defaultOrg;

    // Hitta användarens roll i aktuell organisation
    const currentRole = currentOrganization 
      ? organizations.find((org: Organization) => org.id === currentOrganization.id)?.role || UserRole.MEMBER
      : UserRole.MEMBER;
    
    // Returnera användarinformation med organisationer och roller
    return NextResponse.json({
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      organizations: organizations,
      defaultOrganization: defaultOrg,
      currentOrganization: currentOrganization,
      role: currentRole,
    });
    
  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json({ error: 'Ett fel uppstod' }, { status: 500 });
  }
} 