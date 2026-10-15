export interface StoredBookmark {
  id: string;
  title: string;
  slug: string;
  sapo?: string;
  categoryName?: string;
  publishedAt?: string;
  savedAt: string;
}

const BOOKMARKS_STORAGE_KEY = 'newshub_reader_bookmarks';

export function getStoredBookmarks(): StoredBookmark[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredBookmark[];
  } catch {
    return [];
  }
}

export function isArticleBookmarked(id: string): boolean {
  if (typeof window === 'undefined') return false;
  const bookmarks = getStoredBookmarks();
  return bookmarks.some((b) => b.id === id);
}

export function toggleBookmarkArticle(article: {
  id: string;
  title: string;
  slug: string;
  sapo?: string;
  categoryName?: string;
  publishedAt?: string;
}): boolean {
  if (typeof window === 'undefined') return false;
  const current = getStoredBookmarks();
  const exists = current.some((b) => b.id === article.id);

  let updated: StoredBookmark[];
  let isNowBookmarked: boolean;

  if (exists) {
    updated = current.filter((b) => b.id !== article.id);
    isNowBookmarked = false;
  } else {
    const newEntry: StoredBookmark = {
      id: article.id,
      title: article.title,
      slug: article.slug,
      sapo: article.sapo,
      categoryName: article.categoryName,
      publishedAt: article.publishedAt,
      savedAt: new Date().toISOString(),
    };
    updated = [newEntry, ...current];
    isNowBookmarked = true;
  }

  try {
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('newshub_bookmarks_change', { detail: { count: updated.length } }));
  } catch (e) {
    console.error('Lỗi khi lưu bookmark:', e);
  }

  return isNowBookmarked;
}

export function removeStoredBookmark(id: string): StoredBookmark[] {
  if (typeof window === 'undefined') return [];
  const current = getStoredBookmarks();
  const updated = current.filter((b) => b.id !== id);
  try {
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('newshub_bookmarks_change', { detail: { count: updated.length } }));
  } catch (e) {
    console.error('Lỗi khi cập nhật bookmark:', e);
  }
  return updated;
}

export function clearAllStoredBookmarks(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(BOOKMARKS_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('newshub_bookmarks_change', { detail: { count: 0 } }));
  } catch (e) {
    console.error('Lỗi khi xóa danh sách bookmark:', e);
  }
}
