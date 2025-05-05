import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { createServerClient } from '@/supabase-server';

export async function GET(request: NextRequest) {
  try {
    // Hämta email-parametern från URL:en
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    // Verifiera auktorisering
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
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Validera att förfrågan har korrekt email
      if (!email) {
        return NextResponse.json(
          { error: 'Email parameter is required' },
          { status: 400 }
        );
      }

      // Hämta användaren från databasen
      const dbUser = await prisma.user.findUnique({
        where: { email },
        include: {
          organizations: {
            where: { isDefault: true },
            include: {
              organization: true,
            },
          },
        },
      });

      if (!dbUser) {
        return NextResponse.json(
          { role: 'GUEST', message: 'User not found' },
          { status: 200 }
        );
      }

      // Hämta standardorganisationen och rollen
      const defaultUserOrg = dbUser.organizations.find(
        (org: any) => org.isDefault
      );

      // Returnera användarens roll och organisation
      return NextResponse.json({
        role: defaultUserOrg?.role || 'GUEST',
        organizationId: defaultUserOrg?.organizationId,
        organization: defaultUserOrg?.organization,
      });
    } catch (authError) {
      console.error('[API] Auth error:', authError);
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error getting user role:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
