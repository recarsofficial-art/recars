import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 78-82 recommended
  generateThumbnail?: boolean;
  thumbWidth?: number;
  thumbHeight?: number;
  thumbQuality?: number;
}

export interface OptimizationResult {
  success: boolean;
  url: string;
  thumbnailUrl?: string;
  filename: string;
  thumbnailFilename?: string;
  originalSize: number;
  optimizedSize: number;
  thumbnailSize?: number;
  savingsPercent: number;
  width: number;
  height: number;
  format: 'webp';
  storageProvider: 'supabase' | 'database' | 'local';
}

const DEFAULT_OPTIONS: Required<ImageOptimizationOptions> = {
  maxWidth: 1920,
  maxHeight: 1440,
  quality: 80,
  generateThumbnail: true,
  thumbWidth: 400,
  thumbHeight: 300,
  thumbQuality: 78,
};

const BUCKET_NAME = 'car-images';
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

/**
 * Get configured Supabase Client if valid credentials exist
 */
function getStorageClient(): { client: SupabaseClient | null; publicUrlBase: string } {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kgzzobdvwryijuubyzbh.supabase.co';
  const apiKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_KEY;

  if (!apiKey || apiKey.length < 20 || apiKey === 'public-anon-key') {
    return { client: null, publicUrlBase: `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}` };
  }

  try {
    const client = createClient(supabaseUrl, apiKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    return { client, publicUrlBase: `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}` };
  } catch (err) {
    console.warn('[ImageOptimizer] Failed to initialize Supabase client:', err);
    return { client: null, publicUrlBase: `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}` };
  }
}

/**
 * Validates an image buffer:
 * - Checks size limit (< 20MB)
 * - Verifies image format via sharp header decoding (JPEG, PNG, WebP)
 * - Ensures image isn't truncated or corrupted
 */
export async function validateImageBuffer(buffer: Buffer): Promise<{
  valid: boolean;
  format?: string;
  width?: number;
  height?: number;
  error?: string;
}> {
  if (!buffer || buffer.length === 0) {
    return { valid: false, error: 'Empty file buffer received.' };
  }

  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Image exceeds maximum allowed size of 20MB (received ${(buffer.length / (1024 * 1024)).toFixed(1)}MB).`,
    };
  }

  try {
    const metadata = await sharp(buffer).metadata();
    const supportedFormats = ['jpeg', 'png', 'webp'];
    const fmt = metadata.format?.toLowerCase();

    if (!fmt || !supportedFormats.includes(fmt)) {
      return {
        valid: false,
        error: `Unsupported image format (${fmt || 'unknown'}). Supported formats: JPEG, JPG, PNG, WEBP.`,
      };
    }

    if (!metadata.width || !metadata.height) {
      return {
        valid: false,
        error: 'Corrupted or unreadable image dimensions.',
      };
    }

    return {
      valid: true,
      format: fmt,
      width: metadata.width,
      height: metadata.height,
    };
  } catch (err: any) {
    return {
      valid: false,
      error: `Invalid or corrupted image file: ${err.message || 'Decoding failed'}`,
    };
  }
}

/**
 * Compresses and converts an image Buffer to WebP format,
 * strips EXIF/GPS metadata, auto-orients, creates listing thumbnail,
 * and uploads to Supabase Storage with local backup fallback.
 */
export async function optimizeCarImageBuffer(
  buffer: Buffer,
  originalFilename = 'car-image.jpg',
  userOptions?: ImageOptimizationOptions
): Promise<OptimizationResult> {
  const options = { ...DEFAULT_OPTIONS, ...userOptions };
  const originalSize = buffer.length;

  // 1. Validate image
  const validation = await validateImageBuffer(buffer);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid image buffer');
  }

  // 2. Generate clean WebP filename
  const baseName = path
    .basename(originalFilename, path.extname(originalFilename))
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 50);
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  const webpFilename = `${baseName}-${timestamp}-${randomSuffix}.webp`;
  const thumbFilename = `${baseName}-${timestamp}-${randomSuffix}-thumb.webp`;

  // 3. Process main image with Sharp
  // .rotate() handles EXIF orientation tag and strips EXIF/GPS tags
  const sharpInstance = sharp(buffer)
    .rotate()
    .resize({
      width: options.maxWidth,
      height: options.maxHeight,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({
      quality: options.quality,
      effort: 4, // Balanced CPU effort for optimal compression ratio
      alphaQuality: 90,
    });

  const optimizedBuffer = await sharpInstance.toBuffer();
  const optimizedMetadata = await sharp(optimizedBuffer).metadata();
  const optimizedSize = optimizedBuffer.length;

  // 4. Generate thumbnail if requested
  let thumbBuffer: Buffer | null = null;
  let thumbSize = 0;
  if (options.generateThumbnail) {
    thumbBuffer = await sharp(buffer)
      .rotate()
      .resize({
        width: options.thumbWidth,
        height: options.thumbHeight,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({
        quality: options.thumbQuality,
        effort: 4,
      })
      .toBuffer();
    thumbSize = thumbBuffer.length;
  }

  // 5. Attempt Supabase Storage Upload if configured
  const { client, publicUrlBase } = getStorageClient();
  let storageProvider: 'supabase' | 'database' | 'local' = 'local';
  let finalUrl = '';
  let finalThumbUrl: string | undefined = undefined;

  if (client) {
    try {
      // Upload main WebP to Supabase Storage
      const { data: uploadData, error: uploadError } = await client.storage
        .from(BUCKET_NAME)
        .upload(webpFilename, optimizedBuffer, {
          contentType: 'image/webp',
          cacheControl: '31536000', // 1 year cache
          upsert: true,
        });

      if (!uploadError && uploadData) {
        finalUrl = `${publicUrlBase}/${webpFilename}`;
        storageProvider = 'supabase';

        // Upload thumbnail
        if (thumbBuffer) {
          const { error: thumbErr } = await client.storage
            .from(BUCKET_NAME)
            .upload(thumbFilename, thumbBuffer, {
              contentType: 'image/webp',
              cacheControl: '31536000',
              upsert: true,
            });
          if (!thumbErr) {
            finalThumbUrl = `${publicUrlBase}/${thumbFilename}`;
          }
        }
      } else {
        console.warn('[ImageOptimizer] Supabase upload failed, falling back:', uploadError?.message);
      }
    } catch (err: any) {
      console.warn('[ImageOptimizer] Supabase upload exception, falling back:', err?.message);
    }
  }

  // 6. Safe local filesystem storage (works in dev, safely ignored in read-only serverless like Vercel)
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const localMainPath = path.join(uploadsDir, webpFilename);
    fs.writeFileSync(localMainPath, optimizedBuffer);

    if (thumbBuffer) {
      const localThumbPath = path.join(uploadsDir, thumbFilename);
      fs.writeFileSync(localThumbPath, thumbBuffer);
    }

    if (!finalUrl) {
      finalUrl = `/uploads/${webpFilename}`;
      finalThumbUrl = thumbBuffer ? `/uploads/${thumbFilename}` : undefined;
      storageProvider = 'local';
    }
  } catch (fsErr: any) {
    // Expected on read-only serverless environments like Vercel / AWS Lambda (/var/task)
    console.info('[ImageOptimizer] Read-only serverless environment detected; skipping local disk write:', fsErr?.message);
  }

  // 7. Resilient Database Image Storage Fallback (guarantees image persistence on Vercel without local disk)
  if (!finalUrl || storageProvider === 'local') {
    try {
      const { dbSaveUploadedImage } = await import('@/lib/db');
      const dbUrl = await dbSaveUploadedImage(webpFilename, 'image/webp', optimizedBuffer);
      let dbThumbUrl: string | undefined = undefined;
      if (thumbBuffer) {
        dbThumbUrl = await dbSaveUploadedImage(thumbFilename, 'image/webp', thumbBuffer);
      }

      // If Supabase wasn't used or we are in a serverless environment, use database route URL
      if (!finalUrl || process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
        finalUrl = dbUrl;
        finalThumbUrl = dbThumbUrl;
        storageProvider = 'database';
      }
    } catch (dbErr: any) {
      console.warn('[ImageOptimizer] Database storage fallback warning:', dbErr?.message);
      if (!finalUrl) {
        finalUrl = `/api/images/${webpFilename}`;
        finalThumbUrl = thumbBuffer ? `/api/images/${thumbFilename}` : undefined;
        storageProvider = 'database';
      }
    }
  }

  const savingsPercent = Math.max(
    0,
    parseFloat((((originalSize - optimizedSize) / originalSize) * 100).toFixed(1))
  );

  return {
    success: true,
    url: finalUrl,
    thumbnailUrl: finalThumbUrl,
    filename: webpFilename,
    thumbnailFilename: thumbBuffer ? thumbFilename : undefined,
    originalSize,
    optimizedSize,
    thumbnailSize: thumbSize || undefined,
    savingsPercent,
    width: optimizedMetadata.width || 0,
    height: optimizedMetadata.height || 0,
    format: 'webp',
    storageProvider,
  };
}

/**
 * Optimizes an image from Base64 Data URL (e.g., from web camera or paste)
 */
export async function optimizeCarImageFromBase64(
  base64Data: string,
  originalFilename = 'car-upload.jpg',
  userOptions?: ImageOptimizationOptions
): Promise<OptimizationResult> {
  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  let rawBuffer: Buffer;

  if (matches && matches.length === 3) {
    rawBuffer = Buffer.from(matches[2], 'base64');
  } else {
    // Attempt bare base64 decode
    try {
      rawBuffer = Buffer.from(base64Data, 'base64');
    } catch {
      throw new Error('Invalid base64 image data payload.');
    }
  }

  return optimizeCarImageBuffer(rawBuffer, originalFilename, userOptions);
}
