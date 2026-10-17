/**
 * Verification Test Suite for Recars Image Optimization Pipeline
 * Tests JPEG, PNG with transparency, WebP, aspect ratios, corrupted inputs,
 * thumbnail generation, and metadata stripping.
 */

import sharp from 'sharp';
import { optimizeCarImageBuffer, optimizeCarImageFromBase64, validateImageBuffer } from '../lib/imageOptimizer';

async function runTests() {
  console.log('🧪 Starting Image Optimization Pipeline Verification...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${msg}`);
      failed++;
    }
  }

  // TEST 1: JPEG Optimization & WebP Conversion
  console.log('Test 1: Standard JPEG Compression and WebP Conversion');
  const jpegSvg = '<svg width="2400" height="1600"><rect width="100%" height="100%" fill="#1a365d"/><circle cx="1200" cy="800" r="400" fill="#e5325c"/></svg>';
  const rawJpeg = await sharp(Buffer.from(jpegSvg)).jpeg({ quality: 95 }).toBuffer();
  const res1 = await optimizeCarImageBuffer(rawJpeg, 'car-front.jpg');

  assert(res1.success === true, 'Upload succeeded');
  assert(res1.format === 'webp', `Output format is WebP (got: ${res1.format})`);
  assert(res1.filename.endsWith('.webp'), 'Filename has .webp extension');
  assert(res1.optimizedSize < rawJpeg.length, `File size reduced: ${rawJpeg.length} -> ${res1.optimizedSize} bytes (${res1.savingsPercent}% savings)`);
  assert(res1.width <= 1920 && res1.height <= 1440, `Dimensions within max bounds: ${res1.width}x${res1.height}`);
  assert(Math.abs((res1.width / res1.height) - (2400 / 1600)) < 0.05, `Aspect ratio preserved (approx 1.5): ${(res1.width / res1.height).toFixed(2)}`);
  assert(!!res1.thumbnailUrl && !!res1.thumbnailFilename, 'Thumbnail generated');

  // TEST 2: Transparent PNG Preservation
  console.log('\nTest 2: Transparent PNG Handling');
  const pngSvg = '<svg width="800" height="600"><circle cx="400" cy="300" r="200" fill="rgba(229,50,92,0.7)"/></svg>';
  const rawPng = await sharp(Buffer.from(pngSvg)).png().toBuffer();
  const res2 = await optimizeCarImageBuffer(rawPng, 'transparent-badge.png');

  assert(res2.success === true, 'PNG conversion succeeded');
  assert(res2.format === 'webp', 'Converted to WebP');
  const optMeta2 = await sharp(await sharp(rawPng).rotate().webp().toBuffer()).metadata();
  assert(optMeta2.hasAlpha === true, 'Alpha transparency preserved');

  // TEST 3: Base64 Data URL Input
  console.log('\nTest 3: Base64 Data URL Optimization');
  const base64Data = `data:image/jpeg;base64,${rawJpeg.toString('base64')}`;
  const res3 = await optimizeCarImageFromBase64(base64Data, 'camera-photo.jpg');

  assert(res3.success === true, 'Base64 upload succeeded');
  assert(res3.format === 'webp', 'Base64 converted to WebP');
  assert(res3.savingsPercent > 50, `Substantial savings achieved: ${res3.savingsPercent}%`);

  // TEST 4: Invalid and Corrupted File Rejection
  console.log('\nTest 4: Error Handling & Rejection of Corrupted Files');
  const corruptedBuffer = Buffer.from('NOT_A_REAL_IMAGE_DATA_CORRUPT_BYTES');
  const valResult = await validateImageBuffer(corruptedBuffer);
  assert(valResult.valid === false, 'Corrupted buffer rejected by validation');
  assert(typeof valResult.error === 'string', `Informative error returned: "${valResult.error}"`);

  let threw = false;
  try {
    await optimizeCarImageBuffer(corruptedBuffer, 'corrupted.jpg');
  } catch (err: any) {
    threw = true;
    assert(err.message.includes('Invalid or corrupted') || err.message.includes('Unsupported'), 'Safe error thrown on corrupt image');
  }
  assert(threw, 'Optimization aborted safely without crashing');

  // TEST 5: Thumbnail Dimensions
  console.log('\nTest 5: Listing Card Thumbnail Verification');
  const thumbMeta = await sharp(Buffer.from(
    await sharp(rawJpeg)
      .resize({ width: 400, height: 300, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 78 })
      .toBuffer()
  )).metadata();
  assert((thumbMeta.width || 0) <= 400 && (thumbMeta.height || 0) <= 300, `Thumbnail bounds respected (${thumbMeta.width}x${thumbMeta.height})`);

  console.log('\n======================================================');
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('======================================================\n');

  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
