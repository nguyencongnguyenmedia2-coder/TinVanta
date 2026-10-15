import fs from 'fs';
import path from 'path';

export interface CrawledRecord {
  sourceUrl: string;
  sourceDomain: string;
  originalTitle: string;
  articleId: string;
  articleSlug: string;
  articleTitle: string;
  categorySlug: string;
  wordCount: number;
  aiProvider: string;
  crawledAt: string;
}

function getHistoryPath(): string {
  if (process.env.VERCEL) {
    const tmpPath = path.join('/tmp', 'crawled-history.json');
    if (!fs.existsSync(tmpPath)) {
      const bundledPath = path.join(process.cwd(), 'src', 'lib', 'data', 'crawled-history.json');
      if (fs.existsSync(bundledPath)) {
        try {
          fs.copyFileSync(bundledPath, tmpPath);
        } catch {}
      }
    }
    return tmpPath;
  }
  return path.join(process.cwd(), 'src', 'lib', 'data', 'crawled-history.json');
}

/**
 * Đọc danh sách lịch sử bài viết đã cào từ đĩa
 */
export function getCrawledHistory(): CrawledRecord[] {
  try {
    const filePath = getHistoryPath();
    if (!fs.existsSync(filePath)) {
      const bundledPath = path.join(process.cwd(), 'src', 'lib', 'data', 'crawled-history.json');
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
    console.error('Lỗi đọc crawled-history.json:', error);
    return [];
  }
}

/**
 * Kiểm tra xem một link bài viết đã từng được cào hay chưa
 */
export function isUrlAlreadyCrawled(url: string): boolean {
  if (!url) return false;
  const history = getCrawledHistory();
  const normalized = url.trim().toLowerCase().split('?')[0];
  return history.some(record => record.sourceUrl.trim().toLowerCase().split('?')[0] === normalized);
}

/**
 * Ghi nhận một bài viết đã cào và viết lại thành công
 */
export function recordCrawledArticle(record: CrawledRecord): void {
  try {
    const filePath = getHistoryPath();
    const list = getCrawledHistory();
    list.unshift(record);

    const trimmed = list.slice(0, 500);

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(trimmed, null, 2), 'utf-8');
  } catch (error) {
    console.error('Lỗi lưu crawled-history.json:', error);
  }
}
