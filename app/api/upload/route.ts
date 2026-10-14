import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    // Handle Multipart Form Data (File Input)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ success: false, error: 'No image file uploaded' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const originalName = file.name || 'car-image.jpg';
      const ext = path.extname(originalName) || '.jpg';
      const cleanBase = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
      const uniqueFileName = `${cleanBase}-${Date.now()}${ext.toLowerCase()}`;
      const filePath = path.join(uploadsDir, uniqueFileName);

      fs.writeFileSync(filePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${uniqueFileName}`,
        filename: uniqueFileName,
        size: file.size,
      });
    }

    // Handle JSON (Base64 data URL)
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { base64Data, filename } = body;

      if (!base64Data) {
        return NextResponse.json({ success: false, error: 'No base64 data provided' }, { status: 400 });
      }

      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return NextResponse.json({ success: false, error: 'Invalid base64 image data' }, { status: 400 });
      }

      const buffer = Buffer.from(matches[2], 'base64');
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const ext = '.jpg';
      const safeName = (filename ? path.basename(filename, path.extname(filename)) : 'car-upload').replace(/[^a-zA-Z0-9_-]/g, '_');
      const uniqueFileName = `${safeName}-${Date.now()}${ext}`;
      const filePath = path.join(uploadsDir, uniqueFileName);

      fs.writeFileSync(filePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${uniqueFileName}`,
        filename: uniqueFileName,
      });
    }

    return NextResponse.json({ success: false, error: 'Unsupported Content-Type' }, { status: 400 });
  } catch (err: any) {
    console.error('Image upload failed:', err);
    return NextResponse.json({ success: false, error: err.message || 'Image upload failed' }, { status: 500 });
  }
}
