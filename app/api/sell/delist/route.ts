import { NextResponse } from 'next/server';
import { dbDelistCustomerCar } from '@/lib/db';

export async function POST(request: Request) {
  try {
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
