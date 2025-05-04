import { NextRequest, NextResponse } from 'next/server';
import { getSectionById, createSection, updateSection, deleteSection } from '@/lib/handbooks';
import { getHandbookById } from '@/lib/handbooks';
import { cookies } from 'next/headers';
import { createServerClient } from '@/supabase-server';

// Helper för att verifiera behörigheter
async function verifyPermission(request: NextRequest, sectionId?: string, handbookId?: string) {
  const supabase = createServerClient(cookies());
  
  // Kontrollera autentisering
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { authorized: false, error: 'Unauthorized', status: 401 };
  }
  
  // Hämta användarens data från database
  const { data: userData, error } = await supabase
    .from('users')
    .select('role, organizationId')
    .eq('id', user.id)
    .single();
  
  if (error || !userData) {
    return { authorized: false, error: 'User not found', status: 404 };
  }
  
  // Om användaren är SUPERADMIN, ge tillgång
  if (userData.role === 'SUPERADMIN') {
    return { authorized: true, userId: user.id };
  }
  
  // För GET, PATCH, DELETE där vi har ett sektions-ID
  if (sectionId) {
    // Hämta sektionen för att få handboks-ID
    const section = await getSectionById(sectionId);
    
    if (!section) {
      return { authorized: false, error: 'Section not found', status: 404 };
    }
    
    // Hämta handboken för att få organizations-ID
    const handbook = await getHandbookById(section.handbookId);
    
    if (!handbook) {
      return { authorized: false, error: 'Handbook not found', status: 404 };
    }
    
    // Kontrollera att användaren tillhör samma organisation som handboken
    if (userData.organizationId !== handbook.organizationId) {
      return { authorized: false, error: 'Forbidden', status: 403 };
    }
    
    // Kontrollera att användaren är ADMIN för att redigera
    if (userData.role !== 'ADMIN' && request.method !== 'GET') {
      return { authorized: false, error: 'Forbidden', status: 403 };
    }
  }
  // För POST där vi har ett handboks-ID
  else if (handbookId) {
    // Hämta handboken för att få organizations-ID
    const handbook = await getHandbookById(handbookId);
    
    if (!handbook) {
      return { authorized: false, error: 'Handbook not found', status: 404 };
    }
    
    // Kontrollera att användaren tillhör samma organisation som handboken
    if (userData.organizationId !== handbook.organizationId) {
      return { authorized: false, error: 'Forbidden', status: 403 };
    }
    
    // Kontrollera att användaren är ADMIN för att redigera
    if (userData.role !== 'ADMIN') {
      return { authorized: false, error: 'Forbidden', status: 403 };
    }
  }
  // Om varken sektions-ID eller handboks-ID angavs
  else {
    return { authorized: false, error: 'Missing section ID or handbook ID', status: 400 };
  }
  
  return { authorized: true, userId: user.id };
}

// Hämta en sektion
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Section ID is required' }, { status: 400 });
    }
    
    const auth = await verifyPermission(request, id);
    
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    const section = await getSectionById(id);
    
    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }
    
    return NextResponse.json(section);
  } catch (error: any) {
    console.error('Error fetching section:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch section' }, { status: 500 });
  }
}

// Skapa en ny sektion
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.handbookId) {
      return NextResponse.json({ error: 'Handbook ID is required' }, { status: 400 });
    }
    
    if (!body.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    const auth = await verifyPermission(request, undefined, body.handbookId);
    
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    const newSection = await createSection(body.handbookId, {
      title: body.title,
      sortOrder: body.sortOrder
    });
    
    return NextResponse.json(newSection);
  } catch (error: any) {
    console.error('Error creating section:', error);
    return NextResponse.json({ error: error.message || 'Failed to create section' }, { status: 500 });
  }
}

// Uppdatera en sektion
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json({ error: 'Section ID is required' }, { status: 400 });
    }
    
    const auth = await verifyPermission(request, body.id);
    
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    const updatedSection = await updateSection(body.id, {
      title: body.title,
      sortOrder: body.sortOrder
    });
    
    return NextResponse.json(updatedSection);
  } catch (error: any) {
    console.error('Error updating section:', error);
    return NextResponse.json({ error: error.message || 'Failed to update section' }, { status: 500 });
  }
}

// Ta bort en sektion
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Section ID is required' }, { status: 400 });
    }
    
    const auth = await verifyPermission(request, id);
    
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    await deleteSection(id);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting section:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete section' }, { status: 500 });
  }
} 