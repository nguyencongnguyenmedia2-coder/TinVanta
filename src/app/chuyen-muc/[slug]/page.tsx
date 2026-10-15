import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getCategoryBySlug, getPublishedArticles, getCategories } from '@/lib/data/articles';
import { NewsCard } from '@/components/news/NewsCard';
import { TrendingWidget } from '@/components/news/TrendingWidget';
import { ChevronRight, Home, Folder } from 'lucide-react';

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

  return {
    title: `${category.name} - Tin Tức Mới Nhất`,
    description: category.description || `Cập nhật tin tức sự kiện chuyên mục ${category.name} nhanh chóng, chính xác.`,
    openGraph: {
      title: `${category.name} | TinVanta`,
      description: category.description || '',
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
  const limit = 8;
  const offset = (currentPage - 1) * limit;

  const { articles, total } = await getPublishedArticles({ categorySlug: slug, limit, offset });
  const totalPages = Math.ceil(total / limit);

  if (articles.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
        Chuyên mục đang được cập nhật tin bài mới nhất. Vui lòng quay lại sau!
      </div>
    );
  }

  return (
    <>
      {/* Lead article for this category */}
      {articles[0] && (
        <NewsCard article={articles[0]} variant="lead" />
      )}

      {/* Sub-articles grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
        {articles.slice(1).map((article) => (
          <NewsCard key={article.id} article={article} variant="default" />
        ))}
      </div>

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const p = idx + 1;
            const isActive = p === currentPage;
            return (
              <Link
                key={p}
                href={`/chuyen-muc/${slug}?page=${p}`}
                className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                  isActive
                    ? 'bg-[#D71920] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {p}
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const [allLatestRes, trendingRes] = await Promise.all([
    getPublishedArticles({ orderBy: 'published_at', limit: 5 }),
    getPublishedArticles({ orderBy: 'view_count', limit: 5 })
  ]);

  return (
    <div className="space-y-6">
      {/* 1. BREADCRUMB */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 py-2 border-b border-gray-100">
        <Link href="/" className="hover:text-red-700 flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          Trang chủ
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="font-semibold text-gray-800">{category.name}</span>
      </nav>

      {/* 2. CATEGORY HEADER & DESCRIPTION */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <Folder className="w-5 h-5 text-[#D71920]" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
            {category.name}
          </h1>
        </div>
        {category.description && (
          <p className="text-gray-600 text-sm max-w-3xl leading-relaxed">
            {category.description}
          </p>
        )}
      </div>

      {/* 3. MAIN ARTICLES GRID & SIDEBAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <Suspense fallback={<div className="p-12 text-center text-gray-400 text-xs">Đang tải tin bài chuyên mục...</div>}>
            <CategoryArticlesList slug={slug} searchParams={searchParams} />
          </Suspense>
        </div>

        {/* SIDEBAR */}
        <aside className="lg:col-span-4 space-y-6">
          <TrendingWidget articles={trendingRes.articles} latestArticles={allLatestRes.articles} />
        </aside>
      </div>
    </div>
  );
}
