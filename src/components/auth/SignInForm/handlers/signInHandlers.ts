import { signInWithSupabase, signInViaProxy, checkCookies } from '../utils/authUtils';
import { createBrowserClient } from '@/supabase-client';

/**
 * Hanterar vanlig inloggning med Supabase
 */
export const handleSignIn = async (
  email: string,
  password: string,
  setIsLoading: (loading: boolean) => void,
  setErrorMessage: (error: string | null) => void,
  router: any,
  redirectPath: string,
  setUser: (user: any) => void
) => {
  if (!email || !password) {
    setErrorMessage('Vänligen ange e-postadress och lösenord');
    return;
  }

  setIsLoading(true);
  setErrorMessage(null);

  try {
    // Kontrollera att cookies fungerar
    if (!checkCookies()) {
      setErrorMessage(
        'Cookies verkar vara inaktiverade i din webbläsare. Aktivera cookies för att logga in.'
      );
      setIsLoading(false);
      return;
    }

    // Försök logga in med Supabase
    const result = await signInWithSupabase(email, password);

    if (!result.success) {
      setErrorMessage(result.error || 'Inloggningen misslyckades, försök igen.');
      setIsLoading(false);
      return;
    }

    // Uppdatera användarinformation i AuthContext
    const supabase = createBrowserClient();
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      setUser(data.user);
    }

    // Navigera till vald sida
    router.push(redirectPath);
  } catch (error) {
    console.error('Login error:', error);
    setErrorMessage(
      error instanceof Error ? error.message : 'Ett oväntat fel inträffade, försök igen.'
    );
  } finally {
    setIsLoading(false);
  }
};

/**
 * Hanterar inloggning via proxy
 */
export const handleProxyLogin = async (
  email: string,
  password: string,
  setIsLoading: (loading: boolean) => void,
  setErrorMessage: (error: string | null) => void,
  router: any,
  redirectPath: string,
  setUser: (user: any) => void
) => {
  if (!email || !password) {
    setErrorMessage('Vänligen ange e-postadress och lösenord');
    return;
  }

  setIsLoading(true);
  setErrorMessage(null);

  try {
    // Försök logga in med Proxy
    const result = await signInViaProxy(email, password);

    if (!result.success) {
      setErrorMessage(result.error || 'Alternativ inloggning misslyckades');
      setIsLoading(false);
      return;
    }

    if (result.user) {
      setUser(result.user);
    }

    // Navigera till vald sida
    router.push(redirectPath);
  } catch (error) {
    console.error('Proxy login error:', error);
    setErrorMessage(
      error instanceof Error ? error.message : 'Ett oväntat fel inträffade, försök igen.'
    );
  } finally {
    setIsLoading(false);
  }
};
