import { NextRequest } from 'next/server';

// Re-export funktionen från huvudproxyn
export { GET, POST, PUT, DELETE, PATCH, OPTIONS } from '../route';

// För dubbel säkerhet, lägg även till en backup-handler
export async function GET(request: NextRequest) {
  console.log('[Debug Route] Direct debug endpoint called, redirecting to main proxy');
  // Vidarebefordra till huvudproxyns GET-hanterare
  const mainRoute = await import('../route');
  return mainRoute.GET(request);
} 