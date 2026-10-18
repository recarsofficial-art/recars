import { NextResponse } from 'next/server';
import { dbGetDealers, dbInsertDealer } from '@/lib/db';
import { RegisteredDealer } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const dealers = await dbGetDealers();
    return NextResponse.json({
      success: true,
      dealers,
      total: dealers.length,
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
