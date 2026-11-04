import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { signAdminSession, verifyAdminRequest, checkRateLimit, getClientIp } from '@/lib/security';

const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'Recars.in@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AdminRecars@2026';

function getAllowedAdminEmails(): string[] {
  const envList = process.env.ADMIN_ALLOWED_EMAILS || '';
  const parsed = envList
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  parsed.push(DEFAULT_ADMIN_EMAIL.toLowerCase());
  parsed.push('recars.in@gmail.com');
  return Array.from(new Set(parsed));
}

export async function GET(request: Request) {
  try {
    const verifiedAdmin = await verifyAdminRequest(request);

    if (!verifiedAdmin) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    return NextResponse.json({
      authenticated: true,
      admin: {
        id: verifiedAdmin.id,
        email: verifiedAdmin.email,
        name: verifiedAdmin.name || 'Operations Administrator',
        role: 'admin',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ authenticated: false, error: 'Session verification failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, password, name } = body;
    const clientIp = getClientIp(request);

    if (action === 'logout') {
      const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
      response.cookies.set('recars_admin_session', '', {
        path: '/',
        maxAge: 0,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
      return response;
    }

    // Rate limit login attempts to prevent brute force (max 15 attempts per 15 minutes per IP)
    const rateLimit = checkRateLimit(`admin-login:${clientIp}`, 15, 15 * 60);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many login attempts. Please wait ${rateLimit.retryAfter || 900} seconds before retrying.`,
        },
        { status: 429 }
      );
    }

    if (action === 'login') {
      const inputEmail = (email || '').trim().toLowerCase();
      const inputPassword = (password || '').trim();

      const allowedEmails = getAllowedAdminEmails();
      const isAllowedEmail = allowedEmails.includes(inputEmail);
      const isValidPassword = inputPassword === ADMIN_PASSWORD;

      if (!isAllowedEmail || !isValidPassword) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid admin credentials. Please verify your administrative email and password.',
          },
          { status: 401 }
        );
      }

      const adminUser = {
        id: 'admin-' + Date.now(),
        email: inputEmail,
        name: name || 'Recars Administrator',
      };

      // Cryptographically signed session token
      const sessionToken = signAdminSession(adminUser);

      const response = NextResponse.json({
        success: true,
        admin: { ...adminUser, role: 'admin' },
        token: sessionToken,
        message: 'Admin authentication successful',
      });

      response.cookies.set('recars_admin_session', sessionToken, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });

      return response;
    }

    if (action === 'google_admin') {
      const inputEmail = (email || '').trim().toLowerCase();
      const inputName = (name || '').trim();

      const allowedEmails = getAllowedAdminEmails();
      const isAllowed = allowedEmails.includes(inputEmail);

      if (!isAllowed) {
        return NextResponse.json(
          {
            success: false,
            error: `Access Denied: "${inputEmail}" is not authorized for the Recars Admin Portal. Only authorized administrator emails are permitted.`,
          },
          { status: 403 }
        );
      }

      const adminUser = {
        id: 'admin-google-' + Date.now(),
        email: inputEmail,
        name: inputName || 'Recars Administrator',
      };

      // Cryptographically signed session token
      const sessionToken = signAdminSession(adminUser);

      const response = NextResponse.json({
        success: true,
        admin: { ...adminUser, role: 'admin' },
        token: sessionToken,
        message: 'Google administrator authentication successful',
      });

      response.cookies.set('recars_admin_session', sessionToken, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });

      return response;
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('Admin authentication POST error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Authentication processing failed' },
      { status: 500 }
    );
  }
}
