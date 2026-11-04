# RE CARS — Security Coverage & Attack Surface Analysis

This document details the complete inventory of components, trust boundaries, data flows, and attack surfaces assessed during the Recars production security audit.

---

## 1. Examined Components & Code Surfaces

### A. Next.js 16 API Routes (100% Audited)
- `POST /api/admin/auth`: Authentication and session issuance.
- `GET /api/admin/analytics`: Business intelligence and lead telemetry.
- `GET /api/admin/notifications`: Internal notification queue.
- `POST /api/admin/notifications/retry`: Failed notification dispatcher.
- `GET, POST, PATCH, DELETE /api/cars`: Core vehicle inventory and catalog management.
- `GET, POST, DELETE /api/dealers`: Registered dealer directory and onboarding.
- `GET, POST /api/customers`: Customer profile index and registration.
- `GET, POST, PATCH, DELETE /api/inquiries`: Vehicle purchase enquiries and status changes.
- `GET, POST, PATCH /api/test-drive`: Customer test drive scheduling and management.
- `GET, POST, PATCH /api/negotiations`: Price negotiation offers, counteroffers, and agreements.
- `GET, POST, PATCH, DELETE /api/pdi`: Pre-delivery inspection appointments.
- `GET, POST, PATCH /api/sell`: Sell-your-car submissions and evaluations.
- `POST /api/sell/approve`: Vehicle listing approval and publishing.
- `POST /api/sell/delist`: Vehicle delisting and archive.
- `GET, POST, PATCH /api/car-care`: Detailing and maintenance service requests.
- `GET, POST, PATCH /api/car-finder`: Custom vehicle sourcing requests.
- `POST /api/upload`: Vehicle image optimization and WebP conversion.

### B. Database & Data Access Layer
- [lib/db.ts](file:///Users/javedsayed/Documents/recars/lib/db.ts): Audited all 2,450+ lines of raw PostgreSQL queries, connection pooling, transaction pooler URL rewrites, and client acquisition logic.
- [lib/supabase.ts](file:///Users/javedsayed/Documents/recars/lib/supabase.ts): Audited Supabase client initialization and storage bucket bindings.

### C. Frontend Web Applications
- Customer Portal: Home, Browse Inventory (`app/cars/page.tsx`), Vehicle Detail (`app/cars/[id]/page.tsx`), Sell Car (`app/sell/page.tsx`), Inspection (`app/inspection/page.tsx`), About, Contact.
- Administrative Portal: Admin Dashboard (`app/admin/page.tsx`), Lead Management, Vehicle Creator, Price Negotiator, PDI scheduler, Analytics.

### D. Mobile Capacitor Shells
- Android platform build scripts (`android/app/build.gradle`, `MainActivity.java`).
- iOS platform Xcode project and Capacitor configuration (`capacitor.config.ts`).
- Safe Area hydration and WebView security in `app/layout.tsx`.

---

## 2. Attack Vectors Assessed

| Threat Category | Assessment Vector | Audit Status |
|---|---|---|
| **Authentication Bypass** | Unsigned cookies, parameter spoofing (`?admin=true`), header spoofing (`x-recars-role`) | **Tested & Remediated** |
| **Broken Object-Level Authorization (BOLA/IDOR)** | Unauthenticated scraping of private customer PII, bookings, and negotiations | **Tested & Remediated** |
| **SQL Injection (SQLi)** | Parameter injection across `pg` driver query templates | **Audited & Cleared** |
| **Cross-Site Scripting (XSS)** | React JSX template rendering and `dangerouslySetInnerHTML` analysis | **Audited & Cleared** |
| **Excessive Data Exposure** | Internal dealer acquisition prices, margins, and dealer phone numbers | **Tested & Remediated** |
| **Denial of Service (DoS)** | Unbounded image processing, oversized uploads, and unthrottled API submissions | **Tested & Remediated** |
| **Credential Exposure** | Plaintext database connection strings in source code and example configs | **Audited & Remediated** |
| **HTTP Security Headers** | Clickjacking framing, MIME sniffing, HSTS enforcement | **Tested & Remediated** |
| **Vulnerable Dependencies** | Supply chain vulnerability scanning via `npm audit` | **Audited & Remediated** |

---

## 3. Areas Not Covered / Outside Code Scope

1. **Physical Hosting Infrastructure**: Cloud network firewall (AWS/GCP), physical data centers, and hypervisors managed by Railway / Supabase.
2. **Third-Party Telephony Carriers**: Internal infrastructure of SMS OTP providers (Twilio, Fast2SMS, MSG91).
3. **Database Cloud Dashboard Permissions**: IAM permissions, MFA enforcement, and access keys of administrators inside the Supabase web dashboard.
