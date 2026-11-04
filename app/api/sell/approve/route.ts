import { NextResponse } from 'next/server';
import { dbApproveAndPublishCustomerCar } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/security';

export async function POST(request: Request) {
  try {
    const admin = await verifyAdminRequest(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required to approve vehicle listings.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { requestId, listingPrice, image, galleryImages, city, locationArea, inspectionScore, isVerified, isSelect, description } = body;

    if (!requestId) {
      return NextResponse.json({ success: false, error: 'requestId is required' }, { status: 400 });
    }

    const result = await dbApproveAndPublishCustomerCar({
      requestId,
      listingPrice: listingPrice ? Number(listingPrice) : undefined,
      image,
      galleryImages,
      city,
      locationArea,
      inspectionScore: inspectionScore ? Number(inspectionScore) : undefined,
      isVerified,
      isSelect,
      description,
    });

    return NextResponse.json({
      success: true,
      message: 'Vehicle approved and published to website successfully!',
      car: result.car,
      carId: result.car.id,
      requestId: result.requestId,
    });
  } catch (error: any) {
    console.error('Error approving and publishing customer car:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to approve car' },
      { status: 500 }
    );
  }
}
