import fs from 'fs';
import path from 'path';
import { Article } from '@/types/database';
import { MOCK_ARTICLES, MOCK_CATEGORIES, addDynamicArticle } from './mock-data';

function getStoragePath(): string {
  // Trên Vercel Serverless, thư mục duy nhất có quyền ghi là /tmp
  if (process.env.VERCEL) {
    const tmpPath = path.join('/tmp', 'articles-store.json');
    if (!fs.existsSync(tmpPath)) {
      const bundledPath = path.join(process.cwd(), 'src', 'lib', 'data', 'articles-store.json');
      if (fs.existsSync(bundledPath)) {
        try {
          fs.copyFileSync(bundledPath, tmpPath);
        } catch {
          // Bỏ qua nếu không copy được
        }
      }
    }
    return tmpPath;
  }
  return path.join(process.cwd(), 'src', 'lib', 'data', 'articles-store.json');
}

/**
 * Đọc danh sách bài viết đã lưu cục bộ từ đĩa
 */
export function getStoredArticles(): Article[] {
  try {
    const filePath = getStoragePath();
    if (!fs.existsSync(filePath)) {
      // Nếu ở Vercel và trong /tmp chưa có, thử đọc trực tiếp từ bundledPath
      const bundledPath = path.join(process.cwd(), 'src', 'lib', 'data', 'articles-store.json');
      if (fs.existsSync(bundledPath)) {
        const raw = fs.readFileSync(bundledPath, 'utf-8');
        return raw.trim() ? JSON.parse(raw) : [];
      }
      return [];
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    if (!raw.trim()) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Lỗi đọc articles-store.json:', error);
    return [];
  }
}

/**
 * Lưu bài viết mới vào bộ nhớ tệp JSON trên đĩa (bền vững qua các lần restart)
 */
export function saveArticleToDisk(article: Article): void {
  try {
    const filePath = getStoragePath();
    const list = getStoredArticles();
    const existingIndex = list.findIndex(a => a.id === article.id || a.slug === article.slug);
    
    if (existingIndex >= 0) {
      list[existingIndex] = article;
    } else {
      list.unshift(article);
    }

    // Đảm bảo thư mục tồn tại
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf-8');

    // Đồng bộ ngay lập tức vào in-memory MOCK_ARTICLES
    try {
      addDynamicArticle(article);
    } catch {
      // Ignored
    }
  } catch (error) {
    console.error('Lỗi ghi articles-store.json:', error);
  }
}

/**
 * Cập nhật trạng thái hoặc ngày giờ xuất bản của một bài viết đã lưu
 */
export function updateArticleInStore(
  articleIdOrSlug: string, 
  updates: Partial<Article>
): Article | null {
  try {
    const filePath = getStoragePath();
    const list = getStoredArticles();
    const targetKey = (articleIdOrSlug || '').trim().toLowerCase();
    
    let index = list.findIndex(a => 
      a.id === articleIdOrSlug || 
      a.slug === articleIdOrSlug ||
      (a.id && a.id.toLowerCase() === targetKey) ||
      (a.slug && a.slug.toLowerCase() === targetKey)
    );

    // Nếu bài viết chưa có trong file đĩa, tìm kiếm trong MOCK_ARTICLES
    if (index === -1) {
      try {
        const mockArticle = MOCK_ARTICLES.find((a: Article) => 
          a.id === articleIdOrSlug || 
          a.slug === articleIdOrSlug ||
          (a.id && a.id.toLowerCase() === targetKey) ||
          (a.slug && a.slug.toLowerCase() === targetKey)
        );
        if (mockArticle) {
          list.unshift({ ...mockArticle });
          index = 0;
        }
      } catch {
        // Ignored
      }
    }
    
    if (index === -1) return null;

    // Tự động gán thời điểm xuất bản nếu chuyển sang 'published'
    const finalUpdates: Partial<Article> = { ...updates };
    if (finalUpdates.status === 'published') {
      if (!finalUpdates.published_at && !list[index].published_at) {
        finalUpdates.published_at = new Date().toISOString();
      }
    }

    list[index] = {
      ...list[index],
      ...finalUpdates,
      updated_at: new Date().toISOString(),
    };

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf-8');

    // Đồng bộ ngay lập tức vào in-memory MOCK_ARTICLES
    try {
      addDynamicArticle(list[index]);
    } catch {
      // Ignored
    }

    return list[index];
  } catch (error) {
    console.error('Lỗi cập nhật articles-store.json:', error);
    return null;
  }
}

/**
 * Xóa một bài viết khỏi bộ nhớ đĩa
 */
export function deleteArticleFromStore(articleIdOrSlug: string): boolean {
  try {
    const filePath = getStoragePath();
    const list = getStoredArticles();
    const targetKey = (articleIdOrSlug || '').trim().toLowerCase();
    const filtered = list.filter(a => 
      a.id !== articleIdOrSlug && 
      a.slug !== articleIdOrSlug &&
      a.id.toLowerCase() !== targetKey &&
      a.slug.toLowerCase() !== targetKey
    );
    
    if (filtered.length === list.length) {
      return false;
    }

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Lỗi xóa bài trong articles-store.json:', error);
    return false;
  }
}

/**
 * Lấy danh sách toàn bộ bài viết hợp nhất (Store đĩa + Mock articles ban đầu),
 * tự động loại bỏ trùng lặp và sắp xếp theo ngày giờ mới nhất
 */
export function getAllCombinedArticles(): Article[] {
  const diskArticles = getStoredArticles();

  const combined: Article[] = [];
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();

  // Chuẩn hóa một bài viết để luôn có category object chuẩn
  const normalizeArticle = (art: Article): Article => {
    if (!art.category && art.primary_category_id) {
      const found = MOCK_CATEGORIES.find((c: any) => 
        c.id === art.primary_category_id || 
        c.slug === art.primary_category_id
      );
      if (found) {
        return { ...art, category: found };
      }
    }
    return art;
  };

  // 1. Ưu tiên bài trong store đĩa (các bài do AI cào hoặc do người dùng tạo/sửa/duyệt)
  for (const art of diskArticles) {
    if (art && art.slug && !seenSlugs.has(art.slug) && !seenIds.has(art.id)) {
      seenIds.add(art.id);
      seenSlugs.add(art.slug);
      combined.push(normalizeArticle(art));
    }
  }

  // 2. Bổ sung các bài từ MOCK_ARTICLES nếu chưa có trong store
  for (const art of MOCK_ARTICLES) {
    if (art && art.slug && !seenSlugs.has(art.slug) && !seenIds.has(art.id)) {
      seenIds.add(art.id);
      seenSlugs.add(art.slug);
      combined.push(normalizeArticle(art));
    }
  }

  // 3. Sắp xếp thời gian xuất bản / tạo mới nhất lên đầu
  combined.sort((a, b) => {
    const timeA = new Date(a.published_at || a.created_at || 0).getTime();
    const timeB = new Date(b.published_at || b.created_at || 0).getTime();
    return timeB - timeA;
  });

  return combined;
}
