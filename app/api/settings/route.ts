import { NextResponse } from 'next/server';
import { dbGetInspectionConfig, dbUpdateInspectionConfig } from '@/lib/db';
import { cookies } from 'next/headers';

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

export async function GET() {
  try {
    const config = await dbGetInspectionConfig();
    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin authentication required.' }, { status: 403 });
    }

    const body = await request.json();
    const updated = await dbUpdateInspectionConfig(body);
    return NextResponse.json({ success: true, config: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
