import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId, reactionType } = body;

    if (!articleId || !reactionType) {
      return NextResponse.json({ error: 'Thiếu thông tin articleId hoặc reactionType' }, { status: 400 });
    }

    const validReactions = ['like', 'love', 'insightful', 'surprised', 'sad'];
    if (!validReactions.includes(reactionType)) {
      return NextResponse.json({ error: 'Loại cảm xúc không hợp lệ' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isMock = !supabaseUrl || supabaseUrl.includes('placeholder') || supabaseUrl.includes('mock-newshub');

    if (!isMock) {
      const supabase = await createServerSupabaseClient();
      // Increment likes_count on articles table if reaction is like/love
      if (reactionType === 'like' || reactionType === 'love') {
        await supabase.rpc('increment_article_views', { article_id: articleId });
      }
    }

    return NextResponse.json({
      success: true,
      articleId,
      reactionType,
      message: 'Ghi nhận phản hồi thành công',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Lỗi xử lý phản hồi' }, { status: 500 });
  }
}
