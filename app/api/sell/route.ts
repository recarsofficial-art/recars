import { NextResponse } from 'next/server';
import { dbGetCustomerCars, dbInsertCustomerCar, dbUpdateCustomerCarStatus } from '@/lib/db';
import { SellRequest } from '@/lib/types';

export async function GET() {
  try {
    const customerCars = await dbGetCustomerCars();
    return NextResponse.json({
      success: true,
      total: customerCars.length,
      customerCars,
    });
  } catch (error: any) {
    console.error('Error fetching customer cars from Supabase:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: SellRequest = await request.json();
    const requestId = body.id || `REC-SELL-${Date.now().toString().slice(-5)}`;
    const fullRequest: SellRequest = {
      ...body,
      id: requestId,
      status: body.status || 'Inspection Scheduled',
      createdAt: body.createdAt || new Date().toISOString(),
    };

    await dbInsertCustomerCar(fullRequest);

    return NextResponse.json({
      success: true,
      requestId,
      status: fullRequest.status,
      message: 'Sell request and customer profile stored in Supabase successfully',
      data: fullRequest,
    });
  } catch (err: any) {
    console.error('Error saving sell request to Supabase:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Invalid sell request payload' },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'id and status required' }, { status: 400 });
    }
    const updated = await dbUpdateCustomerCarStatus(id, status);
    return NextResponse.json({ success: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
