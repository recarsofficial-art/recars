import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

/**
 * Creates a standard binary Windows ICO container with multiple PNG frames.
 */
function createIcoFile(pngBuffers: { width: number; height: number; buffer: Buffer }[]): Buffer {
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // ICO type (1 = icon)
  header.writeUInt16LE(count, 4); // Number of images

  const directoryEntries: Buffer[] = [];
  let currentOffset = 6 + count * 16;

  for (const { width, height, buffer } of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(width === 256 ? 0 : width, 0);
    entry.writeUInt8(height === 256 ? 0 : height, 1);
    entry.writeUInt8(0, 2); // Color palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel (32-bit RGBA)
    entry.writeUInt32LE(buffer.length, 8); // Size of image data
    entry.writeUInt32LE(currentOffset, 12); // File offset
    directoryEntries.push(entry);
    currentOffset += buffer.length;
  }

  return Buffer.concat([header, ...directoryEntries, ...pngBuffers.map((p) => p.buffer)]);
}

async function generate() {
  console.log('Generating official Recars emblem favicon suite...\n');

  const sourcePath = path.join(process.cwd(), 'public', 'images', 'recars-emblem.png');
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Emblem source not found: ${sourcePath}`);
  }

  // 1. Trim transparency around the emblem so it occupies maximum usable space
  const trimmed = await sharp(sourcePath).trim().toBuffer();

  /**
   * Helper: places trimmed emblem centered on a square canvas of given size.
   */
  async function createSquareIcon(
    targetSize: number,
    innerRatio = 0.88,
    bg: { r: number; g: number; b: number; alpha: number } = { r: 0, g: 0, b: 0, alpha: 0 }
  ): Promise<Buffer> {
    const maxInner = Math.round(targetSize * innerRatio);
    const resizedInner = await sharp(trimmed)
      .resize(maxInner, maxInner, {
        fit: 'inside',
        kernel: sharp.kernel.lanczos3,
      })
      .toBuffer();

    const innerMeta = await sharp(resizedInner).metadata();
    const left = Math.round((targetSize - (innerMeta.width || maxInner)) / 2);
    const top = Math.round((targetSize - (innerMeta.height || maxInner)) / 2);

    return sharp({
      create: {
        width: targetSize,
        height: targetSize,
        channels: 4,
        background: bg,
      },
    })
      .composite([{ input: resizedInner, top, left }])
      .png()
      .toBuffer();
  }

  // 2. Generate Transparent PNG Favicons (for browser tabs and Google Search)
  const icon16 = await createSquareIcon(16, 0.95);
  const icon32 = await createSquareIcon(32, 0.92);
  const icon48 = await createSquareIcon(48, 0.90);
  const icon96 = await createSquareIcon(96, 0.88);
  const icon512 = await createSquareIcon(512, 0.86);

  // 3. Generate Solid Background Icons (for Apple iOS and Android homescreens)
  const whiteBg = { r: 255, g: 255, b: 255, alpha: 1 };
  const apple180 = await createSquareIcon(180, 0.76, whiteBg); // safe padding for squircle crop
  const android192 = await createSquareIcon(192, 0.78, whiteBg);
  const android512 = await createSquareIcon(512, 0.80, whiteBg);

  // 4. Generate Windows ICO file containing 16x16, 32x32, 48x48
  const icoBuffer = createIcoFile([
    { width: 16, height: 16, buffer: icon16 },
    { width: 32, height: 32, buffer: icon32 },
    { width: 48, height: 48, buffer: icon48 },
  ]);

  // 5. Write to public/
  const publicDir = path.join(process.cwd(), 'public');
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), icon16);
  fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), icon32);
  fs.writeFileSync(path.join(publicDir, 'favicon-48x48.png'), icon48);
  fs.writeFileSync(path.join(publicDir, 'icon.png'), icon512);
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), apple180);
  fs.writeFileSync(path.join(publicDir, 'apple-icon.png'), apple180);
  fs.writeFileSync(path.join(publicDir, 'android-chrome-192x192.png'), android192);
  fs.writeFileSync(path.join(publicDir, 'android-chrome-512x512.png'), android512);

  // 6. Write to app/ (Next.js special file metadata conventions)
  const appDir = path.join(process.cwd(), 'app');
  fs.writeFileSync(path.join(appDir, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(appDir, 'icon.png'), icon512);
  fs.writeFileSync(path.join(appDir, 'apple-icon.png'), apple180);

  console.log('✅ Generated public/favicon.ico (Multi-size: 16x16, 32x32, 48x48)');
  console.log('✅ Generated public/favicon-16x16.png');
  console.log('✅ Generated public/favicon-32x32.png');
  console.log('✅ Generated public/favicon-48x48.png (Google Search preferred size)');
  console.log('✅ Generated public/icon.png (512x512)');
  console.log('✅ Generated public/apple-touch-icon.png & apple-icon.png (180x180)');
  console.log('✅ Generated public/android-chrome-192x192.png & 512x512.png');
  console.log('✅ Generated app/favicon.ico, app/icon.png, app/apple-icon.png');
}

generate().catch(console.error);
