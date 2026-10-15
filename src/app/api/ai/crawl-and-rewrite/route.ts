import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { crawlRewriteAndPublish } from '@/lib/crawler/auto-news-service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { 
      customUrl, 
      sourceId = 'all', 
      categorySlug = 'all', 
      status = 'published', 
      aiProvider = 'auto',
      isBreaking = false,
      batchCount = 1,
      customPublishedAt,
    } = body;

    const result = await crawlRewriteAndPublish({
      customUrl,
      sourceId,
      categorySlug,
      status,
      aiProvider,
      isBreaking,
      batchCount: Number(batchCount) || 1,
      customPublishedAt,
    });

    // Làm mới cache tức thì cho trang chủ, chuyên mục, bài mới nhất và admin
    try {
      revalidatePath('/', 'page');
      revalidatePath('/chuyen-muc/[slug]', 'page');
      revalidatePath('/bai-viet/[slug]', 'page');
      revalidatePath('/tin-moi-nhat', 'page');
      revalidatePath('/admin/bai-viet', 'page');
    } catch {
      // Ignored
    }

    return NextResponse.json({
      success: true,
      article: result.article,
      articles: result.articles || [result.article],
      sourceInfo: result.sourceInfo,
      aiInfo: result.aiInfo,
      message: result.message,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi không xác định khi cào và viết lại bài';
    console.error('Lỗi crawl-and-rewrite route:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
