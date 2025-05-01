import { NextRequest, NextResponse } from 'next/server';
import { getPageById, createPage, updatePage, deletePage } from '@/lib/handbooks';
import { getSectionById, getHandbookById } from '@/lib/handbooks';
import { createClient } from '@/lib/supabase/server';

// Helper för att verifiera behörigheter
async function verifyPermission(request: NextRequest, pageId?: string, sectionId?: string) {
  const supabase = createClient();
  
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
  
  let handbookOrganizationId = null;
  
  // För GET, PATCH, DELETE där vi har ett sid-ID
  if (pageId) {
    // Hämta sidan för att få sektions-ID
    const page = await getPageById(pageId);
    
    if (!page) {
      return { authorized: false, error: 'Page not found', status: 404 };
    }
    
    // Hämta sektionen för att få handboks-ID
    const section = await getSectionById(page.sectionId);
    
    if (!section) {
      return { authorized: false, error: 'Section not found', status: 404 };
    }
    
    // Hämta handboken för att få organizations-ID
    const handbook = await getHandbookById(section.handbookId);
    
    if (!handbook) {
      return { authorized: false, error: 'Handbook not found', status: 404 };
    }
    
    handbookOrganizationId = handbook.organizationId;
  }
  // För POST där vi har ett sektions-ID
  else if (sectionId) {
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
    
    handbookOrganizationId = handbook.organizationId;
  }
  // Om varken sid-ID eller sektions-ID angavs
  else {
    return { authorized: false, error: 'Missing page ID or section ID', status: 400 };
  }
  
  // Kontrollera att användaren tillhör samma organisation som handboken
  if (userData.organizationId !== handbookOrganizationId) {
    return { authorized: false, error: 'Forbidden', status: 403 };
  }
  
  // Kontrollera att användaren är ADMIN för att redigera
  if (userData.role !== 'ADMIN' && request.method !== 'GET') {
    return { authorized: false, error: 'Forbidden', status: 403 };
  }
  
  return { authorized: true, userId: user.id };
}

// Hämta en sida
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Page ID is required' }, { status: 400 });
    }
    
    const auth = await verifyPermission(request, id);
    
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    const page = await getPageById(id);
    
    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }
    
    return NextResponse.json(page);
  } catch (error: any) {
    console.error('Error fetching page:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch page' }, { status: 500 });
  }
}

// Skapa en ny sida
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.sectionId) {
      return NextResponse.json({ error: 'Section ID is required' }, { status: 400 });
    }
    
    if (!body.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    const auth = await verifyPermission(request, undefined, body.sectionId);
    
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    const newPage = await createPage(body.sectionId, {
      title: body.title,
      content: body.content || '',
      sortOrder: body.sortOrder
    });
    
    return NextResponse.json(newPage);
  } catch (error: any) {
    console.error('Error creating page:', error);
    return NextResponse.json({ error: error.message || 'Failed to create page' }, { status: 500 });
  }
}

// Uppdatera en sida
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json({ error: 'Page ID is required' }, { status: 400 });
    }
    
    const auth = await verifyPermission(request, body.id);
    
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    const updatedPage = await updatePage(body.id, {
      title: body.title,
      content: body.content,
      sortOrder: body.sortOrder
    });
    
    return NextResponse.json(updatedPage);
  } catch (error: any) {
    console.error('Error updating page:', error);
    return NextResponse.json({ error: error.message || 'Failed to update page' }, { status: 500 });
  }
}

// Ta bort en sida
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Page ID is required' }, { status: 400 });
    }
    
    const auth = await verifyPermission(request, id);
    
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    await deletePage(id);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting page:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete page' }, { status: 500 });
  }
} 