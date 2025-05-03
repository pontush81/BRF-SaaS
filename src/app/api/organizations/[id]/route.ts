import { NextRequest, NextResponse } from 'next/server';
import { getOrganizationById } from '@/lib/organizations';
import { createClient } from '@/lib/supabase/server';

// Get organization by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verify authentication
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Get organization ID from URL params
  const organizationId = params.id;
  
  if (!organizationId) {
    return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
  }
  
  try {
    const organization = await getOrganizationById(organizationId);
    
    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }
    
    // Check if user belongs to this organization
    const { data: userData, error } = await supabase
      .from('users')
      .select('organizationId, role')
      .eq('id', user.id)
      .single();
    
    if (error || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Only allow access if user is an admin or belongs to the organization
    if (userData.organizationId !== organizationId && userData.role !== 'ADMIN' && userData.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    return NextResponse.json(organization);
  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json({ error: 'Failed to fetch organization' }, { status: 500 });
  }
} 