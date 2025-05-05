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
    // Logga miljön
    console.log('[API] Session sync environment:', {
      NODE_ENV: process.env.NODE_ENV,
      DEPLOYMENT_ENV: process.env.DEPLOYMENT_ENV || 'not set'
    });

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

    // Bestäm säkerhetsinställningar baserat på miljö
    const isProduction = process.env.NODE_ENV === 'production';
    const isStaging = isProduction && process.env.DEPLOYMENT_ENV === 'staging';

    // Förhindra secure cookies i staging för att underlätta testning
    // om det explicit anges att det ska vara av
    const isSecure = isProduction && !process.env.DISABLE_SECURE_COOKIES && !isStaging;

    // Använd domain baserat på environment
    let domain = undefined;
    const hostname = request.headers.get('host') || '';

    if (isProduction) {
      // För staging, använd faktisk host istället för app domain
      if (isStaging) {
        // Extrahera basdomänen från host
        const hostParts = hostname.split('.');
        if (hostParts.length >= 2) {
          // För staging.handbok.org -> använd handbok.org
          domain = hostParts.slice(hostParts.length - 2).join('.');
        } else {
          domain = hostname;
        }
      } else {
        domain = process.env.NEXT_PUBLIC_APP_DOMAIN || undefined;
      }
      console.log('[API] Using cookie domain:', domain);
    }

    // Logga request headers för felsökning
    console.log('[API] Request host:', hostname);

    const cookieSettings = {
      path: '/',
      maxAge: 60 * 60 * 24, // 1 dag
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax' as 'lax',
      domain: domain
    };

    console.log('[API] Cookie settings:', {
      ...cookieSettings,
      tokenLength: accessToken.length,
      isStaging,
      isProduction
    });

    // Sätt access token i cookie som kan läsas av servern
    cookieStore.set('sb-access-token', accessToken, cookieSettings);

    // Sätt refresh token i cookie med längre livstid
    cookieStore.set('sb-refresh-token', refreshToken, {
      ...cookieSettings,
      maxAge: 60 * 60 * 24 * 30, // 30 dagar
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

    // För staging, sätt en särskild staging-cookie som kan hjälpa vid felsökning
    if (isStaging) {
      cookieStore.set('staging-auth', 'true', {
        path: '/',
        maxAge: 60 * 60 * 24, // 1 dag
        httpOnly: false, // Kan läsas av klientskript
        secure: isSecure,
        sameSite: 'lax',
        domain: domain
      });
      console.log('[API] Staging auth cookie set');
    }

    // Sätt även en explicit cookie för diagnostiska ändamål
    cookieStore.set('auth-status', 'authenticated', {
      path: '/',
      maxAge: 60 * 60 * 24, // 1 dag
      httpOnly: false, // Kan läsas av klientskript
      secure: isSecure,
      sameSite: 'lax',
      domain: domain
    });

    // Logga för att bekräfta vilka cookies som sattes
    console.log('[API] Session cookies set successfully');

    return NextResponse.json({
      success: true,
      environment: process.env.NODE_ENV,
      deploymentEnv: process.env.DEPLOYMENT_ENV || 'not set',
      cookieSettings: {
        ...cookieSettings,
        tokenSet: true
      }
    });
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
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('sb-access-token');
    const refreshToken = cookieStore.get('sb-refresh-token');
    const devAuth = cookieStore.get('supabase-dev-auth');
    const stagingAuth = cookieStore.get('staging-auth');
    const host = request.headers.get('host') || '';

    // Logga alla tillgängliga cookies för felsökning
    console.log('[API] Available cookies:', cookieStore.getAll().map(c => c.name));
    console.log('[API] Request host:', host);

    // Kontrollera om tokens finns
    const hasTokens = !!accessToken && !!refreshToken;
    const isDev = process.env.NODE_ENV === 'development';
    const isStaging = process.env.NODE_ENV === 'production' && process.env.DEPLOYMENT_ENV === 'staging';

    // I utvecklingsmiljö kan vi också kontrollera dev-auth-cookie
    const hasDevAuth = isDev && !!devAuth;
    const hasStagingAuth = isStaging && !!stagingAuth;

    return NextResponse.json({
      authenticated: hasTokens || hasDevAuth || hasStagingAuth,
      environment: process.env.NODE_ENV,
      deploymentEnv: process.env.DEPLOYMENT_ENV || 'not set',
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      hasDevAuth: hasDevAuth,
      hasStagingAuth: hasStagingAuth,
      host: host,
      cookies: cookieStore.getAll().map(c => c.name),
    });
  } catch (error: any) {
    console.error('[API] Session check error:', error);
    return NextResponse.json(
      { error: 'Failed to check session' },
      { status: 500 }
    );
  }
}
