import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { UserRole } from '@/lib/auth/roleUtils';

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  try {
    // Verifiera att användaren är autentiserad
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
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
    if (session.user.id !== userId && session.user.email) {
      // Dynamisk import av Prisma för att undvika att importera vid byggtid
      const { default: prisma } = await import('@/lib/prisma');
      
      // Kontrollera om användaren är admin
      const adminUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          organizations: {
            where: { role: UserRole.ADMIN }
          }
        }
      });
      
      if (!adminUser || adminUser.organizations.length === 0) {
        return NextResponse.json(
          { error: 'Du har inte behörighet att ansluta andra användare' }, 
          { status: 403 }
        );
      }
    }
    
    // Hämta organisationen baserat på slug
    const { default: prisma } = await import('@/lib/prisma');
    
    const organization = await prisma.organization.findUnique({
      where: { slug: organizationSlug },
    });
    
    if (!organization) {
      return NextResponse.json(
        { error: 'Föreningen kunde inte hittas' }, 
        { status: 404 }
      );
    }
    
    // Uppdatera användaren för att ansluta till organisationen
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        organizations: {
          create: {
            organizationId: organization.id,
            role: UserRole.MEMBER, // Standardroll är medlem
            isDefault: true // Sätt som standard om det är användarens första organisation
          }
        }
      },
      include: {
        organizations: {
          where: { organizationId: organization.id },
          include: {
            organization: true
          }
        }
      }
    });
    
    const userOrganization = updatedUser.organizations[0];
    
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
    
  } catch (error) {
    console.error('Error joining organization:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid anslutning till föreningen' }, 
      { status: 500 }
    );
  }
} 