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
