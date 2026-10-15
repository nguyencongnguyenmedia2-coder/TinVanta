import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Article, Category, AdCreative, SiteSettings } from '@/types/database';
import { 
  MOCK_ARTICLES, 
  MOCK_CATEGORIES, 
  MOCK_SITE_SETTINGS, 
  MOCK_AD_CREATIVES 
} from './mock-data';

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
    const supabase = await createServerSupabaseClient();
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
    const supabase = await createServerSupabaseClient();
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

  if (!isSupabaseConfigured()) {
    let list = [...MOCK_ARTICLES].filter(a => a.status === 'published');

    if (excludeId) {
      list = list.filter(a => a.id !== excludeId);
    }

    if (categorySlug) {
      list = list.filter(a => a.category?.slug === categorySlug);
    }

    if (tagSlug) {
      list = list.filter(a => a.tags?.some(t => t.slug === tagSlug));
    }

    if (authorSlug) {
      list = list.filter(a => a.author?.slug === authorSlug);
    }

    if (authorId) {
      list = list.filter(a => a.author?.id === authorId);
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

  try {
    const supabase = await createServerSupabaseClient();
    let query = supabase
      .from('articles')
      .select(`
        *,
        category:categories(*),
        featured_image:media_assets(*),
        author:profiles(*)
      `, { count: 'exact' })
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
      .is('deleted_at', null);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    if (categorySlug) {
      // Find category first or filter by relation
      query = query.eq('primary_category_id', categorySlug);
    }

    if (featuredOnly) {
      query = query.eq('is_featured', true);
    }

    if (searchQuery) {
      query = query.textSearch('search_vector', searchQuery, { type: 'websearch' });
    }

    const sortCol = orderBy === 'view_count' ? 'view_count' : 'published_at';
    query = query.order(sortCol, { ascending: orderAsc });

    query = query.range(offset, offset + limit - 1);
    const { data, count, error } = await query;

    if (error || !data) {
      let fallback = [...MOCK_ARTICLES].filter(a => a.status === 'published');
      if (excludeId) fallback = fallback.filter(a => a.id !== excludeId);
      if (orderBy === 'view_count') {
        fallback.sort((a, b) => (orderAsc ? a.view_count - b.view_count : b.view_count - a.view_count));
      }
      return { articles: fallback.slice(offset, offset + limit), total: fallback.length };
    }

    return { articles: data as Article[], total: count || data.length };
  } catch {
    let fallback = [...MOCK_ARTICLES].filter(a => a.status === 'published');
    if (excludeId) fallback = fallback.filter(a => a.id !== excludeId);
    if (orderBy === 'view_count') {
      fallback.sort((a, b) => (orderAsc ? a.view_count - b.view_count : b.view_count - a.view_count));
    }
    return { articles: fallback.slice(offset, offset + limit), total: fallback.length };
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (!isSupabaseConfigured()) {
    return MOCK_ARTICLES.find(a => a.slug === slug) || null;
  }

  try {
    const supabase = await createServerSupabaseClient();
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

    if (error || !data) {
      return MOCK_ARTICLES.find(a => a.slug === slug) || null;
    }

    return data as Article;
  } catch {
    return MOCK_ARTICLES.find(a => a.slug === slug) || null;
  }
}

export async function getAdByPlacement(locationCode: string): Promise<AdCreative | null> {
  const ad = MOCK_AD_CREATIVES.find(a => a.placement_id === locationCode && a.is_active);
  return ad || null;
}
