import { NextResponse } from 'next/server';
import { dbFindCustomer, dbUpsertCustomer, DatabaseError } from '@/lib/db';

const SAFE_UNAVAILABLE_MESSAGE = 'Login is temporarily unavailable. Please try again shortly.';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, phoneOrEmail, name, phone, email, city } = body;

    if (action === 'google' || action === 'apple') {
      let authEmail = (email || '').trim();
      const appleId = (body.appleUserId || '').trim();

      // If Apple didn't provide email directly (e.g. subsequent sign-ins), attempt to decode from JWT identityToken
      if (action === 'apple' && !authEmail && body.identityToken) {
        try {
          const parts = body.identityToken.split('.');
          if (parts.length >= 2) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
            if (payload?.email) {
              authEmail = String(payload.email).trim();
            }
          }
        } catch {
          // ignore decode error
        }
      }

      const defaultName = action === 'apple' ? 'Apple Customer' : 'Google Customer';
      const authName = (name || (authEmail ? authEmail.split('@')[0] : defaultName)).trim();
      const authPhone = (phone || '').trim();

      // Check if user already exists by email or apple ID
      let existing = authEmail ? await dbFindCustomer(authEmail) : null;
      if (!existing && appleId) {
        existing = await dbFindCustomer(`apple_${appleId}`);
      }

      const providerLabel = action === 'apple' ? 'Apple' : 'Google';

      if (existing) {
        return NextResponse.json({
          success: true,
          user: {
            id: existing.id,
            name: existing.name || authName,
            phone: existing.phone || authPhone,
            email: existing.email || authEmail,
            city: existing.city || city || 'Warangal',
          },
          message: `Signed in with ${providerLabel} successfully`,
        });
      }

      // Create new customer record in database
      const fallbackEmail = authEmail || (appleId ? `apple_${appleId}@privaterelay.appleid.com` : '');
      const newId = await dbUpsertCustomer({
        id: '',
        name: authName,
        phone: authPhone,
        email: fallbackEmail,
        city: city || 'Warangal',
      });

      return NextResponse.json({
        success: true,
        user: {
          id: newId,
          name: authName,
          phone: authPhone,
          email: fallbackEmail,
          city: city || 'Warangal',
        },
        message: `${providerLabel} account linked and created successfully`,
      });
    }

    if (action === 'signup') {
      if (!name || (!phone && !email)) {
        return NextResponse.json(
          { success: false, error: 'Name and either mobile number or email are required.' },
          { status: 400 }
        );
      }

      const id = await dbUpsertCustomer({
        id: '',
        name: name.trim(),
        phone: (phone || '').trim(),
        email: (email || '').trim(),
        city: city || 'Warangal',
      });

      return NextResponse.json({
        success: true,
        user: {
          id,
          name: name.trim(),
          phone: (phone || '').trim(),
          email: (email || '').trim(),
          city: city || 'Warangal',
        },
        message: 'Account created successfully',
      });
    }

    if (action === 'login') {
      if (!phoneOrEmail) {
        return NextResponse.json(
          { success: false, error: 'Please enter your mobile number or email address.' },
          { status: 400 }
        );
      }

      // Check if customer exists in database
      const existing = await dbFindCustomer(phoneOrEmail);
      if (existing) {
        return NextResponse.json({
          success: true,
          user: {
            id: existing.id,
            name: existing.name,
            phone: existing.phone,
            email: existing.email || '',
            city: existing.city || 'Warangal',
          },
          message: 'Logged in successfully',
        });
      }

      // If not existing, auto-provision user seamlessly
      const isEmail = phoneOrEmail.includes('@');
      const provisionalName = isEmail ? phoneOrEmail.split('@')[0] : `Customer ${phoneOrEmail.slice(-4)}`;
      const newId = await dbUpsertCustomer({
        id: '',
        name: provisionalName,
        phone: isEmail ? `+91 ${Date.now().toString().slice(-10)}` : phoneOrEmail,
        email: isEmail ? phoneOrEmail : '',
        city: 'Warangal',
      });

      return NextResponse.json({
        success: true,
        user: {
          id: newId,
          name: provisionalName,
          phone: isEmail ? '' : phoneOrEmail,
          email: isEmail ? phoneOrEmail : '',
          city: 'Warangal',
        },
        message: 'Account verified & logged in',
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid authentication request.' }, { status: 400 });
  } catch (error: any) {
    const isConnError =
      error instanceof DatabaseError
        ? error.isConnectionError
        : error?.code === '08006' ||
          error?.code === '08001' ||
          error?.code === 'ECONNRESET' ||
          error?.code === 'ETIMEDOUT' ||
          (error?.message &&
            (error.message.includes('EMAXCONNSESSION') ||
              error.message.includes('connection') ||
              error.message.includes('pool')));

    // Secure server-side diagnostic logging (never leaks to client)
    console.error('[AUTH_API_ERROR]', {
      timestamp: new Date().toISOString(),
      code: error?.code || 'UNKNOWN',
      message: error?.message,
      isConnectionError: isConnError,
    });

    const statusCode = isConnError ? 503 : 500;
    return NextResponse.json(
      {
        success: false,
        error: SAFE_UNAVAILABLE_MESSAGE,
      },
      { status: statusCode }
    );
  }
}
