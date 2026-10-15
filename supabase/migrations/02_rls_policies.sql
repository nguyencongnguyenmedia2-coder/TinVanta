-- ====================================================================
-- NEWSHUB VIỆT NAM — MIGRATION 02: ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- 1. Bật RLS trên toàn bộ 33 bảng dữ liệu
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editorial_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editorial_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editorial_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_view_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_article_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_jobs ENABLE ROW LEVEL SECURITY;

-- 2. Hàm kiểm tra quyền của người dùng hiện tại (Security Definer)
CREATE OR REPLACE FUNCTION public.check_user_permission(perm_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  has_perm BOOLEAN;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Kiểm tra Super Admin
  IF EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role_id = 'super_admin'
  ) THEN
    RETURN TRUE;
  END IF;

  -- Kiểm tra permission qua bảng role_permissions
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role_id = rp.role_id
    WHERE ur.user_id = auth.uid() AND rp.permission_id = perm_id
  ) INTO has_perm;

  RETURN coalesce(has_perm, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --------------------------------------------------------------------
-- 3. CHÍNH SÁCH BẢNG PROFILES
-- --------------------------------------------------------------------
-- Ai cũng có thể đọc profile công khai của tác giả
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

-- Người dùng chỉ được sửa profile của chính mình
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- --------------------------------------------------------------------
-- 4. CHÍNH SÁCH BẢNG CATEGORIES & TAGS
-- --------------------------------------------------------------------
CREATE POLICY "Categories are readable by everyone" 
ON public.categories FOR SELECT USING (true);

CREATE POLICY "Categories manageable by authorized staff" 
ON public.categories FOR ALL USING (public.check_user_permission('categories.manage'));

CREATE POLICY "Tags are readable by everyone" 
ON public.tags FOR SELECT USING (true);

CREATE POLICY "Tags manageable by authorized staff" 
ON public.tags FOR ALL USING (public.check_user_permission('tags.manage'));

-- --------------------------------------------------------------------
-- 5. CHÍNH SÁCH BẢNG ARTICLES
-- --------------------------------------------------------------------
-- Độc giả công khai chỉ đọc được bài đã xuất bản (status = 'published' AND published_at <= NOW())
CREATE POLICY "Public can view published articles" 
ON public.articles FOR SELECT 
USING (status = 'published' AND published_at <= NOW() AND deleted_at IS NULL);

-- Nhân viên tòa soạn có quyền articles.read_all đọc được mọi bài
CREATE POLICY "Editorial staff can view all articles" 
ON public.articles FOR SELECT 
USING (public.check_user_permission('articles.read_all'));

-- Phóng viên đọc được bài do chính mình tạo ra
CREATE POLICY "Authors can view own articles" 
ON public.articles FOR SELECT 
USING (auth.uid() = created_by);

-- Tạo bài viết mới
CREATE POLICY "Staff can create articles" 
ON public.articles FOR INSERT 
WITH CHECK (public.check_user_permission('articles.create') AND auth.uid() = created_by);

-- Phóng viên sửa bài của mình khi ở trạng thái draft hoặc changes_requested
CREATE POLICY "Authors can update own draft articles" 
ON public.articles FOR UPDATE 
USING (
  auth.uid() = created_by 
  AND status IN ('draft', 'changes_requested')
  AND public.check_user_permission('articles.update_own')
);

-- Biên tập viên & Tổng biên tập sửa bài
CREATE POLICY "Editors can update articles" 
ON public.articles FOR UPDATE 
USING (public.check_user_permission('articles.review') OR public.check_user_permission('articles.publish'));

-- --------------------------------------------------------------------
-- 6. CHÍNH SÁCH BẢNG MEDIA_ASSETS
-- --------------------------------------------------------------------
CREATE POLICY "Media is readable by everyone" 
ON public.media_assets FOR SELECT USING (true);

CREATE POLICY "Authorized staff can upload media" 
ON public.media_assets FOR INSERT 
WITH CHECK (public.check_user_permission('media.upload'));

CREATE POLICY "Authorized staff can delete media" 
ON public.media_assets FOR DELETE 
USING (public.check_user_permission('media.delete'));

-- --------------------------------------------------------------------
-- 7. CHÍNH SÁCH BẢNG BOOKMARKS
-- --------------------------------------------------------------------
CREATE POLICY "Users can view own bookmarks" 
ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookmarks" 
ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" 
ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);

-- --------------------------------------------------------------------
-- 8. CHÍNH SÁCH BẢNG COMMENTS
-- --------------------------------------------------------------------
-- Mọi người đọc được bình luận đã duyệt
CREATE POLICY "Public can read approved comments" 
ON public.comments FOR SELECT USING (status = 'approved');

-- Người dùng xem bình luận của chính mình
CREATE POLICY "Users can see own comments" 
ON public.comments FOR SELECT USING (auth.uid() = user_id);

-- Độc giả đăng nhập được gửi bình luận mới (mặc định pending kiểm duyệt)
CREATE POLICY "Authenticated users can submit comments" 
ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Moderator kiểm duyệt bình luận
CREATE POLICY "Moderators can update comments" 
ON public.comments FOR UPDATE USING (public.check_user_permission('comments.moderate'));

-- --------------------------------------------------------------------
-- 9. CHÍNH SÁCH BẢNG ADVERTISING & PLACEMENTS
-- --------------------------------------------------------------------
CREATE POLICY "Placements readable by everyone" 
ON public.ad_placements FOR SELECT USING (is_active = true);

CREATE POLICY "Active creatives readable by everyone" 
ON public.ad_creatives FOR SELECT USING (is_active = true);

CREATE POLICY "Ads manageable by ads managers" 
ON public.ad_campaigns FOR ALL USING (public.check_user_permission('ads.manage'));

CREATE POLICY "Creatives manageable by ads managers" 
ON public.ad_creatives FOR ALL USING (public.check_user_permission('ads.manage'));

-- --------------------------------------------------------------------
-- 10. CHÍNH SÁCH BẢNG SITE_SETTINGS
-- --------------------------------------------------------------------
CREATE POLICY "Site settings readable by public" 
ON public.site_settings FOR SELECT USING (true);

CREATE POLICY "Site settings manageable by admins" 
ON public.site_settings FOR ALL USING (public.check_user_permission('settings.manage'));

-- --------------------------------------------------------------------
-- 11. CHÍNH SÁCH BẢNG AUDIT_LOGS
-- --------------------------------------------------------------------
-- Chỉ Admin / Super Admin được xem audit log
CREATE POLICY "Admins can view audit logs" 
ON public.audit_logs FOR SELECT USING (public.check_user_permission('audit_logs.read'));

-- Chặn tuyệt đối UPDATE/DELETE trên bảng audit_logs từ client
-- (Không tạo policy UPDATE/DELETE -> mặc định deny)
