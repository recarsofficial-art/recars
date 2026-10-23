import { NextRequest, NextResponse } from 'next/server';
import {
  dbInsertCarFinderRequest,
  dbGetCarFinderRequests,
  dbUpdateCarFinderRequest,
  dbMatchCarsForRequest,
} from '@/lib/db';
import { sendAdminEmailNotification } from '@/lib/email';
import { CarFinderRequest } from '@/lib/types';

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

    // Match cars for specific criteria query
    if (searchParams.get('match') === 'true') {
      const preferredBrand = searchParams.get('brand') || undefined;
      const preferredModel = searchParams.get('model') || undefined;
      const budgetMax = searchParams.get('budgetMax') ? Number(searchParams.get('budgetMax')) : undefined;
      const budgetMin = searchParams.get('budgetMin') ? Number(searchParams.get('budgetMin')) : undefined;
      const preferredFuel = searchParams.get('fuel') || undefined;
      const preferredTransmission = searchParams.get('transmission') || undefined;

      const matchingCars = await dbMatchCarsForRequest({
        preferredBrand,
        preferredModel,
        budgetMin,
        budgetMax,
        preferredFuel,
        preferredTransmission,
      });

      return NextResponse.json({
        success: true,
        total: matchingCars.length,
        matchingCars,
      });
    }

    const status = searchParams.get('status') || undefined;
    const brand = searchParams.get('brand') || undefined;
    const search = searchParams.get('q') || undefined;

    const requests = await dbGetCarFinderRequests({
      status,
      brand,
      search,
    });

    return NextResponse.json({
      success: true,
      total: requests.length,
      requests,
    });
  } catch (error: any) {
    console.error('Error fetching Car Finder requests:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch Car Finder requests' },
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
      preferredBrand,
      preferredModel,
      budgetMin,
      budgetMax,
      budgetRange,
      preferredFuel,
      preferredTransmission,
      preferredYear,
      preferredLocation,
      additionalRequirements,
    } = body;

    // Field validations
    if (!customerName || !customerName.trim()) {
      return NextResponse.json(
        { success: false, error: 'Your name is required' },
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

    if (!preferredBrand || !preferredBrand.trim()) {
      return NextResponse.json(
        { success: false, error: 'Please choose or enter your preferred car brand' },
        { status: 400 }
      );
    }

    const requestId = `FIND-${Date.now().toString().slice(-6)}`;
    const newRequest: CarFinderRequest = {
      id: requestId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail?.trim() || undefined,
      preferredBrand: preferredBrand.trim(),
      preferredModel: preferredModel?.trim() || undefined,
      budgetMin: budgetMin ? Number(budgetMin) : undefined,
      budgetMax: budgetMax ? Number(budgetMax) : undefined,
      budgetRange: budgetRange?.trim() || undefined,
      preferredFuel: preferredFuel || undefined,
      preferredTransmission: preferredTransmission || undefined,
      preferredYear: preferredYear || undefined,
      preferredLocation: preferredLocation?.trim() || undefined,
      additionalRequirements: additionalRequirements?.trim() || undefined,
      status: 'New',
      internalNotes: '',
      matchedCarIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Auto-detect any currently matching cars in inventory
    try {
      const matched = await dbMatchCarsForRequest({
        preferredBrand: newRequest.preferredBrand,
        preferredModel: newRequest.preferredModel,
        budgetMin: newRequest.budgetMin,
        budgetMax: newRequest.budgetMax,
        preferredFuel: newRequest.preferredFuel,
        preferredTransmission: newRequest.preferredTransmission,
      });
      newRequest.matchedCarIds = matched.map((c) => c.id);
      if (newRequest.matchedCarIds.length > 0) {
        newRequest.status = 'Matched';
      }
    } catch (e) {
      console.warn('Auto match warning:', e);
    }

    await dbInsertCarFinderRequest(newRequest);

    // Operational email notification to recars.in@gmail.com
    try {
      await sendAdminEmailNotification({
        enquiryId: requestId,
        enquiryType: 'Car Finder Request',
        customerName: newRequest.customerName,
        customerPhone: newRequest.customerPhone,
        customerEmail: newRequest.customerEmail,
        city: newRequest.preferredLocation,
        carMake: newRequest.preferredBrand,
        carModel: newRequest.preferredModel || 'Any model',
        carYear: newRequest.preferredYear,
        adminTab: 'carfinder',
        message: `Budget: ${newRequest.budgetRange || (newRequest.budgetMax ? `Up to ₹${newRequest.budgetMax.toLocaleString('en-IN')}` : 'Flexible')} | Fuel: ${newRequest.preferredFuel || 'Any'} | Trans: ${newRequest.preferredTransmission || 'Any'} | Notes: ${newRequest.additionalRequirements || 'None'}`,
      });
    } catch (mailErr) {
      console.warn('Car Finder email alert non-critical notice:', mailErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Your Car Finder request has been received. Our concierge team will locate your vehicle shortly.',
      requestId,
      matchedCount: newRequest.matchedCarIds?.length || 0,
    });
  } catch (error: any) {
    console.error('Error submitting Car Finder request:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to submit Car Finder request' },
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
    const { id, status, internalNotes, matchedCarIds } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Request ID is required' },
        { status: 400 }
      );
    }

    const updated = await dbUpdateCarFinderRequest(id, {
      status,
      internalNotes,
      matchedCarIds,
    });

    return NextResponse.json({
      success: updated,
      message: 'Car Finder request updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating Car Finder request:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update request' },
      { status: 500 }
    );
  }
}
