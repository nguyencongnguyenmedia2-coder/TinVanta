import { NextRequest, NextResponse } from 'next/server';
import { 
  verifyAdminSessionToken, 
  getAdminCredentials, 
  updateAdminCredentials,
  authenticateAdmin
} from '@/lib/auth/admin-store';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const cookieToken = request.cookies.get('tinvanta_admin_session')?.value;
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const token = cookieToken || bearerToken;

    if (!verifyAdminSessionToken(token)) {
      return NextResponse.json({
        success: false,
        error: 'Bạn không có quyền thực hiện thao tác này. Vui lòng đăng nhập lại.',
      }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newEmail, newPassword } = body;

    const admin = getAdminCredentials();

    if (!currentPassword || !authenticateAdmin(admin.email, currentPassword)) {
      return NextResponse.json({
        success: false,
        error: 'Mật khẩu hiện tại không đúng. Vui lòng thử lại.',
      }, { status: 400 });
    }

    if (newPassword && newPassword.length < 6) {
      return NextResponse.json({
        success: false,
        error: 'Mật khẩu mới phải có tối thiểu 6 ký tự để đảm bảo an toàn.',
      }, { status: 400 });
    }

    const updated = updateAdminCredentials(newEmail, newPassword);

    return NextResponse.json({
      success: true,
      message: 'Cập nhật tài khoản và mật khẩu Quản Trị Viên thành công!',
      email: updated.email,
    });
  } catch (error: any) {
    console.error('Lỗi đổi thông tin admin:', error);
    return NextResponse.json({
      success: false,
      error: 'Có lỗi xảy ra khi cập nhật mật khẩu.',
    }, { status: 500 });
  }
}
