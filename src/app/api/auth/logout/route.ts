import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// Mark this route as dynamic to ensure it's not statically rendered
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();

    // Supabase-miljövariabler (använd de som är definierade i supabase.ts)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lcckqvnwnrgvpnpavhyp.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    // Skapa supabase-klient med cookies
    const options: any = {
      auth: {
        persistSession: false,
      }
    };

    // Lägg till cookies-hantering
    options.cookies = {
      get(name: string) {
        return cookieStore.get(name)?.value;
      }
    };

    const supabase = createClient(supabaseUrl, supabaseAnonKey, options);

    // Logga ut användaren
    await supabase.auth.signOut();

    // Rensa alla relaterade cookies
    const allCookies = cookieStore.getAll();
    for (const cookie of allCookies) {
      // Rensa alla supabase-cookies eller auth-relaterade cookies
      if (cookie.name.includes('supabase') ||
          cookie.name.includes('auth') ||
          cookie.name.includes('sb') ||
          cookie.name.includes('session') ||
          cookie.name.includes('next-auth')) {
        cookieStore.delete(cookie.name);
      }
    }

    // Redirect till login-sidan
    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json({ error: 'Ett fel uppstod vid utloggning' }, { status: 500 });
  }
}
