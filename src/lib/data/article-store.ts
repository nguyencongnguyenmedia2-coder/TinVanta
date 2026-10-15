import fs from 'fs';
import path from 'path';
import { Article } from '@/types/database';

const STORAGE_FILE = path.join(process.cwd(), 'src', 'lib', 'data', 'articles-store.json');

/**
 * Đọc danh sách bài viết đã lưu cục bộ từ đĩa
 */
export function getStoredArticles(): Article[] {
  try {
    if (!fs.existsSync(STORAGE_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
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
    const list = getStoredArticles();
    const existingIndex = list.findIndex(a => a.id === article.id || a.slug === article.slug);
    
    if (existingIndex >= 0) {
      list[existingIndex] = article;
    } else {
      list.unshift(article);
    }

    // Đảm bảo thư mục tồn tại
    const dir = path.dirname(STORAGE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(STORAGE_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (error) {
    console.error('Lỗi ghi articles-store.json:', error);
  }
}
