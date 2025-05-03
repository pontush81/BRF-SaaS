import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const query = url.searchParams.get('query');
  
  if (!query || query.length < 2) {
    return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
  }
  
  try {
    // Söker efter organisationer som matchar sökfrågan
    const organizations = await prisma.organization.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive' // Case-insensitive sökning
        }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true
      },
      orderBy: {
        name: 'asc'
      },
      take: 10 // Begränsa resultatet till 10 träffar
    });
    
    return NextResponse.json(organizations);
  } catch (error) {
    console.error('Error searching organizations:', error);
    return NextResponse.json({ error: 'Failed to search organizations' }, { status: 500 });
  }
} 