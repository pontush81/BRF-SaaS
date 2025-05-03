import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'; 
import { cookies } from 'next/headers';
import { UserRole } from '@/lib/auth/roleUtils';

// Definierar typen för användardata som tas emot från klienten
interface UserData {
  email: string;
  name: string | null;
  role: UserRole;
  organizationName: string | null;
  organizationSlug: string | null;
}

export async function POST(request: NextRequest) {
  try {
    // Hämta användardata från förfrågan
    const userData: UserData = await request.json();
    
    // Validera att nödvändig data finns
    if (!userData.email) {
      return NextResponse.json(
        { error: 'E-postadress saknas' },
        { status: 400 }
      );
    }
    
    // Skapa Supabase klient
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Hämta Prisma klienten först när vi behöver den
    const { default: prisma } = await import('@/lib/prisma');
    
    // Leta först efter en befintlig användare
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { message: 'Användaren finns redan', user: existingUser },
        { status: 200 }
      );
    }
    
    // Skapa en ny organisation om det är en administratör
    let organizationId = null;
    
    if (userData.role === UserRole.ADMIN && userData.organizationName && userData.organizationSlug) {
      // Kontrollera om organisationen redan finns
      const existingOrganization = await prisma.organization.findFirst({
        where: {
          OR: [
            { slug: userData.organizationSlug },
            { name: userData.organizationName }
          ]
        }
      });
      
      if (existingOrganization) {
        return NextResponse.json(
          { error: 'En förening med detta namn eller webbadress finns redan' },
          { status: 400 }
        );
      }
      
      // Skapa ny organisation
      const newOrganization = await prisma.organization.create({
        data: {
          name: userData.organizationName,
          slug: userData.organizationSlug,
        }
      });
      
      organizationId = newOrganization.id;
    }
    
    // Skapa användare i databasen
    const newUser = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        organizations: {
          create: {
            organizationId: organizationId,
            role: userData.role,
            isDefault: true
          }
        }
      },
      include: {
        organizations: {
          include: {
            organization: true
          }
        }
      }
    });
    
    return NextResponse.json({
      message: 'Användare skapad',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: userData.role,
        organization: newUser.organizations[0]?.organization
      }
    });
    
  } catch (error: any) {
    console.error('Error creating user:', error);
    
    // Ge detaljerade felmeddelanden för dubblettkonflikter
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'En användare med denna e-post finns redan' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Ett fel uppstod vid skapande av användaren', details: error.message },
      { status: 500 }
    );
  }
} 