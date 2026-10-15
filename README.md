# TINVANTA — BÁO ĐIỆN TỬ TIN TỨC HÀNG ĐẦU 24/7
*Nền tảng báo điện tử đa phương tiện, vận hành thương mại chuẩn quốc gia | Tin tức nhanh — Thông tin chuẩn*

[![GitHub repo](https://img.shields.io/badge/GitHub-TinVanta-red.svg)](https://github.com/nguyencongnguyenmedia2-coder/TinVanta.git)

---

## 1. TỔNG QUAN DỰ ÁN

**TinVanta** là nền tảng báo điện tử toàn diện bao gồm:
- **Website công khai (Public Portal):** Thiết kế hiện đại, responsive từ 320px đến 4K, tốc độ tải trang Core Web Vitals tối ưu, bố cục báo chí chuyên nghiệp (tin nóng, spotlight, tin dòng thời sự, chuyên mục, top đọc nhiều, podcast/multimedia, widgets).
- **Tòa soạn số hội tụ (CMS Quản Trị `/admin`):** Bảng điều khiển KPI thời gian thực, bảng quản lý tin bài TanStack, trình soạn thảo rich-text TipTap, quản lý chuyên mục, chiến dịch quảng cáo và nhật ký audit trail.
- **Workflow tòa soạn 7 bước:** Phóng viên tạo bài (`draft`) → Nộp duyệt (`pending_review`) → Biên tập viên rà soát/yêu cầu sửa (`changes_requested`) → Phê duyệt (`approved`) → Lên lịch (`scheduled`) → Xuất bản ngay (`published`) → Lưu trữ (`archived`).
- **AI Trợ lý biên tập (Human-in-the-loop):** Gợi ý tiêu đề, tự động viết sapo tóm tắt, đề xuất từ khóa/thẻ tag và kiểm tra chính tả. AI không bao giờ tự ý xuất bản.
- **Hệ thống quảng cáo nội bộ (Ads Engine):** Quản lý banners, theo dõi impressions, clicks và chống gian lận click fraud.
- **Bảo mật & Phân quyền:** Supabase PostgreSQL RLS 100% trên 33 bảng, ma trận phân quyền RBAC 10 vai trò, chống XSS, CSRF, IDOR, SQL Injection.

---

## 2. CÔNG NGHỆ SỬ DỤNG (TECH STACK)

- **Frontend & Server:** Next.js (App Router, Turbopack, Server Components, Server Actions).
- **Ngôn ngữ:** TypeScript Strict Mode.
- **Styling:** Tailwind CSS + Design Tokens chuyên dụng báo chí.
- **Database & Storage:** Supabase PostgreSQL (33 tables, RLS, Full-Text Search tiếng Việt) + Supabase Storage.
- **Biên tập nội dung:** TipTap Editor + Sanitize Server-side an toàn.
- **Bảng dữ liệu & Thống kê:** TanStack Table, Lucide React, Recharts.
- **Kiểm thử:** Vitest + React Testing Library.

---

## 3. CẤU TRÚC THƯ MỤC SOURCE CODE

```
├── .env.example                # File mẫu biến môi trường
├── .env.local                  # Cấu hình môi trường phát triển local
├── src/
│   ├── app/
│   │   ├── (public)/           # Trang chủ, chuyên mục, bài viết, tìm kiếm
│   │   ├── admin/              # Hệ thống CMS tòa soạn (/admin)
│   │   ├── api/                # Route handlers: Ads tracking, Cron, AI, Newsletter
│   │   ├── sitemap.ts          # Dynamic XML Sitemap cho Google News
│   │   ├── robots.ts           # Robots.txt chuẩn SEO
│   │   └── rss.xml/            # RSS 2.0 Feed
│   ├── components/
│   │   ├── layout/             # Header, Footer, BreakingTicker, Navigation
│   │   ├── news/               # NewsCard, FeaturedSpotlight, CategoryBlock, TrendingWidget
│   │   ├── article/            # ArticleActions (cỡ chữ, bookmark, chia sẻ, in bài), Comments
│   │   ├── editor/             # TipTapEditor
│   │   ├── ads/                # AdSlot (Anti-fraud click tracker)
│   │   └── forms/              # NewsletterWidget
│   ├── features/               # Module nghiệp vụ mở rộng
│   ├── lib/
│   │   ├── auth/               # RBAC matrix & authorization checker
│   │   ├── data/               # Data Access Layer & Mock Data Repository
│   │   ├── security/           # HTML sanitization chống XSS
│   │   ├── supabase/           # Supabase SSR client, server client, admin client
│   │   └── utils.ts            # Helper định dạng ngày tháng tiếng Việt, slugify
│   ├── types/
│   │   └── database.ts         # TypeScript types cho 33 bảng cơ sở dữ liệu
│   └── tests/
│       ├── setup.ts            # Setup test runner
│       └── unit.test.ts        # Unit tests cho Slug, Sanitizer, RBAC
└── supabase/
    └── migrations/
        ├── 01_initial_schema.sql    # 33 bảng, khóa ngoại, indexes, triggers, FTS
        ├── 02_rls_policies.sql      # Row Level Security toàn diện
        ├── 03_seed_data.sql         # Dữ liệu ban đầu (chuyên mục, vai trò, quyền, ads)
        └── 04_bootstrap_admin.sql   # Quy trình kích hoạt tài khoản Super Admin an toàn
```

---

## 4. HƯỚNG DẪN CÀI ĐẶT & CHẠY LOCAL

### Bước 1: Clone và Cài đặt Dependencies
```bash
npm install
```

### Bước 2: Thiết lập Biến Môi Trường
Sao chép `.env.example` thành `.env.local`:
```bash
cp .env.example .env.local
```
Điền các tham số kết nối Supabase của bạn (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).

### Bước 3: Chạy Cơ Sở Dữ Liệu Supabase
Đăng nhập vào Supabase Dashboard hoặc chạy qua Supabase CLI:
Thực thi các file migration theo đúng thứ tự trong `supabase/migrations/`:
1. `01_initial_schema.sql`
2. `02_rls_policies.sql`
3. `03_seed_data.sql`
4. `04_bootstrap_admin.sql`

### Bước 4: Bootstrap Tài Khoản Super Admin Ban Đầu
Sau khi người dùng đăng ký tài khoản qua Supabase Auth, mở **Supabase SQL Editor** và chạy:
```sql
SELECT public.bootstrap_super_admin(
  'UUID_CUA_USER_TRONG_AUTH_USERS',
  'admin@newshub.vn',
  'Tổng Quản Trị Viên'
);
```

### Bước 5: Chạy Ứng Dụng Môi Trường Dev
```bash
npm run dev
```
Mở trình duyệt tại [http://localhost:3000](http://localhost:3000).
- Giao diện báo điện tử công khai: [http://localhost:3000](http://localhost:3000)
- Tòa soạn số CMS: [http://localhost:3000/admin](http://localhost:3000/admin)

### Bước 6: Chạy Kiểm Thử (Tests) & Build Production
```bash
npm run test
npm run build
```

---

## 5. HƯỚNG DẪN TRIỂN KHAI VERCEL (PRODUCTION DEPLOYMENT)

1. Đẩy mã nguồn lên kho lưu trữ GitHub / GitLab riêng của bạn.
2. Đăng nhập Vercel và chọn **Import Project**.
3. Cấu hình các biến môi trường từ file `.env.example`:
   - `NEXT_PUBLIC_SITE_URL`: Domain chính thức (ví dụ: `https://newshub.vn`)
   - `NEXT_PUBLIC_SUPABASE_URL`: URL project Supabase Production
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Anon Key
   - `SUPABASE_SERVICE_ROLE_KEY`: Supabase Service Role Key (Server-only)
   - `CRON_SECRET`: Mã bí mật kích hoạt xuất bản bài viết lên lịch
   - `AI_ASSISTANT_ENABLED`: `true` hoặc `false`
4. Cấu hình Cron Job trên Vercel hoặc GitHub Actions để định kỳ gọi endpoint:
   ```
   GET /api/cron/publish-scheduled
   Header: Authorization: Bearer <CRON_SECRET>
   ```
   Tần suất khuyến nghị: Mỗi 5 phút (`*/5 * * * *`).

---

## 6. LƯU Ý PHÁP LÝ & BẢN QUYỀN

NEWSHUB VIỆT NAM là nền tảng công nghệ báo điện tử. Việc vận hành trang tin, liên kết xuất bản và khai thác thương mại cần tuân thủ đầy đủ Luật Báo chí Việt Nam, quy định về bảo vệ dữ liệu cá nhân (Nghị định 13/2023/NĐ-CP) và các giấy phép thiết lập trang thông tin điện tử / cơ quan báo chí theo quy định của Bộ Thông tin và Truyền thông.
