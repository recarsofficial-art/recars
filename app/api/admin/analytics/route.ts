import { NextRequest, NextResponse } from 'next/server';
import { dbGetAdminAnalytics } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminRequest(request);

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required for analytics' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const timePeriod = searchParams.get('timePeriod') || 'all';
    const budgetRange = searchParams.get('budgetRange') || 'all';
    const make = searchParams.get('make') || 'all';
    const model = searchParams.get('model') || 'all';
    const sortBy = searchParams.get('sortBy') || 'views';

    const analytics = await dbGetAdminAnalytics({
      timePeriod,
      budgetRange,
      make,
      model,
      sortBy,
    });

    return NextResponse.json({
      success: true,
      ...analytics,
    });
  } catch (error: any) {
    console.error('Error fetching admin analytics:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to compute analytics' },
      { status: 500 }
    );
  }
}
