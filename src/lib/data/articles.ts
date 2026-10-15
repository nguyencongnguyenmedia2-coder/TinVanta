import { getPublicSupabase } from '@/lib/supabase/server';
import { Article, Category, AdCreative, SiteSettings } from '@/types/database';
import { 
  MOCK_ARTICLES, 
  MOCK_CATEGORIES, 
  MOCK_SITE_SETTINGS, 
  MOCK_AD_CREATIVES 
} from './mock-data';
import { getStoredArticles, getAllCombinedArticles } from './article-store';

// Hàm kiểm tra xem Supabase credentials có hợp lệ hay đang ở chế độ mock/placeholder
function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return false;
  if (url.includes('placeholder') || url.includes('mock-newshub') || anon.includes('mock') || anon.includes('placeholder')) {
    return false;
  }
  return true;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!isSupabaseConfigured()) {
    return MOCK_SITE_SETTINGS;
  }

  try {
    const supabase = getPublicSupabase();
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('key', 'general')
      .single();

    if (error || !data) return MOCK_SITE_SETTINGS;
    return data as SiteSettings;
  } catch {
    return MOCK_SITE_SETTINGS;
  }
}

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) {
    return MOCK_CATEGORIES.filter(c => c.is_active);
  }

  try {
    const supabase = getPublicSupabase();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) return MOCK_CATEGORIES;
    return data as Category[];
  } catch {
    return MOCK_CATEGORIES;
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  if (!slug) return null;
  let clean = String(slug).trim();
  try {
    clean = decodeURIComponent(clean).toLowerCase();
  } catch {
    clean = clean.toLowerCase();
  }

  const categories = await getCategories();
  return categories.find(c => 
    c.slug.toLowerCase() === clean || 
    c.id.toLowerCase() === clean ||
    c.name.toLowerCase() === clean
  ) || null;
}

export async function getPublishedArticles(options: {
  categorySlug?: string;
  tagSlug?: string;
  authorSlug?: string;
  authorId?: string;
  limit?: number;
  offset?: number;
  searchQuery?: string;
  featuredOnly?: boolean;
  excludeId?: string;
  orderBy?: 'published_at' | 'view_count';
  orderAsc?: boolean;
} = {}): Promise<{ articles: Article[]; total: number }> {
  const { 
    categorySlug, 
    tagSlug, 
    authorSlug, 
    authorId, 
    limit = 10, 
    offset = 0, 
    searchQuery, 
    featuredOnly,
    excludeId,
    orderBy = 'published_at',
    orderAsc = false,
  } = options;

  // Lấy toàn bộ bài viết hợp nhất (ưu tiên đĩa mới nhất + mock data được chuẩn hóa)
  const basePool: Article[] = getAllCombinedArticles();
  const seenSlugs = new Set<string>(basePool.map(a => a.slug));

  // Nếu Supabase cấu hình thực tế, bổ sung thêm bài viết từ cơ sở dữ liệu
  if (isSupabaseConfigured()) {
    try {
      const supabase = getPublicSupabase();
      let query = supabase
        .from('articles')
        .select(`
          *,
          category:categories(*),
          featured_image:media_assets(*),
          author:profiles(*)
        `)
        .eq('status', 'published')
        .is('deleted_at', null);

      if (categorySlug) {
        query = query.eq('primary_category_id', categorySlug);
      }
      if (featuredOnly) {
        query = query.eq('is_featured', true);
      }

      const { data } = await query;
      if (data && Array.isArray(data)) {
        for (const item of data as Article[]) {
          if (item && item.slug && !seenSlugs.has(item.slug)) {
            seenSlugs.add(item.slug);
            basePool.push(item);
          }
        }
      }
    } catch {
      // Supabase query error fallback smoothly
    }
  }

  // 1. Lọc theo trạng thái xuất bản
  let list = basePool.filter(a => a.status === 'published');

  // 2. Loại trừ ID (nếu có yêu cầu, ví dụ bài hiện tại ở chi tiết)
  if (excludeId) {
    list = list.filter(a => a.id !== excludeId);
  }

  // 3. Lọc theo chuyên mục linh hoạt (hỗ trợ cả slug, id UUID và tiếng Việt có dấu/không dấu)
  if (categorySlug) {
    let catTarget = String(categorySlug).trim();
    try {
      catTarget = decodeURIComponent(catTarget).toLowerCase();
    } catch {
      catTarget = catTarget.toLowerCase();
    }

    const foundCat = MOCK_CATEGORIES.find(c => 
      c.slug.toLowerCase() === catTarget || 
      c.id.toLowerCase() === catTarget || 
      c.name.toLowerCase() === catTarget
    );

    const validKeys = new Set<string>([catTarget]);
    if (foundCat) {
      validKeys.add(foundCat.slug.toLowerCase());
      validKeys.add(foundCat.id.toLowerCase());
    }

    list = list.filter(a => {
      const aCatSlug = (a.category?.slug || '').toLowerCase();
      const aCatId = (a.category?.id || a.primary_category_id || '').toLowerCase();
      return (
        validKeys.has(aCatSlug) || 
        validKeys.has(aCatId)
      );
    });
  }

  // 4. Lọc theo tag
  if (tagSlug) {
    const cleanTag = tagSlug.toLowerCase();
    list = list.filter(a => a.tags?.some(t => t.slug.toLowerCase() === cleanTag || t.name.toLowerCase() === cleanTag));
  }

  // 5. Lọc theo tác giả
  if (authorSlug) {
    list = list.filter(a => a.author?.slug === authorSlug);
  }

  if (authorId) {
    list = list.filter(a => a.author?.id === authorId || a.created_by === authorId);
  }

  // 6. Lọc bài tiêu điểm
  if (featuredOnly) {
    list = list.filter(a => a.is_featured);
  }

  // 7. Tìm kiếm từ khóa
  if (searchQuery) {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter(a => 
      a.title.toLowerCase().includes(q) || 
      a.sapo.toLowerCase().includes(q)
    );
  }

  // 8. Sắp xếp thứ tự
  if (orderBy === 'view_count') {
    list.sort((a, b) => (orderAsc ? a.view_count - b.view_count : b.view_count - a.view_count));
  } else {
    list.sort((a, b) => {
      const timeA = new Date(a.published_at || a.created_at || 0).getTime();
      const timeB = new Date(b.published_at || b.created_at || 0).getTime();
      return orderAsc ? timeA - timeB : timeB - timeA;
    });
  }

  const total = list.length;
  const paginated = list.slice(offset, offset + limit);
  return { articles: paginated, total };
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (!slug) return null;
  const raw = String(slug).trim();
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw).trim();
  } catch {}
  const lowerRaw = raw.toLowerCase();
  const lowerDecoded = decoded.toLowerCase();

  // 1. Kiểm tra trong kho bài viết tổng hợp (Store đĩa + In-memory mock articles)
  const allArticles = getAllCombinedArticles();

  // 1.1 Khớp chính xác tuyệt đối theo slug
  let found = allArticles.find(a => a.slug === raw || a.slug === decoded);
  if (found) return found;

  // 1.2 Khớp không phân biệt hoa thường theo slug
  found = allArticles.find(a => 
    a.slug && (a.slug.toLowerCase() === lowerRaw || a.slug.toLowerCase() === lowerDecoded)
  );
  if (found) return found;

  // 1.3 Khớp theo ID bài viết (phòng khi người dùng hoặc link truy cập bằng ID)
  found = allArticles.find(a => 
    a.id === raw || 
    (a.id && (a.id.toLowerCase() === lowerRaw || a.id.toLowerCase() === lowerDecoded))
  );
  if (found) return found;

  // 1.4 Khớp tiền tố hoặc hậu tố (phòng trường hợp URL bị cắt đuôi ID)
  found = allArticles.find(a => {
    if (!a.slug) return false;
    const s = a.slug.toLowerCase();
    return (s.length > 10 && (s.startsWith(lowerDecoded) || lowerDecoded.startsWith(s)));
  });
  if (found) return found;

  // 2. Nếu có cấu hình Supabase, tìm trong Supabase
  if (isSupabaseConfigured()) {
    try {
      const supabase = getPublicSupabase();
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          category:categories(*),
          featured_image:media_assets(*),
          author:profiles(*)
        `)
        .or(`slug.eq.${raw},slug.eq.${decoded},id.eq.${raw}`)
        .single();

      if (!error && data) {
        return data as Article;
      }
    } catch {
      // Fallback
    }
  }

  return null;
}

export async function getAdByPlacement(locationCode: string): Promise<AdCreative | null> {
  const ad = MOCK_AD_CREATIVES.find(a => a.placement_id === locationCode && a.is_active);
  return ad || null;
}
