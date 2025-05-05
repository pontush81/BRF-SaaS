import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UserRole } from '@/lib/auth/roleUtils';
import { userRepository } from '@/repositories/userRepository';
import { organizationRepository } from '@/repositories/organizationRepository';
import { createServerClient } from '@/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = await createServerClient(cookieStore);

    // Kontrollera att supabase och auth är tillgängliga
    if (!supabase || !supabase.auth) {
      console.error(
        '[API] Failed to create Supabase client or auth is undefined'
      );
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 500 }
      );
    }

    try {
      // Verifiera att användaren är autentiserad
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
      }

      // Hämta data från förfrågan
      const body = await request.json();
      const { userId, organizationSlug } = body;

      // Validera att nödvändig data finns
      if (!userId || !organizationSlug) {
        return NextResponse.json(
          { error: 'Användar-ID och organisations-slug krävs' },
          { status: 400 }
        );
      }

      // Säkerställ att användaren bara kan ansluta sig själv
      if (user.id !== userId && user.email) {
        // Kontrollera om användaren är admin
        const adminUser = await userRepository.getUserWithRoleInOrganizations(
          user.email,
          UserRole.ADMIN
        );

        if (!adminUser || adminUser.organizations.length === 0) {
          return NextResponse.json(
            { error: 'Du har inte behörighet att ansluta andra användare' },
            { status: 403 }
          );
        }
      }

      // Hämta organisationen baserat på slug
      const organization =
        await organizationRepository.getOrganizationBySlug(organizationSlug);

      if (!organization) {
        return NextResponse.json(
          { error: 'Föreningen kunde inte hittas' },
          { status: 404 }
        );
      }

      // Uppdatera användaren för att ansluta till organisationen
      const updatedUser = await userRepository.connectUserToOrganization(
        userId,
        organization.id,
        UserRole.MEMBER,
        true // Sätt som default
      );

      // Hitta rätt organisation i användarens lista
      const userOrganization = updatedUser.organizations.find(
        org => org.organizationId === organization.id
      );

      return NextResponse.json({
        success: true,
        message: 'Användaren har anslutits till föreningen',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: userOrganization?.role || UserRole.MEMBER,
          organization: userOrganization?.organization,
        },
      });
    } catch (authError) {
      console.error('[API] Auth error:', authError);
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error joining organization:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid anslutning till föreningen' },
      { status: 500 }
    );
  }
}
