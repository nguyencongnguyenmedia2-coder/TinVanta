import { NextResponse } from 'next/server';
import { generateAndPublishArticle } from '@/lib/ai/article-writer-service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { categorySlug, customTopic, status = 'published', isBreaking = false } = body;

    const result = await generateAndPublishArticle({
      categorySlug,
      customTopic,
      status,
      isBreaking,
    });

    return NextResponse.json({
      success: true,
      article: result.article,
      source: result.source,
      wordCount: result.wordCount,
      message: result.message,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi không xác định khi tạo bài viết';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
