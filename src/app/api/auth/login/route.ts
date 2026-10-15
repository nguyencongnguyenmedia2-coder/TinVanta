import { NextRequest, NextResponse } from 'next/server';
import { 
  authenticateAdmin, 
  generateAdminSessionToken, 
  getAdminCredentials 
} from '@/lib/auth/admin-store';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Vui lòng nhập đầy đủ Email và Mật khẩu quản trị.',
      }, { status: 400 });
    }

    const isValid = authenticateAdmin(email, password);

    if (!isValid) {
      return NextResponse.json({
        success: false,
        error: 'Email hoặc Mật khẩu không chính xác. Chỉ tài khoản Quản Trị Viên mới có quyền truy cập CMS.',
      }, { status: 401 });
    }

    const admin = getAdminCredentials();
    const token = generateAdminSessionToken();

    const response = NextResponse.json({
      success: true,
      message: 'Đăng nhập Quản trị viên thành công!',
      user: {
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
      },
      token,
    });

    // Thiết lập cookie phiên an toàn (30 ngày)
    response.cookies.set('tinvanta_admin_session', token, {
      path: '/',
      httpOnly: false, // Để client script cũng đọc được khi cần
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60,
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    console.error('Lỗi API Login:', error);
    return NextResponse.json({
      success: false,
      error: 'Có lỗi xảy ra trong quá trình xác thực.',
    }, { status: 500 });
  }
}
