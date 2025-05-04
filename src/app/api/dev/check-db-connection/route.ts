import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getEnvironment, Environment } from '@/lib/env';

/**
 * API endpoint to check database connection
 * Only available in development environment
 */
export async function GET() {
  // Only allow this in development
  if (getEnvironment() !== Environment.DEVELOPMENT) {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  try {
    // Simple query to check connection
    await prisma.$queryRaw`SELECT 1 as ping`;
    return NextResponse.json({ connected: true });
  } catch (error) {
    console.error('Database connection check failed:', error);
    return NextResponse.json({ connected: false, error: String(error) });
  }
} 