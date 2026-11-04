import { NextResponse } from 'next/server';
import { dbDelistCustomerCar } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/security';

export async function POST(request: Request) {
  try {
    const admin = await verifyAdminRequest(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required to delist vehicle listings.' },
        { status: 401 }
      );
    }

    const { requestId } = await request.json();

    if (!requestId) {
      return NextResponse.json({ success: false, error: 'requestId is required' }, { status: 400 });
    }

    const success = await dbDelistCustomerCar(requestId);

    return NextResponse.json({
      success,
      message: 'Vehicle removed from website and status reset to inspection completed.',
    });
  } catch (error: any) {
    console.error('Error delisting customer car:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delist car' },
      { status: 500 }
    );
  }
}
