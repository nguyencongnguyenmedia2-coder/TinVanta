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
