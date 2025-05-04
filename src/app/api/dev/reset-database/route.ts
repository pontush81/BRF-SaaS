import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';
import { getEnvironment, Environment } from '@/lib/env';

const execPromise = util.promisify(exec);

/**
 * API endpoint to reset the database with test data
 * Only available in development environment
 */
export async function POST() {
  // Only allow this in development
  if (getEnvironment() !== Environment.DEVELOPMENT) {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  try {
    console.log('Starting database reset...');
    
    // Run the database reset command
    await execPromise('npm run db:reset');
    
    console.log('Database reset completed successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database reset and seeded successfully' 
    });
  } catch (error) {
    console.error('Database reset failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error),
      message: 'Failed to reset database'
    }, { status: 500 });
  }
} 