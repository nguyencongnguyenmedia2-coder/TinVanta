import fs from 'fs';
import path from 'path';
import { Article } from '@/types/database';

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
    const index = list.findIndex(a => a.id === articleIdOrSlug || a.slug === articleIdOrSlug);
    
    if (index === -1) return null;

    list[index] = {
      ...list[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf-8');
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
    const filtered = list.filter(a => a.id !== articleIdOrSlug && a.slug !== articleIdOrSlug);
    
    if (filtered.length === list.length) {
      // Nếu không tìm thấy trong store (có thể là mock article), lưu một bản đánh dấu xóa hoặc return true
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
  const { MOCK_ARTICLES } = require('./mock-data');

  const combined: Article[] = [];
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();

  // Ưu tiên bài trong store đĩa (các bài do AI cào hoặc do người dùng tạo/sửa)
  for (const art of diskArticles) {
    if (art && art.slug && !seenSlugs.has(art.slug)) {
      seenIds.add(art.id);
      seenSlugs.add(art.slug);
      combined.push(art);
    }
  }

  // Bổ sung các bài từ MOCK_ARTICLES nếu chưa có trong store
  for (const art of MOCK_ARTICLES) {
    if (art && art.slug && !seenSlugs.has(art.slug) && !seenIds.has(art.id)) {
      seenIds.add(art.id);
      seenSlugs.add(art.slug);
      combined.push(art);
    }
  }

  // Sắp xếp thời gian mới nhất lên đầu
  combined.sort((a, b) => {
    const timeA = new Date(a.published_at || a.created_at || 0).getTime();
    const timeB = new Date(b.published_at || b.created_at || 0).getTime();
    return timeB - timeA;
  });

  return combined;
}
