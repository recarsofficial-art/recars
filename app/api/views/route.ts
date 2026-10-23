import { NextResponse } from 'next/server';
import { dbRecordVehicleView } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { carId, sessionId } = body;

    if (!carId || typeof carId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Vehicle ID is required' },
        { status: 400 }
      );
    }

    // Capture forwarded client IP or header hash for rate-limiting & deduplication
    const forwardedFor = request.headers.get('x-forwarded-for') || '';
    const ip = forwardedFor.split(',')[0]?.trim() || request.headers.get('x-real-ip') || '';
    const ipHash = ip ? Buffer.from(ip).toString('base64').slice(0, 16) : undefined;

    const recorded = await dbRecordVehicleView(carId, sessionId, ipHash);

    return NextResponse.json({
      success: true,
      recorded,
      message: recorded ? 'View recorded' : 'View deduplicated within 15m window',
    });
  } catch (error: any) {
    console.error('Error tracking vehicle view:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to record view' },
      { status: 500 }
    );
  }
}
