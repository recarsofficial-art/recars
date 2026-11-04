import { NextResponse } from 'next/server';
import { dbGetPDIBookings, dbInsertPDIBooking, dbUpdatePDIBookingStatus, dbDeletePDIBooking } from '@/lib/db';
import { PDIBooking } from '@/lib/types';
import { sendEnquiryNotification } from '@/lib/email';
import { verifyAdminRequest, checkRateLimit, getClientIp } from '@/lib/security';

export async function GET(request: Request) {
  try {
    const admin = await verifyAdminRequest(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required to access PDI bookings.' },
        { status: 401 }
      );
    }

    const bookings = await dbGetPDIBookings();
    return NextResponse.json({
      success: true,
      total: bookings.length,
      bookings,
    });
  } catch (error: any) {
    console.error('Error fetching PDI bookings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const limit = checkRateLimit(`pdi-submit:${clientIp}`, 15, 10 * 60);
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many PDI requests submitted. Please wait a few minutes before trying again.' },
        { status: 429 }
      );
    }

    const body: Partial<PDIBooking> = await request.json();

    if (!body.customerName || !body.customerPhone || !body.dealershipName || !body.carMake || !body.carModel || !body.preferredDate) {
      return NextResponse.json(
        { success: false, error: 'Customer name, phone, dealership name, car make/model, and date are required' },
        { status: 400 }
      );
    }

    const id = body.id || `PDI-${Date.now().toString().slice(-6)}`;
    const newBooking: PDIBooking = {
      id,
      customerName: body.customerName.trim(),
      customerPhone: body.customerPhone.trim(),
      customerEmail: body.customerEmail?.trim() || '',
      city: body.city?.trim() || 'Warangal',
      dealershipName: body.dealershipName.trim(),
      dealershipAddress: body.dealershipAddress?.trim() || '',
      carMake: body.carMake.trim(),
      carModel: body.carModel.trim(),
      carVariant: body.carVariant?.trim() || '',
      fuelType: body.fuelType || 'Petrol',
      transmission: body.transmission || 'Automatic',
      vinOrChassis: body.vinOrChassis?.trim() || '',
      preferredDate: body.preferredDate,
      preferredTimeSlot: body.preferredTimeSlot || 'Morning 10:00 AM - 12:00 PM',
      specialInstructions: body.specialInstructions || '',
      packageType: body.packageType || 'Standard PDI',
      fee: body.fee || 2499,
      paymentStatus: body.paymentStatus || 'Pay on Inspection',
      status: body.status || 'Booked',
      assignedRepresentative: body.assignedRepresentative,
      createdAt: body.createdAt || new Date().toISOString(),
    };

    await dbInsertPDIBooking(newBooking);

    // Trigger email alert to recars.in@gmail.com
    sendEnquiryNotification({
      enquiryId: id,
      enquiryType: 'Pre-Delivery Inspection (PDI)',
      customerName: newBooking.customerName,
      customerPhone: newBooking.customerPhone,
      customerEmail: newBooking.customerEmail,
      city: newBooking.city,
      carMake: newBooking.carMake,
      carModel: newBooking.carModel,
      carVariant: newBooking.carVariant,
      dealershipName: newBooking.dealershipName,
      dealershipAddress: newBooking.dealershipAddress,
      preferredDate: newBooking.preferredDate,
      preferredTimeSlot: newBooking.preferredTimeSlot,
      packageType: newBooking.packageType,
      fee: newBooking.fee,
      paymentStatus: newBooking.paymentStatus,
      message: `PDI Booking for ${newBooking.carMake} ${newBooking.carModel} (${newBooking.carVariant || 'Standard'}). Dealership: ${newBooking.dealershipName}, ${newBooking.dealershipAddress}. Date: ${newBooking.preferredDate} (${newBooking.preferredTimeSlot}). Package: ${newBooking.packageType} (₹${newBooking.fee}, ${newBooking.paymentStatus}). Notes: ${newBooking.specialInstructions || 'None'}`,
      adminTab: 'pdi',
      createdAt: newBooking.createdAt,
    }).catch((err) => console.error('Notice: PDI notification trigger error:', err));

    return NextResponse.json({
      success: true,
      bookingId: id,
      message: 'Pre-Delivery Inspection booked successfully! A certified representative will come check your new car at the dealership.',
      booking: newBooking,
    });
  } catch (error: any) {
    console.error('Error saving PDI booking:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await verifyAdminRequest(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required to update PDI bookings.' },
        { status: 401 }
      );
    }

    const { id, status, assignedRepresentative } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'Booking ID and status are required' }, { status: 400 });
    }
    const updated = await dbUpdatePDIBookingStatus(id, status, assignedRepresentative);
    return NextResponse.json({ success: updated });
  } catch (error: any) {
    console.error('Error updating PDI booking status:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await verifyAdminRequest(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required to delete PDI bookings.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Booking ID is required' }, { status: 400 });
    }
    const deleted = await dbDeletePDIBooking(id);
    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    console.error('Error deleting PDI booking:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
