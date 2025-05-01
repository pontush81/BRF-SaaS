import { NextRequest, NextResponse } from 'next/server';
import { createOrganization, getOrganizationBySlug, updateOrganization, deleteOrganization } from '@/lib/organizations';
import { supabase } from '@/lib/supabase';

// Hjälpfunktion för att verifiera admin-behörighet
async function verifyAdmin(request: NextRequest) {
  try {
    // Hämta Authorization-header från request
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { isAdmin: false, error: 'Unauthorized' };
    }

    const token = authHeader.split(' ')[1];
    
    // Verifiera med Supabase
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return { isAdmin: false, error: 'Invalid token' };
    }

    // Här skulle vi kunna kontrollera om användaren är admin
    // För tillfället godkänner vi alla autentiserade användare
    return { isAdmin: true, userId: data.user.id };
  } catch (error) {
    console.error('Error verifying admin:', error);
    return { isAdmin: false, error: 'Server error' };
  }
}

// GET /api/organization?slug=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    
    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }
    
    const organization = await getOrganizationBySlug(slug);
    
    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }
    
    return NextResponse.json({ organization });
  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/organization
export async function POST(request: NextRequest) {
  try {
    const { isAdmin, error } = await verifyAdmin(request);
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: 401 });
    }
    
    const body = await request.json();
    
    if (!body.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    
    const organization = await createOrganization({
      name: body.name,
      slug: body.slug,
      domain: body.domain,
    });
    
    return NextResponse.json({ organization }, { status: 201 });
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/organization?id=...
export async function PATCH(request: NextRequest) {
  try {
    const { isAdmin, error } = await verifyAdmin(request);
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }
    
    const body = await request.json();
    
    if (Object.keys(body).length === 0) {
      return NextResponse.json({ error: 'No update data provided' }, { status: 400 });
    }
    
    const organization = await updateOrganization(id, {
      name: body.name,
      slug: body.slug,
      domain: body.domain,
    });
    
    return NextResponse.json({ organization });
  } catch (error) {
    console.error('Error updating organization:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/organization?id=...
export async function DELETE(request: NextRequest) {
  try {
    const { isAdmin, error } = await verifyAdmin(request);
    
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }
    
    await deleteOrganization(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting organization:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 