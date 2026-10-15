import { NextRequest, NextResponse } from 'next/server';
import { 
  verifyAdminSessionToken, 
  getAdminCredentials 
} from '@/lib/auth/admin-store';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cookieToken = request.cookies.get('tinvanta_admin_session')?.value;
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const token = cookieToken || bearerToken;

    const isValid = verifyAdminSessionToken(token);

    if (!isValid) {
      return NextResponse.json({
        authenticated: false,
        error: 'Phiên làm việc không hợp lệ hoặc đã hết hạn.',
      }, { status: 401 });
    }

    const admin = getAdminCredentials();

    return NextResponse.json({
      authenticated: true,
      user: {
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      authenticated: false,
      error: 'Lỗi xác thực phiên.',
    }, { status: 500 });
  }
}
