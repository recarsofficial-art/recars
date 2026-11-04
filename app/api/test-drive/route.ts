import { NextResponse } from 'next/server';
import { dbGetTestDrives, dbInsertTestDrive } from '@/lib/db';
import { TestDriveBooking } from '@/lib/types';
import { sendEnquiryNotification } from '@/lib/email';
import { verifyAdminRequest, checkRateLimit, getClientIp } from '@/lib/security';

export async function GET(request: Request) {
  try {
    const admin = await verifyAdminRequest(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required to access test drive bookings.' },
        { status: 401 }
      );
    }

    const testDrives = await dbGetTestDrives();
    return NextResponse.json({
      success: true,
      total: testDrives.length,
      testDrives,
    });
  } catch (error: any) {
    console.error('Error fetching test drives from Supabase:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const limit = checkRateLimit(`testdrive-submit:${clientIp}`, 15, 10 * 60);
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many test drive requests submitted. Please wait a few minutes before trying again.' },
        { status: 429 }
      );
    }

    const body: TestDriveBooking = await request.json();

    if (!body || !body.userName || !body.userPhone || !body.carId) {
      return NextResponse.json(
        { success: false, error: 'Customer name, phone number, and vehicle selection are required.' },
        { status: 400 }
      );
    }

    const bookingId = body.id || `TD-${Date.now().toString().slice(-6)}`;
    const fullBooking: TestDriveBooking = {
      ...body,
      id: bookingId,
      userName: body.userName.trim(),
      userPhone: body.userPhone.trim(),
      userEmail: body.userEmail?.trim() || '',
      status: body.status || 'Confirmed',
      createdAt: body.createdAt || new Date().toISOString(),
    };

    await dbInsertTestDrive(fullBooking);

    // Trigger email alert to recars.in@gmail.com
    sendEnquiryNotification({
      enquiryId: bookingId,
      enquiryType: 'Test Drive Request',
      customerName: fullBooking.userName,
      customerPhone: fullBooking.userPhone,
      customerEmail: fullBooking.userEmail,
      city: fullBooking.city,
      carId: fullBooking.carId,
      carPrice: fullBooking.carPrice,
      carModel: fullBooking.carTitle,
      preferredDate: fullBooking.preferredDate,
      preferredTimeSlot: fullBooking.preferredTimeSlot,
      packageType: fullBooking.type,
      message: `Customer requested ${fullBooking.type} for ${fullBooking.carTitle} on ${fullBooking.preferredDate} (${fullBooking.preferredTimeSlot}).`,
      adminTab: 'testdrives',
      createdAt: fullBooking.createdAt,
    }).catch((err) => console.error('Notice: test drive notification trigger error:', err));

    return NextResponse.json({
      success: true,
      bookingId,
      status: fullBooking.status,
      message: 'Test drive booking and customer profile stored in Supabase successfully',
      data: fullBooking,
    });
  } catch (err: any) {
    console.error('Error saving test drive to Supabase:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Invalid test drive booking payload' },
      { status: 400 }
    );
  }
}
