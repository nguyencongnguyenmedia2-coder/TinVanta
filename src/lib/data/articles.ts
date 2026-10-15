import { getPublicSupabase } from '@/lib/supabase/server';
import { Article, Category, AdCreative, SiteSettings } from '@/types/database';
import { 
  MOCK_ARTICLES, 
  MOCK_CATEGORIES, 
  MOCK_SITE_SETTINGS, 
  MOCK_AD_CREATIVES 
} from './mock-data';
import { getStoredArticles } from './article-store';

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
  const categories = await getCategories();
  return categories.find(c => c.slug === slug) || null;
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

  // Lấy các bài viết từ ổ đĩa (các bài AI tự động tạo) và Mock Articles
  const diskArticles = getStoredArticles();
  const basePool: Article[] = [];
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();

  // 1. Ưu tiên bài mới nhất từ ổ đĩa
  for (const art of diskArticles) {
    if (art && art.slug && !seenSlugs.has(art.slug)) {
      seenIds.add(art.id);
      seenSlugs.add(art.slug);
      basePool.push(art);
    }
  }

  // 2. Thêm bài từ MOCK_ARTICLES
  for (const art of MOCK_ARTICLES) {
    if (art && art.slug && !seenSlugs.has(art.slug) && !seenIds.has(art.id)) {
      seenIds.add(art.id);
      seenSlugs.add(art.slug);
      basePool.push(art);
    }
  }

  // 3. Nếu Supabase cấu hình, truy vấn thêm từ database
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

  // 4. Lọc và phân trang trên danh sách tổng hợp
  let list = basePool.filter(a => a.status === 'published');

  if (excludeId) {
    list = list.filter(a => a.id !== excludeId);
  }

  if (categorySlug) {
    list = list.filter(a => a.category?.slug === categorySlug || a.primary_category_id === categorySlug);
  }

  if (tagSlug) {
    list = list.filter(a => a.tags?.some(t => t.slug === tagSlug));
  }

  if (authorSlug) {
    list = list.filter(a => a.author?.slug === authorSlug);
  }

  if (authorId) {
    list = list.filter(a => a.author?.id === authorId || a.created_by === authorId);
  }

  if (featuredOnly) {
    list = list.filter(a => a.is_featured);
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(a => 
      a.title.toLowerCase().includes(q) || 
      a.sapo.toLowerCase().includes(q)
    );
  }

  if (orderBy === 'view_count') {
    list.sort((a, b) => (orderAsc ? a.view_count - b.view_count : b.view_count - a.view_count));
  } else {
    list.sort((a, b) => {
      const timeA = new Date(a.published_at || a.created_at).getTime();
      const timeB = new Date(b.published_at || b.created_at).getTime();
      return orderAsc ? timeA - timeB : timeB - timeA;
    });
  }

  const total = list.length;
  const paginated = list.slice(offset, offset + limit);
  return { articles: paginated, total };
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  // 1. Kiểm tra trong bộ nhớ đĩa trước
  const diskArticles = getStoredArticles();
  const fromDisk = diskArticles.find(a => a.slug === slug);
  if (fromDisk) return fromDisk;

  // 2. Kiểm tra trong Mock Articles
  const fromMock = MOCK_ARTICLES.find(a => a.slug === slug);
  if (fromMock) return fromMock;

  // 3. Nếu cấu hình Supabase, tìm trong Supabase
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
        .eq('slug', slug)
        .eq('status', 'published')
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
