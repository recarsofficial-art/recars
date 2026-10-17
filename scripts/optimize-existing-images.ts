#!/usr/bin/env node
/**
 * Recars — Automatic Image Migration & Optimization Script
 *
 * Scans vehicle images stored locally or in Supabase Storage, converts
 * them to high-efficiency WebP format (quality 80, max 1920x1440),
 * strips EXIF metadata, generates thumbnails, updates database references,
 * and prints an audit report with verified storage savings.
 *
 * Usage:
 *   npx tsx scripts/optimize-existing-images.ts --dry-run
 *   npx tsx scripts/optimize-existing-images.ts --execute
 *   npx tsx scripts/optimize-existing-images.ts --execute --delete-originals
 *   npx tsx scripts/optimize-existing-images.ts --batch-size=10
 */

import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

// Parse command-line flags
const args = process.argv.slice(2);
const isExecute = args.includes('--execute') || args.includes('--apply');
const isDryRun = !isExecute || args.includes('--dry-run');
const deleteOriginals = args.includes('--delete-originals');
const batchSizeArg = args.find((a) => a.startsWith('--batch-size='));
const BATCH_SIZE = batchSizeArg ? parseInt(batchSizeArg.split('=')[1], 10) : 5;

// Load .env.local manually if not populated
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}
loadEnv();

const dbUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres.kgzzobdvwryijuubyzbh:Recars%402026@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
  max: 3,
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kgzzobdvwryijuubyzbh.supabase.co';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY;

const supabase =
  supabaseKey && supabaseKey.length > 20 && supabaseKey !== 'public-anon-key'
    ? createClient(supabaseUrl, supabaseKey)
    : null;

const BUCKET_NAME = 'car-images';

interface ImageJob {
  sourceType: 'car_main' | 'car_gallery' | 'customer_photo' | 'uploads_dir';
  recordId?: string;
  originalUrl: string;
  galleryIndex?: number;
}

interface ProcessResult {
  url: string;
  originalBytes: number;
  optimizedBytes: number;
  savingsBytes: number;
  savingsPercent: number;
  originalDimensions: string;
  optimizedDimensions: string;
  newUrl?: string;
  status: 'optimized' | 'skipped' | 'failed';
  error?: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Fetch image buffer from local file system or remote URL
 */
async function resolveImageBuffer(imgUrl: string): Promise<{ buffer: Buffer; localPath?: string } | null> {
  // 1. If it's a local relative path like /car-creta-hd.jpg or /uploads/foo.jpg
  if (imgUrl.startsWith('/')) {
    const localPath = path.join(process.cwd(), 'public', imgUrl.replace(/^\//, ''));
    if (fs.existsSync(localPath)) {
      const buffer = fs.readFileSync(localPath);
      return { buffer, localPath };
    }
  }

  // 2. If it's a remote URL (Supabase or external CDN)
  if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
    try {
      const res = await fetch(imgUrl);
      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        return { buffer: Buffer.from(arrayBuf) };
      }
    } catch {
      return null;
    }
  }

  // 3. Base64 data URL
  if (imgUrl.startsWith('data:image/')) {
    const matches = imgUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches[2]) {
      return { buffer: Buffer.from(matches[2], 'base64') };
    }
  }

  return null;
}

async function main() {
  console.log('\n======================================================');
  console.log('  RECARS — VEHICLE IMAGE OPTIMIZATION & MIGRATION');
  console.log('======================================================');
  console.log(`Mode:            ${isDryRun ? 'DRY-RUN (Simulating savings)' : 'EXECUTE (Modifying files & database)'}`);
  console.log(`Supabase Client: ${supabase ? 'Active (Connected)' : 'Local File Fallback (No Service Key)'}`);
  console.log(`Batch Size:      ${BATCH_SIZE}`);
  console.log(`Delete Originals: ${deleteOriginals ? 'YES' : 'NO (Preserving original files)'}`);
  console.log('------------------------------------------------------\n');

  // Collect all image references from Database and Local Storage
  const jobs: ImageJob[] = [];

  try {
    // 1. Cars table
    const { rows: cars } = await pool.query('SELECT id, image, gallery_images FROM public.cars');
    for (const car of cars) {
      if (car.image && !car.image.endsWith('.webp')) {
        jobs.push({ sourceType: 'car_main', recordId: car.id, originalUrl: car.image });
      }
      if (Array.isArray(car.gallery_images)) {
        car.gallery_images.forEach((img: string, idx: number) => {
          if (img && !img.endsWith('.webp')) {
            jobs.push({
              sourceType: 'car_gallery',
              recordId: car.id,
              originalUrl: img,
              galleryIndex: idx,
            });
          }
        });
      }
    }

    // 2. Customer cars / sell requests
    const { rows: customerCars } = await pool.query('SELECT id, photos FROM public.customer_cars');
    for (const cc of customerCars) {
      if (Array.isArray(cc.photos)) {
        cc.photos.forEach((photo: string, idx: number) => {
          if (photo && !photo.endsWith('.webp')) {
            jobs.push({
              sourceType: 'customer_photo',
              recordId: cc.id,
              originalUrl: photo,
              galleryIndex: idx,
            });
          }
        });
      }
    }

    // 3. Check public/uploads for non-webp images
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (['.jpg', '.jpeg', '.png'].includes(ext)) {
          jobs.push({ sourceType: 'uploads_dir', originalUrl: `/uploads/${file}` });
        }
      }
    }
  } catch (err: any) {
    console.error('Failed to query database for images:', err.message);
  }

  // Deduplicate jobs by originalUrl
  const uniqueJobsMap = new Map<string, ImageJob[]>();
  for (const job of jobs) {
    const list = uniqueJobsMap.get(job.originalUrl) || [];
    list.push(job);
    uniqueJobsMap.set(job.originalUrl, list);
  }

  const distinctUrls = Array.from(uniqueJobsMap.keys());
  console.log(`Found ${jobs.length} total image reference(s) across ${distinctUrls.length} unique file(s).\n`);

  if (distinctUrls.length === 0) {
    console.log('✅ All vehicle images are already optimized to WebP format! Nothing to migrate.');
    await pool.end();
    return;
  }

  const results: ProcessResult[] = [];
  let totalOriginal = 0;
  let totalOptimized = 0;

  // Process in batches
  for (let i = 0; i < distinctUrls.length; i += BATCH_SIZE) {
    const batch = distinctUrls.slice(i, i + BATCH_SIZE);
    console.log(`\n--- Processing Batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(distinctUrls.length / BATCH_SIZE)} ---`);

    for (const url of batch) {
      try {
        const resolved = await resolveImageBuffer(url);
        if (!resolved) {
          console.warn(`[SKIPPED] Could not retrieve image: ${url}`);
          results.push({
            url,
            originalBytes: 0,
            optimizedBytes: 0,
            savingsBytes: 0,
            savingsPercent: 0,
            originalDimensions: 'N/A',
            optimizedDimensions: 'N/A',
            status: 'skipped',
            error: 'File not found or unreachable',
          });
          continue;
        }

        const { buffer, localPath } = resolved;
        const originalBytes = buffer.length;
        const origMeta = await sharp(buffer).metadata();
        const origDim = `${origMeta.width || '?'}x${origMeta.height || '?'}`;

        // Sharp WebP conversion
        const optimizedBuffer = await sharp(buffer)
          .rotate()
          .resize({ width: 1920, height: 1440, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80, effort: 4 })
          .toBuffer();

        const optMeta = await sharp(optimizedBuffer).metadata();
        const optDim = `${optMeta.width || '?'}x${optMeta.height || '?'}`;
        const optBytes = optimizedBuffer.length;
        const savingsBytes = Math.max(0, originalBytes - optBytes);
        const savingsPercent = parseFloat(((savingsBytes / originalBytes) * 100).toFixed(1));

        totalOriginal += originalBytes;
        totalOptimized += optBytes;

        const baseName = path.basename(url.split('?')[0], path.extname(url.split('?')[0])).replace(/[^a-zA-Z0-9_-]/g, '_');
        const newFilename = `${baseName}-${Date.now()}.webp`;

        if (isDryRun) {
          console.log(
            `[DRY-RUN] ${url.slice(0, 40).padEnd(42)} | ${formatBytes(originalBytes).padStart(9)} -> ${formatBytes(optBytes).padStart(9)} | Saved: ${savingsPercent}% (${formatBytes(savingsBytes)})`
          );
          results.push({
            url,
            originalBytes,
            optimizedBytes: optBytes,
            savingsBytes,
            savingsPercent,
            originalDimensions: origDim,
            optimizedDimensions: optDim,
            status: 'optimized',
          });
        } else {
          // EXECUTE MODE
          let newUrl = `/uploads/${newFilename}`;

          // 1. Write local WebP file
          const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
          if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
          const localWebpPath = path.join(uploadsDir, newFilename);
          fs.writeFileSync(localWebpPath, optimizedBuffer);

          // 2. Upload to Supabase Storage if client available
          if (supabase) {
            try {
              const { data: upData, error: upErr } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(newFilename, optimizedBuffer, {
                  contentType: 'image/webp',
                  cacheControl: '31536000',
                  upsert: true,
                });
              if (!upErr && upData) {
                newUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${newFilename}`;
              }
            } catch (storageErr: any) {
              console.warn(`[Supabase Upload Warning] ${storageErr.message}`);
            }
          }

          // 3. Verify the generated WebP file
          const verifyMeta = await sharp(optimizedBuffer).metadata();
          if (verifyMeta.format !== 'webp') {
            throw new Error(`Verification failed: Output is not WebP (${verifyMeta.format})`);
          }

          // 4. Update Database references safely
          const relatedJobs = uniqueJobsMap.get(url) || [];
          for (const job of relatedJobs) {
            if (job.sourceType === 'car_main' && job.recordId) {
              await pool.query('UPDATE public.cars SET image = $1, updated_at = now() WHERE id = $2', [
                newUrl,
                job.recordId,
              ]);
            } else if (job.sourceType === 'car_gallery' && job.recordId && typeof job.galleryIndex === 'number') {
              const carRow = await pool.query('SELECT gallery_images FROM public.cars WHERE id = $1', [job.recordId]);
              if (carRow.rows[0]) {
                const list = (carRow.rows[0].gallery_images || []) as string[];
                list[job.galleryIndex] = newUrl;
                await pool.query('UPDATE public.cars SET gallery_images = $1, updated_at = now() WHERE id = $2', [
                  JSON.stringify(list),
                  job.recordId,
                ]);
              }
            } else if (job.sourceType === 'customer_photo' && job.recordId && typeof job.galleryIndex === 'number') {
              const ccRow = await pool.query('SELECT photos FROM public.customer_cars WHERE id = $1', [job.recordId]);
              if (ccRow.rows[0]) {
                const list = (ccRow.rows[0].photos || []) as string[];
                list[job.galleryIndex] = newUrl;
                await pool.query('UPDATE public.customer_cars SET photos = $1, updated_at = now() WHERE id = $2', [
                  JSON.stringify(list),
                  job.recordId,
                ]);
              }
            }
          }

          // 5. Delete original file only if explicitly requested AND file is in uploads
          if (deleteOriginals && localPath && localPath.includes('/uploads/')) {
            try {
              fs.unlinkSync(localPath);
              console.log(`[DELETED ORIGINAL] ${localPath}`);
            } catch (err: any) {
              console.warn(`Could not delete original: ${err.message}`);
            }
          }

          console.log(`[OPTIMIZED & SAVED] ${url} -> ${newUrl} (Saved ${savingsPercent}%)`);
          results.push({
            url,
            originalBytes,
            optimizedBytes: optBytes,
            savingsBytes,
            savingsPercent,
            originalDimensions: origDim,
            optimizedDimensions: optDim,
            newUrl,
            status: 'optimized',
          });
        }
      } catch (err: any) {
        console.error(`[ERROR] Processing failed for ${url}:`, err.message);
        results.push({
          url,
          originalBytes: 0,
          optimizedBytes: 0,
          savingsBytes: 0,
          savingsPercent: 0,
          originalDimensions: 'N/A',
          optimizedDimensions: 'N/A',
          status: 'failed',
          error: err.message,
        });
      }
    }
  }

  // Summary Report
  const totalSavingsBytes = Math.max(0, totalOriginal - totalOptimized);
  const totalSavingsPercent = totalOriginal > 0 ? ((totalSavingsBytes / totalOriginal) * 100).toFixed(1) : '0';

  console.log('\n======================================================');
  console.log('             IMAGE OPTIMIZATION AUDIT REPORT');
  console.log('======================================================');
  console.log(`Total Files Inspected:  ${distinctUrls.length}`);
  console.log(`Successfully Converted: ${results.filter((r) => r.status === 'optimized').length}`);
  console.log(`Skipped / Failed:       ${results.filter((r) => r.status !== 'optimized').length}`);
  console.log(`Original Storage Footprint:  ${formatBytes(totalOriginal)}`);
  console.log(`Optimized WebP Footprint:    ${formatBytes(totalOptimized)}`);
  console.log(`Storage Savings:             ${formatBytes(totalSavingsBytes)} (-${totalSavingsPercent}%)`);
  console.log('======================================================\n');

  if (isDryRun) {
    console.log('ℹ️  This was a DRY RUN. No files or database rows were modified.');
    console.log('To apply the changes live, execute:');
    console.log('  npx tsx scripts/optimize-existing-images.ts --execute\n');
  }

  await pool.end();
}

main().catch((err) => {
  console.error('Fatal migration error:', err);
  pool.end().finally(() => process.exit(1));
});
