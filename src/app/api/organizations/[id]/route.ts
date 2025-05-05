import { NextRequest, NextResponse } from 'next/server';
import { getOrganizationById } from '@/lib/organizations';
import { cookies } from 'next/headers';
import { createServerClient } from '@/supabase-server';
import { safeUserData } from '@/lib/supabase-types';
import {
  UserRole,
  SUPERADMIN_ROLE,
  hasSuperAdminAccess,
} from '@/lib/auth/roleUtils';

// Get organization by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Hämta organisationens ID från URL-parametern
    const organizationId = params.id;

    // Skapa en Supabase-klient
    const supabase = await createServerClient(cookies());

    // Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    const organization = await getOrganizationById(organizationId);

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Check if user belongs to this organization
    const result = await supabase
      .from('users')
      .select('organizationId, role')
      .eq('id', user.id)
      .single();

    // Använd safeUserData för att hantera resultatet
    const userData = safeUserData(result);

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only allow access if user is an admin or belongs to the organization
    if (
      userData.organizationId !== organizationId &&
      userData.role !== UserRole.ADMIN &&
      !hasSuperAdminAccess(userData)
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
      { status: 500 }
    );
  }
}
