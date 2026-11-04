import { NextResponse } from 'next/server';
import { dbGetDealers, dbInsertDealer, dbDeleteDealer } from '@/lib/db';
import { RegisteredDealer } from '@/lib/types';
import { verifyAdminRequest } from '@/lib/security';

export async function GET(request: Request) {
  try {
    const admin = await verifyAdminRequest(request);
    const dealers = await dbGetDealers();

    // If unauthenticated public request, sanitize private internal dealer fields
    const sanitized = admin
      ? dealers
      : dealers
          .filter((d) => d.status === 'Active')
          .map((d) => ({
            id: d.id,
            name: d.name,
            city: d.city,
            activeCarsCount: d.activeCarsCount,
          }));

    return NextResponse.json({
      success: true,
      dealers: sanitized,
      total: sanitized.length,
    });
  } catch (error: any) {
    console.error('Error fetching registered dealers:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch dealers' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await verifyAdminRequest(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required to register dealers.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Dealer business name is required' },
        { status: 400 }
      );
    }
    if (!body.phone || !body.phone.trim()) {
      return NextResponse.json(
        { success: false, error: 'Dealer contact phone is required' },
        { status: 400 }
      );
    }

    const newDealer: RegisteredDealer = {
      id: body.id || `DLR-${Date.now().toString().slice(-4)}`,
      name: body.name.trim(),
      contactPerson: body.contactPerson?.trim() || undefined,
      phone: body.phone.trim(),
      email: body.email?.trim() || undefined,
      city: body.city?.trim() || 'Warangal',
      address: body.address?.trim() || undefined,
      status: body.status || 'Active',
    };

    const saved = await dbInsertDealer(newDealer);
    return NextResponse.json({
      success: true,
      message: 'Dealer registered successfully',
      dealer: saved,
    });
  } catch (error: any) {
    console.error('Error registering dealer:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to register dealer' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await verifyAdminRequest(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required to delete dealers.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Dealer ID is required' },
        { status: 400 }
      );
    }
    const deleted = await dbDeleteDealer(id);
    return NextResponse.json({
      success: deleted,
      message: deleted ? 'Dealer removed successfully' : 'Dealer not found',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete dealer' },
      { status: 500 }
    );
  }
}
