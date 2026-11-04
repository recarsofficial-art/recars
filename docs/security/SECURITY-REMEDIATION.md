# RE CARS — Security Remediation & Code Hardening Log

This document records the exact defensive code modifications, new security controls, and architectural enhancements applied across the Recars application to remediate confirmed vulnerabilities.

---

## 1. Summary of Modified & Created Files

| File Path | Description of Changes Applied |
|---|---|
| [lib/security.ts](file:///Users/javedsayed/Documents/recars/lib/security.ts) | **NEW FILE**: Cryptographic HMAC-SHA256 session token generation and verification (`signAdminSession`, `verifyAdminToken`, `verifyAdminRequest`), token-bucket in-memory IP rate limiter (`checkRateLimit`), and robust multi-header IP extractor (`getClientIp`). |
| [app/api/admin/auth/route.ts](file:///Users/javedsayed/Documents/recars/app/api/admin/auth/route.ts) | Upgraded session generation from raw base64 JSON to HMAC-SHA256 signed tokens; added IP rate limiting on login attempts to thwart credential stuffing; set secure cookie flags (`httpOnly`, `sameSite: 'lax'`, `secure` in production). |
| [app/api/cars/route.ts](file:///Users/javedsayed/Documents/recars/app/api/cars/route.ts) | Completely eradicated `?admin=true` and `x-recars-role: admin` bypasses; enforced `verifyAdminRequest` on `POST`, `PATCH`, `DELETE`; dynamically sanitized public `GET` responses to strip sensitive dealer pricing (`dealerPrice`, `dealerMargin`, `purchaseCost`, `dealerPhone`). |
| [app/api/customers/route.ts](file:///Users/javedsayed/Documents/recars/app/api/customers/route.ts) | Enforced `verifyAdminRequest` on `GET` to prevent unauthenticated scraping of customer PII; added validation and rate limiting on `POST`. |
| [app/api/dealers/route.ts](file:///Users/javedsayed/Documents/recars/app/api/dealers/route.ts) | Enforced `verifyAdminRequest` on `POST` and `DELETE`; sanitized public dealer listings to omit private phone numbers unless authenticated as admin. |
| [app/api/inquiries/route.ts](file:///Users/javedsayed/Documents/recars/app/api/inquiries/route.ts) | Enforced `verifyAdminRequest` on `GET`, `PATCH`, `DELETE`; added per-IP rate limiting and input sanitization on public `POST` inquiry submissions. |
| [app/api/test-drive/route.ts](file:///Users/javedsayed/Documents/recars/app/api/test-drive/route.ts) | Enforced `verifyAdminRequest` on `GET` and booking management; rate-limited and validated public `POST` test drive submissions. |
| [app/api/pdi/route.ts](file:///Users/javedsayed/Documents/recars/app/api/pdi/route.ts) | Enforced `verifyAdminRequest` on `GET`, `PATCH`, `DELETE`; rate-limited public `POST` PDI booking requests. |
| [app/api/sell/route.ts](file:///Users/javedsayed/Documents/recars/app/api/sell/route.ts) | Enforced `verifyAdminRequest` on administrative sell request retrieval (`GET`) and status updates (`PATCH`); rate-limited public `POST` sell submissions. |
| [app/api/sell/approve/route.ts](file:///Users/javedsayed/Documents/recars/app/api/sell/approve/route.ts) | Enforced `verifyAdminRequest` on vehicle publication / approval endpoint. |
| [app/api/sell/delist/route.ts](file:///Users/javedsayed/Documents/recars/app/api/sell/delist/route.ts) | Enforced `verifyAdminRequest` on vehicle delisting endpoint. |
| [app/api/negotiations/route.ts](file:///Users/javedsayed/Documents/recars/app/api/negotiations/route.ts) | Enforced `verifyAdminRequest` on `GET` and administrative counteroffers / approvals; added rate limiting on customer `POST` price negotiation offers. |
| [app/api/admin/analytics/route.ts](file:///Users/javedsayed/Documents/recars/app/api/admin/analytics/route.ts) | Replaced spoofable `checkIsAdmin` with strict `verifyAdminRequest`. |
| [app/api/admin/notifications/route.ts](file:///Users/javedsayed/Documents/recars/app/api/admin/notifications/route.ts) | Secured notification retrieval behind `verifyAdminRequest`. |
| [app/api/admin/notifications/retry/route.ts](file:///Users/javedsayed/Documents/recars/app/api/admin/notifications/retry/route.ts) | Secured notification retry dispatcher behind `verifyAdminRequest`. |
| [app/api/car-care/route.ts](file:///Users/javedsayed/Documents/recars/app/api/car-care/route.ts) | Enforced `verifyAdminRequest` on administrative status queries and mutations; rate-limited public bookings. |
| [app/api/car-finder/route.ts](file:///Users/javedsayed/Documents/recars/app/api/car-finder/route.ts) | Enforced `verifyAdminRequest` on administrative finder requests; rate-limited public requests. |
| [app/api/upload/route.ts](file:///Users/javedsayed/Documents/recars/app/api/upload/route.ts) | Added per-IP rate limiting (30 requests/min), 15MB file-size ceiling, and 20MB Base64 length limit to prevent denial of service and memory exhaustion. |
| [lib/db.ts](file:///Users/javedsayed/Documents/recars/lib/db.ts) | Removed plaintext database connection fallback string containing production password; added graceful error handling and configuration guards. |
| [.env.example](file:///Users/javedsayed/Documents/recars/.env.example) | Replaced live production database credentials and Supabase URLs with generic template placeholders. |
| [next.config.ts](file:///Users/javedsayed/Documents/recars/next.config.ts) | Injected standard HTTP security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, `Referrer-Policy`, `Permissions-Policy`). |
| [package.json](file:///Users/javedsayed/Documents/recars/package.json) | Patched vulnerable transitive dependencies (`nodemailer`, `body-parser`, `undici`, `fast-uri`, `re2`). |

---

## 2. Detailed Technical Implementations

### A. Cryptographic Session Architecture (`lib/security.ts`)
```ts
export interface AdminSessionPayload {
  email: string;
  role: 'admin';
  createdAt: number;
  exp: number; // 7-day expiration timestamp
}

export function signAdminSession(payload: Omit<AdminSessionPayload, 'createdAt' | 'exp'>): string {
  const fullPayload: AdminSessionPayload = {
    ...payload,
    createdAt: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
  const data = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  return `${data}.${signature}`;
}

export function verifyAdminToken(token: string): AdminSessionPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [data, signature] = parts;
  const expectedSignature = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  
  // Constant-time comparison to prevent timing attacks
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }
  const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as AdminSessionPayload;
  if (payload.exp < Date.now() || payload.role !== 'admin') return null;
  return payload;
}
```

### B. Rate Limiting System (`lib/security.ts`)
```ts
export function checkRateLimit(
  key: string,
  limit: number = 60,
  windowSeconds: number = 60
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowSeconds * 1000 };
  }
  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }
  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}
```

### C. Sensitive Data Sanitization (`app/api/cars/route.ts`)
```ts
const safeCars = isAdmin
  ? allCars
  : allCars.map((car) => {
      const { dealerPhone, dealerPrice, dealerMargin, purchaseCost, ...publicCar } = car;
      return publicCar;
    });
```

---

## 3. Remaining Operational Recommendations for Deployment

1. **Set `ADMIN_SESSION_SECRET` in Production**:
   Generate a high-entropy 256-bit string (e.g. `openssl rand -hex 32`) and configure it in the production deployment environment (Railway / Vercel).
2. **Rotate Supabase Database Password**:
   Reset the PostgreSQL password in the Supabase Cloud dashboard and update `DATABASE_URL` in production secret stores to invalidate the previously committed credential.
3. **Audit Supabase Dashboard Table Policies**:
   Confirm that Row-Level Security (RLS) is active on all tables and that the public `anon` role has zero direct table modification permissions.
