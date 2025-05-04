import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/session
 * 
 * En API-endpoint för att synkronisera sessionsdata mellan klienten och servern.
 * Denna funktion tar emot access- och refresh-token från klienten och lagrar dem
 * i cookies som är tillgängliga både på klient- och serversidan.
 */
export async function POST(request: NextRequest) {
  try {
    // Extrahera tokens från request-body
    const { accessToken, refreshToken } = await request.json();
    
    if (!accessToken || !refreshToken) {
      console.error('[API] Session sync failed: Missing tokens');
      return NextResponse.json(
        { error: 'Missing tokens' },
        { status: 400 }
      );
    }

    console.log('[API] Setting session cookies');
    
    // Sätt cookies för sessionen
    const cookieStore = cookies();
    
    // Sätt access token i cookie som kan läsas av servern
    cookieStore.set('sb-access-token', accessToken, {
      path: '/',
      maxAge: 60 * 60 * 24, // 1 dag
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    
    // Sätt refresh token i cookie som kan läsas av servern
    cookieStore.set('sb-refresh-token', refreshToken, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 dagar
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    
    // I utvecklingsläge, sätt även en development auth cookie
    if (process.env.NODE_ENV === 'development') {
      cookieStore.set('supabase-dev-auth', 'true', {
        path: '/',
        maxAge: 60 * 60 * 24, // 1 dag
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
      });
      console.log('[API] Development auth cookie set');
    }
    
    // Logga för att bekräfta vilka cookies som sattes
    console.log('[API] Session cookies set successfully');
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API] Session sync error:', error);
    return NextResponse.json(
      { error: 'Failed to set session cookies' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/session
 * 
 * Returnerar information om aktuell sessions status.
 * Kan användas för att verifiera om en sessionscookie finns.
 */
export async function GET() {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('sb-access-token');
    const refreshToken = cookieStore.get('sb-refresh-token');
    const devAuth = cookieStore.get('supabase-dev-auth');
    
    // Logga alla tillgängliga cookies för felsökning
    console.log('[API] Available cookies:', cookieStore.getAll().map(c => c.name));
    
    // Kontrollera om tokens finns
    const hasTokens = !!accessToken && !!refreshToken;
    const isDev = process.env.NODE_ENV === 'development';
    
    // I utvecklingsmiljö kan vi också kontrollera dev-auth-cookie
    const hasDevAuth = isDev && !!devAuth;
    
    return NextResponse.json({
      authenticated: hasTokens || hasDevAuth,
      environment: process.env.NODE_ENV,
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      hasDevAuth: hasDevAuth,
    });
  } catch (error: any) {
    console.error('[API] Session check error:', error);
    return NextResponse.json(
      { error: 'Failed to check session' },
      { status: 500 }
    );
  }
} 