import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublishedArticles, getCategories } from '@/lib/data/articles';
import { NewsCard } from '@/components/news/NewsCard';
import { Search as SearchIcon } from 'lucide-react';
import { Category } from '@/types/database';

interface SearchPageProps {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}

export const metadata: Metadata = {
  title: 'Tìm kiếm tin tức | TinVanta',
  description: 'Tìm kiếm thông tin, bài viết nhanh chóng trên Báo điện tử TinVanta.',
};

async function SearchResultsContent({
  searchParams,
  categories,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
  categories: Category[];
}) {
  const { q = '', category = '', page = '1' } = await searchParams;

  const currentPage = Number(page) || 1;
  const limit = 8;
  const offset = (currentPage - 1) * limit;

  const searchResults = await getPublishedArticles({
    searchQuery: q.trim(),
    categorySlug: category || undefined,
    limit,
    offset,
  });

  const { articles, total } = searchResults;
  const totalPages = Math.ceil(total / limit);

  return (
    <>
      {/* Search Header Form */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h1 className="text-xl sm:text-2xl font-black text-[#172033] mb-4">
          Tìm kiếm thông tin & bài viết
        </h1>

        <form method="GET" action="/tim-kiem" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Nhập từ khóa tìm kiếm (hỗ trợ tiếng Việt có dấu và không dấu)..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D71920]"
              />
              <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
            </div>

            <select
              name="category"
              defaultValue={category}
              className="px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D71920]"
            >
              <option value="">Tất cả chuyên mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="bg-[#D71920] hover:bg-[#b8141a] text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors"
            >
              Tìm kiếm
            </button>
          </div>
        </form>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-xs text-gray-500 border-b border-gray-200 pb-3">
        <span>
          {q ? (
            <>
              Kết quả tìm kiếm cho từ khóa: <strong className="text-[#172033]">"{q}"</strong>
              {category && ` trong chuyên mục ${category}`} ({total} bài viết)
            </>
          ) : (
            `Tất cả tin bài mới nhất (${total} bài viết)`
          )}
        </span>
      </div>

      {/* Articles */}
      {articles.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
          <p className="text-base font-semibold text-gray-700 mb-1">
            Không tìm thấy bài viết nào phù hợp với từ khóa của bạn.
          </p>
          <p className="text-xs text-gray-400">
            Gợi ý: Thử kiểm tra lại chính tả hoặc tìm bằng các từ khóa ngắn gọn, phổ biến hơn.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} variant="default" />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const p = idx + 1;
            const isActive = p === currentPage;
            const params = new URLSearchParams();
            if (q) params.set('q', q);
            if (category) params.set('category', category);
            params.set('page', String(p));

            return (
              <Link
                key={p}
                href={`/tim-kiem?${params.toString()}`}
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

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <Suspense fallback={<div className="p-12 text-center text-gray-400 text-xs">Đang nạp kết quả tìm kiếm...</div>}>
        <SearchResultsContent searchParams={searchParams} categories={categories} />
      </Suspense>
    </div>
  );
}
