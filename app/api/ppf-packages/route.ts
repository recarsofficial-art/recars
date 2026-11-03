import { NextRequest, NextResponse } from 'next/server';
import { dbGetPPFPackages, dbUpsertPPFPackage, dbDeletePPFPackage } from '@/lib/db';
import { PPFSpecificationPackage } from '@/lib/types';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const packages = await dbGetPPFPackages();
    return NextResponse.json({
      success: true,
      packages,
    });
  } catch (error: any) {
    console.error('Error fetching PPF packages:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch PPF packages' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      title,
      brand,
      microns,
      finishType,
      warrantyYears,
      mrp,
      discountPercent,
      offerPrice,
      validityDate,
      images,
      features,
      location,
      contactPhones,
      isActive,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Package title is required' },
        { status: 400 }
      );
    }

    if (!brand || !brand.trim()) {
      return NextResponse.json(
        { success: false, error: 'PPF brand is required (e.g. The Detailing Mafia, 3M, Garware, Llumar)' },
        { status: 400 }
      );
    }

    if (!microns || !microns.trim()) {
      return NextResponse.json(
        { success: false, error: 'PPF thickness / microns specification is required (e.g. 180 Micron TPU, 200 Micron)' },
        { status: 400 }
      );
    }

    const packageId = id || `ppf-${Date.now()}`;
    const calculatedDiscount = Number(discountPercent) || 0;
    const numMrp = Number(mrp) || 0;
    const calculatedOfferPrice =
      Number(offerPrice) > 0
        ? Number(offerPrice)
        : calculatedDiscount > 0 && numMrp > 0
        ? Math.round(numMrp * (1 - calculatedDiscount / 100))
        : numMrp;

    const pkg: PPFSpecificationPackage = {
      id: packageId,
      title: title.trim(),
      brand: brand.trim(),
      microns: microns.trim(),
      finishType: finishType?.trim() || 'Gloss PPF',
      warrantyYears: warrantyYears?.trim() || '5 Year Warranty',
      mrp: numMrp,
      discountPercent: calculatedDiscount,
      offerPrice: calculatedOfferPrice,
      validityDate: validityDate?.trim() || '',
      images: Array.isArray(images) && images.length > 0 ? images : ['/ppf/ppf-studio-launch.jpg'],
      features: Array.isArray(features) ? features : [],
      location: location?.trim() || 'Tellapur - Osman Nagar Road',
      contactPhones: Array.isArray(contactPhones) ? contactPhones : ['9032172211', '7780267514'],
      isActive: isActive !== false,
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await dbUpsertPPFPackage(pkg);

    return NextResponse.json({
      success: true,
      package: saved,
      message: 'PPF package and specifications saved successfully',
    });
  } catch (error: any) {
    console.error('Error saving PPF package:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to save PPF package' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const packageId = searchParams.get('id');
    const imageUrl = searchParams.get('imageUrl');

    // Option 1: Delete an uploaded picture file
    if (imageUrl) {
      if (imageUrl.startsWith('/uploads/') || imageUrl.startsWith('/ppf/')) {
        const filePath = path.join(process.cwd(), 'public', imageUrl);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (e) {
            console.warn('Failed to delete file on disk:', e);
          }
        }
      }
      return NextResponse.json({
        success: true,
        message: 'Image removed successfully',
      });
    }

    // Option 2: Delete a PPF specification package
    if (!packageId) {
      return NextResponse.json(
        { success: false, error: 'Package ID or Image URL is required for deletion' },
        { status: 400 }
      );
    }

    const success = await dbDeletePPFPackage(packageId);

    return NextResponse.json({
      success,
      message: 'PPF specification package deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting PPF package:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete PPF package' },
      { status: 500 }
    );
  }
}

