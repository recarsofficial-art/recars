# RE CARS — Rejected Findings & Disproven Hypotheses

During the comprehensive security audit, several potential vulnerability classes were hypothesized, investigated, and systematically disproved through code inspection and dynamic testing. This document details why these candidates were rejected to avoid speculative or noisy reporting.

---

### 1. SQL Injection via PostgreSQL Database Queries

- **Candidate Finding**: Unsanitized user inputs passed into raw SQL query strings resulting in SQL Injection (CWE-89).
- **Hypothesis**:
  Because `lib/db.ts` uses the low-level `pg` Pool client rather than an ORM like Prisma or Drizzle, database queries might concatenate untrusted user strings into `pool.query(...)`.
- **Investigation**:
  Every database query in `lib/db.ts` was audited line-by-line (across 2,400+ lines). Every single dynamic database query throughout the entire application utilizes parameterized queries with indexed placeholders (`$1, $2, $3, ...`) and a distinct parameter array:
  ```ts
  // Example from lib/db.ts:
  const query = `
    INSERT INTO car_inquiries (id, car_id, car_title, user_name, user_phone, user_email, message, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `;
  await pool.query(query, [id, carId, carTitle, userName, userPhone, userEmail, message, status]);
  ```
  Where dynamic filters are constructed (such as in `dbGetCars` or `dbGetNegotiations`), column names and clauses are strictly whitelisted and hardcoded in JavaScript; only the search values are pushed into parameter arrays.
- **Verdict**: **REJECTED**. No SQL injection vulnerabilities exist in the codebase.

---

### 2. Cross-Site Scripting (XSS) via React Components

- **Candidate Finding**: Stored or Reflected XSS through customer enquiry messages, car notes, or test drive requests rendered in the admin dashboard (CWE-79).
- **Hypothesis**:
  If customer inputs (names, messages, notes) are rendered via `dangerouslySetInnerHTML` in the admin portal or customer web pages, attackers could inject malicious `<script>` tags to execute session-hijacking scripts.
- **Investigation**:
  A global search for `dangerouslySetInnerHTML` across all `.tsx` and `.ts` files was conducted:
  - The only occurrences of `dangerouslySetInnerHTML` are in `app/layout.tsx` for static JSON-LD Schema.org structured data (organization schema, website metadata) and inline CSS safe area padding calculations.
  - All customer-supplied texts in `app/admin/page.tsx`, `app/cars/[id]/page.tsx`, and customer modal dialogs are rendered via standard JSX expression interpolation (e.g. `<span>{inquiry.message}</span>`), which automatically HTML-encodes all text nodes in React before insertion into the DOM.
- **Verdict**: **REJECTED**. Standard JSX output encoding effectively prevents DOM-based and Stored XSS from customer inputs.

---

### 3. Server-Side Request Forgery (SSRF) in Image Processing

- **Candidate Finding**: Server-Side Request Forgery (SSRF) in image upload or car fetching endpoints (CWE-918).
- **Hypothesis**:
  If `/api/upload` accepts arbitrary external URLs to fetch remote images for optimization, an attacker could supply internal metadata addresses (`http://169.254.169.254/` or `http://localhost:5432`) to probe cloud infrastructure.
- **Investigation**:
  Inspected [app/api/upload/route.ts](file:///Users/javedsayed/Documents/recars/app/api/upload/route.ts) and [lib/imageOptimizer.ts](file:///Users/javedsayed/Documents/recars/lib/imageOptimizer.ts). The upload route accepts strictly:
  1. `multipart/form-data` with direct binary file buffer.
  2. `application/json` with direct `base64Data` string.
  The server does not perform outbound HTTP `fetch()` or `curl` calls against remote URLs supplied by users.
- **Verdict**: **REJECTED**. No URL fetching mechanism exists in the upload pipeline.

---

### 4. Client-Side Authentication State Manipulation

- **Candidate Finding**: Bypassing admin authentication by setting `localStorage` flags in the browser.
- **Hypothesis**:
  Because some frontend components check local state or context for user display, an attacker could set `localStorage.setItem('recars_admin', 'true')` to execute administrative actions.
- **Investigation**:
  While the frontend admin UI uses React state to render administrative navigation, all data operations (`POST`, `PATCH`, `DELETE`, and `GET` for sensitive tables) communicate with backend Next.js API routes. With the fixes implemented in this audit, every backend API route independently validates the cryptographic HMAC-SHA256 signature on the HTTP-only cookie or bearer token before reading from or writing to the database. Modifying `localStorage` or React state has zero effect on backend API authorization.
- **Verdict**: **REJECTED**. Authorization is strictly enforced at the server-side API boundary.
