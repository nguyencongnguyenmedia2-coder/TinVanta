/**
 * Dịch vụ cào tin tức tự động từ các nguồn báo chí uy tín tại Việt Nam
 * (VnExpress, Dân Trí, Tuổi Trẻ, Thanh Niên, VietnamNet)
 */

export interface FeedSourceConfig {
  id: string;
  name: string;
  domain: string;
  feeds: {
    categorySlug: string;
    categoryName: string;
    rssUrl: string;
  }[];
}

export interface CrawledFeedItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  imageUrl?: string;
  sourceDomain: string;
  sourceName: string;
  categorySlug: string;
}

export interface ExtractedArticle {
  url: string;
  originalTitle: string;
  sapo: string;
  bodyParagraphs: string[];
  rawText: string;
  imageUrl?: string;
  imageCaption?: string;
  sourceDomain: string;
  sourceName: string;
  categorySlug: string;
}

export const NEWS_SOURCES: FeedSourceConfig[] = [
  {
    id: 'vnexpress',
    name: 'VnExpress',
    domain: 'vnexpress.net',
    feeds: [
      { categorySlug: 'thoi-su', categoryName: 'Thời sự', rssUrl: 'https://vnexpress.net/rss/thoi-su.rss' },
      { categorySlug: 'kinh-te', categoryName: 'Kinh tế', rssUrl: 'https://vnexpress.net/rss/kinh-doanh.rss' },
      { categorySlug: 'cong-nghe', categoryName: 'Công nghệ', rssUrl: 'https://vnexpress.net/rss/khoa-hoc-cong-nghe.rss' },
      { categorySlug: 'the-thao', categoryName: 'Thể thao', rssUrl: 'https://vnexpress.net/rss/the-thao.rss' },
      { categorySlug: 'giai-tri', categoryName: 'Giải trí', rssUrl: 'https://vnexpress.net/rss/giai-tri.rss' },
      { categorySlug: 'suc-khoe', categoryName: 'Sức khỏe', rssUrl: 'https://vnexpress.net/rss/suc-khoe.rss' },
      { categorySlug: 'xa-hoi', categoryName: 'Xã hội - Đời sống', rssUrl: 'https://vnexpress.net/rss/doi-song.rss' },
      { categorySlug: 'phap-luat', categoryName: 'Pháp luật', rssUrl: 'https://vnexpress.net/rss/phap-luat.rss' },
      { categorySlug: 'giao-duc', categoryName: 'Giáo dục', rssUrl: 'https://vnexpress.net/rss/giao-duc.rss' },
      { categorySlug: 'xe', categoryName: 'Xe', rssUrl: 'https://vnexpress.net/rss/oto-xe-may.rss' },
    ]
  },
  {
    id: 'dantri',
    name: 'Dân Trí',
    domain: 'dantri.com.vn',
    feeds: [
      { categorySlug: 'thoi-su', categoryName: 'Xã hội - Thời sự', rssUrl: 'https://dantri.com.vn/rss/xa-hoi.rss' },
      { categorySlug: 'kinh-te', categoryName: 'Kinh doanh', rssUrl: 'https://dantri.com.vn/rss/kinh-doanh.rss' },
      { categorySlug: 'cong-nghe', categoryName: 'Sức mạnh số', rssUrl: 'https://dantri.com.vn/rss/suc-manh-so.rss' },
      { categorySlug: 'the-thao', categoryName: 'Thể thao', rssUrl: 'https://dantri.com.vn/rss/the-thao.rss' },
      { categorySlug: 'giai-tri', categoryName: 'Giải trí', rssUrl: 'https://dantri.com.vn/rss/giai-tri.rss' },
      { categorySlug: 'suc-khoe', categoryName: 'Sức khỏe', rssUrl: 'https://dantri.com.vn/rss/suc-khoe.rss' },
      { categorySlug: 'giao-duc', categoryName: 'Giáo dục', rssUrl: 'https://dantri.com.vn/rss/giao-duc.rss' },
      { categorySlug: 'phap-luat', categoryName: 'Pháp luật', rssUrl: 'https://dantri.com.vn/rss/phap-luat.rss' },
      { categorySlug: 'xe', categoryName: 'Ô tô xe máy', rssUrl: 'https://dantri.com.vn/rss/o-to-xe-may.rss' },
    ]
  },
  {
    id: 'tuoitre',
    name: 'Tuổi Trẻ',
    domain: 'tuoitre.vn',
    feeds: [
      { categorySlug: 'thoi-su', categoryName: 'Thời sự', rssUrl: 'https://tuoitre.vn/rss/thoi-su.rss' },
      { categorySlug: 'kinh-te', categoryName: 'Kinh doanh', rssUrl: 'https://tuoitre.vn/rss/kinh-doanh.rss' },
      { categorySlug: 'cong-nghe', categoryName: 'Khoa học - Công nghệ', rssUrl: 'https://tuoitre.vn/rss/khoa-hoc-cong-nghe.rss' },
      { categorySlug: 'the-thao', categoryName: 'Thể thao', rssUrl: 'https://tuoitre.vn/rss/the-thao.rss' },
      { categorySlug: 'giai-tri', categoryName: 'Giải trí', rssUrl: 'https://tuoitre.vn/rss/giai-tri.rss' },
      { categorySlug: 'suc-khoe', categoryName: 'Sức khỏe', rssUrl: 'https://tuoitre.vn/rss/suc-khoe.rss' },
      { categorySlug: 'phap-luat', categoryName: 'Pháp luật', rssUrl: 'https://tuoitre.vn/rss/phap-luat.rss' },
      { categorySlug: 'xe', categoryName: 'Xe', rssUrl: 'https://tuoitre.vn/rss/xe.rss' },
    ]
  },
  {
    id: 'thanhnien',
    name: 'Thanh Niên',
    domain: 'thanhnien.vn',
    feeds: [
      { categorySlug: 'thoi-su', categoryName: 'Thời sự', rssUrl: 'https://thanhnien.vn/rss/thoi-su.rss' },
      { categorySlug: 'kinh-te', categoryName: 'Kinh tế', rssUrl: 'https://thanhnien.vn/rss/kinh-te.rss' },
      { categorySlug: 'cong-nghe', categoryName: 'Công nghệ', rssUrl: 'https://thanhnien.vn/rss/cong-nghe-game.rss' },
      { categorySlug: 'the-thao', categoryName: 'Thể thao', rssUrl: 'https://thanhnien.vn/rss/the-thao.rss' },
      { categorySlug: 'giai-tri', categoryName: 'Giải trí', rssUrl: 'https://thanhnien.vn/rss/giai-tri.rss' },
      { categorySlug: 'suc-khoe', categoryName: 'Sức khỏe', rssUrl: 'https://thanhnien.vn/rss/suc-khoe.rss' },
      { categorySlug: 'xe', categoryName: 'Xe', rssUrl: 'https://thanhnien.vn/rss/xe.rss' },
    ]
  },
  {
    id: 'vietnamnet',
    name: 'VietnamNet',
    domain: 'vietnamnet.vn',
    feeds: [
      { categorySlug: 'thoi-su', categoryName: 'Thời sự', rssUrl: 'https://vietnamnet.vn/rss/thoi-su.rss' },
      { categorySlug: 'kinh-te', categoryName: 'Kinh doanh', rssUrl: 'https://vietnamnet.vn/rss/kinh-doanh.rss' },
      { categorySlug: 'cong-nghe', categoryName: 'Công nghệ', rssUrl: 'https://vietnamnet.vn/rss/thong-tin-truyen-thong.rss' },
      { categorySlug: 'the-thao', categoryName: 'Thể thao', rssUrl: 'https://vietnamnet.vn/rss/the-thao.rss' },
      { categorySlug: 'giai-tri', categoryName: 'Giải trí', rssUrl: 'https://vietnamnet.vn/rss/giai-tri.rss' },
      { categorySlug: 'suc-khoe', categoryName: 'Sức khỏe', rssUrl: 'https://vietnamnet.vn/rss/suc-khoe.rss' },
    ]
  }
];

/**
 * Giải mã các ký tự HTML entities cơ bản
 */
function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .trim();
}

/**
 * Loại bỏ tag HTML
 */
function stripHtmlTags(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Phân tích XML RSS để lấy danh sách bài viết
 */
export function parseRssXml(
  xml: string, 
  sourceDomain: string, 
  sourceName: string, 
  categorySlug: string
): CrawledFeedItem[] {
  const items: CrawledFeedItem[] = [];
  const itemMatches = [...xml.matchAll(/<item[\s\S]*?>([\s\S]*?)<\/item>/gi)];

  for (const match of itemMatches) {
    const itemBlock = match[1];

    // Trích xuất Title
    const titleMatch = itemBlock.match(/<title>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/title>/i);
    const rawTitle = titleMatch ? (titleMatch[1] || titleMatch[2] || '') : '';
    const title = decodeHtmlEntities(rawTitle).trim();

    // Trích xuất Link
    const linkMatch = itemBlock.match(/<link>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/link>/i);
    const link = linkMatch ? (linkMatch[1] || linkMatch[2] || '').trim() : '';

    // Trích xuất PubDate
    const pubDateMatch = itemBlock.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
    const pubDate = pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString();

    // Trích xuất Description / Sapo
    const descMatch = itemBlock.match(/<description>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/description>/i);
    const rawDesc = descMatch ? (descMatch[1] || descMatch[2] || '') : '';

    // Trích xuất Image Url từ enclosure, media:content hoặc img trong description
    let imageUrl: string | undefined;
    const enclosureMatch = itemBlock.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
    if (enclosureMatch) {
      imageUrl = enclosureMatch[1];
    } else {
      const mediaMatch = itemBlock.match(/<media:content[^>]+url=["']([^"']+)["']/i);
      if (mediaMatch) {
        imageUrl = mediaMatch[1];
      } else {
        const imgTagMatch = rawDesc.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (imgTagMatch) {
          imageUrl = imgTagMatch[1];
        }
      }
    }

    const cleanDesc = decodeHtmlEntities(stripHtmlTags(rawDesc));

    if (title && link && link.startsWith('http')) {
      items.push({
        title,
        link,
        pubDate,
        description: cleanDesc,
        imageUrl,
        sourceDomain,
        sourceName,
        categorySlug,
      });
    }
  }

  return items;
}

/**
 * Kiểm tra xem một đoạn văn có phải là rác, mã JavaScript, CSS hay điều hướng hay không
 */
export function isCleanVietnameseParagraph(text: string): boolean {
  if (!text || text.length < 35 || text.length > 2500) return false;

  // 1. Chặn các token mã lệnh JavaScript / CSS
  const codeKeywords = [
    '{', '}', 'function(', 'function (', 'var ', 'const ', 'let ',
    'document.', 'window.', 'localStorage', 'sessionStorage',
    'addEventListener', 'return ', 'typeof ', '="', '=>',
    'googTagCode', 'layout_version', 'box_embed', 'item_slide_show',
    'serviceWorker', 'data-cache', 'loadCSS', 'jsonMode',
    'decodeNestedURI', 'checkQueryXSS', 'appendTracking',
    'phimdecu', 'thumb_list', 'thumbnail_url', 'share_url'
  ];

  for (const kw of codeKeywords) {
    if (text.includes(kw)) return false;
  }

  // 2. Chặn các đoạn có quá nhiều dấu chấm phẩy hoặc dấu gạch chéo ngược (thường là script/JSON)
  const semicolonCount = (text.match(/;/g) || []).length;
  if (semicolonCount > 2) return false;

  const backslashCount = (text.match(/\\/g) || []).length;
  if (backslashCount > 2) return false;

  // 3. Chặn các câu chỉ dẫn giao diện hoặc bản quyền của báo gốc
  const junkPhrases = [
    'Bản quyền thuộc',
    'Ý kiến bạn đọc',
    'Theo dõi trên Google News',
    'Bình luận',
    'Chia sẻ bài viết',
    'dấu tích xanh bên cạnh',
    'khi ô vuông chuyển thành',
    'bạn đọc có thể đóng trang web',
    'Trở lại Thời sự',
    'Trở lại Kinh doanh',
    'Xem thêm:',
    'Tin liên quan'
  ];

  for (const phrase of junkPhrases) {
    if (text.includes(phrase)) return false;
  }

  // 4. Phải có tối thiểu 6 từ
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length < 6) return false;

  return true;
}

/**
 * Tải và bóc tách nội dung chi tiết từ một URL bài viết
 */
export async function extractArticleDetails(
  url: string, 
  fallbackCategory = 'thoi-su'
): Promise<ExtractedArticle | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8',
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      console.warn(`Lỗi fetch trang web: ${res.status} cho link: ${url}`);
      return null;
    }

    const rawHtml = await res.text();
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '');

    let sourceName = 'Báo điện tử';
    if (hostname.includes('vnexpress')) sourceName = 'VnExpress';
    else if (hostname.includes('dantri')) sourceName = 'Dân Trí';
    else if (hostname.includes('tuoitre')) sourceName = 'Tuổi Trẻ';
    else if (hostname.includes('thanhnien')) sourceName = 'Thanh Niên';
    else if (hostname.includes('vietnamnet')) sourceName = 'VietnamNet';

    // BƯỚC 1: XÓA SẠCH HOÀN TOÀN MÃ SCRIPT, STYLE, NOSCRIPT, SVG, IFRAME VÀ COMMENTS
    const cleanHtml = rawHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ')
      .replace(/<template\b[^<]*(?:(?!<\/template>)<[^<]*)*<\/template>/gi, ' ')
      .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ');

    // 1. Tìm tiêu đề (h1)
    const h1Match = cleanHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const originalTitle = h1Match ? decodeHtmlEntities(stripHtmlTags(h1Match[1])) : '';

    // 2. Tìm Sapo / Mô tả mở đầu
    const sapoMatch = 
      cleanHtml.match(/<(?:p|div|h2)[^>]*class=["'][^"']*(?:sapo|description|lead)[^"']*["'][^>]*>([\s\S]*?)<\/(?:p|div|h2)>/i) ||
      cleanHtml.match(/<meta[^>]+name=["'](?:description|twitter:description)["'][^>]+content=["']([^"']*)["']/i);
    
    let sapo = '';
    if (sapoMatch) {
      const candidateSapo = decodeHtmlEntities(stripHtmlTags(sapoMatch[1]));
      if (isCleanVietnameseParagraph(candidateSapo)) {
        sapo = candidateSapo;
      }
    }

    // 3. Tìm vùng chứa nội dung chính của bài báo
    let mainArticleHtml = cleanHtml;
    const articleContainerMatch = 
      cleanHtml.match(/<article[\s\S]*?>([\s\S]*?)<\/article>/i) ||
      cleanHtml.match(/<div[^>]*class=["'][^"']*(?:fck_detail|singular-content|detail-content|maincontent|detail__content|article-content)[^"']*["'][\s\S]*?>([\s\S]*?)<\/div>/i);

    if (articleContainerMatch) {
      mainArticleHtml = articleContainerMatch[1];
    }

    // 4. Tìm các đoạn văn thân bài từ vùng nội dung chính
    const pMatches = [...mainArticleHtml.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
    let bodyParagraphs: string[] = [];

    for (const p of pMatches) {
      const text = decodeHtmlEntities(stripHtmlTags(p[1]));
      if (isCleanVietnameseParagraph(text)) {
        bodyParagraphs.push(text);
      }
    }

    // Nếu vùng mainArticleHtml không đủ đoạn văn, thử quét toàn bộ cleanHtml nhưng với bộ lọc nghiêm ngặt
    if (bodyParagraphs.length < 2) {
      const allPMatches = [...cleanHtml.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
      bodyParagraphs = [];
      for (const p of allPMatches) {
        const text = decodeHtmlEntities(stripHtmlTags(p[1]));
        if (isCleanVietnameseParagraph(text)) {
          bodyParagraphs.push(text);
        }
      }
    }

    // 5. Tìm ảnh đại diện chính (og:image hoặc img đầu tiên của bài)
    let imageUrl: string | undefined;
    let imageCaption: string | undefined;

    const ogImageMatch = rawHtml.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    if (ogImageMatch && ogImageMatch[1].startsWith('http')) {
      imageUrl = ogImageMatch[1];
    }

    // Tìm caption ảnh nếu có
    const figcaptionMatch = cleanHtml.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i);
    if (figcaptionMatch) {
      const cap = decodeHtmlEntities(stripHtmlTags(figcaptionMatch[1]));
      if (isCleanVietnameseParagraph(cap) || (cap.length > 10 && cap.length < 300)) {
        imageCaption = cap;
      }
    }

    const rawText = [sapo, ...bodyParagraphs].join('\n\n');

    return {
      url,
      originalTitle: originalTitle || 'Tin tức nóng trong ngày',
      sapo: sapo || bodyParagraphs[0] || 'Thông tin chi tiết đang được tiếp tục cập nhật.',
      bodyParagraphs,
      rawText,
      imageUrl,
      imageCaption,
      sourceDomain: hostname,
      sourceName,
      categorySlug: fallbackCategory,
    };
  } catch (error) {
    console.error(`Lỗi trích xuất bài viết từ ${url}:`, error);
    return null;
  }
}

/**
 * Quét các RSS feeds để tìm các bài viết mới nhất từ các báo
 */
export async function scanNewsFeeds(options: {
  sourceId?: string;
  categorySlug?: string;
  limitPerFeed?: number;
} = {}): Promise<CrawledFeedItem[]> {
  const { sourceId, categorySlug, limitPerFeed = 5 } = options;
  const allItems: CrawledFeedItem[] = [];

  const sourcesToScan = sourceId && sourceId !== 'all'
    ? NEWS_SOURCES.filter(s => s.id === sourceId)
    : NEWS_SOURCES;

  for (const src of sourcesToScan) {
    const feedsToScan = categorySlug && categorySlug !== 'all' && categorySlug !== 'random'
      ? src.feeds.filter(f => f.categorySlug === categorySlug)
      : src.feeds;

    for (const feed of feedsToScan) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000); // 6s timeout

        const res = await fetch(feed.rssUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          },
        });
        clearTimeout(timeout);

        if (res.ok) {
          const xml = await res.text();
          const items = parseRssXml(xml, src.domain, src.name, feed.categorySlug);
          allItems.push(...items.slice(0, limitPerFeed));
        }
      } catch {
        // Bỏ qua lỗi kết nối một feed cụ thể để không gián đoạn toàn bộ quá trình
      }
    }
  }

  return allItems;
}
