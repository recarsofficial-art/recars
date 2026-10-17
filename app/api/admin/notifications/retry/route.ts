import { NextResponse } from 'next/server';
import { dbGetEmailNotificationByEnquiryId } from '@/lib/db';
import { sendEnquiryNotification, EmailNotificationPayload } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { enquiryId } = body;

    if (!enquiryId) {
      return NextResponse.json({ success: false, error: 'Enquiry ID is required' }, { status: 400 });
    }

    const record = await dbGetEmailNotificationByEnquiryId(enquiryId);
    if (!record) {
      return NextResponse.json(
        { success: false, error: `No notification record found for enquiry ID ${enquiryId}` },
        { status: 404 }
      );
    }

    const payload: EmailNotificationPayload = record.payload || {
      enquiryId: record.enquiryId,
      enquiryType: record.enquiryType,
      customerName: record.customerName || 'Customer',
      customerPhone: record.customerPhone,
      customerEmail: record.customerEmail,
    };

    const result = await sendEnquiryNotification(payload, true /* forceRetry */);

    return NextResponse.json({
      success: result.success,
      status: result.status,
      message: result.success
        ? `Notification successfully resent to recars.in@gmail.com!`
        : `Retry attempt resulted in status: ${result.status}. ${result.error || ''}`,
      error: result.error,
    });
  } catch (error: any) {
    console.error('Error retrying notification:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
