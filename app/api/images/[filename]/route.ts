import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { dbGetUploadedImage } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    // Sanitize filename to prevent directory traversal
    const safeFilename = path.basename(filename);

    // 1. Check PostgreSQL Database Image Store
    try {
      const dbImage = await dbGetUploadedImage(safeFilename);
      if (dbImage && dbImage.data) {
        return new NextResponse(new Uint8Array(dbImage.data), {
          status: 200,
          headers: {
            'Content-Type': dbImage.mimeType || 'image/webp',
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Content-Length': dbImage.data.length.toString(),
          },
        });
      }
    } catch (dbErr: any) {
      console.warn('[API /api/images] DB fetch error:', dbErr?.message);
    }

    // 2. Fallback to local /public/uploads directory if present
    try {
      const localFilePath = path.join(process.cwd(), 'public', 'uploads', safeFilename);
      if (fs.existsSync(localFilePath)) {
        const fileBuffer = fs.readFileSync(localFilePath);
        const ext = path.extname(safeFilename).toLowerCase();
        const mimeType = ext === '.webp' ? 'image/webp' : ext === '.png' ? 'image/png' : 'image/jpeg';
        return new NextResponse(new Uint8Array(fileBuffer), {
          status: 200,
          headers: {
            'Content-Type': mimeType,
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Content-Length': fileBuffer.length.toString(),
          },
        });
      }
    } catch (fsErr: any) {
      // Local fs reading not available or failed
    }

    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  } catch (err: any) {
    console.error('[API /api/images] Handler error:', err);
    return NextResponse.json({ error: 'Failed to retrieve image' }, { status: 500 });
  }
}
