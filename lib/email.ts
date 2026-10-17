import nodemailer from 'nodemailer';
import { dbUpsertEmailNotification, dbGetEmailNotificationByEnquiryId, EmailNotificationRecord } from './db';

export type NotificationEnquiryType =
  | 'Interested in Vehicle'
  | 'Car Inquiry'
  | 'Test Drive Request'
  | 'Sell Car Request'
  | 'Price Negotiation Offer'
  | 'Pre-Delivery Inspection (PDI)'
  | 'Callback Request'
  | 'General Customer Enquiry';

export interface EmailNotificationPayload {
  enquiryId: string;
  enquiryType: NotificationEnquiryType | string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  city?: string;
  message?: string;

  // Vehicle information (when applicable)
  carId?: string;
  carMake?: string;
  carModel?: string;
  carVariant?: string;
  carYear?: number | string;
  carPrice?: number;
  listingUrl?: string;

  // Specific appointment / service fields
  preferredDate?: string;
  preferredTimeSlot?: string;
  dealershipName?: string;
  dealershipAddress?: string;
  offeredPrice?: number;
  listedPrice?: number;
  packageType?: string;
  fee?: number;
  paymentStatus?: string;
  adminTab?: 'inquiries' | 'leads' | 'testdrives' | 'negotiations' | 'pdi';
  createdAt?: string;
}

/**
 * Get the canonical Recars base URL for links in email notifications.
 */
function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`;
  }
  return 'https://recars.in';
}

/**
 * Format a date/timestamp nicely in Indian Standard Time (IST).
 */
function formatISTDate(dateStr?: string): string {
  try {
    const d = dateStr ? new Date(dateStr) : new Date();
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(d) + ' IST';
  } catch {
    return new Date().toLocaleString('en-IN');
  }
}

/**
 * Format currency in Indian Rupees (INR).
 */
function formatINR(val?: number): string {
  if (!val && val !== 0) return 'N/A';
  return `₹${val.toLocaleString('en-IN')}`;
}

/**
 * Generate a clean, responsive HTML email body.
 */
function buildHtmlEmail(payload: EmailNotificationPayload, appUrl: string): string {
  const formattedDate = formatISTDate(payload.createdAt);
  const adminTab = payload.adminTab || 'inquiries';
  const adminLink = `${appUrl}/admin?tab=${adminTab}`;
  const carLink = payload.listingUrl || (payload.carId ? `${appUrl}/cars/${payload.carId}` : null);

  const vehicleTitle = [payload.carYear, payload.carMake, payload.carModel, payload.carVariant]
    .filter(Boolean)
    .join(' ');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Customer Enquiry — Recars</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #F8F9FA; color: #101216; }
    .container { max-width: 620px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #E5E7EB; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: #101216; padding: 24px 32px; border-bottom: 3px solid #E5325C; }
    .logo { color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; margin: 0; }
    .logo span { color: #E5325C; }
    .sub-tag { color: #9CA3AF; font-size: 11px; text-transform: uppercase; tracking: 0.1em; margin-top: 4px; }
    .banner { background: #FFF0F3; border-left: 4px solid #E5325C; padding: 16px 24px; margin: 24px; border-radius: 8px; }
    .banner h2 { margin: 0 0 6px 0; color: #E5325C; font-size: 18px; font-weight: 700; }
    .banner p { margin: 0; font-size: 13px; color: #4B5563; }
    .content { padding: 0 24px 24px 24px; }
    .section { background: #F8F9FA; border: 1px solid #E5E7EB; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
    .section-title { font-size: 13px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 14px 0; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px; }
    .data-row { display: flex; margin-bottom: 10px; font-size: 14px; }
    .data-label { width: 140px; font-weight: 600; color: #6B7280; flex-shrink: 0; }
    .data-value { color: #101216; font-weight: 500; word-break: break-word; }
    .highlight-pill { display: inline-block; background: #E5325C; color: #ffffff; font-weight: 700; font-size: 12px; padding: 3px 10px; border-radius: 9999px; }
    .message-box { background: #ffffff; border: 1px solid #E5E7EB; border-radius: 8px; padding: 14px; margin-top: 10px; font-size: 13px; color: #374151; line-height: 1.5; font-style: italic; }
    .btn { display: inline-block; background: #E5325C; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; text-align: center; }
    .btn-secondary { display: inline-block; background: #ffffff; color: #101216 !important; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-weight: 600; font-size: 12px; border: 1px solid #D1D5DB; margin-top: 10px; }
    .footer { background: #F3F4F6; padding: 20px 32px; font-size: 12px; color: #6B7280; text-align: center; border-top: 1px solid #E5E7EB; }
    .footer a { color: #E5325C; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="logo">Re<span>cars</span></div>
      <div class="sub-tag">Trust Every Drive. Value Every Rupee. — Operational Alert Desk</div>
    </div>

    <!-- Alert Banner -->
    <div class="banner">
      <h2>New Customer Enquiry — ${payload.enquiryType}</h2>
      <p>Submitted on <strong>${formattedDate}</strong> via Recars Online Portal</p>
    </div>

    <div class="content">
      <!-- Customer Information -->
      <div class="section">
        <div class="section-title">Customer Information</div>
        <table width="100%" cellpadding="4" cellspacing="0" style="font-size: 14px;">
          <tr>
            <td width="140" style="color: #6B7280; font-weight: 600;">Full Name:</td>
            <td style="color: #101216; font-weight: 700;">${payload.customerName || 'Prospective Buyer / Seller'}</td>
          </tr>
          <tr>
            <td style="color: #6B7280; font-weight: 600;">Phone Number:</td>
            <td style="color: #101216; font-weight: 700;">
              ${payload.customerPhone ? `<a href="tel:${payload.customerPhone.replace(/\s+/g, '')}" style="color: #E5325C; text-decoration: none;">${payload.customerPhone}</a>` : 'Not provided'}
            </td>
          </tr>
          <tr>
            <td style="color: #6B7280; font-weight: 600;">Email Address:</td>
            <td style="color: #101216;">
              ${payload.customerEmail ? `<a href="mailto:${payload.customerEmail}" style="color: #2563EB; text-decoration: none;">${payload.customerEmail}</a>` : 'Not provided'}
            </td>
          </tr>
          <tr>
            <td style="color: #6B7280; font-weight: 600;">Target City / Hub:</td>
            <td style="color: #101216;">${payload.city || 'Warangal (Official Hub)'}</td>
          </tr>
          <tr>
            <td style="color: #6B7280; font-weight: 600;">Enquiry ID:</td>
            <td style="color: #101216; font-family: monospace; font-size: 12px; font-weight: 600;">${payload.enquiryId}</td>
          </tr>
        </table>
      </div>

      <!-- Vehicle Information (if applicable) -->
      ${(vehicleTitle || payload.carId) ? `
      <div class="section">
        <div class="section-title">Vehicle Details</div>
        <table width="100%" cellpadding="4" cellspacing="0" style="font-size: 14px;">
          ${vehicleTitle ? `
          <tr>
            <td width="140" style="color: #6B7280; font-weight: 600;">Vehicle:</td>
            <td style="color: #101216; font-weight: 700; font-size: 15px;">${vehicleTitle}</td>
          </tr>` : ''}
          ${payload.carId ? `
          <tr>
            <td style="color: #6B7280; font-weight: 600;">Vehicle ID:</td>
            <td style="color: #101216; font-family: monospace;">${payload.carId}</td>
          </tr>` : ''}
          ${payload.carPrice ? `
          <tr>
            <td style="color: #6B7280; font-weight: 600;">Listed Price:</td>
            <td style="color: #101216; font-weight: 700;">${formatINR(payload.carPrice)}</td>
          </tr>` : ''}
          ${payload.offeredPrice ? `
          <tr>
            <td style="color: #6B7280; font-weight: 600;">Customer Offer:</td>
            <td style="color: #E5325C; font-weight: 800; font-size: 16px;">${formatINR(payload.offeredPrice)}</td>
          </tr>` : ''}
          ${carLink ? `
          <tr>
            <td style="color: #6B7280; font-weight: 600;">Listing URL:</td>
            <td><a href="${carLink}" target="_blank" style="color: #E5325C; font-weight: 600;">View Car on Recars.in &rarr;</a></td>
          </tr>` : ''}
        </table>
      </div>` : ''}

      <!-- Specific Service Details (PDI / Test Drive / Negotiation) -->
      ${(payload.preferredDate || payload.dealershipName || payload.packageType) ? `
      <div class="section">
        <div class="section-title">Booking / Appointment Details</div>
        <table width="100%" cellpadding="4" cellspacing="0" style="font-size: 14px;">
          ${payload.packageType ? `
          <tr>
            <td width="140" style="color: #6B7280; font-weight: 600;">Package / Service:</td>
            <td style="color: #101216; font-weight: 700;">${payload.packageType}</td>
          </tr>` : ''}
          ${payload.fee ? `
          <tr>
            <td style="color: #6B7280; font-weight: 600;">Service Fee:</td>
            <td style="color: #101216; font-weight: 700;">${formatINR(payload.fee)} ${payload.paymentStatus ? `(${payload.paymentStatus})` : ''}</td>
          </tr>` : ''}
          ${payload.preferredDate ? `
          <tr>
            <td style="color: #6B7280; font-weight: 600;">Preferred Slot:</td>
            <td style="color: #101216; font-weight: 700;">${payload.preferredDate} ${payload.preferredTimeSlot ? `• ${payload.preferredTimeSlot}` : ''}</td>
          </tr>` : ''}
          ${payload.dealershipName ? `
          <tr>
            <td style="color: #6B7280; font-weight: 600;">Dealership / Venue:</td>
            <td style="color: #101216;">${payload.dealershipName}${payload.dealershipAddress ? `, ${payload.dealershipAddress}` : ''}</td>
          </tr>` : ''}
        </table>
      </div>` : ''}

      <!-- Customer Message / Notes -->
      ${payload.message ? `
      <div class="section">
        <div class="section-title">Customer Message & Notes</div>
        <div class="message-box">
          &ldquo;${payload.message}&rdquo;
        </div>
      </div>` : ''}

      <!-- Call to Action -->
      <div style="text-align: center; margin: 32px 0 12px 0;">
        <a href="${adminLink}" target="_blank" class="btn">
          Open in Recars Admin Portal &rarr;
        </a>
      </div>
      <p style="text-align: center; font-size: 11px; color: #9CA3AF; margin: 0;">
        Direct access: <a href="${adminLink}" style="color: #6B7280;">${adminLink}</a>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p style="margin: 0 0 6px 0;">This is an automated operational alert sent to <strong>recars.in@gmail.com</strong>.</p>
      <p style="margin: 0;">&copy; 2026 Recars Technologies Private Limited. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate a clean plain text fallback for the email.
 */
function buildTextEmail(payload: EmailNotificationPayload, appUrl: string): string {
  const formattedDate = formatISTDate(payload.createdAt);
  const adminTab = payload.adminTab || 'inquiries';
  const adminLink = `${appUrl}/admin?tab=${adminTab}`;
  const carLink = payload.listingUrl || (payload.carId ? `${appUrl}/cars/${payload.carId}` : null);

  const vehicleTitle = [payload.carYear, payload.carMake, payload.carModel, payload.carVariant]
    .filter(Boolean)
    .join(' ');

  let txt = `=========================================================\n`;
  txt += `[RECARS] NEW CUSTOMER ENQUIRY — ${payload.enquiryType.toUpperCase()}\n`;
  txt += `=========================================================\n\n`;
  txt += `Submission Time : ${formattedDate}\n`;
  txt += `Enquiry ID      : ${payload.enquiryId}\n`;
  txt += `Enquiry Type    : ${payload.enquiryType}\n\n`;

  txt += `--- CUSTOMER DETAILS ---\n`;
  txt += `Name            : ${payload.customerName || 'Prospective Buyer / Seller'}\n`;
  txt += `Phone           : ${payload.customerPhone || 'Not provided'}\n`;
  txt += `Email           : ${payload.customerEmail || 'Not provided'}\n`;
  txt += `City / Region   : ${payload.city || 'Warangal'}\n\n`;

  if (vehicleTitle || payload.carId) {
    txt += `--- VEHICLE DETAILS ---\n`;
    if (vehicleTitle) txt += `Vehicle         : ${vehicleTitle}\n`;
    if (payload.carId) txt += `Vehicle ID      : ${payload.carId}\n`;
    if (payload.carPrice) txt += `Listed Price    : ${formatINR(payload.carPrice)}\n`;
    if (payload.offeredPrice) txt += `Customer Offer  : ${formatINR(payload.offeredPrice)}\n`;
    if (carLink) txt += `Listing URL     : ${carLink}\n`;
    txt += `\n`;
  }

  if (payload.preferredDate || payload.dealershipName || payload.packageType) {
    txt += `--- APPOINTMENT / SERVICE DETAILS ---\n`;
    if (payload.packageType) txt += `Package         : ${payload.packageType}\n`;
    if (payload.fee) txt += `Fee             : ${formatINR(payload.fee)} (${payload.paymentStatus || 'Pending'})\n`;
    if (payload.preferredDate) txt += `Preferred Slot  : ${payload.preferredDate} ${payload.preferredTimeSlot || ''}\n`;
    if (payload.dealershipName) txt += `Dealership      : ${payload.dealershipName} (${payload.dealershipAddress || ''})\n`;
    txt += `\n`;
  }

  if (payload.message) {
    txt += `--- CUSTOMER MESSAGE ---\n`;
    txt += `"${payload.message}"\n\n`;
  }

  txt += `--- ACTIONS ---\n`;
  txt += `Open in Admin   : ${adminLink}\n\n`;
  txt += `=========================================================\n`;
  txt += `Sent automatically to recars.in@gmail.com\n`;

  return txt;
}

/**
 * Create or reuse SMTP Transporter with production-grade pool settings.
 */
function createSmtpTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER || process.env.ADMIN_EMAIL || 'recars.in@gmail.com';
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || '';

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

export interface SendNotificationResult {
  success: boolean;
  status: 'sent' | 'pending' | 'failed';
  messageId?: string;
  error?: string;
  isDuplicate?: boolean;
}

/**
 * Core entrypoint: Send transactional email alert to recars.in@gmail.com.
 * Idempotent, duplicate-protected, and resilient (never throws to caller).
 */
export async function sendEnquiryNotification(
  payload: EmailNotificationPayload,
  forceRetry = false
): Promise<SendNotificationResult> {
  const recipient = process.env.ADMIN_NOTIFICATION_EMAIL || 'recars.in@gmail.com';
  const subject = `[Recars] New Customer Enquiry — ${payload.enquiryType}`;
  const appUrl = getAppBaseUrl();

  // Basic anti-spam validation: ignore empty customer entries
  if (!payload.enquiryId) {
    return { success: false, status: 'failed', error: 'Missing enquiryId' };
  }

  try {
    // 1. Idempotency check: Do not re-send if already 'sent' unless forceRetry is true
    if (!forceRetry) {
      const existing = await dbGetEmailNotificationByEnquiryId(payload.enquiryId);
      if (existing && existing.status === 'sent') {
        console.log(`[EMAIL_SERVICE] Notification for enquiry ${payload.enquiryId} already sent. Skipping duplicate.`);
        return { success: true, status: 'sent', isDuplicate: true };
      }
    }

    // 2. Prepare DB record
    const notifRecord: EmailNotificationRecord = {
      id: `notif-${payload.enquiryId}`,
      enquiryId: payload.enquiryId,
      enquiryType: payload.enquiryType,
      recipient,
      subject,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      customerEmail: payload.customerEmail,
      status: 'pending',
      payload,
    };

    // 3. Check SMTP credentials
    const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD;
    if (!smtpPass) {
      const warningMsg = 'SMTP credentials not configured in environment (SMTP_PASS is required to deliver live emails).';
      console.warn(`[EMAIL_SERVICE_PENDING] ${warningMsg} Notification recorded in database for enquiry ${payload.enquiryId}.`);
      
      notifRecord.status = 'pending';
      notifRecord.errorMessage = warningMsg;
      await dbUpsertEmailNotification(notifRecord);

      return {
        success: false,
        status: 'pending',
        error: warningMsg,
      };
    }

    // 4. Construct email contents
    const html = buildHtmlEmail(payload, appUrl);
    const text = buildTextEmail(payload, appUrl);
    const from = process.env.SMTP_FROM || `"Recars Notifications" <${process.env.SMTP_USER || 'recars.in@gmail.com'}>`;

    const transporter = createSmtpTransporter();

    // 5. Transmit email via SMTP
    const info = await transporter.sendMail({
      from,
      to: recipient,
      replyTo: payload.customerEmail || recipient,
      subject,
      text,
      html,
    });

    console.log(`[EMAIL_SERVICE_SUCCESS] Email sent to ${recipient} for enquiry ${payload.enquiryId} (MessageId: ${info.messageId})`);

    // 6. Update database status to 'sent'
    notifRecord.status = 'sent';
    notifRecord.sentAt = new Date().toISOString();
    notifRecord.errorMessage = undefined;
    await dbUpsertEmailNotification(notifRecord);

    return {
      success: true,
      status: 'sent',
      messageId: info.messageId,
    };
  } catch (err: any) {
    const errorMsg = err?.message || 'Unknown SMTP transmission error';
    console.error(`[EMAIL_SERVICE_ERROR] Failed delivering email for enquiry ${payload.enquiryId}:`, errorMsg);

    // Save failure status to database so admin can retry
    try {
      await dbUpsertEmailNotification({
        id: `notif-${payload.enquiryId}`,
        enquiryId: payload.enquiryId,
        enquiryType: payload.enquiryType,
        recipient,
        subject,
        customerName: payload.customerName,
        customerPhone: payload.customerPhone,
        customerEmail: payload.customerEmail,
        status: 'failed',
        errorMessage: errorMsg,
        payload,
      });
    } catch (dbErr) {
      console.error('[EMAIL_SERVICE_DB_ERROR] Failed logging notification failure to DB:', dbErr);
    }

    return {
      success: false,
      status: 'failed',
      error: errorMsg,
    };
  }
}
