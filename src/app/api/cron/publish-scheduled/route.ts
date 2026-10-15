import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  // 1. Kiểm tra secret auth header cho Cron Job
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'mock-cron-secret';

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized cron invocation' }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const now = new Date().toISOString();

    // 2. Cập nhật các bài viết đã đến giờ xuất bản
    const { data, error } = await supabase
      .from('articles')
      .update({
        status: 'published',
        published_at: now,
      })
      .eq('status', 'scheduled')
      .lte('scheduled_at', now)
      .select('id, title, slug');

    if (error) {
      return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      status: 'success',
      published_count: data?.length || 0,
      published_articles: data,
      timestamp: now,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ status: 'error', message }, { status: 500 });
  }
}
