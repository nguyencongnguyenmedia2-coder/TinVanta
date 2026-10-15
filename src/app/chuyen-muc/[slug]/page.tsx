import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getCategoryBySlug, getPublishedArticles, getCategories } from '@/lib/data/articles';
import { NewsCard } from '@/components/news/NewsCard';
import { TrendingWidget } from '@/components/news/TrendingWidget';
import { ChevronRight, Home, FolderTree, Sparkles, Filter, FileText } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((cat) => ({
    slug: cat.slug,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) {
    return { title: 'Không tìm thấy chuyên mục' };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tinvanta.vercel.app';
  const canonicalUrl = `${siteUrl}/chuyen-muc/${category.slug}`;

  return {
    title: `${category.name} - Tin Tức Mới Nhất 24/7`,
    description: category.description || `Cập nhật tin tức sự kiện chuyên mục ${category.name} nhanh chóng, chính xác trên TinVanta.`,
    keywords: [category.name, `tin tức ${category.name.toLowerCase()}`, `${category.name.toLowerCase()} 24h`, 'TinVanta', 'báo điện tử TinVanta'],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${category.name} | TinVanta — Tin tức nhanh, thông tin chuẩn`,
      description: category.description || '',
      url: canonicalUrl,
      type: 'website',
      images: [
        {
          url: `${siteUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: `${category.name} | TinVanta`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category.name} | TinVanta`,
      description: category.description || '',
      images: [`${siteUrl}/og-image.jpg`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

async function CategoryArticlesList({
  slug,
  searchParams,
}: {
  slug: string;
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const limit = 9;
  const offset = (currentPage - 1) * limit;

  const { articles, total } = await getPublishedArticles({ categorySlug: slug, limit, offset });
  const totalPages = Math.ceil(total / limit);

  if (articles.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center text-gray-500 space-y-3">
        <FolderTree className="w-10 h-10 mx-auto text-gray-300" />
        <p className="font-semibold text-sm text-gray-700">Chuyên mục đang được cập nhật thêm tin bài.</p>
        <p className="text-xs text-gray-400">Bạn có thể xem các tin mới nhất ở trang chủ hoặc các chuyên mục khác.</p>
        <Link 
          href="/" 
          className="inline-block mt-2 px-4 py-2 bg-[#D71920] text-white font-bold text-xs rounded-xl hover:bg-[#b8141a]"
        >
          Quay về Trang chủ
        </Link>
      </div>
    );
  }

  const leadArticle = articles[0];
  const otherArticles = articles.slice(1);

  return (
    <div className="space-y-6">
      {/* Lead article for this category */}
      {leadArticle && (
        <NewsCard article={leadArticle} variant="lead" priority={true} />
      )}

      {/* Grid articles: Desktop 2 cols default, Mobile horizontal feed */}
      <div className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
          <span className="text-xs font-black uppercase tracking-wider text-gray-500">
            Tin bài mới cập nhật ({total} bài viết)
          </span>
          <span className="text-[11px] text-gray-400 font-medium">Trang {currentPage} / {totalPages || 1}</span>
        </div>

        {/* Desktop Grid & Mobile Horizontal list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {otherArticles.map((article) => (
            <div key={article.id} className="hidden sm:block">
              <NewsCard article={article} variant="default" />
            </div>
          ))}
          {/* Mobile view uses compact horizontal feed for thumb reading */}
          <div className="sm:hidden divide-y divide-gray-100 col-span-1">
            {otherArticles.map((article) => (
              <NewsCard key={article.id} article={article} variant="horizontal" />
            ))}
          </div>
        </div>
      </div>

      {/* Phân trang số trang hiện đại */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const p = idx + 1;
            const isActive = p === currentPage;
            return (
              <Link
                key={p}
                href={`/chuyen-muc/${slug}?page=${p}`}
                className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#D71920] text-white shadow-sm ring-2 ring-red-500/20'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {p}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const [allLatestRes, trendingRes] = await Promise.all([
    getPublishedArticles({ orderBy: 'published_at', limit: 6 }),
    getPublishedArticles({ orderBy: 'view_count', limit: 6 })
  ]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. REFINED BREADCRUMB */}
      <nav aria-label="Đường dẫn" className="flex items-center gap-1.5 text-xs text-gray-500 py-2 border-b border-gray-100">
        <Link href="/" className="hover:text-[#D71920] flex items-center gap-1 font-medium transition-colors">
          <Home className="w-3.5 h-3.5 text-gray-400" />
          <span>Trang chủ</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
        <span className="font-bold text-gray-900">{category.name}</span>
      </nav>

      {/* 2. CATEGORY HEADER BANNER SANG TRỌNG */}
      <div className="bg-gradient-to-r from-red-50/50 via-gray-50 to-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-6 bg-[#D71920] rounded-xs" />
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#172033] tracking-tight uppercase">
                {category.name}
              </h1>
            </div>
            {category.description && (
              <p className="text-gray-600 text-xs sm:text-sm max-w-2xl leading-relaxed">
                {category.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-gray-500 font-semibold bg-white px-3.5 py-1.5 rounded-full border border-gray-200 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Cập nhật liên tục 24/7</span>
          </div>
        </div>
      </div>

      {/* 3. MAIN ARTICLES GRID & SIDEBAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-7">
        <div className="lg:col-span-8">
          <Suspense fallback={<div className="p-12 text-center text-gray-400 text-xs">Đang tải tin bài chuyên mục...</div>}>
            <CategoryArticlesList slug={slug} searchParams={searchParams} />
          </Suspense>
        </div>

        {/* SIDEBAR */}
        <aside className="lg:col-span-4 space-y-5 sm:space-y-6">
          <TrendingWidget articles={trendingRes.articles} latestArticles={allLatestRes.articles} />

          {/* Khối gợi ý đọc thêm */}
          <div className="bg-gray-50/80 rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#172033]">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Chủ đề nổi bật chuyên mục</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['Vĩ mô', 'Thị trường', 'Chính sách mới', 'Doanh nghiệp', 'Đầu tư'].map((t) => (
                <Link
                  key={t}
                  href={`/tim-kiem?q=${encodeURIComponent(t)}`}
                  className="bg-white hover:bg-red-50 hover:text-[#D71920] text-gray-700 text-[11px] px-3 py-1 rounded-full border border-gray-200 transition-colors font-medium shadow-2xs"
                >
                  #{t}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
