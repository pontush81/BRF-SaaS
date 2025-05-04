import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Hantera favicon.ico-requests
export async function GET() {
  try {
    // Läs favicon.ico från public-mappen
    const filePath = path.join(process.cwd(), 'public', 'favicon.ico');
    
    // Kontrollera om filen finns
    if (!fs.existsSync(filePath)) {
      throw new Error('Favicon file not found');
    }
    
    const fileBuffer = fs.readFileSync(filePath);
    
    // Kontrollera om filen är tom
    if (fileBuffer.length === 0) {
      throw new Error('Favicon file is empty');
    }
    
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/x-icon',
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache i ett år
      },
    });
  } catch (error) {
    console.error('Error serving favicon:', error);
    
    // Om filen inte kan läsas, returnera en 1x1 transparent ikon
    const EMPTY_FAVICON = 'AAABAAEAAQEAAAEAGAAwAAAAFgAAACgAAAABAAAAAgAAAAEAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==';
    const buffer = Buffer.from(EMPTY_FAVICON, 'base64');
    
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/x-icon',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  }
} 