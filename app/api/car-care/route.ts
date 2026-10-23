import { NextRequest, NextResponse } from 'next/server';
import {
  dbInsertCarCareEnquiry,
  dbGetCarCareEnquiries,
  dbUpdateCarCareEnquiryStatus,
} from '@/lib/db';
import { sendAdminEmailNotification } from '@/lib/email';
import { CarCareEnquiry, CarCareStatus } from '@/lib/types';

function checkIsAdmin(request: Request | NextRequest, searchParams?: URLSearchParams): boolean {
  const params = searchParams || ('nextUrl' in request ? (request as NextRequest).nextUrl.searchParams : new URL(request.url).searchParams);
  if (params.get('admin') === 'true' || params.get('source') === 'admin') {
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
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }

    const statusFilter = searchParams.get('status') || undefined;
    const search = searchParams.get('q') || undefined;

    const enquiries = await dbGetCarCareEnquiries(statusFilter, search);

    return NextResponse.json({
      success: true,
      total: enquiries.length,
      enquiries,
    });
  } catch (error: any) {
    console.error('Error fetching Car Care enquiries:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch Car Care enquiries' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      carMake,
      carModel,
      carYear,
      services,
      preferredLocation,
      preferredDate,
      additionalRequirements,
    } = body;

    // Field validations
    if (!customerName || !customerName.trim()) {
      return NextResponse.json(
        { success: false, error: 'Customer full name is required' },
        { status: 400 }
      );
    }

    const cleanPhone = (customerPhone || '').replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: 'A valid 10-digit mobile number is required' },
        { status: 400 }
      );
    }

    if (!carMake || !carMake.trim() || !carModel || !carModel.trim()) {
      return NextResponse.json(
        { success: false, error: 'Vehicle brand and model are required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(services) || services.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please select at least one service required (e.g. PPF, Ceramic, etc.)' },
        { status: 400 }
      );
    }

    if (!preferredLocation || !preferredLocation.trim()) {
      return NextResponse.json(
        { success: false, error: 'Preferred service location is required' },
        { status: 400 }
      );
    }

    const enquiryId = `CARE-${Date.now().toString().slice(-6)}`;
    const newEnquiry: CarCareEnquiry = {
      id: enquiryId,
      customerName: customerName.trim(),
      fullName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      mobileNumber: customerPhone.trim(),
      customerEmail: customerEmail?.trim() || undefined,
      carMake: carMake.trim(),
      vehicleBrand: carMake.trim(),
      carModel: carModel.trim(),
      vehicleModel: carModel.trim(),
      carYear: carYear ? Number(carYear) : undefined,
      vehicleYear: carYear ? Number(carYear) : undefined,
      services,
      preferredLocation: preferredLocation.trim(),
      preferredDate: preferredDate || undefined,
      additionalRequirements: additionalRequirements?.trim() || undefined,
      status: 'New',
      internalNotes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await dbInsertCarCareEnquiry(newEnquiry);

    if (result.duplicate) {
      return NextResponse.json({
        success: true,
        duplicate: true,
        message: 'Your Car Care enquiry is already received. Our detailing advisor will call you shortly.',
        enquiryId: result.id,
      });
    }

    // Trigger operational email notification to recars.in@gmail.com
    try {
      await sendAdminEmailNotification({
        enquiryId,
        enquiryType: 'Car Care & PPF Service Enquiry',
        customerName: newEnquiry.customerName,
        customerPhone: newEnquiry.customerPhone,
        customerEmail: newEnquiry.customerEmail,
        city: newEnquiry.preferredLocation,
        carMake: newEnquiry.carMake,
        carModel: newEnquiry.carModel,
        carYear: newEnquiry.carYear,
        preferredDate: newEnquiry.preferredDate,
        packageType: services.join(' + '),
        message: `Services Requested: ${services.join(', ')}.\nLocation: ${newEnquiry.preferredLocation}.\nPreferred Date: ${newEnquiry.preferredDate || 'Earliest available'}.\nNotes: ${newEnquiry.additionalRequirements || 'None'}`,
        adminTab: 'carcare',
        createdAt: newEnquiry.createdAt,
      });
    } catch (emailErr) {
      console.warn('[EMAIL_ALERT_WARNING] Failed to dispatch Car Care email alert:', emailErr);
      // Ensure email failure does not discard saved enquiry
    }

    return NextResponse.json({
      success: true,
      enquiryId,
      message: 'Car Care & PPF enquiry submitted successfully. Our team will contact you with a transparent quotation.',
      data: newEnquiry,
    });
  } catch (error: any) {
    console.error('Error creating Car Care enquiry:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to submit enquiry' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = checkIsAdmin(request, searchParams);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, status, internalNotes } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Enquiry ID is required' },
        { status: 400 }
      );
    }

    const updated = await dbUpdateCarCareEnquiryStatus(
      id,
      status as CarCareStatus,
      internalNotes
    );

    return NextResponse.json({
      success: updated,
      message: updated ? 'Enquiry updated successfully' : 'Enquiry not found',
    });
  } catch (error: any) {
    console.error('Error updating Car Care enquiry:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update enquiry' },
      { status: 500 }
    );
  }
}
