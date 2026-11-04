# RE CARS — Security Areas Requiring Validation in Production

This document catalogs potential security observations and environmental configurations that cannot be conclusively verified strictly via local static analysis and local test executions because they depend on external infrastructure, secrets, or cloud dashboard configurations.

---

### 1. Supabase Postgres Row-Level Security (RLS) on Anonymous Key Access

- **Area**: Database / Storage Security
- **Observation**:
  `lib/db.ts` and Next.js backend API routes connect directly to PostgreSQL via standard Node `pg` pool over the Supabase transaction pooler (`aws-0-ap-northeast-1.pooler.supabase.com:6543`) using connection credentials. This path bypasses Supabase PostgREST RLS because it connects as the database superuser/role.
  However, `NEXT_PUBLIC_SUPABASE_ANON_KEY` is exposed in frontend client bundles for Supabase Storage uploads.
- **Risk Hypothesis**:
  If the Postgres database tables (`cars`, `car_inquiries`, `customers`, `negotiations`, `pdi_bookings`, `sell_requests`) do not have Row-Level Security (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`) turned on, an attacker could use the public anon key to make direct REST queries to `https://<ref>.supabase.co/rest/v1/customers` and read or alter database records directly through Supabase's automatic PostgREST API.
- **Validation Step Required**:
  Log into the [Supabase Dashboard](https://supabase.com/dashboard) for the project, navigate to **Authentication** > **Policies** (or **Table Editor** > Table Settings), and verify that:
  1. RLS is **ENABLED** on all tables.
  2. Public anon role (`anon`) has **ZERO** direct table access policies, ensuring all table reads/writes must pass through the secured Next.js server APIs.

---

### 2. Supabase Storage Bucket Access Policies (`car-images`)

- **Area**: File Storage & Access Control
- **Observation**:
  Vehicle images are uploaded to the `car-images` Supabase storage bucket via `STORAGE_BUCKET_NAME=car-images`.
- **Risk Hypothesis**:
  If the bucket is configured with public write policies, unauthorized users could overwrite existing vehicle images or upload malicious non-image files directly using the Supabase JavaScript client, bypassing `app/api/upload/route.ts`.
- **Validation Step Required**:
  In the Supabase Dashboard under **Storage** > **Configuration**:
  1. Confirm that `car-images` bucket permits public `SELECT` (read) operations so visitors can view vehicle photos.
  2. Confirm that `INSERT`, `UPDATE`, and `DELETE` policies on `storage.objects` are restricted to the service role key (`service_role`) and NOT granted to `anon`.

---

### 3. Production Database Password Rotation

- **Area**: Secrets Management
- **Observation**:
  A previous database connection string with a plaintext password was found committed to git history and `.env.example`. While removed from the codebase and `.env.example` in this audit, git commit history retains prior commits unless rewritten.
- **Risk Hypothesis**:
  Anyone with read access to the git repository history could retrieve the old password.
- **Validation Step Required**:
  In the Supabase project dashboard:
  1. Navigate to **Project Settings** > **Database**.
  2. Click **Reset database password** to generate a new strong password.
  3. Update `DATABASE_URL` in the production hosting provider (Railway / Vercel / Docker) environment settings and local `.env.local`.

---

### 4. Admin Session Secret Environment Configuration

- **Area**: Authentication & Cryptography
- **Observation**:
  `lib/security.ts` signs session tokens with `process.env.ADMIN_SESSION_SECRET`. If this variable is undefined, it falls back to a development derivation.
- **Risk Hypothesis**:
  In a multi-instance production deployment without `ADMIN_SESSION_SECRET` explicitly set, instance restarts or container redeployments could invalidate existing sessions or rely on default salt values.
- **Validation Step Required**:
  Ensure that an explicit, cryptographically random 64-character hex string is configured as `ADMIN_SESSION_SECRET` in the production environment variables (e.g. `openssl rand -hex 32`).

---

### 5. Third-Party Payment Gateway Webhook Signature Verification (When Activated)

- **Area**: Financial & Payment Security
- **Observation**:
  Razorpay keys (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`) are present in `.env.example`, but full payment processing routes are currently dormant or configured for offline enquiry/booking.
- **Risk Hypothesis**:
  When live online payments (booking deposits, inspection fees) are enabled, payment success confirmation must always be validated via server-side HMAC signature verification (`razorpay_signature`) rather than trusting client-supplied status flags.
- **Validation Step Required**:
  Prior to turning on live financial transactions, audit the Razorpay webhook endpoint to guarantee `crypto.createHmac('sha256', RAZORPAY_KEY_SECRET)` validation is in place.
