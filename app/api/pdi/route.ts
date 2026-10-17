import { NextResponse } from 'next/server';
import { dbGetPDIBookings, dbInsertPDIBooking, dbUpdatePDIBookingStatus, dbDeletePDIBooking } from '@/lib/db';
import { PDIBooking } from '@/lib/types';

export async function GET() {
  try {
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
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerEmail: body.customerEmail || '',
      city: body.city || 'Warangal',
      dealershipName: body.dealershipName,
      dealershipAddress: body.dealershipAddress || '',
      carMake: body.carMake,
      carModel: body.carModel,
      carVariant: body.carVariant || '',
      fuelType: body.fuelType || 'Petrol',
      transmission: body.transmission || 'Automatic',
      vinOrChassis: body.vinOrChassis || '',
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
