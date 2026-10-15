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
import { Clock, Radio, ChevronRight, Sparkles, TrendingUp, BookOpen, Flame, Zap, ArrowRight } from 'lucide-react';
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
    getPublishedArticles({ featuredOnly: true, limit: 6 }),
    getPublishedArticles({ limit: 14 }),
    getPublishedArticles({ orderBy: 'view_count', limit: 6 }),
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
    <div className="space-y-4 sm:space-y-6">
      {/* 1. REAL-TIME MARKET DATA & WEATHER TICKER */}
      <MarketDataBar />

      {/* 2. TOP HEADER LEADERBOARD AD */}
      {headerAd && (
        <div className="hidden sm:block">
          <AdSlot creative={headerAd} slotName="Tài trợ độc quyền" />
        </div>
      )}

      {/* 3. HERO MAGAZINE SPOTLIGHT (TIN TIÊU ĐIỂM ĐA TẦNG ĐẲNG CẤP) */}
      <FeaturedSpotlight articles={featuredArticles} />

      {/* 4. PRIMARY 2-COLUMN GRID (DÒNG THỜI SỰ 24/7 & TIỆN ÍCH PHẢI) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-7 pt-1 sm:pt-2">
        {/* CỘT TRÁI (8 COLS): STREAM THỜI SỰ & CÁC CHUYÊN MỤC TRỌNG ĐIỂM */}
        <div className="lg:col-span-8 space-y-6 sm:space-y-8">
          {/* Stream tin mới nhất Header */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#D71920]"></span>
                </span>
                <h2 className="font-black text-sm sm:text-base uppercase tracking-tight text-[#172033] flex items-center gap-1.5">
                  Dòng thời sự trực tiếp 24/7
                </h2>
              </div>
              <Link 
                href="/tin-moi-nhat"
                className="text-xs text-[#D71920] hover:underline font-bold flex items-center transition-colors gap-0.5"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-gray-100">
              {streamArticles.slice(0, 6).map((article) => (
                <NewsCard key={article.id} article={article} variant="horizontal" />
              ))}
            </div>

            <div className="pt-3 text-center border-t border-gray-100">
              <Link
                href="/tin-moi-nhat"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-[#D71920] font-bold text-xs rounded-xl border border-gray-200 transition-colors"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Xem thêm các tin tức vừa phát hành hôm nay →</span>
              </Link>
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
        <aside className="lg:col-span-4 space-y-5 sm:space-y-6">
          {/* Top Đọc Nhiều Widget (#1 - #5) */}
          <TrendingWidget articles={trendingRes.articles} latestArticles={streamArticles} />

          {/* Sidebar Top Ad Slot */}
          {sidebarAd && (
            <AdSlot creative={sidebarAd} slotName="Quảng cáo tài trợ" />
          )}

          {/* Khối Khám Phá Chủ Đề Quan Tâm (Tags Cloud) */}
          <div className="bg-gray-50/80 rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2.5 mb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="font-black text-xs uppercase tracking-wider text-[#172033]">
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
                { name: 'Thị trường tài chính', slug: 'tai-chinh' },
                { name: 'Năng lượng xanh', slug: 'nang-luong-xanh' }
              ].map((tag) => (
                <Link
                  key={tag.slug}
                  href={`/tim-kiem?q=${encodeURIComponent(tag.name)}`}
                  className="bg-white hover:bg-red-50 hover:text-[#D71920] hover:border-red-200 text-gray-700 text-xs px-3 py-1.5 rounded-full border border-gray-200 transition-colors shadow-2xs font-semibold"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Hộp cam kết chất lượng báo chí */}
          <div className="bg-red-50/70 rounded-2xl border border-red-100 p-4 sm:p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-[#D71920]">
              <BookOpen className="w-4 h-4" />
              <h4 className="font-black text-xs uppercase tracking-wider">
                Tòa soạn cam kết
              </h4>
            </div>
            <p className="text-xs text-gray-700 leading-relaxed">
              Mọi thông tin trên TinVanta đều được kiểm chứng độc lập theo quy trình biên tập 7 bước, tuân thủ nghiêm ngặt Luật Báo chí Việt Nam.
            </p>
            <Link
              href="/gioi-thieu"
              className="text-xs text-[#D71920] font-bold hover:underline inline-flex items-center gap-1"
            >
              Xem quy trình xuất bản →
            </Link>
          </div>
        </aside>
      </div>

      {/* 5. FULL-WIDTH MULTIMEDIA SHOWCASE & E-MAGAZINE (DARK NAVY HUB) */}
      <MultimediaShowcase />

      {/* 6. SECONDARY GRID: GÓC NHÌN CHUYÊN GIA & CÔNG NGHỆ */}
      <div className="space-y-6 sm:space-y-8">
        {/* Khối Góc Nhìn & Bình Luận Chuyên Gia */}
        <OpinionColumn />

        {/* Chuyên Mục Công Nghệ & Bán Dẫn */}
        {congNgheCat && congNgheArticles.articles.length > 0 && (
          <CategoryBlock 
            category={congNgheCat} 
            articles={congNgheArticles.articles} 
          />
        )}
      </div>

      {/* 7. NEWSLETTER DOUBLE OPT-IN SUBSCRIPTION WIDGET */}
      <NewsletterWidget />
    </div>
  );
}
