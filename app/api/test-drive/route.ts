import { NextResponse } from 'next/server';
import { dbGetTestDrives, dbInsertTestDrive } from '@/lib/db';
import { TestDriveBooking } from '@/lib/types';

export async function GET() {
  try {
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
    const body: TestDriveBooking = await request.json();
    const bookingId = body.id || `TD-${Date.now().toString().slice(-6)}`;
    const fullBooking: TestDriveBooking = {
      ...body,
      id: bookingId,
      status: body.status || 'Confirmed',
      createdAt: body.createdAt || new Date().toISOString(),
    };

    await dbInsertTestDrive(fullBooking);

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
