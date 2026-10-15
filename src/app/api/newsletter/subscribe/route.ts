import { NextResponse } from 'next/server';
import { z } from 'zod';

const SubscribeSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = SubscribeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = result.data;

    // Trong môi trường thực tế, ghi vào Supabase bảng newsletter_subscriptions
    // và gửi email kích hoạt Double Opt-in.

    return NextResponse.json({
      status: 'success',
      message: 'Cảm ơn bạn đã đăng ký! Bạn sẽ nhận được bản tin hàng ngày từ NEWSHUB VIỆT NAM.',
      email,
    });
  } catch {
    return NextResponse.json(
      { error: 'Lỗi xử lý yêu cầu' },
      { status: 500 }
    );
  }
}
