import { NextResponse } from 'next/server';
import { dbGetInquiries, dbInsertInquiry, dbUpdateInquiryStatus, dbDeleteInquiry } from '@/lib/db';
import { CarInquiry } from '@/lib/types';

export async function GET() {
  try {
    const inquiries = await dbGetInquiries();
    return NextResponse.json({
      success: true,
      total: inquiries.length,
      inquiries,
    });
  } catch (error: any) {
    console.error('Error fetching inquiries from Supabase:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: CarInquiry = await request.json();
    const id = body.id || `inq-${Date.now().toString().slice(-5)}`;
    const newInquiry: CarInquiry = {
      ...body,
      id,
      status: body.status || 'New',
      createdAt: body.createdAt || new Date().toISOString(),
    };

    await dbInsertInquiry(newInquiry);

    return NextResponse.json({
      success: true,
      inquiryId: id,
      message: 'Inquiry and customer profile stored in Supabase successfully',
      data: newInquiry,
    });
  } catch (error: any) {
    console.error('Error saving inquiry to Supabase:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'id and status required' }, { status: 400 });
    }
    const updated = await dbUpdateInquiryStatus(id, status);
    return NextResponse.json({ success: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Inquiry ID is required' }, { status: 400 });
    }
    const deleted = await dbDeleteInquiry(id);
    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
