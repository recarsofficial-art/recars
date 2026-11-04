import { NextResponse } from 'next/server';
import { dbGetCustomers, dbUpsertCustomer } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/security';

export async function GET(request: Request) {
  try {
    const admin = await verifyAdminRequest(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required to view customer records.' },
        { status: 401 }
      );
    }

    const customers = await dbGetCustomers();
    return NextResponse.json({
      success: true,
      total: customers.length,
      customers,
    });
  } catch (error: any) {
    console.error('Error fetching customers from Supabase:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || (!body.name && !body.phone && !body.email)) {
      return NextResponse.json(
        { success: false, error: 'Customer name or contact information is required.' },
        { status: 400 }
      );
    }

    const id = await dbUpsertCustomer(body);
    return NextResponse.json({
      success: true,
      customerId: id,
      message: 'Customer saved to Supabase successfully',
    });
  } catch (error: any) {
    console.error('Error saving customer to Supabase:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
