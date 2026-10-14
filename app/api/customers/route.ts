import { NextResponse } from 'next/server';
import { dbGetCustomers, dbUpsertCustomer } from '@/lib/db';

export async function GET() {
  try {
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
