import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { updateArticleInStore } from '@/lib/data/article-store';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { articleId, status, publishedAt } = body;

    if (!articleId) {
      return NextResponse.json({ success: false, error: 'Thiếu mã bài viết (articleId)' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (status) {
      updates.status = status;
      if (status === 'published') {
        updates.published_at = publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString();
      }
    }
    if (publishedAt) {
      updates.published_at = new Date(publishedAt).toISOString();
    }

    const updatedArticle = updateArticleInStore(articleId, updates);

    // Cập nhật Supabase nếu có cấu hình
    try {
      const supabase = createAdminClient();
      await supabase
        .from('articles')
        .update(updates)
        .or(`id.eq.${articleId},slug.eq.${articleId}`);
    } catch {
      // Ignored
    }

    if (!updatedArticle) {
      return NextResponse.json({ 
        success: false, 
        error: 'Không tìm thấy bài viết để cập nhật' 
      }, { status: 404 });
    }

    // Làm mới cache tức thì cho trang chủ, chuyên mục, chi tiết và admin
    try {
      revalidatePath('/', 'page');
      revalidatePath('/chuyen-muc/[slug]', 'page');
      revalidatePath('/bai-viet/[slug]', 'page');
      revalidatePath('/tin-moi-nhat', 'page');
      revalidatePath('/admin/bai-viet', 'page');
      revalidatePath('/admin/tu-dong-viet-bai', 'page');
    } catch {
      // Ignored
    }

    return NextResponse.json({
      success: true,
      article: updatedArticle,
      message: status === 'published' 
        ? 'Bài viết đã được duyệt và đăng trực tiếp lên trang chủ thành công!' 
        : 'Đã cập nhật trạng thái và thời gian bài viết thành công!',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi cập nhật trạng thái bài viết';
    console.error('Lỗi update-article-status route:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
