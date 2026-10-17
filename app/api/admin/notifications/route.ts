import { NextResponse } from 'next/server';
import { dbGetEmailNotifications } from '@/lib/db';

export async function GET() {
  try {
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
