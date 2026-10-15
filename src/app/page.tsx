import React from 'react';
import { 
  getPublishedArticles, 
  getCategories, 
  getAdByPlacement 
} from '@/lib/data/articles';
import { MarketDataBar } from '@/components/news/MarketDataBar';
import { FeaturedSpotlight } from '@/components/news/FeaturedSpotlight';
import { MultimediaShowcase } from '@/components/news/MultimediaShowcase';
import { OpinionColumn } from '@/components/news/OpinionColumn';
import { NewsCard } from '@/components/news/NewsCard';
import { TrendingWidget } from '@/components/news/TrendingWidget';
import { CategoryBlock } from '@/components/news/CategoryBlock';
import { AdSlot } from '@/components/ads/AdSlot';
import { NewsletterWidget } from '@/components/forms/NewsletterWidget';
import { Clock, Radio, ChevronRight, Sparkles, TrendingUp, BookOpen } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const [
    featuredRes,
    latestRes,
    trendingRes,
    categories,
    headerAd,
    sidebarAd
  ] = await Promise.all([
    getPublishedArticles({ featuredOnly: true, limit: 5 }),
    getPublishedArticles({ limit: 12 }),
    getPublishedArticles({ orderBy: 'view_count', limit: 5 }),
    getCategories(),
    getAdByPlacement('header_top'),
    getAdByPlacement('sidebar_top')
  ]);

  // Featured articles fallback to latest if empty
  const featuredArticles = featuredRes.articles.length > 0 ? featuredRes.articles : latestRes.articles.slice(0, 5);
  const streamArticles = latestRes.articles;

  // Category blocks mapping (Thời sự, Kinh tế, Công nghệ, Xã hội)
  const thoiSuCat = categories.find(c => c.slug === 'thoi-su');
  const kinhTeCat = categories.find(c => c.slug === 'kinh-te');
  const congNgheCat = categories.find(c => c.slug === 'cong-nghe');
  const xaHoiCat = categories.find(c => c.slug === 'xa-hoi');

  const [thoiSuArticles, kinhTeArticles, congNgheArticles] = await Promise.all([
    thoiSuCat ? getPublishedArticles({ categorySlug: thoiSuCat.slug, limit: 4 }) : Promise.resolve({ articles: [] }),
    kinhTeCat ? getPublishedArticles({ categorySlug: kinhTeCat.slug, limit: 4 }) : Promise.resolve({ articles: [] }),
    congNgheCat ? getPublishedArticles({ categorySlug: congNgheCat.slug, limit: 4 }) : Promise.resolve({ articles: [] }),
  ]);

  return (
    <div className="space-y-6">
      {/* 1. REAL-TIME MARKET DATA & WEATHER TICKER */}
      <MarketDataBar />

      {/* 2. TOP HEADER LEADERBOARD AD */}
      {headerAd && (
        <AdSlot creative={headerAd} slotName="Tài trợ độc quyền" />
      )}

      {/* 3. HERO MAGAZINE SPOTLIGHT (TIN TIÊU ĐIỂM ĐA TẦNG) */}
      <FeaturedSpotlight articles={featuredArticles} />

      {/* 4. PRIMARY 2-COLUMN GRID (DÒNG THỜI SỰ 24/7 & TIỆN ÍCH PHẢI) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
        {/* CỘT TRÁI (8 COLS): STREAM THỜI SỰ & CÁC CHUYÊN MỤC TRỌNG ĐIỂM */}
        <div className="lg:col-span-8 space-y-8">
          {/* Stream tin mới nhất Header */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#D71920]"></span>
                </span>
                <h2 className="font-black text-base uppercase tracking-tight text-[#172033] flex items-center gap-1.5">
                  Dòng thời sự trực tiếp 24/7
                </h2>
              </div>
              <Link 
                href="/tin-moi-nhat"
                className="text-xs text-gray-500 hover:text-[#D71920] font-semibold flex items-center transition-colors"
              >
                <span>Xem luồng tin đầy đủ</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-gray-100">
              {streamArticles.slice(0, 5).map((article) => (
                <NewsCard key={article.id} article={article} variant="horizontal" />
              ))}
            </div>
          </div>

          {/* CHUYÊN MỤC THỜI SỰ */}
          {thoiSuCat && thoiSuArticles.articles.length > 0 && (
            <CategoryBlock 
              category={thoiSuCat} 
              articles={thoiSuArticles.articles} 
            />
          )}

          {/* CHUYÊN MỤC KINH TẾ */}
          {kinhTeCat && kinhTeArticles.articles.length > 0 && (
            <CategoryBlock 
              category={kinhTeCat} 
              articles={kinhTeArticles.articles} 
            />
          )}
        </div>

        {/* CỘT PHẢI (4 COLS): TRENDING WIDGET & QUẢNG CÁO & CHỦ ĐỀ HOT */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Top Đọc Nhiều Widget (#1 - #5) */}
          <TrendingWidget articles={trendingRes.articles} latestArticles={streamArticles} />

          {/* Sidebar Top Ad Slot */}
          {sidebarAd && (
            <AdSlot creative={sidebarAd} slotName="Quảng cáo tài trợ" />
          )}

          {/* Khối Khám Phá Chủ Đề Quan Tâm (Tags Cloud) */}
          <div className="bg-gray-50/80 rounded-2xl border border-gray-200 p-5 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2.5 mb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#172033]">
                Chủ đề đang quan tâm
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'Bán dẫn', slug: 'ban-dan' },
                { name: 'Trí tuệ nhân tạo', slug: 'tri-tue-nhan-tao' },
                { name: 'Kinh tế tuần hoàn', slug: 'kinh-te-tuan-hoan' },
                { name: 'Đường sắt tốc độ cao', slug: 'duong-sat-toc-do-cao' },
                { name: 'Chuyển đổi số', slug: 'chuyen-doi-so' },
                { name: 'Thị trường tài chính', slug: 'tai-chinh' }
              ].map((tag) => (
                <Link
                  key={tag.slug}
                  href={`/tim-kiem?q=${encodeURIComponent(tag.name)}`}
                  className="bg-white hover:bg-red-50 hover:text-[#D71920] hover:border-red-200 text-gray-700 text-xs px-3 py-1.5 rounded-full border border-gray-200 transition-colors shadow-2xs font-medium"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* 5. FULL-WIDTH MULTIMEDIA SHOWCASE & E-MAGAZINE (DARK NAVY HUB) */}
      <MultimediaShowcase />

      {/* 6. SECONDARY GRID: GÓC NHÌN CHUYÊN GIA & CÔNG NGHỆ & NEWSLETTER */}
      <div className="space-y-8">
        {/* Khối Góc Nhìn & Bình Luận Chuyên Gia */}
        <OpinionColumn />

        {/* 2 Cột Chuyên Mục Công Nghệ & Khối Bản Tin */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            {congNgheCat && congNgheArticles.articles.length > 0 && (
              <CategoryBlock 
                category={congNgheCat} 
                articles={congNgheArticles.articles} 
              />
            )}
          </div>

          <div className="lg:col-span-4 space-y-6">
            {/* Hộp cam kết chất lượng báo chí */}
            <div className="bg-red-50/60 rounded-2xl border border-red-100 p-5 space-y-3">
              <div className="flex items-center gap-2 text-[#D71920]">
                <BookOpen className="w-4 h-4" />
                <h4 className="font-bold text-xs uppercase tracking-wider">
                  Tòa soạn cam kết
                </h4>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">
                Mọi thông tin trên TinVanta đều được kiểm chứng độc lập theo quy trình biên tập 7 bước, tuân thủ nghiêm ngặt Luật Báo chí và đạo đức nghề nghiệp người làm báo.
              </p>
              <Link
                href="/gioi-thieu"
                className="text-xs text-[#D71920] font-bold hover:underline inline-flex items-center gap-1"
              >
                Xem quy trình xuất bản →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 7. NEWSLETTER DOUBLE OPT-IN SUBSCRIPTION WIDGET */}
      <NewsletterWidget />
    </div>
  );
}
