import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Logga felet detaljerat
    console.error("==== CLIENT ERROR ====");
    console.error("Time:", new Date().toISOString());
    console.error("URL:", body.url);
    console.error("Error:", body.error);
    console.error("Stack:", body.stack);
    console.error("User Agent:", request.headers.get('user-agent'));
    console.error("==== END CLIENT ERROR ====");
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to log error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
} 