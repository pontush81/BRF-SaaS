import { NextRequest, NextResponse } from 'next/server';

// Re-export all UTOM GET för att undvika duplicate export
export { POST, PUT, DELETE, PATCH, OPTIONS } from '../route';

// Implementera GET-hanteraren direkt i denna fil
export async function GET(request: NextRequest) {
  console.log('[Debug Route] Direct debug endpoint called');
  
  // Vidarebefordra till huvudproxyns debug funktion
  try {
    const mainRoute = await import('../route');
    
    // Anropa handleDebug från huvudproxyn via GET-hanteraren
    // Vi använder GET-hanteraren men vi kan inte exportera den direkt
    return mainRoute.GET(request);
  } catch (error) {
    console.error('[Debug Route] Error forwarding to main proxy:', error);
    
    // Fallback om vi inte kan importera huvudproxyn
    return NextResponse.json({
      status: 'error',
      error: 'Failed to forward to main proxy',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 