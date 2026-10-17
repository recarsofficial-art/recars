# Recars — Automatic Customer Enquiry Email Notifications

This document explains the automatic customer enquiry notification system configured for **Recars — Trust Every Drive. Value Every Rupee.**

Every customer enquiry, vehicle interest submission, test drive booking, car selling lead, price negotiation offer, or Pre-Delivery Inspection (PDI) request automatically dispatches an alert email to **`recars.in@gmail.com`**.

---

## 1. Supported Enquiry Triggers

The system automatically triggers transactional email notifications on the following customer actions:

| Action / Enquiry Type | Trigger Route | Notification Subject | Admin Workspace Link |
| :--- | :--- | :--- | :--- |
| **Interested in Vehicle** | `POST /api/inquiries` | `[Recars] New Customer Enquiry — Interested in Vehicle` | `/admin?tab=inquiries` |
| **Vehicle Inquiry / Query** | `POST /api/inquiries` | `[Recars] New Customer Enquiry — Car Inquiry` | `/admin?tab=inquiries` |
| **Instant Callback Request** | `POST /api/inquiries` | `[Recars] New Customer Enquiry — Price Quote / Best Offer` | `/admin?tab=inquiries` |
| **Test Drive Appointment** | `POST /api/test-drive` | `[Recars] New Customer Enquiry — Test Drive Request` | `/admin?tab=testdrives` |
| **Car Selling Lead / Evaluation** | `POST /api/sell` | `[Recars] New Customer Enquiry — Sell Car Request` | `/admin?tab=leads` |
| **Price Negotiation / Offer** | `POST /api/negotiations`| `[Recars] New Customer Enquiry — Price Negotiation Offer` | `/admin?tab=negotiations` |
| **Pre-Delivery Inspection (PDI)**| `POST /api/pdi` | `[Recars] New Customer Enquiry — Pre-Delivery Inspection (PDI)` | `/admin?tab=pdi` |

---

## 2. Notification Email Content

Each notification includes:
- **Standardized Subject**: `[Recars] New Customer Enquiry — [Enquiry Type]`
- **Customer Information**: Full Name, Phone Number (clickable `tel:`), Email (clickable `mailto:`), City / Hub.
- **Vehicle Information (when applicable)**: Make, Model, Variant, Year, Vehicle ID, Listed Price, and Direct Listing URL (`https://recars.in/cars/[id]`).
- **Service Details**:
  - For Test Drives: Preferred date, time slot, and booking type (Home vs Hub).
  - For Sell Requests: Estimated price range, registration number, mileage, inspection date/time.
  - For Price Negotiations: Customer offer amount vs listed price, discount %, and offer note.
  - For PDI Bookings: Dealership name & address, selected car variant/VIN, PDI package fee, payment status.
- **Submission Timestamp**: Formatted in Indian Standard Time (IST).
- **Direct Admin Action**: A prominent button linking directly to the relevant workspace in the Recars Admin Portal (`/admin?tab=...`).
- Both **Responsive HTML** and **Plain Text** formats are delivered.

---

## 3. Reliability, Idempotency & Database Logging

1. **Enquiry Safety**: The customer enquiry is **always persisted in PostgreSQL first**. Email dispatch is non-blocking to ensure fast page responses and zero risk of customer form failure.
2. **Database Logging**: Every delivery attempt is recorded in the `public.email_notifications` table with status:
   - `sent`: Successfully delivered via SMTP (stores SMTP `messageId` and timestamp).
   - `pending`: Stored in database, awaiting valid SMTP credentials or network pickup.
   - `failed`: Delivery attempted but failed (stores exact error message for inspection).
3. **Duplicate Prevention**: The system enforces idempotency using unique enquiry IDs (`inq-`, `TD-`, `REC-SELL-`, `NEG-`, `PDI-`). If an email has already been sent for an ID, duplicate submissions are suppressed.
4. **Admin Retry Action**: Within the Recars Admin Portal, any enquiry shows an email status badge with a one-click **"Send"** or **"Resend"** button to retry failed or pending emails without re-entering data.

---

## 4. Environment Variables Configuration

Add the following environment variables to your deployment environment (e.g. Vercel Project Settings &rarr; Environment Variables):

```bash
# ==========================================
# Recars Transactional Email Configuration
# ==========================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=recars.in@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM="Recars Notifications <recars.in@gmail.com>"
ADMIN_NOTIFICATION_EMAIL=recars.in@gmail.com
```

### Option A: Using Gmail (Google Workspace or Free Gmail)
1. Go to [myaccount.google.com/security](https://myaccount.google.com/security).
2. Enable **2-Step Verification**.
3. Under 2-Step Verification, select **App passwords**.
4. Generate a new App Password (name it `Recars Vercel Production`).
5. Copy the 16-character password (e.g. `abcd efgh ijkl mnop`).
6. Set:
   - `SMTP_HOST=smtp.gmail.com`
   - `SMTP_PORT=587`
   - `SMTP_SECURE=false`
   - `SMTP_USER=recars.in@gmail.com`
   - `SMTP_PASS=abcdefghijklmnop` (without spaces)
   - `ADMIN_NOTIFICATION_EMAIL=recars.in@gmail.com`

### Option B: Using SendGrid / Resend / Amazon SES
If you use SendGrid or Resend:
- `SMTP_HOST=smtp.sendgrid.net` (or `smtp.resend.com`)
- `SMTP_PORT=587`
- `SMTP_USER=apikey` (for SendGrid) or `resend` (for Resend)
- `SMTP_PASS=your-sendgrid-or-resend-api-key`
- `SMTP_FROM="Recars Notifications <noreply@recars.in>"`
- `ADMIN_NOTIFICATION_EMAIL=recars.in@gmail.com`

---

## 5. Verifying the Deployment

1. Visit any vehicle page at `https://recars.in/cars/recars-101` and click **Interested** or **Request Instant Callback**.
2. Visit `/sell` and submit an evaluation request for your car.
3. Visit `/pdi` and submit a Pre-Delivery Inspection booking.
4. Open the **Admin Portal** at `/admin`.
5. Check the **Email Notification Status** badge on each card (`Alert Sent to Email` or `Email Pending`).
6. Click **Resend / Send Alert** to test live transactional delivery to `recars.in@gmail.com`.
