import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { UserRole } from '@/lib/auth/roleUtils';

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
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
    
    if (!dbUser) {
      return NextResponse.json({ error: 'Användare hittades inte' }, { status: 404 });
    }
    
    // Returnera användarinformation med roll och organisation
    return NextResponse.json({
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role as UserRole,
      organizationId: dbUser.organizationId,
      organization: dbUser.organization || null,
      // Inkludera inte känsliga fält som password
    });
    
  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json({ error: 'Ett fel uppstod' }, { status: 500 });
  }
} 