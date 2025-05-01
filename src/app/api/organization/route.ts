import { NextRequest, NextResponse } from 'next/server';
import { createOrganization, getAllOrganizations, getOrganizationById, updateOrganization, deleteOrganization } from '@/lib/organizations';
import { createClient } from '@/lib/supabase/server';

// Helper för att verifiera admin-behörighet
async function verifyAdmin(request: NextRequest) {
  const supabase = createClient();
  
  // Kontrollera autentisering
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { authorized: false, error: 'Unauthorized', status: 401 };
  }
  
  // Hämta användarens roll från database
  const { data: userData, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (error || !userData) {
    return { authorized: false, error: 'User not found', status: 404 };
  }
  
  if (userData.role !== 'ADMIN' && userData.role !== 'SUPERADMIN') {
    return { authorized: false, error: 'Forbidden', status: 403 };
  }
  
  return { authorized: true, userId: user.id };
}

// Hämta alla organisationer (endast för admin)
export async function GET(request: NextRequest) {
  const auth = await verifyAdmin(request);
  
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  
  try {
    const organizations = await getAllOrganizations();
    return NextResponse.json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 });
  }
}

// Skapa en ny organisation
export async function POST(request: NextRequest) {
  const auth = await verifyAdmin(request);
  
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  
  try {
    const body = await request.json();
    
    if (!body.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    
    const organization = await createOrganization({
      name: body.name,
      slug: body.slug,
      domain: body.domain,
      userId: body.userId || auth.userId // Använd userId från auth om inget annat anges
    });
    
    return NextResponse.json(organization);
  } catch (error: any) {
    console.error('Error creating organization:', error);
    return NextResponse.json({ error: error.message || 'Failed to create organization' }, { status: 500 });
  }
}

// Uppdatera en organisation
export async function PATCH(request: NextRequest) {
  const auth = await verifyAdmin(request);
  
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }
    
    // Kontrollera att organisationen finns
    const existingOrg = await getOrganizationById(body.id);
    if (!existingOrg) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }
    
    const updatedOrganization = await updateOrganization(body.id, {
      name: body.name,
      slug: body.slug,
      domain: body.domain
    });
    
    return NextResponse.json(updatedOrganization);
  } catch (error: any) {
    console.error('Error updating organization:', error);
    return NextResponse.json({ error: error.message || 'Failed to update organization' }, { status: 500 });
  }
}

// Ta bort en organisation
export async function DELETE(request: NextRequest) {
  const auth = await verifyAdmin(request);
  
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }
    
    // Kontrollera att organisationen finns
    const existingOrg = await getOrganizationById(id);
    if (!existingOrg) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }
    
    await deleteOrganization(id);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting organization:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete organization' }, { status: 500 });
  }
} 