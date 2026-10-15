import { NextResponse } from 'next/server';
import { dbGetCars, dbInsertCar, dbDeleteCar } from '@/lib/db';
import { INITIAL_CARS } from '@/lib/data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const make = searchParams.get('make') || undefined;
    const type = searchParams.get('type') || undefined;
    const city = searchParams.get('city') || undefined;
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const q = searchParams.get('q');

    let cars = await dbGetCars({ make, bodyType: type, city, minPrice, maxPrice });

    // Fallback to initial data if database is empty
    if (!cars || cars.length === 0) {
      cars = INITIAL_CARS;
    }

    if (q) {
      const query = q.toLowerCase();
      cars = cars.filter((c) =>
        `${c.make} ${c.model} ${c.variant}`.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({
      success: true,
      total: cars.length,
      cars,
    });
  } catch (error) {
    console.error('Error fetching cars from Supabase:', error);
    return NextResponse.json({
      success: true,
      total: INITIAL_CARS.length,
      cars: INITIAL_CARS,
      source: 'fallback',
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
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
    const body = await request.json();
    const { id, availabilityStatus } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Car ID is required' }, { status: 400 });
    }
    if (availabilityStatus) {
      const { dbUpdateCarAvailability } = await import('@/lib/db');
      const updated = await dbUpdateCarAvailability(id, availabilityStatus);
      return NextResponse.json({ success: updated, message: `Availability status set to ${availabilityStatus}` });
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
