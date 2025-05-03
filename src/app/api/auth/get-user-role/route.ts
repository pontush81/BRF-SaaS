import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Hämta email-parametern från URL:en
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    
    // Verifiera auktorisering
    const supabase = createServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Validera att förfrågan har korrekt email
    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }
    
    // Hämta användaren från databasen
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organizations: {
          where: { isDefault: true },
          include: {
            organization: true
          }
        }
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { role: 'GUEST', message: 'User not found' },
        { status: 200 }
      );
    }
    
    // Hämta standardorganisationen och rollen
    const defaultUserOrg = user.organizations.find((org: any) => org.isDefault);
    
    // Returnera användarens roll och organisation
    return NextResponse.json({
      role: defaultUserOrg?.role || 'GUEST',
      organizationId: defaultUserOrg?.organizationId,
      organization: defaultUserOrg?.organization,
    });
    
  } catch (error) {
    console.error('Error getting user role:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 