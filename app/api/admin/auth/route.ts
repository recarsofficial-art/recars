import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'Recars.in@gmail.com';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AdminRecars@2026';

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

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('recars_admin_session')?.value;

    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    try {
      const decoded = JSON.parse(Buffer.from(sessionCookie, 'base64').toString('utf-8'));
      if (decoded && decoded.role === 'admin' && decoded.email) {
        return NextResponse.json({
          authenticated: true,
          admin: {
            email: decoded.email,
            name: decoded.name || 'Operations Administrator',
            role: 'admin',
          },
        });
      }
    } catch {
      // Invalid cookie format
    }

    return NextResponse.json({ authenticated: false }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ authenticated: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, password, name } = body;
    const cookieStore = await cookies();

    if (action === 'logout') {
      const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
      response.cookies.set('recars_admin_session', '', {
        path: '/',
        maxAge: 0,
        httpOnly: true,
        sameSite: 'lax',
      });
      return response;
    }

    if (action === 'login') {
      const inputEmail = (email || '').trim().toLowerCase();
      const inputPassword = (password || '').trim();

      const allowedEmails = getAllowedAdminEmails();
      const isAllowedEmail = allowedEmails.includes(inputEmail);

      const isValidPassword = inputPassword === DEFAULT_ADMIN_PASSWORD;

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
        role: 'admin',
        loginTime: new Date().toISOString(),
      };

      const sessionValue = Buffer.from(JSON.stringify(adminUser)).toString('base64');
      const response = NextResponse.json({
        success: true,
        admin: adminUser,
        message: 'Admin authentication successful',
      });

      response.cookies.set('recars_admin_session', sessionValue, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        sameSite: 'lax',
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
        role: 'admin',
        loginTime: new Date().toISOString(),
      };

      const sessionValue = Buffer.from(JSON.stringify(adminUser)).toString('base64');
      const response = NextResponse.json({
        success: true,
        admin: adminUser,
        message: 'Google administrator authentication successful',
      });

      response.cookies.set('recars_admin_session', sessionValue, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        sameSite: 'lax',
      });

      return response;
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Authentication error' }, { status: 500 });
  }
}
