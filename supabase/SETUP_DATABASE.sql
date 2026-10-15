-- ====================================================================
-- NEWSHUB VIỆT NAM — MIGRATION 01: INITIAL SCHEMA (33 TABLES)
-- ====================================================================

-- 1. Kích hoạt extensions cần thiết
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- 2. Hàm trigger tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------------------------------
-- 3. BẢNG 1: PROFILES (Tách biệt khỏi auth.users)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  title_role TEXT DEFAULT 'Phóng viên',
  is_author BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_profiles_slug ON public.profiles(slug);
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- --------------------------------------------------------------------
-- 4. BẢNG 2: ROLES
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- --------------------------------------------------------------------
-- 5. BẢNG 3: PERMISSIONS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.permissions (
  id TEXT PRIMARY KEY,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- --------------------------------------------------------------------
-- 6. BẢNG 4: ROLE_PERMISSIONS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_id TEXT NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id TEXT NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (role_id, permission_id)
);

-- --------------------------------------------------------------------
-- 7. BẢNG 5: USER_ROLES
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id TEXT NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, role_id)
);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id);

-- --------------------------------------------------------------------
-- 8. BẢNG 6: CATEGORIES
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  sort_order INT DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  show_in_menu BOOLEAN DEFAULT true NOT NULL,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON public.categories(parent_id);
DROP TRIGGER IF EXISTS trg_categories_updated_at ON public.categories;
CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- --------------------------------------------------------------------
-- 9. BẢNG 7: TAGS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  article_count INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON public.tags(slug);

-- --------------------------------------------------------------------
-- 10. BẢNG 13: MEDIA_ASSETS (Tạo trước để articles tham chiếu)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.media_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  width INT,
  height INT,
  alt_text TEXT,
  caption TEXT,
  credit TEXT,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON public.media_assets(uploaded_by);

-- --------------------------------------------------------------------
-- 11. BẢNG 8: ARTICLES
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  sapo TEXT NOT NULL,
  content_html TEXT NOT NULL,
  content_json JSONB,
  primary_category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  featured_image_id UUID REFERENCES public.media_assets(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'changes_requested', 'approved', 'scheduled', 'published', 'archived')),
  version INT DEFAULT 1 NOT NULL,
  published_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  reading_time_minutes INT DEFAULT 3 NOT NULL,
  is_featured BOOLEAN DEFAULT false NOT NULL,
  is_breaking BOOLEAN DEFAULT false NOT NULL,
  allow_comments BOOLEAN DEFAULT true NOT NULL,
  seo_title TEXT,
  seo_description TEXT,
  canonical_url TEXT,
  view_count BIGINT DEFAULT 0 NOT NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_articles_status_pub ON public.articles(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(primary_category_id);
CREATE INDEX IF NOT EXISTS idx_articles_created_by ON public.articles(created_by);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON public.articles(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_articles_breaking ON public.articles(is_breaking) WHERE is_breaking = true;
DROP TRIGGER IF EXISTS trg_articles_updated_at ON public.articles;
CREATE TRIGGER trg_articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Full Text Search column & index (tiếng Việt không dấu và có dấu)
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;

CREATE OR REPLACE FUNCTION public.articles_update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('simple', unaccent(coalesce(NEW.title, '') || ' ' || coalesce(NEW.sapo, '') || ' ' || coalesce(NEW.content_html, '')));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_articles_search_vector ON public.articles;
CREATE TRIGGER trg_articles_search_vector
BEFORE INSERT OR UPDATE ON public.articles
FOR EACH ROW EXECUTE FUNCTION public.articles_update_search_vector();

CREATE INDEX IF NOT EXISTS idx_articles_search ON public.articles USING GIN(search_vector);

-- --------------------------------------------------------------------
-- 12. BẢNG 9: ARTICLE_VERSIONS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.article_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  version INT NOT NULL,
  title TEXT NOT NULL,
  sapo TEXT NOT NULL,
  content_html TEXT NOT NULL,
  content_json JSONB,
  saved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (article_id, version)
);

-- --------------------------------------------------------------------
-- 13. BẢNG 10: ARTICLE_CATEGORIES (Quan hệ phụ ngoài primary category)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.article_categories (
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, category_id)
);

-- --------------------------------------------------------------------
-- 14. BẢNG 11: ARTICLE_TAGS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.article_tags (
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- --------------------------------------------------------------------
-- 15. BẢNG 12: ARTICLE_AUTHORS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.article_authors (
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT true NOT NULL,
  PRIMARY KEY (article_id, author_id)
);

-- --------------------------------------------------------------------
-- 16. BẢNG 14: EDITORIAL_ASSIGNMENTS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.editorial_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  due_date TIMESTAMPTZ,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- --------------------------------------------------------------------
-- 17. BẢNG 15: EDITORIAL_REVIEWS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.editorial_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  from_status TEXT NOT NULL,
  to_status TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('request_changes', 'approve', 'reject', 'publish', 'schedule')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reviews_article ON public.editorial_reviews(article_id);

-- --------------------------------------------------------------------
-- 18. BẢNG 16: EDITORIAL_COMMENTS (Bình luận nội bộ tòa soạn)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.editorial_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- --------------------------------------------------------------------
-- 19. BẢNG 17: COMMENTS (Bình luận độc giả)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'spam')),
  moderated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_comments_article_status ON public.comments(article_id, status);

-- --------------------------------------------------------------------
-- 20. BẢNG 18: COMMENT_REPORTS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.comment_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- --------------------------------------------------------------------
-- 21. BẢNG 19: BOOKMARKS (Lưu bài độc giả)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, article_id)
);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.bookmarks(user_id);

-- --------------------------------------------------------------------
-- 22. BẢNG 20: NEWSLETTERS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.newsletters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject TEXT NOT NULL,
  content_html TEXT NOT NULL,
  sent_at TIMESTAMPTZ,
  sent_count INT DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- --------------------------------------------------------------------
-- 23. BẢNG 21: NEWSLETTER_SUBSCRIPTIONS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  is_verified BOOLEAN DEFAULT false NOT NULL,
  verification_token TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'unsubscribed')),
  subscribed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  unsubscribed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_subscriptions(email);

-- --------------------------------------------------------------------
-- 24. BẢNG 22: NOTIFICATIONS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);

-- --------------------------------------------------------------------
-- 25. BẢNG 23: AD_CAMPAIGNS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ad_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advertiser_name TEXT NOT NULL,
  campaign_name TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- --------------------------------------------------------------------
-- 26. BẢNG 25: AD_PLACEMENTS (Vị trí quảng cáo chuẩn)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ad_placements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location_code TEXT UNIQUE NOT NULL,
  device_target TEXT DEFAULT 'all' CHECK (device_target IN ('all', 'desktop', 'mobile')),
  width INT,
  height INT,
  is_active BOOLEAN DEFAULT true NOT NULL
);

-- --------------------------------------------------------------------
-- 27. BẢNG 24: AD_CREATIVES
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ad_creatives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  placement_id TEXT NOT NULL REFERENCES public.ad_placements(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  destination_url TEXT NOT NULL,
  impressions_count BIGINT DEFAULT 0 NOT NULL,
  clicks_count BIGINT DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ad_creatives_placement ON public.ad_creatives(placement_id, is_active);

-- --------------------------------------------------------------------
-- 28. BẢNG 26: AD_EVENTS (Fraud protection & deduplication)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ad_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creative_id UUID NOT NULL REFERENCES public.ad_creatives(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('impression', 'click')),
  ip_hash TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ad_events_creative ON public.ad_events(creative_id, event_type, created_at);

-- --------------------------------------------------------------------
-- 29. BẢNG 27: SITE_SETTINGS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- --------------------------------------------------------------------
-- 30. BẢNG 28: REDIRECTS (301/302 redirects)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.redirects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_path TEXT UNIQUE NOT NULL,
  target_path TEXT NOT NULL,
  status_code INT DEFAULT 301 CHECK (status_code IN (301, 302)),
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- --------------------------------------------------------------------
-- 31. BẢNG 29: ARTICLE_VIEW_EVENTS (Deduplicated page views)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.article_view_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  ip_hash TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_view_events_article_time ON public.article_view_events(article_id, created_at);

-- --------------------------------------------------------------------
-- 32. BẢNG 30: DAILY_ARTICLE_STATS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_article_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  view_count BIGINT DEFAULT 0 NOT NULL,
  unique_visitors BIGINT DEFAULT 0 NOT NULL,
  UNIQUE(article_id, date)
);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON public.daily_article_stats(date DESC);

-- --------------------------------------------------------------------
-- 33. BẢNG 31: AUDIT_LOGS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action, created_at DESC);

-- --------------------------------------------------------------------
-- 34. BẢNG 32: AI_USAGE_LOGS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  prompt_tokens INT DEFAULT 0,
  completion_tokens INT DEFAULT 0,
  provider TEXT NOT NULL,
  status TEXT DEFAULT 'success',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- --------------------------------------------------------------------
-- 35. BẢNG 33: SCHEDULED_JOBS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scheduled_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  attempts INT DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  executed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_status_time ON public.scheduled_jobs(status, scheduled_for) WHERE status = 'pending';


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
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

-- Người dùng chỉ được sửa profile của chính mình
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- --------------------------------------------------------------------
-- 4. CHÍNH SÁCH BẢNG CATEGORIES & TAGS
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Categories are readable by everyone" ON public.categories;
CREATE POLICY "Categories are readable by everyone" 
ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Categories manageable by authorized staff" ON public.categories;
CREATE POLICY "Categories manageable by authorized staff" 
ON public.categories FOR ALL USING (public.check_user_permission('categories.manage'));

DROP POLICY IF EXISTS "Tags are readable by everyone" ON public.tags;
CREATE POLICY "Tags are readable by everyone" 
ON public.tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Tags manageable by authorized staff" ON public.tags;
CREATE POLICY "Tags manageable by authorized staff" 
ON public.tags FOR ALL USING (public.check_user_permission('tags.manage'));

-- --------------------------------------------------------------------
-- 5. CHÍNH SÁCH BẢNG ARTICLES
-- --------------------------------------------------------------------
-- Độc giả công khai chỉ đọc được bài đã xuất bản (status = 'published' AND published_at <= NOW())
DROP POLICY IF EXISTS "Public can view published articles" ON public.articles;
CREATE POLICY "Public can view published articles" 
ON public.articles FOR SELECT 
USING (status = 'published' AND published_at <= NOW() AND deleted_at IS NULL);

-- Nhân viên tòa soạn có quyền articles.read_all đọc được mọi bài
DROP POLICY IF EXISTS "Editorial staff can view all articles" ON public.articles;
CREATE POLICY "Editorial staff can view all articles" 
ON public.articles FOR SELECT 
USING (public.check_user_permission('articles.read_all'));

-- Phóng viên đọc được bài do chính mình tạo ra
DROP POLICY IF EXISTS "Authors can view own articles" ON public.articles;
CREATE POLICY "Authors can view own articles" 
ON public.articles FOR SELECT 
USING (auth.uid() = created_by);

-- Tạo bài viết mới
DROP POLICY IF EXISTS "Staff can create articles" ON public.articles;
CREATE POLICY "Staff can create articles" 
ON public.articles FOR INSERT 
WITH CHECK (public.check_user_permission('articles.create') AND auth.uid() = created_by);

-- Phóng viên sửa bài của mình khi ở trạng thái draft hoặc changes_requested
DROP POLICY IF EXISTS "Authors can update own draft articles" ON public.articles;
CREATE POLICY "Authors can update own draft articles" 
ON public.articles FOR UPDATE 
USING (
  auth.uid() = created_by 
  AND status IN ('draft', 'changes_requested')
  AND public.check_user_permission('articles.update_own')
);

-- Biên tập viên & Tổng biên tập sửa bài
DROP POLICY IF EXISTS "Editors can update articles" ON public.articles;
CREATE POLICY "Editors can update articles" 
ON public.articles FOR UPDATE 
USING (public.check_user_permission('articles.review') OR public.check_user_permission('articles.publish'));

-- --------------------------------------------------------------------
-- 6. CHÍNH SÁCH BẢNG MEDIA_ASSETS
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Media is readable by everyone" ON public.media_assets;
CREATE POLICY "Media is readable by everyone" 
ON public.media_assets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authorized staff can upload media" ON public.media_assets;
CREATE POLICY "Authorized staff can upload media" 
ON public.media_assets FOR INSERT 
WITH CHECK (public.check_user_permission('media.upload'));

DROP POLICY IF EXISTS "Authorized staff can delete media" ON public.media_assets;
CREATE POLICY "Authorized staff can delete media" 
ON public.media_assets FOR DELETE 
USING (public.check_user_permission('media.delete'));

-- --------------------------------------------------------------------
-- 7. CHÍNH SÁCH BẢNG BOOKMARKS
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can view own bookmarks" 
ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can create own bookmarks" 
ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can delete own bookmarks" 
ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);

-- --------------------------------------------------------------------
-- 8. CHÍNH SÁCH BẢNG COMMENTS
-- --------------------------------------------------------------------
-- Mọi người đọc được bình luận đã duyệt
DROP POLICY IF EXISTS "Public can read approved comments" ON public.comments;
CREATE POLICY "Public can read approved comments" 
ON public.comments FOR SELECT USING (status = 'approved');

-- Người dùng xem bình luận của chính mình
DROP POLICY IF EXISTS "Users can see own comments" ON public.comments;
CREATE POLICY "Users can see own comments" 
ON public.comments FOR SELECT USING (auth.uid() = user_id);

-- Độc giả đăng nhập được gửi bình luận mới (mặc định pending kiểm duyệt)
DROP POLICY IF EXISTS "Authenticated users can submit comments" ON public.comments;
CREATE POLICY "Authenticated users can submit comments" 
ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Moderator kiểm duyệt bình luận
DROP POLICY IF EXISTS "Moderators can update comments" ON public.comments;
CREATE POLICY "Moderators can update comments" 
ON public.comments FOR UPDATE USING (public.check_user_permission('comments.moderate'));

-- --------------------------------------------------------------------
-- 9. CHÍNH SÁCH BẢNG ADVERTISING & PLACEMENTS
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Placements readable by everyone" ON public.ad_placements;
CREATE POLICY "Placements readable by everyone" 
ON public.ad_placements FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Active creatives readable by everyone" ON public.ad_creatives;
CREATE POLICY "Active creatives readable by everyone" 
ON public.ad_creatives FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Ads manageable by ads managers" ON public.ad_campaigns;
CREATE POLICY "Ads manageable by ads managers" 
ON public.ad_campaigns FOR ALL USING (public.check_user_permission('ads.manage'));

DROP POLICY IF EXISTS "Creatives manageable by ads managers" ON public.ad_creatives;
CREATE POLICY "Creatives manageable by ads managers" 
ON public.ad_creatives FOR ALL USING (public.check_user_permission('ads.manage'));

-- --------------------------------------------------------------------
-- 10. CHÍNH SÁCH BẢNG SITE_SETTINGS
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Site settings readable by public" ON public.site_settings;
CREATE POLICY "Site settings readable by public" 
ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Site settings manageable by admins" ON public.site_settings;
CREATE POLICY "Site settings manageable by admins" 
ON public.site_settings FOR ALL USING (public.check_user_permission('settings.manage'));

-- --------------------------------------------------------------------
-- 11. CHÍNH SÁCH BẢNG AUDIT_LOGS
-- --------------------------------------------------------------------
-- Chỉ Admin / Super Admin được xem audit log
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs" 
ON public.audit_logs FOR SELECT USING (public.check_user_permission('audit_logs.read'));

-- Chặn tuyệt đối UPDATE/DELETE trên bảng audit_logs từ client
-- (Không tạo policy UPDATE/DELETE -> mặc định deny)


-- ====================================================================
-- NEWSHUB VIỆT NAM — MIGRATION 03: SEED DATA
-- ====================================================================

-- 1. SEED ROLES
INSERT INTO public.roles (id, name, description, is_system) VALUES
('super_admin', 'Super Admin', 'Toàn quyền quản trị cao nhất hệ thống', true),
('admin', 'Admin', 'Quản trị viên hệ thống', true),
('editor_in_chief', 'Tổng biên tập', 'Phê duyệt, chỉ đạo xuất bản bài viết và điều hành tòa soạn', true),
('editor', 'Biên tập viên', 'Biên tập, rà soát, yêu cầu sửa bài của phóng viên', true),
('reporter', 'Phóng viên', 'Viết bài, gửi duyệt nội dung', true),
('seo_manager', 'SEO Manager', 'Tối ưu hóa công cụ tìm kiếm, sitemaps và metadata', true),
('ads_manager', 'Advertising Manager', 'Quản lý chiến dịch quảng cáo và doanh thu', true),
('moderator', 'Moderator', 'Kiểm duyệt bình luận và tương tác độc giả', true),
('reader', 'Độc giả', 'Đọc tin tức, lưu bài và bình luận', true)
ON CONFLICT (id) DO NOTHING;

-- 2. SEED PERMISSIONS
INSERT INTO public.permissions (id, resource, action, description) VALUES
('articles.read_published', 'articles', 'read_published', 'Đọc các bài viết đã xuất bản công khai'),
('articles.read_all', 'articles', 'read_all', 'Xem tất cả bài viết bao gồm nháp và chờ duyệt'),
('articles.create', 'articles', 'create', 'Tạo bài viết mới'),
('articles.update_own', 'articles', 'update_own', 'Sửa bài viết của chính mình khi chưa xuất bản'),
('articles.update_assigned', 'articles', 'update_assigned', 'Sửa bài viết được giao biên tập'),
('articles.review', 'articles', 'review', 'Kiểm tra và gửi nhận xét bài viết'),
('articles.approve', 'articles', 'approve', 'Phê duyệt bài viết'),
('articles.publish', 'articles', 'publish', 'Xuất bản bài viết lên trang chủ'),
('articles.schedule', 'articles', 'schedule', 'Lên lịch xuất bản bài viết'),
('articles.archive', 'articles', 'archive', 'Thu hồi hoặc lưu trữ bài viết'),
('categories.manage', 'categories', 'manage', 'Thêm, sửa, xóa và sắp xếp chuyên mục'),
('tags.manage', 'tags', 'manage', 'Quản lý từ khóa và thẻ bài viết'),
('media.upload', 'media', 'upload', 'Tải ảnh và tệp phương tiện lên hệ thống'),
('media.delete', 'media', 'delete', 'Xóa ảnh và tệp phương tiện'),
('seo.manage', 'seo', 'manage', 'Quản lý thẻ SEO, Sitemap và canonicals'),
('ads.manage', 'ads', 'manage', 'Quản lý chiến dịch quảng cáo và vị trí'),
('comments.moderate', 'comments', 'moderate', 'Kiểm duyệt và phản hồi bình luận'),
('users.manage', 'users', 'manage', 'Quản lý tài khoản người dùng'),
('roles.manage', 'roles', 'manage', 'Phân vai trò và quyền hạn'),
('settings.manage', 'settings', 'manage', 'Cấu hình cài đặt hệ thống'),
('analytics.read', 'analytics', 'read', 'Xem báo cáo và thống kê truy cập'),
('audit_logs.read', 'audit_logs', 'read', 'Xem nhật ký hoạt động hệ thống')
ON CONFLICT (id) DO NOTHING;

-- 3. SEED ROLE_PERMISSIONS
-- Tổng biên tập
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 'editor_in_chief', id FROM public.permissions 
WHERE id IN ('articles.read_published', 'articles.read_all', 'articles.create', 'articles.update_own', 'articles.update_assigned', 'articles.review', 'articles.approve', 'articles.publish', 'articles.schedule', 'articles.archive', 'categories.manage', 'tags.manage', 'media.upload', 'media.delete', 'seo.manage', 'comments.moderate', 'analytics.read')
ON CONFLICT DO NOTHING;

-- Biên tập viên
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 'editor', id FROM public.permissions 
WHERE id IN ('articles.read_published', 'articles.read_all', 'articles.create', 'articles.update_own', 'articles.update_assigned', 'articles.review', 'tags.manage', 'media.upload', 'comments.moderate', 'analytics.read')
ON CONFLICT DO NOTHING;

-- Phóng viên
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 'reporter', id FROM public.permissions 
WHERE id IN ('articles.read_published', 'articles.create', 'articles.update_own', 'tags.manage', 'media.upload')
ON CONFLICT DO NOTHING;

-- SEO Manager
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 'seo_manager', id FROM public.permissions 
WHERE id IN ('articles.read_published', 'articles.read_all', 'categories.manage', 'tags.manage', 'seo.manage', 'analytics.read')
ON CONFLICT DO NOTHING;

-- Ads Manager
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 'ads_manager', id FROM public.permissions 
WHERE id IN ('articles.read_published', 'ads.manage', 'media.upload', 'analytics.read')
ON CONFLICT DO NOTHING;

-- Moderator
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 'moderator', id FROM public.permissions 
WHERE id IN ('articles.read_published', 'comments.moderate')
ON CONFLICT DO NOTHING;

-- Reader
INSERT INTO public.role_permissions (role_id, permission_id)
VALUES ('reader', 'articles.read_published')
ON CONFLICT DO NOTHING;

-- 4. SEED CATEGORIES (Chuyên mục chuẩn)
INSERT INTO public.categories (id, name, slug, description, sort_order, is_active, show_in_menu) VALUES
('c0000000-0000-0000-0000-000000000001', 'Thời sự', 'thoi-su', 'Tin tức sự kiện thời sự trong nước và quốc tế nóng hổi', 1, true, true),
('c0000000-0000-0000-0000-000000000002', 'Kinh tế', 'kinh-te', 'Tài chính, ngân hàng, thị trường chứng khoán và doanh nghiệp', 2, true, true),
('c0000000-0000-0000-0000-000000000003', 'Công nghệ', 'cong-nghe', 'Đổi mới sáng tạo, trí tuệ nhân tạo, thiết bị và viễn thông', 3, true, true),
('c0000000-0000-0000-0000-000000000004', 'Xã hội', 'xa-hoi', 'Đời sống dân sinh, an sinh xã hội và câu chuyện nhân văn', 4, true, true),
('c0000000-0000-0000-0000-000000000005', 'Pháp luật', 'phap-luat', 'Phổ biến pháp luật, vụ án và phân tích tư pháp', 5, true, true),
('c0000000-0000-0000-0000-000000000006', 'Giáo dục', 'giao-duc', 'Tuyển sinh, đổi mới giáo dục và học bổng', 6, true, true),
('c0000000-0000-0000-0000-000000000007', 'Sức khỏe', 'suc-khoe', 'Y tế học đường, dinh dưỡng và tiến bộ y khoa', 7, true, true),
('c0000000-0000-0000-0000-000000000008', 'Thể thao', 'the-thao', 'Bóng đá trong nước, thể thao thế giới và Olympic', 8, true, true),
('c0000000-0000-0000-0000-000000000009', 'Giải trí', 'giai-tri', 'Văn hóa nghệ thuật, điện ảnh và âm nhạc', 9, true, true),
('c0000000-0000-0000-0000-000000000010', 'Xe & Giao thông', 'xe', 'Thị trường ô tô, xe điện và an toàn giao thông', 10, true, true)
ON CONFLICT (slug) DO NOTHING;

-- 5. SEED TAGS
INSERT INTO public.tags (name, slug, description) VALUES
('Trí tuệ nhân tạo', 'tri-tue-nhan-tao', 'Các đột phá và ứng dụng của trí tuệ nhân tạo AI'),
('Chuyển đổi số', 'chuyen-doi-so', 'Chương trình chuyển đổi số quốc gia và doanh nghiệp'),
('Kinh tế xanh', 'kinh-te-xanh', 'Phát triển bền vững, năng lượng sạch và ESG'),
('Bất động sản', 'bat-dong-san', 'Thị trường địa ốc, nhà ở xã hội và chính sách đất đai'),
('Bóng đá Việt Nam', 'bong-da-viet-nam', 'Đội tuyển quốc gia và giải vô địch quốc gia'),
('Khởi nghiệp', 'khoi-nghiep', 'Hệ sinh thái startup và đổi mới sáng tạo'),
('Hạ tầng giao thông', 'ha-tang-giao-thong', 'Cao tốc Bắc Nam, sân bay và metro')
ON CONFLICT (slug) DO NOTHING;

-- 6. SEED AD PLACEMENTS
INSERT INTO public.ad_placements (id, name, location_code, device_target, width, height, is_active) VALUES
('placement_header_banner', 'Banner đầu trang (Leaderboard)', 'header_top', 'all', 970, 90, true),
('placement_sidebar_top', 'Banner góc phải trên (Medium Rectangle)', 'sidebar_top', 'desktop', 300, 250, true),
('placement_sidebar_sticky', 'Banner bám dính cột phải (Half Page)', 'sidebar_sticky', 'desktop', 300, 600, true),
('placement_inline_article', 'Quảng cáo giữa bài viết (Inline Article)', 'article_middle', 'all', 640, 200, true),
('placement_home_middle', 'Banner ngang trang chủ', 'home_middle', 'all', 1200, 150, true),
('placement_mobile_sticky', 'Banner chân trang di động', 'mobile_bottom_sticky', 'mobile', 320, 50, true)
ON CONFLICT (id) DO NOTHING;

-- 7. SEED SITE SETTINGS
INSERT INTO public.site_settings (key, value, description) VALUES
('general', '{
  "site_name": "TinVanta",
  "site_slogan": "Tin tức nhanh — Thông tin chuẩn",
  "primary_color": "#D71920",
  "navy_color": "#172033",
  "logo_url": "/logo-tinvanta-v2.png",
  "favicon_url": "/favicon.ico",
  "hotline": "1900 6868",
  "email_contact": "toasoan@tinvanta.vn",
  "address": "Tòa soạn TinVanta, Hà Nội, Việt Nam",
  "copyright": "© 2026 TinVanta. Toàn quyền bảo lưu thông tin."
}', 'Cấu hình chung và nhận diện thương hiệu'),

('editorial', '{
  "breaking_news_enabled": true,
  "breaking_news_text": "Chính phủ ban hành chiến lược phát triển công nghệ bán dẫn quốc gia đến năm 2030",
  "breaking_news_link": "/bai-viet/viet-nam-but-pha-trong-chuoi-cung-ung-vi-mach-ban-dan-toan-cau",
  "auto_schedule_interval_minutes": 5,
  "enable_comments": true,
  "comments_require_moderation": true,
  "allow_ai_assistance": true
}', 'Cấu hình xuất bản và biên tập'),

('seo', '{
  "meta_title": "TinVanta - Báo Điện Tử Tin Tức Hàng Đầu 24/7 | Tin Nhanh & Chuẩn Xác",
  "meta_description": "Cập nhật liên tục tin tức thời sự, kinh tế, công nghệ, xã hội, thể thao nhanh chóng và chính xác nhất tại Việt Nam.",
  "canonical_domain": "https://tinvanta.vn",
  "default_og_image": "/logo-tinvanta-v2.png",
  "twitter_handle": "@tinvantavn"
}', 'Cấu hình SEO mặc định toàn trang')
ON CONFLICT (key) DO NOTHING;
