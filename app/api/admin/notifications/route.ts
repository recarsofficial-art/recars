import { NextResponse } from 'next/server';
import { dbGetEmailNotifications } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/security';

export async function GET(request: Request) {
  try {
    const admin = await verifyAdminRequest(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required to access email notification logs.' },
        { status: 401 }
      );
    }

    const notifications = await dbGetEmailNotifications(200);
    return NextResponse.json({
      success: true,
      total: notifications.length,
      notifications,
    });
  } catch (error: any) {
    console.error('Error fetching email notifications:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
