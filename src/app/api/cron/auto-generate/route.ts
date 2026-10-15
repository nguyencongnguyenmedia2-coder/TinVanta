import { NextResponse } from 'next/server';
import { crawlRewriteAndPublish } from '@/lib/crawler/auto-news-service';

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
    // Tự động cào tin từ các báo lớn, AI viết lại và đăng lên web
    const result = await crawlRewriteAndPublish({
      sourceId: 'all',
      categorySlug: 'all',
      status: 'published',
      aiProvider: 'auto',
    });

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      source_newspaper: result.sourceInfo.sourceName,
      source_url: result.sourceInfo.originalUrl,
      original_title: result.sourceInfo.originalTitle,
      published_article: {
        id: result.article.id,
        title: result.article.title,
        slug: result.article.slug,
        category: result.article.category?.name,
        wordCount: result.aiInfo.wordCount,
        published_at: result.article.published_at,
        aiProvider: result.aiInfo.provider,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi cron tự động cào và đăng bài';
    return NextResponse.json({ status: 'error', error: message }, { status: 500 });
  }
}
