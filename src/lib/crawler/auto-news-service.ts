import { Article, Category, Profile } from '@/types/database';
import { MOCK_CATEGORIES, MOCK_AUTHORS, addDynamicArticle } from '../data/mock-data';
import { saveArticleToDisk } from '../data/article-store';
import { createAdminClient } from '../supabase/admin';
import slugify from 'slugify';
import { 
  scanNewsFeeds, 
  extractArticleDetails, 
  ExtractedArticle,
  CrawledFeedItem
} from './news-crawler';
import { 
  rewriteCrawledArticle, 
  RewrittenArticleResult 
} from '../ai/free-ai-writer';
import { 
  isUrlAlreadyCrawled, 
  recordCrawledArticle 
} from './crawler-history';

export interface AutoCrawlOptions {
  customUrl?: string;
  sourceId?: string; // 'vnexpress' | 'dantri' | 'tuoitre' | 'thanhnien' | 'vietnamnet' | 'all'
  categorySlug?: string;
  status?: 'published' | 'pending_review';
  aiProvider?: 'auto' | 'pollinations_free' | 'gemini_free' | 'smart_synthesizer';
  isBreaking?: boolean;
  batchCount?: number; // Số lượng bài cần cào (1 - 10 bài)
  customPublishedAt?: string; // Tùy chỉnh ngày giờ đăng bài
}

export interface AutoCrawlResult {
  success: boolean;
  article: Article;
  articles?: Article[];
  sourceInfo: {
    originalUrl: string;
    originalTitle: string;
    sourceDomain: string;
    sourceName: string;
  };
  aiInfo: {
    provider: string;
    wordCount: number;
    readingTimeMinutes: number;
  };
  message: string;
}

function generateCleanSlug(title: string): string {
  const base = slugify(title, {
    lower: true,
    strict: true,
    locale: 'vi',
    trim: true,
  });
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${base}-${randomSuffix}`;
}

const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  'thoi-su': 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80',
  'kinh-te': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80',
  'cong-nghe': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
  'xa-hoi': 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=1200&auto=format&fit=crop&q=80',
  'phap-luat': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80',
  'giao-duc': 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80',
  'suc-khoe': 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200&auto=format&fit=crop&q=80',
  'the-thao': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&auto=format&fit=crop&q=80',
  'giai-tri': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
  'xe': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&auto=format&fit=crop&q=80',
};

/**
 * Xử lý cào và viết lại cho một bài viết đơn lẻ
 */
async function processSingleArticle(
  targetArticle: ExtractedArticle,
  options: {
    status: 'published' | 'pending_review';
    aiProvider: 'auto' | 'pollinations_free' | 'gemini_free' | 'smart_synthesizer';
    isBreaking: boolean;
    publishDate: string;
  }
): Promise<Article> {
  const { status, aiProvider, isBreaking, publishDate } = options;

  let matchedCategory: Category | undefined;
  if (targetArticle.categorySlug && targetArticle.categorySlug !== 'all') {
    matchedCategory = MOCK_CATEGORIES.find(c => c.slug === targetArticle.categorySlug);
  }
  if (!matchedCategory) {
    matchedCategory = MOCK_CATEGORIES[0];
  }

  const author: Profile = MOCK_AUTHORS[Math.floor(Math.random() * MOCK_AUTHORS.length)];

  const rewritten: RewrittenArticleResult = await rewriteCrawledArticle(
    targetArticle,
    matchedCategory.name,
    aiProvider
  );

  const cleanSlug = generateCleanSlug(rewritten.title);
  const now = new Date().toISOString();
  const readingTime = Math.max(4, Math.ceil(rewritten.wordCount / 220));
  const articleId = `art-crawler-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const finalImageUrl = targetArticle.imageUrl || CATEGORY_DEFAULT_IMAGES[matchedCategory.slug] || CATEGORY_DEFAULT_IMAGES['thoi-su'];

  const newArticle: Article = {
    id: articleId,
    title: rewritten.title,
    slug: cleanSlug,
    sapo: rewritten.sapo,
    content_html: rewritten.contentHtml,
    primary_category_id: matchedCategory.id,
    status,
    version: 1,
    published_at: publishDate,
    reading_time_minutes: readingTime,
    is_featured: false,
    is_breaking: isBreaking,
    allow_comments: true,
    seo_title: rewritten.seoTitle,
    seo_description: rewritten.seoDescription,
    view_count: Math.floor(800 + Math.random() * 4500),
    likes_count: Math.floor(25 + Math.random() * 120),
    summary_points: rewritten.summaryPoints,
    created_by: author.id,
    created_at: now,
    updated_at: now,
    category: matchedCategory,
    author,
    tags: rewritten.tags.map((t, idx) => ({
      id: `tag-crawl-${idx}-${Date.now()}`,
      name: t,
      slug: slugify(t, { lower: true, strict: true, locale: 'vi' }),
      article_count: 1,
      created_at: now,
    })),
    featured_image: {
      id: `media-crawl-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      filename: `${cleanSlug}.jpg`,
      storage_path: `crawled/${cleanSlug}.jpg`,
      public_url: finalImageUrl,
      mime_type: 'image/jpeg',
      file_size: 380000,
      width: 1200,
      height: 800,
      alt_text: rewritten.title,
      caption: targetArticle.imageCaption || `Hình ảnh phản ánh sự kiện: ${rewritten.title}`,
      credit: `Nguồn tư liệu: ${targetArticle.sourceName}`,
      created_at: now,
    },
  };

  saveArticleToDisk(newArticle);
  addDynamicArticle(newArticle);

  recordCrawledArticle({
    sourceUrl: targetArticle.url,
    sourceDomain: targetArticle.sourceDomain,
    originalTitle: targetArticle.originalTitle,
    articleId: newArticle.id,
    articleSlug: newArticle.slug,
    articleTitle: newArticle.title,
    categorySlug: matchedCategory.slug,
    wordCount: rewritten.wordCount,
    aiProvider: rewritten.aiProvider,
    crawledAt: now,
  });

  try {
    const supabase = createAdminClient();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const catId = uuidRegex.test(matchedCategory.id) ? matchedCategory.id : 'c0000000-0000-0000-0000-000000000001';
    const authId = uuidRegex.test(author.id) ? author.id : 'a0000000-0000-0000-0000-000000000001';

    await supabase.from('articles').insert({
      title: newArticle.title,
      slug: newArticle.slug,
      sapo: newArticle.sapo,
      content_html: newArticle.content_html,
      primary_category_id: catId,
      status: newArticle.status,
      version: 1,
      published_at: newArticle.published_at,
      reading_time_minutes: newArticle.reading_time_minutes,
      is_featured: newArticle.is_featured,
      is_breaking: newArticle.is_breaking,
      allow_comments: true,
      seo_title: newArticle.seo_title,
      seo_description: newArticle.seo_description,
      view_count: newArticle.view_count,
      created_by: authId,
    });
  } catch {
    // Ignored
  }

  return newArticle;
}

/**
 * Hàm điều phối toàn diện: Tự động cào tin từ báo chí khác, hỗ trợ cào hàng loạt và tùy chỉnh ngày đăng
 */
export async function crawlRewriteAndPublish(
  options: AutoCrawlOptions = {}
): Promise<AutoCrawlResult> {
  const {
    customUrl,
    sourceId = 'all',
    categorySlug = 'all',
    status = 'published',
    aiProvider = 'auto',
    isBreaking = false,
    batchCount = 1,
    customPublishedAt,
  } = options;

  const countToCrawl = Math.min(Math.max(1, batchCount), 10);

  // ========================================================
  // TRƯỜNG HỢP 1: CÀO THEO LINK TÙY CHỌN (CUSTOM URL)
  // ========================================================
  if (customUrl && customUrl.trim().startsWith('http')) {
    const targetArticle = await extractArticleDetails(customUrl.trim(), categorySlug !== 'all' ? categorySlug : 'thoi-su');
    if (!targetArticle) {
      throw new Error(`Không thể trích xuất dữ liệu từ đường dẫn: ${customUrl}. Vui lòng kiểm tra lại liên kết.`);
    }

    const publishDate = customPublishedAt || new Date().toISOString();
    const article = await processSingleArticle(targetArticle, {
      status,
      aiProvider,
      isBreaking,
      publishDate,
    });

    return {
      success: true,
      article,
      articles: [article],
      sourceInfo: {
        originalUrl: targetArticle.url,
        originalTitle: targetArticle.originalTitle,
        sourceDomain: targetArticle.sourceDomain,
        sourceName: targetArticle.sourceName,
      },
      aiInfo: {
        provider: aiProvider,
        wordCount: Math.round(article.content_html.length / 5),
        readingTimeMinutes: article.reading_time_minutes,
      },
      message: status === 'published'
        ? `Đã cào thành công bài viết từ ${targetArticle.sourceName}, AI đã viết lại và tự động đăng lên trang chủ!`
        : `Đã cào thành công bài viết từ ${targetArticle.sourceName}, AI đã viết xong và lưu vào danh sách chờ admin duyệt!`,
    };
  }

  // ========================================================
  // TRƯỜNG HỢP 2: TỰ ĐỘNG QUÉT RSS BÁO CHÍ (HỖ TRỢ NHIỀU BÀI)
  // ========================================================
  const feedItems: CrawledFeedItem[] = await scanNewsFeeds({
    sourceId,
    categorySlug: categorySlug !== 'all' ? categorySlug : undefined,
    limitPerFeed: Math.max(10, countToCrawl * 3),
  });

  if (feedItems.length === 0) {
    throw new Error('Không tìm thấy bản tin nào từ các nguồn báo chí. Vui lòng thử lại sau.');
  }

  // Lọc bài chưa từng cào (chống trùng lặp)
  const uncrawledItems = feedItems.filter(item => !isUrlAlreadyCrawled(item.link));
  const candidateItems = uncrawledItems.length >= countToCrawl 
    ? uncrawledItems.slice(0, countToCrawl)
    : [...uncrawledItems, ...feedItems.filter(item => isUrlAlreadyCrawled(item.link))].slice(0, countToCrawl);

  const processedArticles: Article[] = [];
  const baseTime = customPublishedAt ? new Date(customPublishedAt).getTime() : Date.now();

  for (let i = 0; i < candidateItems.length; i++) {
    const item = candidateItems[i];
    let extracted = await extractArticleDetails(item.link, item.categorySlug);
    if (!extracted) {
      extracted = {
        url: item.link,
        originalTitle: item.title,
        sapo: item.description,
        bodyParagraphs: [item.description],
        rawText: item.description,
        imageUrl: item.imageUrl,
        sourceDomain: item.sourceDomain,
        sourceName: item.sourceName,
        categorySlug: item.categorySlug,
      };
    }

    // Thời gian đăng: Giãn cách 2 phút giữa các bài nếu cào nhiều bài
    const itemPublishDate = new Date(baseTime - i * 120000).toISOString();

    const art = await processSingleArticle(extracted, {
      status,
      aiProvider,
      isBreaking,
      publishDate: itemPublishDate,
    });
    processedArticles.push(art);
  }

  const primaryArticle = processedArticles[0];
  const totalWords = processedArticles.reduce((sum, a) => sum + (a.reading_time_minutes * 220), 0);

  return {
    success: true,
    article: primaryArticle,
    articles: processedArticles,
    sourceInfo: {
      originalUrl: candidateItems[0].link,
      originalTitle: candidateItems[0].title,
      sourceDomain: candidateItems[0].sourceDomain,
      sourceName: candidateItems[0].sourceName,
    },
    aiInfo: {
      provider: aiProvider,
      wordCount: totalWords,
      readingTimeMinutes: primaryArticle.reading_time_minutes,
    },
    message: status === 'published'
      ? `Đã cào và viết lại thành công ${processedArticles.length} bài báo mới, tự động đăng tải trực tiếp lên trang chủ!`
      : `Đã cào và viết lại thành công ${processedArticles.length} bài báo mới, hiện đang lưu ở trạng thái chờ admin duyệt đăng!`,
  };
}
