import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { 
  getAllCombinedArticles, 
  saveArticleToDisk, 
  updateArticleInStore, 
  deleteArticleFromStore,
  getStoredArticles
} from '@/lib/data/article-store';
import { MOCK_CATEGORIES, MOCK_AUTHORS } from '@/lib/data/mock-data';
import { Article, ArticleStatus } from '@/types/database';
import { generateVietnameseSlug, calculateReadingTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';

/**
 * GET: Lấy danh sách bài viết quản trị với đầy đủ bộ lọc và thống kê
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const category = searchParams.get('category') || 'all';
    const tag = searchParams.get('tag') || '';
    const search = searchParams.get('search') || '';
    const source = searchParams.get('source') || 'all'; // 'all' | 'ai' | 'editorial'

    let articles = getAllCombinedArticles();

    // Thống kê tổng quan trước khi lọc
    const stats = {
      total: articles.length,
      published: articles.filter(a => a.status === 'published').length,
      pending: articles.filter(a => a.status === 'pending_review').length,
      draft: articles.filter(a => a.status === 'draft').length,
      aiCount: articles.filter(a => a.author?.email?.includes('ai') || a.id.startsWith('crawl-')).length,
    };

    // 1. Lọc theo trạng thái
    if (status !== 'all') {
      articles = articles.filter(a => a.status === status);
    }

    // 2. Lọc theo chuyên mục (theo id hoặc slug)
    if (category !== 'all') {
      articles = articles.filter(a => 
        a.primary_category_id === category || 
        a.category?.slug === category ||
        a.category?.id === category
      );
    }

    // 3. Lọc theo tag
    if (tag) {
      const tagLower = tag.toLowerCase();
      articles = articles.filter(a => 
        a.tags?.some(t => t.slug === tagLower || t.name.toLowerCase().includes(tagLower))
      );
    }

    // 4. Lọc theo nguồn (AI crawler vs BTV tòa soạn)
    if (source === 'ai') {
      articles = articles.filter(a => a.author?.email?.includes('ai') || a.id.startsWith('crawl-'));
    } else if (source === 'editorial') {
      articles = articles.filter(a => !a.author?.email?.includes('ai') && !a.id.startsWith('crawl-'));
    }

    // 5. Tìm kiếm từ khóa
    if (search.trim()) {
      const q = search.toLowerCase();
      articles = articles.filter(a => 
        a.title.toLowerCase().includes(q) || 
        a.sapo.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      success: true,
      stats,
      total: articles.length,
      articles
    });
  } catch (error: any) {
    console.error('Lỗi API admin articles GET:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST: Tạo bài viết mới trong CMS
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      sapo, 
      content_html, 
      category_id, 
      status = 'pending_review',
      featured_image_url,
      is_featured = false,
      is_breaking = false,
      tags = []
    } = body;

    if (!title || !sapo) {
      return NextResponse.json({ success: false, error: 'Tiêu đề và Sapo không được để trống.' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const articleId = `art-${Date.now()}`;
    const slug = generateVietnameseSlug(title) + `-${Date.now().toString().slice(-4)}`;
    const matchedCategory = MOCK_CATEGORIES.find(c => c.id === category_id || c.slug === category_id) || MOCK_CATEGORIES[0];
    const defaultAuthor = MOCK_AUTHORS[0];

    const newArticle: Article = {
      id: articleId,
      title: title.trim(),
      slug,
      sapo: sapo.trim(),
      content_html: content_html || `<p>${sapo}</p>`,
      primary_category_id: matchedCategory.id,
      category: matchedCategory,
      author: defaultAuthor,
      created_by: defaultAuthor.id,
      status: status as ArticleStatus,
      is_featured: Boolean(is_featured),
      is_breaking: Boolean(is_breaking),
      allow_comments: true,
      published_at: status === 'published' ? now : null,
      created_at: now,
      updated_at: now,
      view_count: 0,
      reading_time_minutes: calculateReadingTime(content_html || sapo),
      version: 1,
      featured_image: featured_image_url ? {
        id: `img-${Date.now()}`,
        filename: 'featured-image.jpg',
        storage_path: 'articles/featured-image.jpg',
        public_url: featured_image_url,
        mime_type: 'image/jpeg',
        file_size: 250000,
        alt_text: title,
        caption: title,
        created_at: now,
      } : undefined,
      tags: Array.isArray(tags) ? tags : []
    };

    saveArticleToDisk(newArticle);

    try {
      revalidatePath('/', 'page');
      revalidatePath('/chuyen-muc/[slug]', 'page');
      revalidatePath('/tin-moi-nhat', 'page');
      revalidatePath('/admin/bai-viet', 'page');
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'Tạo bài viết thành công!',
      article: newArticle
    });
  } catch (error: any) {
    console.error('Lỗi API admin articles POST:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * PATCH: Cập nhật trạng thái hoặc dữ liệu bài viết
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, published_at, title, sapo, content_html, category_id } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu ID bài viết.' }, { status: 400 });
    }

    // Chuẩn bị payload cập nhật
    const updates: Partial<Article> = {};
    if (status) {
      updates.status = status as ArticleStatus;
      if (status === 'published' && !published_at) {
        updates.published_at = new Date().toISOString();
      }
    }
    if (published_at) {
      updates.published_at = new Date(published_at).toISOString();
    }
    if (title) updates.title = title.trim();
    if (sapo) updates.sapo = sapo.trim();
    if (content_html) updates.content_html = content_html;
    if (category_id) {
      const cat = MOCK_CATEGORIES.find(c => c.id === category_id || c.slug === category_id);
      if (cat) {
        updates.primary_category_id = cat.id;
        updates.category = cat;
      }
    }

    // Thử cập nhật trong store đĩa trước
    let updated = updateArticleInStore(id, updates);

    // Nếu bài viết nằm trong Mock ban đầu mà chưa có trong store, ta lấy bài mock ra, merge rồi lưu vào store
    if (!updated) {
      const allArticles = getAllCombinedArticles();
      const existing = allArticles.find(a => a.id === id || a.slug === id);
      if (existing) {
        const merged: Article = {
          ...existing,
          ...updates,
          updated_at: new Date().toISOString()
        };
        saveArticleToDisk(merged);
        updated = merged;
      }
    }

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy bài viết để cập nhật.' }, { status: 404 });
    }

    try {
      revalidatePath('/', 'page');
      revalidatePath('/chuyen-muc/[slug]', 'page');
      revalidatePath('/bai-viet/[slug]', 'page');
      revalidatePath('/tin-moi-nhat', 'page');
      revalidatePath('/admin/bai-viet', 'page');
      revalidatePath('/admin/tu-dong-viet-bai', 'page');
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'Cập nhật bài viết thành công!',
      article: updated
    });
  } catch (error: any) {
    console.error('Lỗi API admin articles PATCH:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * DELETE: Xóa bài viết khỏi hệ thống
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu ID bài viết để xóa.' }, { status: 400 });
    }

    // Nếu bài viết trong store, xóa khỏi store
    deleteArticleFromStore(id);

    // Để đảm bảo xóa hoàn toàn ngay cả bài thuộc mock data, ta đánh dấu status = 'archived' hoặc loại bỏ
    const stored = getStoredArticles();
    const isStillInCombined = getAllCombinedArticles().some(a => a.id === id);
    if (isStillInCombined) {
      // Lưu một bản ghi đánh dấu đã xóa (soft-delete)
      const all = getAllCombinedArticles();
      const target = all.find(a => a.id === id);
      if (target) {
        saveArticleToDisk({
          ...target,
          status: 'archived',
          deleted_at: new Date().toISOString()
        });
      }
    }

    try {
      revalidatePath('/', 'page');
      revalidatePath('/chuyen-muc/[slug]', 'page');
      revalidatePath('/bai-viet/[slug]', 'page');
      revalidatePath('/tin-moi-nhat', 'page');
      revalidatePath('/admin/bai-viet', 'page');
      revalidatePath('/admin/tu-dong-viet-bai', 'page');
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'Đã xóa bài viết thành công!'
    });
  } catch (error: any) {
    console.error('Lỗi API admin articles DELETE:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
