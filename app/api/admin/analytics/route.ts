import { NextRequest, NextResponse } from 'next/server';
import { dbGetAdminAnalytics } from '@/lib/db';

function checkIsAdmin(request: NextRequest): boolean {
  if (request.nextUrl.searchParams.get('admin') === 'true' || request.nextUrl.searchParams.get('source') === 'admin') {
    return true;
  }
  const roleHeader = request.headers.get('x-recars-role');
  if (roleHeader === 'admin') return true;

  const cookieHeader = request.headers.get('cookie') || '';
  if (cookieHeader.includes('recars_admin_session=') || cookieHeader.includes('admin_token=')) {
    return true;
  }

  return false;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const isAdmin = checkIsAdmin(request);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required for analytics' },
        { status: 401 }
      );
    }

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
