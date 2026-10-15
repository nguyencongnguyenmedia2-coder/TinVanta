import { NextResponse } from 'next/server';
import { generateAndPublishArticle } from '@/lib/ai/article-writer-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // 1. Kiểm tra Authorization header (nếu có CRON_SECRET)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'mock-cron-secret';

  // Cho phép gọi trong môi trường dev hoặc khi khớp Bearer token
  const isDev = process.env.NODE_ENV !== 'production';
  if (!isDev && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized cron invocation' }, { status: 401 });
  }

  try {
    // Tự động xoay tua chủ đề ngẫu nhiên trong 10 chuyên mục
    const result = await generateAndPublishArticle({
      categorySlug: 'random',
      status: 'published',
    });

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      source: result.source,
      published_article: {
        id: result.article.id,
        title: result.article.title,
        slug: result.article.slug,
        category: result.article.category?.name,
        published_at: result.article.published_at,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi cron tự động đăng bài';
    return NextResponse.json({ status: 'error', error: message }, { status: 500 });
  }
}
