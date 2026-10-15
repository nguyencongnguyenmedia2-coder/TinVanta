import { NextResponse } from 'next/server';
import { getCrawledHistory } from '@/lib/crawler/crawler-history';
import { NEWS_SOURCES } from '@/lib/crawler/news-crawler';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const history = getCrawledHistory();
    const sourcesSummary = NEWS_SOURCES.map(s => ({
      id: s.id,
      name: s.name,
      domain: s.domain,
      feedCount: s.feeds.length,
    }));

    return NextResponse.json({
      success: true,
      totalCrawled: history.length,
      history: history.slice(0, 30), // 30 bài mới nhất
      sources: sourcesSummary,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi lấy trạng thái crawler';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
