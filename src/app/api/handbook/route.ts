import { NextRequest, NextResponse } from 'next/server';
import { getHandbookById, updateHandbook } from '@/lib/handbooks';
import { cookies } from 'next/headers';
import { createServerClient } from '@/supabase-server';
import { safeUserData } from '@/lib/supabase-types';
import {
  UserRole,
  SUPERADMIN_ROLE,
  hasSuperAdminAccess,
} from '@/lib/auth/roleUtils';

// Helper för att verifiera behörigheter
async function verifyPermission(request: NextRequest, handbookId: string) {
  const supabase = await createServerClient(cookies());

  // Kontrollera autentisering
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { authorized: false, error: 'Unauthorized', status: 401 };
  }

  // Hämta användarens data från database
  const result = await supabase
    .from('users')
    .select('role, organizationId')
    .eq('id', user.id)
    .single();

  // Använd safeUserData för att hantera resultatet
  const userData = safeUserData(result);

  if (!userData) {
    return { authorized: false, error: 'User not found', status: 404 };
  }

  // Om användaren är SUPERADMIN, ge tillgång
  if (hasSuperAdminAccess(userData)) {
    return { authorized: true, userId: user.id };
  }

  // Hämta handboken för att kontrollera organizationId
  const handbook = await getHandbookById(handbookId);

  if (!handbook) {
    return { authorized: false, error: 'Handbook not found', status: 404 };
  }

  // Kontrollera att användaren tillhör samma organisation som handboken
  if (userData.organizationId !== handbook.organizationId) {
    return { authorized: false, error: 'Forbidden', status: 403 };
  }

  // Kontrollera att användaren är ADMIN för att redigera
  if (userData.role !== UserRole.ADMIN && request.method !== 'GET') {
    return { authorized: false, error: 'Forbidden', status: 403 };
  }

  return { authorized: true, userId: user.id };
}

// Hämta en handbok
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Handbook ID is required' },
        { status: 400 }
      );
    }

    const auth = await verifyPermission(request, id);

    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const handbook = await getHandbookById(id);

    if (!handbook) {
      return NextResponse.json(
        { error: 'Handbook not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(handbook);
  } catch (error: any) {
    console.error('Error fetching handbook:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch handbook' },
      { status: 500 }
    );
  }
}

// Uppdatera en handbok
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: 'Handbook ID is required' },
        { status: 400 }
      );
    }

    const auth = await verifyPermission(request, body.id);

    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const updatedHandbook = await updateHandbook(body.id, {
      title: body.title,
    });

    return NextResponse.json(updatedHandbook);
  } catch (error: any) {
    console.error('Error updating handbook:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update handbook' },
      { status: 500 }
    );
  }
}
