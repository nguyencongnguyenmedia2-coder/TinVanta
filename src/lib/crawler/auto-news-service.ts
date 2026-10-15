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
}

export interface AutoCrawlResult {
  success: boolean;
  article: Article;
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
 * Hàm điều phối toàn diện: Tự động cào tin từ báo chí khác, viết lại bằng AI và xuất bản lên TinVanta
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
  } = options;

  let targetArticle: ExtractedArticle | null = null;

  // ========================================================
  // BƯỚC 1: XÁC ĐỊNH BÀI BÁO GỐC ĐỂ CÀO
  // ========================================================
  if (customUrl && customUrl.trim().startsWith('http')) {
    // 1A. Người dùng dán link cụ thể từ một trang báo bất kỳ
    targetArticle = await extractArticleDetails(customUrl.trim(), categorySlug !== 'all' ? categorySlug : 'thoi-su');
    if (!targetArticle) {
      throw new Error(`Không thể trích xuất dữ liệu từ đường dẫn: ${customUrl}. Vui lòng kiểm tra lại liên kết.`);
    }
  } else {
    // 1B. Quét tự động từ các nguồn RSS của các báo lớn
    const feedItems: CrawledFeedItem[] = await scanNewsFeeds({
      sourceId,
      categorySlug: categorySlug !== 'all' ? categorySlug : undefined,
      limitPerFeed: 8,
    });

    if (feedItems.length === 0) {
      throw new Error('Không tìm thấy bản tin nào từ các nguồn báo chí. Vui lòng thử lại sau.');
    }

    // Lọc ra các bài chưa từng cào (chống trùng lặp)
    const uncrawledItems = feedItems.filter(item => !isUrlAlreadyCrawled(item.link));

    // Nếu tất cả bài đều đã cào, lấy bài mới nhất trong danh sách
    const selectedItem = uncrawledItems.length > 0
      ? uncrawledItems[0]
      : feedItems[0];

    // Trích xuất toàn bộ nội dung từ trang bài viết gốc
    targetArticle = await extractArticleDetails(selectedItem.link, selectedItem.categorySlug);

    // Nếu không bóc tách được chi tiết, dùng thông tin tóm tắt từ RSS
    if (!targetArticle) {
      targetArticle = {
        url: selectedItem.link,
        originalTitle: selectedItem.title,
        sapo: selectedItem.description,
        bodyParagraphs: [selectedItem.description],
        rawText: selectedItem.description,
        imageUrl: selectedItem.imageUrl,
        sourceDomain: selectedItem.sourceDomain,
        sourceName: selectedItem.sourceName,
        categorySlug: selectedItem.categorySlug,
      };
    }
  }

  // ========================================================
  // BƯỚC 2: XÁC ĐỊNH CHUYÊN MỤC & TÁC GIẢ
  // ========================================================
  let matchedCategory: Category | undefined;
  if (targetArticle.categorySlug && targetArticle.categorySlug !== 'all') {
    matchedCategory = MOCK_CATEGORIES.find(c => c.slug === targetArticle?.categorySlug);
  }
  if (!matchedCategory) {
    matchedCategory = MOCK_CATEGORIES[0]; // Mặc định Thời sự
  }

  const author: Profile = MOCK_AUTHORS[Math.floor(Math.random() * MOCK_AUTHORS.length)];

  // ========================================================
  // BƯỚC 3: DÙNG AI MIỄN PHÍ VIẾT LẠI HOÀN TOÀN
  // ========================================================
  const rewritten: RewrittenArticleResult = await rewriteCrawledArticle(
    targetArticle,
    matchedCategory.name,
    aiProvider
  );

  const cleanSlug = generateCleanSlug(rewritten.title);
  const now = new Date().toISOString();
  const readingTime = Math.max(4, Math.ceil(rewritten.wordCount / 220));
  const articleId = `art-crawler-${Date.now()}`;

  // Ảnh đại diện bài viết
  const finalImageUrl = targetArticle.imageUrl || CATEGORY_DEFAULT_IMAGES[matchedCategory.slug] || CATEGORY_DEFAULT_IMAGES['thoi-su'];

  // ========================================================
  // BƯỚC 4: TẠO THỰC THỂ ARTICLE CHUẨN CƠ SỞ DỮ LIỆU
  // ========================================================
  const newArticle: Article = {
    id: articleId,
    title: rewritten.title,
    slug: cleanSlug,
    sapo: rewritten.sapo,
    content_html: rewritten.contentHtml,
    primary_category_id: matchedCategory.id,
    status,
    version: 1,
    published_at: now,
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
      id: `media-crawl-${Date.now()}`,
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

  // ========================================================
  // BƯỚC 5: LƯU TRỮ VÀ XUẤT BẢN NGAY LÊN WEBSITE
  // ========================================================
  saveArticleToDisk(newArticle);
  addDynamicArticle(newArticle);

  // Ghi nhận vào lịch sử cào tin tức để chống trùng lặp
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

  // Ghi vào Supabase Database nếu cấu hình
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
    // Không chặn luồng nếu Supabase RLS giới hạn
  }

  return {
    success: true,
    article: newArticle,
    sourceInfo: {
      originalUrl: targetArticle.url,
      originalTitle: targetArticle.originalTitle,
      sourceDomain: targetArticle.sourceDomain,
      sourceName: targetArticle.sourceName,
    },
    aiInfo: {
      provider: rewritten.aiProvider,
      wordCount: rewritten.wordCount,
      readingTimeMinutes: readingTime,
    },
    message: `Đã cào thành công bài viết từ ${targetArticle.sourceName}, AI đã viết lại bài độc quyền "${newArticle.title}" (${rewritten.wordCount} từ) và tự động đăng lên trang chủ!`,
  };
}
