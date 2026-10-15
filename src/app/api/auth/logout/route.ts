import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Đã đăng xuất khỏi phiên quản trị an toàn.',
  });

  response.cookies.set('tinvanta_admin_session', '', {
    path: '/',
    maxAge: 0,
  });

  return response;
}
