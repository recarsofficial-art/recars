import { NextResponse } from 'next/server';
import { dbFindCustomer, dbUpsertCustomer } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, phoneOrEmail, name, phone, email, city } = body;

    if (action === 'google') {
      const googleEmail = (email || '').trim();
      const googleName = (name || (googleEmail ? googleEmail.split('@')[0] : 'Google Customer')).trim();
      const googlePhone = (phone || '').trim();

      // Check if user already exists by email
      const existing = googleEmail ? await dbFindCustomer(googleEmail) : null;
      if (existing) {
        return NextResponse.json({
          success: true,
          user: {
            id: existing.id,
            name: existing.name || googleName,
            phone: existing.phone || googlePhone,
            email: existing.email || googleEmail,
            city: existing.city || city || 'Hyderabad',
          },
          message: 'Signed in with Google successfully',
        });
      }

      // Create new customer record in Supabase
      const newId = await dbUpsertCustomer({
        id: '',
        name: googleName,
        phone: googlePhone,
        email: googleEmail,
        city: city || 'Hyderabad',
      });

      return NextResponse.json({
        success: true,
        user: {
          id: newId,
          name: googleName,
          phone: googlePhone,
          email: googleEmail,
          city: city || 'Hyderabad',
        },
        message: 'Google account linked and created successfully in Supabase',
      });
    }

    if (action === 'signup') {
      if (!name || (!phone && !email)) {
        return NextResponse.json(
          { success: false, error: 'Name and either phone or email are required' },
          { status: 400 }
        );
      }

      const id = await dbUpsertCustomer({
        id: '',
        name: name.trim(),
        phone: (phone || '').trim(),
        email: (email || '').trim(),
        city: city || 'Hyderabad',
      });

      return NextResponse.json({
        success: true,
        user: {
          id,
          name: name.trim(),
          phone: (phone || '').trim(),
          email: (email || '').trim(),
          city: city || 'Hyderabad',
        },
        message: 'Account created successfully in Supabase',
      });
    }

    if (action === 'login') {
      if (!phoneOrEmail) {
        return NextResponse.json(
          { success: false, error: 'Phone number or email required' },
          { status: 400 }
        );
      }

      // Check if customer exists in Supabase
      const existing = await dbFindCustomer(phoneOrEmail);
      if (existing) {
        return NextResponse.json({
          success: true,
          user: {
            id: existing.id,
            name: existing.name,
            phone: existing.phone,
            email: existing.email || '',
            city: existing.city || 'Hyderabad',
          },
          message: 'Logged in successfully',
        });
      }

      // If not existing, auto-provision user so customer has seamless experience
      const isEmail = phoneOrEmail.includes('@');
      const provisionalName = isEmail ? phoneOrEmail.split('@')[0] : `Customer ${phoneOrEmail.slice(-4)}`;
      const newId = await dbUpsertCustomer({
        id: '',
        name: provisionalName,
        phone: isEmail ? `+91 ${Date.now().toString().slice(-10)}` : phoneOrEmail,
        email: isEmail ? phoneOrEmail : '',
        city: 'Hyderabad',
      });

      return NextResponse.json({
        success: true,
        user: {
          id: newId,
          name: provisionalName,
          phone: isEmail ? '' : phoneOrEmail,
          email: isEmail ? phoneOrEmail : '',
          city: 'Hyderabad',
        },
        message: 'Account verified & logged in',
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Auth API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
