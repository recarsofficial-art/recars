import { NextResponse } from 'next/server';
import { dbGetInquiries, dbInsertInquiry, dbUpdateInquiryStatus, dbDeleteInquiry } from '@/lib/db';
import { CarInquiry } from '@/lib/types';
import { sendEnquiryNotification } from '@/lib/email';
import { verifyAdminRequest, checkRateLimit, getClientIp } from '@/lib/security';

export async function GET(request: Request) {
  try {
    const admin = await verifyAdminRequest(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required to access customer inquiries.' },
        { status: 401 }
      );
    }

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
    const clientIp = getClientIp(request);
    const limit = checkRateLimit(`inquiry-submit:${clientIp}`, 15, 10 * 60);
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many inquiries submitted. Please wait a few minutes before submitting again.' },
        { status: 429 }
      );
    }

    const body: CarInquiry = await request.json();

    if (!body || !body.userName || !body.userPhone) {
      return NextResponse.json(
        { success: false, error: 'Name and phone number are required.' },
        { status: 400 }
      );
    }

    const id = body.id || `inq-${Date.now().toString().slice(-5)}`;
    const newInquiry: CarInquiry = {
      ...body,
      id,
      userName: body.userName.trim(),
      userPhone: body.userPhone.trim(),
      userEmail: body.userEmail?.trim() || '',
      status: body.status || 'New',
      createdAt: body.createdAt || new Date().toISOString(),
    };

    await dbInsertInquiry(newInquiry);

    // Trigger email alert to recars.in@gmail.com
    sendEnquiryNotification({
      enquiryId: id,
      enquiryType: newInquiry.inquiryType || 'Car Inquiry',
      customerName: newInquiry.userName,
      customerPhone: newInquiry.userPhone,
      customerEmail: newInquiry.userEmail,
      city: newInquiry.city,
      message: newInquiry.message,
      carId: newInquiry.carId,
      carPrice: newInquiry.carPrice,
      carModel: newInquiry.carTitle,
      adminTab: 'inquiries',
      createdAt: newInquiry.createdAt,
    }).catch((err) => console.error('Notice: inquiry notification trigger error:', err));

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
    const admin = await verifyAdminRequest(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required to update inquiry status.' },
        { status: 401 }
      );
    }

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
    const admin = await verifyAdminRequest(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required to delete inquiries.' },
        { status: 401 }
      );
    }

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
