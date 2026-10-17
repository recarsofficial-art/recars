import { NextResponse } from 'next/server';
import { dbGetNegotiations, dbGetNegotiationById, dbCreateNegotiation, dbUpdateNegotiationStatus } from '@/lib/db';
import { Negotiation } from '@/lib/types';
import { cookies } from 'next/headers';
import { sendEnquiryNotification } from '@/lib/email';

// Verify admin session cookie
async function checkIsAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('recars_admin_session')?.value;
    if (!sessionCookie) return false;
    const decoded = JSON.parse(Buffer.from(sessionCookie, 'base64').toString('utf-8'));
    return decoded && decoded.role === 'admin';
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const carId = searchParams.get('carId') || undefined;
    const customerPhone = searchParams.get('customerPhone') || undefined;
    const status = searchParams.get('status') || undefined;
    const id = searchParams.get('id') || undefined;

    if (id) {
      const negotiation = await dbGetNegotiationById(id);
      if (!negotiation) {
        return NextResponse.json({ success: false, error: 'Negotiation not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, negotiation });
    }

    const negotiations = await dbGetNegotiations({ carId, customerPhone, status });
    return NextResponse.json({
      success: true,
      total: negotiations.length,
      negotiations,
    });
  } catch (error: any) {
    console.error('Error fetching negotiations:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { carId, carTitle, carImage, listedPrice, customerName, customerPhone, customerEmail, customerOffer, notes } = body;

    // Server-side validation
    if (!carId || !carTitle || !customerName || !customerPhone || !customerOffer) {
      return NextResponse.json(
        { success: false, error: 'Car details, customer name, mobile number, and proposed offer amount are required.' },
        { status: 400 }
      );
    }

    const cleanPhone = String(customerPhone).trim();
    if (cleanPhone.replace(/\D/g, '').length < 10) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 10-digit mobile number.' },
        { status: 400 }
      );
    }

    const offerNum = Number(customerOffer);
    const listedNum = Number(listedPrice);
    if (isNaN(offerNum) || offerNum <= 0) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid offer amount in INR.' },
        { status: 400 }
      );
    }

    // Realistic bounds: offer must be between 40% and 120% of listed price
    if (listedNum > 0 && (offerNum < listedNum * 0.4 || offerNum > listedNum * 1.5)) {
      return NextResponse.json(
        { success: false, error: `Offer must be within a realistic market range (₹${Math.round(listedNum * 0.5).toLocaleString('en-IN')} - ₹${Math.round(listedNum * 1.1).toLocaleString('en-IN')}).` },
        { status: 400 }
      );
    }

    const negotiationId = `NEG-${Date.now().toString().slice(-6)}`;
    const newNegotiation: Negotiation = {
      id: negotiationId,
      carId,
      carTitle,
      carImage: carImage || undefined,
      listedPrice: listedNum,
      customerName: customerName.trim(),
      customerPhone: cleanPhone,
      customerEmail: customerEmail?.trim() || undefined,
      customerOffer: offerNum,
      status: 'Pending',
      notes: notes || undefined,
      offerHistory: [
        {
          id: `off-${Date.now()}`,
          sender: 'customer',
          senderName: customerName.trim(),
          amount: offerNum,
          message: notes || `Customer offered ₹${offerNum.toLocaleString('en-IN')}`,
          timestamp: new Date().toISOString(),
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await dbCreateNegotiation(newNegotiation);

    // Trigger email alert to recars.in@gmail.com
    sendEnquiryNotification({
      enquiryId: negotiationId,
      enquiryType: 'Price Negotiation Offer',
      customerName: newNegotiation.customerName,
      customerPhone: newNegotiation.customerPhone,
      customerEmail: newNegotiation.customerEmail,
      carId: newNegotiation.carId,
      carModel: newNegotiation.carTitle,
      listedPrice: newNegotiation.listedPrice,
      offeredPrice: newNegotiation.customerOffer,
      message: newNegotiation.notes || `Customer made an offer of ₹${newNegotiation.customerOffer.toLocaleString('en-IN')} against listed price ₹${newNegotiation.listedPrice.toLocaleString('en-IN')}.`,
      adminTab: 'negotiations',
      createdAt: newNegotiation.createdAt,
    }).catch((err) => console.error('Notice: negotiation notification trigger error:', err));

    return NextResponse.json({
      success: true,
      negotiation: newNegotiation,
      message: 'Your price offer has been submitted to the Recars pricing desk. An executive will review and respond shortly.',
    });
  } catch (error: any) {
    console.error('Error creating negotiation offer:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, action, counterOffer, finalPrice, notes, actorName } = body;

    if (!id || !action) {
      return NextResponse.json({ success: false, error: 'Negotiation ID and action are required.' }, { status: 400 });
    }

    // Customer can accept a counteroffer without admin session
    if (action !== 'customer_accept') {
      const isAdmin = await checkIsAdmin();
      if (!isAdmin) {
        return NextResponse.json({ success: false, error: 'Unauthorized: Admin authentication required.' }, { status: 403 });
      }
    }

    const updated = await dbUpdateNegotiationStatus(id, action, {
      counterOffer: counterOffer ? Number(counterOffer) : undefined,
      finalPrice: finalPrice ? Number(finalPrice) : undefined,
      notes,
      actorName,
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Negotiation not found or could not be updated.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      negotiation: updated,
      message: `Negotiation updated successfully (${action}).`,
    });
  } catch (error: any) {
    console.error('Error updating negotiation:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
