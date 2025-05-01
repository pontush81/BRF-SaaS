import { NextResponse } from 'next/server';
import { checkDatabaseConnection } from '@/lib/db';

export async function GET() {
  try {
    const connectionResult = await checkDatabaseConnection();
    
    if (!connectionResult.connected) {
      return NextResponse.json(connectionResult, { status: 500 });
    }
    
    return NextResponse.json(connectionResult, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 