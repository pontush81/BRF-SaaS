import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { UserRole } from '@/lib/auth/roleUtils';
import { createServerClient } from '@/supabase-server';

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
  try {
    const cookieStore = cookies();

    // Logga alla cookies för debugging
    const allCookies = cookieStore.getAll();
    console.log("[API] Cookies:", allCookies.map(c => c.name).join(', '));

    // Skapa Supabase-klient med server-server implementationen
    const supabase = await createServerClient(cookieStore);

    console.log("[API] /api/auth/current-user anropad");

    // Kontrollera att supabase och auth är tillgängliga
    if (!supabase || !supabase.auth) {
      console.error("[API] Failed to create Supabase client or auth is undefined");
      return NextResponse.json({ error: 'Authentication error' }, { status: 500 });
    }

    try {
      // Verifierar att användaren är autentiserad
      const { data: { user }, error } = await supabase.auth.getUser();

      console.log("[API] User check:", {
        userExists: !!user,
        userId: user?.id,
        userEmail: user?.email
      });

      if (error || !user) {
        console.log("[API] Ingen användare hittades");
        return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
      }

      // Kontrollera att email finns
      if (!user.email) {
        console.log("[API] E-post saknas på användaren");
        return NextResponse.json({ error: 'Ingen email tillgänglig för användaren' }, { status: 400 });
      }

      console.log("[API] Söker användare med e-post:", user.email);

      // Hämta användarinformation från databasen
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
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

      console.log("[API] Databassökning resultat:", {
        userFound: !!dbUser,
        userId: dbUser?.id
      });

      if (!dbUser) {
        console.log("[API] Användare hittades inte i databasen");
        return NextResponse.json({ error: 'Användare hittades inte' }, { status: 404 });
      }

      // Konvertera organisationer till rätt format
      const organizations: Organization[] = dbUser.organizations.map(
        (userOrg: UserOrganizationWithOrg) => ({
          id: userOrg.organization.id,
          name: userOrg.organization.name,
          slug: userOrg.organization.slug,
          domain: userOrg.organization.domain,
          role: userOrg.role as UserRole,
          isDefault: userOrg.isDefault,
        })
      );

      // Hämta standardorganisationen
      const defaultOrg = organizations.find((org) => org.isDefault);

      console.log("[API] Användare hittad:", {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        organizations: organizations.length,
        defaultOrg: defaultOrg?.name || 'Ingen',
      });

      // Skapa användarsvaret
      const userData = {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name || '',
        organizations: organizations,
        currentOrganization: defaultOrg || null,
      };

      return NextResponse.json(userData);
    } catch (authError) {
      console.error("[API] Autentiseringsfel:", authError);
      return NextResponse.json({ error: 'Autentiseringsfel' }, { status: 500 });
    }
  } catch (error) {
    console.error("[API] Fel vid hämtning av användardata:", error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid hämtning av användardata' },
      { status: 500 }
    );
  }
}
