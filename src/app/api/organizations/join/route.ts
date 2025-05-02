import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { UserRole } from '@/lib/auth/roleUtils';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId, organizationSlug } = await request.json();

    // Validera parametrar
    if (!userId) {
      return NextResponse.json(
        { error: 'Användar-ID saknas' },
        { status: 400 }
      );
    }

    if (!organizationSlug) {
      return NextResponse.json(
        { error: 'Föreningens slug saknas' },
        { status: 400 }
      );
    }

    // Verifiera att användaren finns
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Användaren hittades inte' },
        { status: 404 }
      );
    }

    // Om användaren redan har en organisation
    if (user.organizationId) {
      return NextResponse.json(
        { error: 'Du är redan ansluten till en förening' },
        { status: 400 }
      );
    }

    // Hitta organisationen
    const organization = await prisma.organization.findUnique({
      where: { slug: organizationSlug }
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Föreningen hittades inte. Kontrollera att du angett rätt webbadress.' },
        { status: 404 }
      );
    }

    // Anslut användaren till organisationen
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        organizationId: organization.id,
        role: UserRole.MEMBER // Nya användare får alltid medlemsroll
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    // Returnera uppdaterad information
    return NextResponse.json({
      message: `Du har anslutit till ${organization.name}`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        organization: updatedUser.organization
      }
    });
  } catch (error) {
    console.error('Fel vid anslutning till organisation:', error);
    return NextResponse.json(
      { error: 'Ett oväntat fel inträffade' },
      { status: 500 }
    );
  }
} 