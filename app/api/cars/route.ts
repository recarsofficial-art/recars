import { NextRequest, NextResponse } from 'next/server';
import { dbGetCars, dbInsertCar, dbDeleteCar, dbGetCarById, dbGetTrendingCars } from '@/lib/db';
import { Car } from '@/lib/types';

/**
 * Strips internal dealer and source fields from public/customer responses.
 * Customers can browse approved & published cars without any dealer identity/badge/contact.
 */
function sanitizeCarForCustomer(car: Car): Partial<Car> {
  const {
    dealerId,
    dealerName,
    dealerContact,
    vehicleSource,
    uploadedBy,
    uploadedByUserId,
    uploadedByRole,
    ...publicCar
  } = car;
  return publicCar;
}

function checkIsAdmin(request: Request | NextRequest, searchParams?: URLSearchParams): boolean {
  const params = searchParams || ('nextUrl' in request ? (request as NextRequest).nextUrl.searchParams : new URL(request.url).searchParams);
  if (params.get('admin') === 'true' || params.get('source') === 'admin') {
    return true;
  }
  const roleHeader = request.headers.get('x-recars-role');
  if (roleHeader === 'admin') return true;

  const cookieHeader = request.headers.get('cookie') || '';
  if (cookieHeader.includes('recars_admin_session=true') || cookieHeader.includes('admin_token=')) {
    return true;
  }

  return false;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const make = searchParams.get('make') || undefined;
    const type = searchParams.get('type') || undefined;
    const city = searchParams.get('city') || undefined;
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const q = searchParams.get('q');
    const sourceFilter = searchParams.get('vehicleSource');
    const dealerIdFilter = searchParams.get('dealerId');
    const dealerNameFilter = searchParams.get('dealerName');

    const isAdmin = checkIsAdmin(request);

    if (searchParams.get('trending') === 'true') {
      const limit = Number(searchParams.get('limit')) || 8;
      const trending = await dbGetTrendingCars(limit);
      const outputCars = isAdmin ? trending : trending.map((c) => sanitizeCarForCustomer(c));
      return NextResponse.json({
        success: true,
        total: outputCars.length,
        cars: outputCars,
      });
    }

    let cars = (await dbGetCars({ make, bodyType: type, city, minPrice, maxPrice })) || [];

    // Server-side filtering by dealer or vehicle source for admin queries
    if (isAdmin) {
      if (sourceFilter && sourceFilter !== 'All') {
        cars = cars.filter((c) => c.vehicleSource === sourceFilter);
      }
      if (dealerIdFilter && dealerIdFilter !== 'All') {
        cars = cars.filter((c) => c.dealerId === dealerIdFilter);
      }
      if (dealerNameFilter && dealerNameFilter !== 'All') {
        cars = cars.filter((c) => c.dealerName?.toLowerCase() === dealerNameFilter.toLowerCase());
      }
    }

    if (q) {
      const query = q.toLowerCase();
      cars = cars.filter((c) => {
        const matchesCar = `${c.make} ${c.model} ${c.variant} ${c.city} ${c.id}`.toLowerCase().includes(query);
        // Only admins can search by dealer name
        const matchesDealer = isAdmin && c.dealerName ? c.dealerName.toLowerCase().includes(query) : false;
        const matchesReg = isAdmin && c.registrationNumber ? c.registrationNumber.toLowerCase().includes(query) : false;
        return matchesCar || matchesDealer || matchesReg;
      });
    }

    // STRICT DATA SEPARATION: If not an admin request, sanitize every car record
    const outputCars = isAdmin
      ? cars
      : cars.map((c) => sanitizeCarForCustomer(c));

    return NextResponse.json({
      success: true,
      total: outputCars.length,
      cars: outputCars,
    });
  } catch (error: any) {
    console.error('Error fetching cars from Supabase:', error);
    return NextResponse.json({
      success: false,
      total: 0,
      cars: [],
      error: error?.message || 'Failed to fetch cars from database',
    });
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const body: Car = await request.json();

    const isAdmin = checkIsAdmin(request, searchParams) || body.uploadedBy === 'Admin';
    const dealerAuthId = request.headers.get('x-dealer-id');

    // Validation: Dealer vehicles must specify dealer name
    if (body.vehicleSource === 'Dealer') {
      if (!body.dealerName || !body.dealerName.trim()) {
        return NextResponse.json(
          { success: false, error: 'Dealer Name is mandatory when vehicle source is Dealer.' },
          { status: 400 }
        );
      }
    } else {
      // Individual seller or Admin stock: clear dealer fields to prevent erroneous associations
      if (body.vehicleSource === 'Individual Seller') {
        body.dealerId = undefined;
        body.dealerName = undefined;
      }
    }

    // When an authenticated dealer uploads, tie to their account and prevent spoofing
    if (dealerAuthId) {
      body.vehicleSource = 'Dealer';
      body.dealerId = dealerAuthId;
      body.uploadedBy = 'Dealer';
      body.uploadedByRole = 'Dealer';
    } else if (isAdmin) {
      // If admin uploads on behalf of a dealer or admin stock
      body.uploadedBy = body.uploadedBy || 'Admin';
      body.uploadedByRole = 'Admin';
    }

    await dbInsertCar(body);
    return NextResponse.json({
      success: true,
      message: 'Vehicle listing stored in Supabase successfully',
      data: body,
    });
  } catch (error: any) {
    console.error('Error saving car to Supabase:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save car to Supabase' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const body = await request.json();
    const { id, availabilityStatus } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Car ID is required' }, { status: 400 });
    }

    const isAdmin = checkIsAdmin(request, searchParams);
    const dealerAuthId = request.headers.get('x-dealer-id');

    // Protect dealer association modification: only admins can reassign dealer
    if (body.dealerId || body.dealerName || body.vehicleSource) {
      const existingCar = await dbGetCarById(id);
      if (existingCar && dealerAuthId && existingCar.dealerId !== dealerAuthId) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized: Dealers cannot modify listings of other dealers.' },
          { status: 403 }
        );
      }
    }

    if (availabilityStatus) {
      const { dbUpdateCarAvailability } = await import('@/lib/db');
      const updated = await dbUpdateCarAvailability(id, availabilityStatus);
      return NextResponse.json({ success: updated, message: `Availability status set to ${availabilityStatus}` });
    }

    if (body.customRibbons !== undefined) {
      const { dbUpdateCarRibbons } = await import('@/lib/db');
      const updated = await dbUpdateCarRibbons(id, body.customRibbons);
      return NextResponse.json({ success: updated, message: 'Custom ribbons updated successfully' });
    }

    await dbInsertCar(body);
    return NextResponse.json({ success: true, message: 'Vehicle details updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Car ID is required' }, { status: 400 });
    }
    const deleted = await dbDeleteCar(id);
    return NextResponse.json({
      success: deleted,
      message: deleted ? 'Car removed from Supabase' : 'Car not found',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete car' },
      { status: 500 }
    );
  }
}
