import { describe, it, expect } from 'vitest';
import { parseRssXml } from '../lib/crawler/news-crawler';
import { synthesizeJournalisticArticle, countWords } from '../lib/ai/free-ai-writer';
import { isUrlAlreadyCrawled, recordCrawledArticle, getCrawledHistory } from '../lib/crawler/crawler-history';

describe('News Crawler & Free AI Rewriter Suite', () => {
  it('Bóc tách đúng dữ liệu XML RSS bài báo', () => {
    const sampleXml = `
      <rss version="2.0">
        <channel>
          <title>Tin mới</title>
          <item>
            <title><![CDATA[Chính phủ ban hành chính sách mới thúc đẩy kinh tế số]]></title>
            <link>https://vnexpress.net/chinh-phu-ban-hanh-chinh-sach-moi-4700000.html</link>
            <description><![CDATA[<img src="https://i1-vnexpress.vnecdn.net/2026/10/sample.jpg">Chính sách nhằm tạo động lực mạnh mẽ cho doanh nghiệp công nghệ trong nước.]]></description>
            <pubDate>Thu, 15 Oct 2026 08:00:00 +0700</pubDate>
          </item>
        </channel>
      </rss>
    `;

    const items = parseRssXml(sampleXml, 'vnexpress.net', 'VnExpress', 'kinh-te');
    expect(items.length).toBe(1);
    expect(items[0].title).toBe('Chính phủ ban hành chính sách mới thúc đẩy kinh tế số');
    expect(items[0].link).toBe('https://vnexpress.net/chinh-phu-ban-hanh-chinh-sach-moi-4700000.html');
    expect(items[0].imageUrl).toBe('https://i1-vnexpress.vnecdn.net/2026/10/sample.jpg');
    expect(items[0].description).toContain('Chính sách nhằm tạo động lực');
  });

  it('AI tổng hợp bài báo độc quyền với cấu trúc chuẩn báo chí', () => {
    const extracted = {
      url: 'https://dantri.com.vn/xa-hoi/su-kien-thu-hut-su-chu-y.htm',
      originalTitle: 'Khởi công tuyến cao tốc kết nối vùng kinh tế trọng điểm',
      sapo: 'Dự án có tổng mức đầu tư hàng chục nghìn tỷ đồng chính thức khởi công sáng nay.',
      bodyParagraphs: [
        'Dự án có chiều dài hơn 100km kết nối trực tiếp các trung tâm logistics lớn.',
        'Đại diện cơ quan chức năng khẳng định tuyến đường sẽ rút ngắn thời gian di chuyển hơn một nửa.',
        'Các đơn vị thi công cam kết áp dụng công nghệ số và vật liệu thân thiện môi trường.'
      ],
      rawText: 'Dự án có chiều dài hơn 100km...',
      sourceDomain: 'dantri.com.vn',
      sourceName: 'Dân Trí',
      categorySlug: 'kinh-te'
    };

    const rewritten = synthesizeJournalisticArticle(extracted, 'Kinh tế');
    expect(rewritten.title).not.toBe(extracted.originalTitle);
    expect(rewritten.contentHtml).toContain('<h2>1. Bối cảnh và diễn biến cốt lõi của sự việc</h2>');
    expect(rewritten.contentHtml).toContain('<h2>2. Phân tích tác động và các góc nhìn đa chiều</h2>');
    expect(rewritten.summaryPoints.length).toBeGreaterThanOrEqual(3);
    expect(rewritten.wordCount).toBeGreaterThan(100);
  });

  it('Ghi nhận và chống trùng lặp URL cào tin', () => {
    const testUrl = `https://tuoitre.vn/bai-test-${Date.now()}.htm`;
    expect(isUrlAlreadyCrawled(testUrl)).toBe(false);

    recordCrawledArticle({
      sourceUrl: testUrl,
      sourceDomain: 'tuoitre.vn',
      originalTitle: 'Tiêu đề thử nghiệm',
      articleId: 'test-art-1',
      articleSlug: 'tieu-de-thu-nghiem-test',
      articleTitle: 'Tiêu đề mới thử nghiệm',
      categorySlug: 'thoi-su',
      wordCount: 500,
      aiProvider: 'smart_synthesizer',
      crawledAt: new Date().toISOString()
    });

    expect(isUrlAlreadyCrawled(testUrl)).toBe(true);
  });

  it('Tự động cào tin từ báo chí, AI viết lại và lưu vào kho bài viết', async () => {
    const { crawlRewriteAndPublish } = await import('../lib/crawler/auto-news-service');
    const { getPublishedArticles } = await import('../lib/data/articles');

    const result = await crawlRewriteAndPublish({
      sourceId: 'vnexpress',
      categorySlug: 'kinh-te',
      aiProvider: 'smart_synthesizer', // deterministic for unit test
    });

    expect(result.success).toBe(true);
    expect(result.article.id).toBeDefined();
    expect(result.article.title).toBeDefined();
    expect(result.sourceInfo.sourceName).toBeDefined();
    expect(result.aiInfo.wordCount).toBeGreaterThan(100);

    // Kiểm tra bài viết mới đã tự động hiển thị trong kho bài viết hệ thống
    const { articles } = await getPublishedArticles({ limit: 10 });
    const exists = articles.some(a => a.id === result.article.id || a.slug === result.article.slug);
    expect(exists).toBe(true);
  }, 25000);
});

