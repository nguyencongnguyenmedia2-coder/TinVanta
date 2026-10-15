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
