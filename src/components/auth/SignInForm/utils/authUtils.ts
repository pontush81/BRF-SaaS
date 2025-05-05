import { createBrowserClient } from '@/supabase-client';
import { SupabaseClient, Session } from '@supabase/supabase-js';

/**
 * Resultat från en autentiseringsoperation
 */
export interface AuthResult {
  success: boolean;
  message?: string;
  session?: Session;
}

/**
 * Kontrollerar cookies för att säkerställa att de fungerar korrekt
 */
export const checkCookies = (): boolean => {
  try {
    // Testa att skriva en cookie
    const testValue = 'test-cookie-' + Date.now();
    document.cookie = `test_cookie=${testValue}; path=/; SameSite=Strict`;

    // Försök läsa tillbaka den
    const cookies = document.cookie.split(';');
    const testCookie = cookies.find(cookie =>
      cookie.trim().startsWith('test_cookie=')
    );

    if (!testCookie) {
      console.error('Failed to read test cookie - cookies may be disabled');
      return false;
    }

    const cookieValue = testCookie.split('=')[1];
    console.log(
      'Cookie test:',
      cookieValue === testValue ? 'successful' : 'failed'
    );

    return cookieValue === testValue;
  } catch (error) {
    console.error('Error checking cookies:', error);
    return false;
  }
};

/**
 * Försöker logga in användaren via Supabase
 * FÖRENKLAD VERSION: Fokuserar på att antingen använda standard Supabase eller säkerhetskopia via proxy
 */
export async function signInWithSupabase(
  supabase: SupabaseClient,
  email: string,
  password: string
): Promise<AuthResult> {
  const isStaging = process.env.NODE_ENV === 'production' && process.env.DEPLOYMENT_ENV === 'staging';

  // Om vi är i staging, försök med proxy-inloggning direkt
  if (isStaging) {
    try {
      console.log('[signInWithSupabase] Staging environment detected, trying direct proxy login');
      const proxyResult = await tryProxyLogin(email, password);
      if (proxyResult.success) {
        return proxyResult;
      }

      // Om proxy-inloggning misslyckas, fortsätt med standard Supabase
      console.log('[signInWithSupabase] Proxy login failed, trying standard Supabase login');
    } catch (error) {
      console.error('[signInWithSupabase] Proxy login error:', error);
      // Fortsätt med standard Supabase om proxy misslyckas
    }
  }

  try {
    // Standard Supabase inloggning
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('[signInWithSupabase] Supabase login error:', error);

      // Om vi får ett nätverksfel, försök med proxy som en säkerhetskopia
      if (error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
        console.log('[signInWithSupabase] Network error detected, trying proxy login as fallback');
        return tryProxyLogin(email, password);
      }

      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: true,
      session: data.session,
    };
  } catch (error) {
    console.error('[signInWithSupabase] Unexpected error:', error);

    // Nätverksfel, försök med proxy
    if (
      error instanceof TypeError &&
      (error.message.includes('Failed to fetch') ||
       error.message.includes('Network request failed'))
    ) {
      console.log('[signInWithSupabase] Network error, trying proxy login');
      return tryProxyLogin(email, password);
    }

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Ett oväntat fel inträffade vid inloggningen',
    };
  }
}

/**
 * Försöker logga in via proxy-API
 */
async function tryProxyLogin(email: string, password: string): Promise<AuthResult> {
  try {
    const response = await fetch('/api/proxy/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[tryProxyLogin] Proxy login failed:', errorData);
      return {
        success: false,
        message: errorData.error_description || 'Inloggningen misslyckades'
      };
    }

    const session = await response.json();
    return { success: true, session };
  } catch (proxyError) {
    console.error('[tryProxyLogin] Error:', proxyError);
    return {
      success: false,
      message: 'Kunde inte ansluta till inloggningsservern. Kontrollera din internetanslutning.'
    };
  }
}

/**
 * Försöker logga in användaren via Proxy-API
 */
export const signInViaProxy = async (
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; user?: any }> => {
  try {
    console.log('Attempting proxy-based login');

    const response = await fetch('/api/proxy/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Proxy login failed:', data.error);
      return {
        success: false,
        error: data.error || `Login failed (${response.status})`,
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: 'No user data returned',
      };
    }

    console.log('Proxy login successful, applying session');

    // Apply the session using supabase client
    try {
      const supabase = createBrowserClient();
      const { data: sessionData, error: sessionError } =
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

      if (sessionError) {
        console.error('Error applying session:', sessionError);
        return {
          success: false,
          error: sessionError.message,
        };
      }

      console.log(
        'Session applied successfully:',
        sessionData.user ? 'User present' : 'No user'
      );

      return {
        success: true,
        user: sessionData.user,
      };
    } catch (sessionError) {
      console.error('Error applying session:', sessionError);
      return {
        success: false,
        error:
          sessionError instanceof Error
            ? sessionError.message
            : 'Error applying session',
      };
    }
  } catch (error) {
    console.error('Error in signInViaProxy:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Unknown error during login',
    };
  }
};
