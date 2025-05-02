import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { UserRole } from '@/lib/auth/roleUtils';

export async function POST(request: NextRequest) {
  try {
    const { email, name, role, organizationName, organizationSlug } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Kontrollera om användaren redan finns
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }
    
    // Om användaren är administratör och har angett organisationsinformation
    let organizationId: string | null = null;
    
    if (role === UserRole.ADMIN && organizationName && organizationSlug) {
      // Kontrollera om organisationen redan finns (baserat på slug)
      const existingOrg = await prisma.organization.findUnique({
        where: { slug: organizationSlug }
      });
      
      if (existingOrg) {
        return NextResponse.json(
          { error: 'Organization slug is already taken' },
          { status: 409 }
        );
      }
      
      // Skapa organisationen
      const newOrganization = await prisma.organization.create({
        data: {
          name: organizationName,
          slug: organizationSlug,
        }
      });
      
      organizationId = newOrganization.id;
      
      // Skapa en gratis trial-prenumeration för organisationen
      await prisma.subscription.create({
        data: {
          planType: 'TRIAL',
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dagar
          organizationId: newOrganization.id
        }
      });
      
      // Skapa en tom handbok för organisationen
      await prisma.handbook.create({
        data: {
          title: `${organizationName} Handbok`,
          description: 'Din förenings digitala handbok',
          organizationId: newOrganization.id
        }
      });
    } else if (role === UserRole.MEMBER && organizationSlug) {
      // För medlemmar, hitta organisationen baserat på slug
      const organization = await prisma.organization.findUnique({
        where: { slug: organizationSlug }
      });
      
      if (organization) {
        organizationId = organization.id;
      }
    }
    
    // Skapa användaren
    const user = await prisma.user.create({
      data: {
        email,
        name,
        role,
        organizationId
      }
    });
    
    return NextResponse.json({
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId
    });
    
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 