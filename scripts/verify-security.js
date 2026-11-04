const http = require('http');
const crypto = require('crypto');

const BASE_URL = 'http://localhost:3000';
const SECRET = 'recars_jwt_sec_8a3f91bc09e13d72a488dc61f7d98412';

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

function parseCookies(resHeaders) {
  const setCookie = resHeaders['set-cookie'];
  if (!setCookie) return {};
  const cookies = {};
  setCookie.forEach((cookieStr) => {
    const parts = cookieStr.split(';')[0].split('=');
    if (parts.length >= 2) {
      cookies[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
  });
  return cookies;
}

let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${testName} - ${details}`);
    failed++;
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('RE CARS — INDEPENDENT PRODUCTION SECURITY VERIFICATION');
  console.log('====================================================\n');

  // ----------------------------------------------------
  // TEST SUITE 1: Admin Authentication & Cryptography
  // ----------------------------------------------------
  console.log('--- SUITE 1: Admin Authentication & Token Verification ---');

  // 1.1 Unauthenticated access
  const res1_1 = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/customers',
    method: 'GET',
  });
  assert(res1_1.statusCode === 401, '1.1 Unauthenticated request rejected (401)');

  // 1.2 Forged unsigned base64 cookie
  const forgedPayload = Buffer.from(JSON.stringify({ role: 'admin', email: 'attacker@evil.com' })).toString('base64');
  const res1_2 = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/customers',
    method: 'GET',
    headers: { Cookie: `recars_admin_session=${forgedPayload}` },
  });
  assert(res1_2.statusCode === 401, '1.2 Forged unsigned Base64 cookie rejected (401)');

  // 1.3 Invalid credentials
  const res1_3 = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/auth',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    JSON.stringify({ action: 'login', email: 'fake@recars.in', password: 'WrongPassword123!' })
  );
  assert(res1_3.statusCode === 401, '1.3 Invalid login credentials rejected (401)');

  // 1.4 Valid credentials login
  const res1_4 = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/auth',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    JSON.stringify({ action: 'login', email: 'Recars.in@gmail.com', password: 'AdminRecars@2026' })
  );
  const cookies = parseCookies(res1_4.headers);
  const validSessionCookie = cookies['recars_admin_session'];
  assert(res1_4.statusCode === 200 && !!validSessionCookie, '1.4 Legitimate admin login returns signed session cookie');

  // 1.5 Access with genuine signed cookie
  const res1_5 = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/customers',
    method: 'GET',
    headers: { Cookie: `recars_admin_session=${validSessionCookie}` },
  });
  assert(res1_5.statusCode === 200, '1.5 Valid signed cookie allows administrative access (200)');

  // 1.6 Tampered payload with original signature
  if (validSessionCookie) {
    const [payloadB64, signature] = validSessionCookie.split('.');
    const decoded = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
    decoded.email = 'tampered@hacker.com';
    const tamperedPayloadB64 = Buffer.from(JSON.stringify(decoded)).toString('base64url');
    const tamperedCookie = `${tamperedPayloadB64}.${signature}`;

    const res1_6 = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/customers',
      method: 'GET',
      headers: { Cookie: `recars_admin_session=${tamperedCookie}` },
    });
    assert(res1_6.statusCode === 401, '1.6 Tampered session payload rejected by HMAC verification (401)');
  }

  // 1.7 Expired token rejection
  const expiredPayload = {
    id: 'admin-exp',
    email: 'recars.in@gmail.com',
    name: 'Expired Admin',
    role: 'admin',
    loginTime: new Date(Date.now() - 100000000).toISOString(),
    exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
  };
  const expB64 = Buffer.from(JSON.stringify(expiredPayload)).toString('base64url');
  const expSig = crypto.createHmac('sha256', SECRET).update(expB64).digest('hex');
  const expiredCookie = `${expB64}.${expSig}`;

  const res1_7 = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/customers',
    method: 'GET',
    headers: { Cookie: `recars_admin_session=${expiredCookie}` },
  });
  assert(res1_7.statusCode === 401, '1.7 Expired token rejected despite valid cryptographic signature (401)');

  // 1.8 Non-admin role token rejection
  const userPayload = {
    id: 'user-1',
    email: 'user@example.com',
    name: 'Customer User',
    role: 'customer',
    loginTime: new Date().toISOString(),
    exp: Math.floor(Date.now() / 1000) + 3600,
  };
  const userB64 = Buffer.from(JSON.stringify(userPayload)).toString('base64url');
  const userSig = crypto.createHmac('sha256', SECRET).update(userB64).digest('hex');
  const userCookie = `${userB64}.${userSig}`;

  const res1_8 = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/customers',
    method: 'GET',
    headers: { Cookie: `recars_admin_session=${userCookie}` },
  });
  assert(res1_8.statusCode === 401, '1.8 Non-admin role in valid signed token rejected for admin route (401)');

  // ----------------------------------------------------
  // TEST SUITE 2: Authorization Bypass Query & Header Immunity
  // ----------------------------------------------------
  console.log('\n--- SUITE 2: Query Parameter & Header Spoofing Immunity ---');

  const bypassEndpoints = [
    { method: 'GET', path: '/api/customers?admin=true', name: 'GET /api/customers?admin=true' },
    { method: 'GET', path: '/api/inquiries?admin=true', name: 'GET /api/inquiries?admin=true' },
    { method: 'GET', path: '/api/test-drive?admin=true', name: 'GET /api/test-drive?admin=true' },
    { method: 'POST', path: '/api/cars?admin=true', name: 'POST /api/cars?admin=true', data: JSON.stringify({ make: 'Hack' }) },
    { method: 'POST', path: '/api/sell/approve?admin=true', name: 'POST /api/sell/approve?admin=true', data: JSON.stringify({ id: 'any' }) },
    { method: 'POST', path: '/api/sell/delist?admin=true', name: 'POST /api/sell/delist?admin=true', data: JSON.stringify({ id: 'any' }) },
  ];

  for (const ep of bypassEndpoints) {
    const res = await request(
      {
        hostname: 'localhost',
        port: 3000,
        path: ep.path,
        method: ep.method,
        headers: {
          'Content-Type': 'application/json',
          'x-recars-role': 'admin',
        },
      },
      ep.data || null
    );
    assert(res.statusCode === 401, `2.x ${ep.name} with ?admin=true + x-recars-role rejected (401)`);
  }

  // ----------------------------------------------------
  // TEST SUITE 3: Customer Privacy & PII Access Restriction
  // ----------------------------------------------------
  console.log('\n--- SUITE 3: Customer Privacy & Data Scraping Protection ---');

  const piiEndpoints = [
    '/api/customers',
    '/api/inquiries',
    '/api/test-drive',
    '/api/negotiations',
    '/api/pdi',
    '/api/sell',
    '/api/admin/analytics',
    '/api/admin/notifications',
  ];

  for (const path of piiEndpoints) {
    const res = await request({
      hostname: 'localhost',
      port: 3000,
      path,
      method: 'GET',
    });
    assert(res.statusCode === 401, `3.x Unauthenticated GET ${path} blocked (401)`);
  }

  // ----------------------------------------------------
  // TEST SUITE 4: Dealer Pricing and Internal Margin Sanitization
  // ----------------------------------------------------
  console.log('\n--- SUITE 4: Vehicle Inventory Public Data Sanitization ---');

  const resCars = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/cars',
    method: 'GET',
  });
  assert(resCars.statusCode === 200, '4.1 Public GET /api/cars succeeds with HTTP 200');

  let sanitized = true;
  try {
    const data = JSON.parse(resCars.body);
    assert(data.success === true && Array.isArray(data.cars) && data.cars.length > 0, '4.2 Public cars list returned');
    for (const car of data.cars) {
      if (car.dealerPrice !== undefined || car.dealerMargin !== undefined || car.purchaseCost !== undefined || car.dealerPhone !== undefined) {
        sanitized = false;
        console.error('Leaked fields on car:', car.id, {
          dealerPrice: car.dealerPrice,
          dealerMargin: car.dealerMargin,
          purchaseCost: car.purchaseCost,
          dealerPhone: car.dealerPhone,
        });
        break;
      }
    }
  } catch (err) {
    sanitized = false;
  }
  assert(sanitized, '4.3 Sensitive dealer fields (dealerPrice, dealerMargin, purchaseCost, dealerPhone) stripped from public API');

  // ----------------------------------------------------
  // TEST SUITE 5: File Upload & Abuse Prevention
  // ----------------------------------------------------
  console.log('\n--- SUITE 5: File Upload Controls & Size Enforcements ---');

  // 5.1 Unsupported mime type
  const res5_1 = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/upload',
      method: 'POST',
      headers: { 'Content-Type': 'application/xml' },
    },
    '<xml>malicious</xml>'
  );
  assert(res5_1.statusCode === 400, '5.1 Non-image Content-Type rejected (400)');

  // 5.2 Empty request
  const res5_2 = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/upload',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    JSON.stringify({})
  );
  assert(res5_2.statusCode === 400, '5.2 Empty JSON upload payload rejected (400)');

  // ----------------------------------------------------
  // TEST SUITE 6: HTTP Security Headers
  // ----------------------------------------------------
  console.log('\n--- SUITE 6: HTTP Security Headers ---');

  const resHeaders = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET',
  });

  const headers = resHeaders.headers;
  assert(headers['x-frame-options'] === 'SAMEORIGIN', '6.1 X-Frame-Options is SAMEORIGIN');
  assert(headers['x-content-type-options'] === 'nosniff', '6.2 X-Content-Type-Options is nosniff');
  assert(headers['referrer-policy'] === 'strict-origin-when-cross-origin', '6.3 Referrer-Policy is strict-origin-when-cross-origin');
  assert(headers['strict-transport-security'] && headers['strict-transport-security'].includes('max-age'), '6.4 Strict-Transport-Security is present with max-age');
  assert(headers['permissions-policy'] && headers['permissions-policy'].includes('camera=()'), '6.5 Permissions-Policy is configured');

  console.log('\n====================================================');
  console.log(`VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
