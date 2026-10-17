import { NextResponse } from 'next/server';
import { optimizeCarImageBuffer, optimizeCarImageFromBase64 } from '@/lib/imageOptimizer';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    // 1. Handle Multipart Form Data (File Input)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json(
          { success: false, error: 'No image file uploaded.' },
          { status: 400 }
        );
      }

      // Quick mime validation before reading arrayBuffer
      const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (file.type && !allowedMimes.includes(file.type.toLowerCase())) {
        return NextResponse.json(
          {
            success: false,
            error: `Unsupported file type (${file.type}). Please upload a JPEG, PNG, or WebP vehicle photograph.`,
          },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const result = await optimizeCarImageBuffer(buffer, file.name);

      return NextResponse.json({
        success: true,
        url: result.url,
        thumbnailUrl: result.thumbnailUrl,
        filename: result.filename,
        thumbnailFilename: result.thumbnailFilename,
        format: result.format,
        originalSize: result.originalSize,
        optimizedSize: result.optimizedSize,
        thumbnailSize: result.thumbnailSize,
        savingsPercent: result.savingsPercent,
        width: result.width,
        height: result.height,
        storageProvider: result.storageProvider,
      });
    }

    // 2. Handle JSON (Base64 data URL)
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { base64Data, filename } = body;

      if (!base64Data) {
        return NextResponse.json(
          { success: false, error: 'No base64 data provided in request body.' },
          { status: 400 }
        );
      }

      const result = await optimizeCarImageFromBase64(base64Data, filename || 'car-upload.jpg');

      return NextResponse.json({
        success: true,
        url: result.url,
        thumbnailUrl: result.thumbnailUrl,
        filename: result.filename,
        thumbnailFilename: result.thumbnailFilename,
        format: result.format,
        originalSize: result.originalSize,
        optimizedSize: result.optimizedSize,
        thumbnailSize: result.thumbnailSize,
        savingsPercent: result.savingsPercent,
        width: result.width,
        height: result.height,
        storageProvider: result.storageProvider,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Unsupported Content-Type. Please use multipart/form-data or application/json.',
      },
      { status: 400 }
    );
  } catch (err: any) {
    console.error('[API /api/upload] Image optimization failed:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Image processing and WebP conversion failed.',
      },
      { status: 400 }
    );
  }
}
