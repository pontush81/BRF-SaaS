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
 */
export async function signInWithSupabase(
  supabase: SupabaseClient,
  email: string,
  password: string
): Promise<AuthResult> {
  let dnsError = false;

  // Kontrollera om vi har ett känt DNS-problem
  if (typeof window !== 'undefined' && window.__hasDnsFailure === true) {
    console.log('[signInWithSupabase] Using cached DNS failure state - proxy mode active');
    dnsError = true;
  }

  try {
    // Check DNS connectivity first if we don't already know we have a problem
    if (!dnsError && typeof window !== 'undefined') {
      try {
        // Simple DNS check
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/healthz`, {
          method: 'HEAD',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
      } catch (error) {
        console.warn('[signInWithSupabase] DNS preflight check failed:', error);
        dnsError = true;

        // Set global flag for future requests
        if (typeof window !== 'undefined') {
          window.__hasDnsFailure = true;
        }
      }
    }

    // Om vi har DNS-problem, använd direkt proxy-API för inloggningen
    if (dnsError) {
      console.log('[signInWithSupabase] Using proxy API for login due to DNS issues');

      try {
        const response = await fetch('/api/proxy/auth/v1/token?grant_type=password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('[signInWithSupabase] Proxy login failed:', errorData);
          return { success: false, message: errorData.error_description || 'Inloggningen misslyckades' };
        }

        const session = await response.json();
        return { success: true, session };
      } catch (proxyError) {
        console.error('[signInWithSupabase] Proxy login error:', proxyError);
        return {
          success: false,
          message: 'Kunde inte ansluta till inloggningsservern. Kontrollera din internetanslutning.'
        };
      }
    }

    // Standard Supabase inloggning om ingen DNS-problem upptäckts
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('[signInWithSupabase] Supabase login error:', error);
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

    // Fånga DNS-relaterade fel
    if (
      error instanceof TypeError &&
      (error.message.includes('Failed to fetch') ||
       error.message.includes('Network request failed'))
    ) {
      console.warn('[signInWithSupabase] DNS error detected, trying proxy');

      // Sätt global flagga för framtida anrop
      if (typeof window !== 'undefined') {
        window.__hasDnsFailure = true;
      }

      // Försök igen med proxy
      try {
        const response = await fetch('/api/proxy/auth/v1/token?grant_type=password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          return { success: false, message: errorData.error_description || 'Inloggningen misslyckades' };
        }

        const session = await response.json();
        return { success: true, session };
      } catch (proxyError) {
        console.error('[signInWithSupabase] Proxy login attempt failed:', proxyError);
        return {
          success: false,
          message: 'Kunde inte ansluta till inloggningsservern. Kontrollera din internetanslutning.'
        };
      }
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
    console.error('Error during proxy login:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
};
