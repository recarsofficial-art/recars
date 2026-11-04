import { NextResponse } from 'next/server';
import { dbGetCustomerCars, dbInsertCustomerCar, dbUpdateCustomerCarStatus } from '@/lib/db';
import { SellRequest } from '@/lib/types';
import { sendEnquiryNotification } from '@/lib/email';
import { verifyAdminRequest, checkRateLimit, getClientIp } from '@/lib/security';

export async function GET(request: Request) {
  try {
    const admin = await verifyAdminRequest(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required to access customer vehicle sell requests.' },
        { status: 401 }
      );
    }

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
    const clientIp = getClientIp(request);
    const limit = checkRateLimit(`sell-submit:${clientIp}`, 15, 10 * 60);
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many sell requests submitted. Please wait a few minutes before trying again.' },
        { status: 429 }
      );
    }

    const body: SellRequest = await request.json();

    if (!body || !body.sellerName || !body.sellerPhone || !body.make || !body.model) {
      return NextResponse.json(
        { success: false, error: 'Seller name, mobile number, make, and model are required.' },
        { status: 400 }
      );
    }

    const requestId = body.id || `REC-SELL-${Date.now().toString().slice(-5)}`;
    const fullRequest: SellRequest = {
      ...body,
      id: requestId,
      sellerName: body.sellerName.trim(),
      sellerPhone: body.sellerPhone.trim(),
      make: body.make.trim(),
      model: body.model.trim(),
      status: body.status || 'Inspection Scheduled',
      createdAt: body.createdAt || new Date().toISOString(),
    };

    await dbInsertCustomerCar(fullRequest);

    // Trigger email alert to recars.in@gmail.com
    sendEnquiryNotification({
      enquiryId: requestId,
      enquiryType: 'Sell Car Request',
      customerName: fullRequest.sellerName,
      customerPhone: fullRequest.sellerPhone,
      city: fullRequest.sellerCity,
      carMake: fullRequest.make,
      carModel: fullRequest.model,
      carVariant: fullRequest.variant,
      carYear: fullRequest.year,
      preferredDate: fullRequest.preferredInspectionDate,
      preferredTimeSlot: fullRequest.preferredInspectionTime,
      offeredPrice: fullRequest.estimatedPriceMin,
      listedPrice: fullRequest.estimatedPriceMax,
      message: `Customer wants to sell ${fullRequest.year} ${fullRequest.make} ${fullRequest.model} (${fullRequest.variant || 'Standard'}). Reg: ${fullRequest.registrationNumber || 'Pending'}. Mileage: ${fullRequest.kilometers?.toLocaleString('en-IN') || 0} km. Estimated Range: ₹${fullRequest.estimatedPriceMin?.toLocaleString('en-IN') || 0} - ₹${fullRequest.estimatedPriceMax?.toLocaleString('en-IN') || 0}. Inspection: ${fullRequest.preferredInspectionDate} (${fullRequest.preferredInspectionTime}).`,
      adminTab: 'leads',
      createdAt: fullRequest.createdAt,
    }).catch((err) => console.error('Notice: sell request notification trigger error:', err));

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
    const admin = await verifyAdminRequest(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required to update sell request status.' },
        { status: 401 }
      );
    }

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
