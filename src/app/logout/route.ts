import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/supabase-server';

export async function GET() {
  try {
    const cookieStore = cookies();
    console.log("[Logout] Route anropad");
    
    // Skapa en Supabase-klient med serverfunktionen
    const supabase = createServerClient(cookieStore);
    
    // Logga ut användaren
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("[Logout] Error:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    
    console.log("[Logout] Användare utloggad framgångsrikt");
    
    // Omdirigera till inloggningssidan
    return NextResponse.json({ 
      success: true, 
      redirectTo: '/login'
    });
  } catch (error) {
    console.error("[Logout] Unexpected error:", error);
    return NextResponse.json({ 
      success: false, 
      error: 'Ett oväntat fel inträffade vid utloggning'
    }, { 
      status: 500 
    });
  }
} 