import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Extremt förenklad middleware - tillåt allt utan någon logik
  return NextResponse.next();
}

// Ta bort alla matcher - låt inget gå genom middleware
export const config = {
  matcher: [],
};
