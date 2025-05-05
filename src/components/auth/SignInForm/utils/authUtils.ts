import { createBrowserClient } from '@/supabase-client';

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
export const signInWithSupabase = async (
  email: string,
  password: string
): Promise<{
  success: boolean;
  error?: string;
  userId?: string;
  sessionExpires?: Date;
}> => {
  try {
    console.log('Rensar befintlig session innan inloggning');
    const supabase = createBrowserClient();

    // Try to sign out first to ensure a clean state
    try {
      await supabase.auth.signOut();
    } catch (signOutError) {
      console.warn('Could not sign out before login:', signOutError);
      // Continue anyway
    }

    console.log('Anropar supabase.auth.signInWithPassword');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase login error:', error);

      // Check if this is a network or DNS error
      if (
        error.message.includes('Failed to fetch') ||
        error.message.includes('NetworkError') ||
        error.message.includes('network error')
      ) {
        console.log(
          'Detected network error. Attempting proxy login instead...'
        );
        // Try proxy login as a fallback
        return signInViaProxy(email, password).then(proxyResult => {
          if (proxyResult.success) {
            return {
              success: true,
              userId: proxyResult.user?.id,
              sessionExpires: proxyResult.user?.app_metadata?.session_expires,
            };
          }
          // If proxy also fails, return the original error
          return {
            success: false,
            error: error.message || 'Inloggningen misslyckades',
          };
        });
      }

      return {
        success: false,
        error: error.message || 'Inloggningen misslyckades',
      };
    }

    if (!data?.user) {
      return {
        success: false,
        error: 'Inget användarkonto hittades',
      };
    }

    console.log('Inloggningsresultat: ', {
      success: true,
      userId: data.user.id,
      sessionExpires: data.session?.expires_at
        ? new Date(data.session.expires_at * 1000)
        : undefined,
    });

    return {
      success: true,
      userId: data.user.id,
      sessionExpires: data.session?.expires_at
        ? new Date(data.session.expires_at * 1000)
        : undefined,
    };
  } catch (error) {
    console.error('Error during direct Supabase login:', error);

    // Check if this is a network error and try proxy login
    if (
      error instanceof Error &&
      (error.message.includes('Failed to fetch') ||
        error.message.includes('NetworkError') ||
        error.message.includes('network error'))
    ) {
      console.log(
        'Caught network error. Attempting proxy login as fallback...'
      );
      return signInViaProxy(email, password).then(proxyResult => {
        if (proxyResult.success) {
          return {
            success: true,
            userId: proxyResult.user?.id,
            sessionExpires: proxyResult.user?.app_metadata?.session_expires,
          };
        }
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'Ett oväntat fel inträffade',
        };
      });
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Ett oväntat fel inträffade',
    };
  }
};

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
