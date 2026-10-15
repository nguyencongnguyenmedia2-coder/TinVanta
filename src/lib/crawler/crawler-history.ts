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

const HISTORY_FILE = path.join(process.cwd(), 'src', 'lib', 'data', 'crawled-history.json');

/**
 * Đọc danh sách lịch sử bài viết đã cào từ đĩa
 */
export function getCrawledHistory(): CrawledRecord[] {
  try {
    if (!fs.existsSync(HISTORY_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(HISTORY_FILE, 'utf-8');
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
  const normalized = url.trim().toLowerCase().split('?')[0]; // Bỏ query parameters
  return history.some(record => record.sourceUrl.trim().toLowerCase().split('?')[0] === normalized);
}

/**
 * Ghi nhận một bài viết đã cào và viết lại thành công
 */
export function recordCrawledArticle(record: CrawledRecord): void {
  try {
    const list = getCrawledHistory();
    // Đưa bản ghi mới lên đầu danh sách
    list.unshift(record);

    // Giới hạn lưu tối đa 500 bài gần nhất để tối ưu dung lượng
    const trimmed = list.slice(0, 500);

    const dir = path.dirname(HISTORY_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(HISTORY_FILE, JSON.stringify(trimmed, null, 2), 'utf-8');
  } catch (error) {
    console.error('Lỗi lưu crawled-history.json:', error);
  }
}
