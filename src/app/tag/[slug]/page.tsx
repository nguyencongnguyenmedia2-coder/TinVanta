import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { MOCK_TAGS } from '@/lib/data/mock-data';
import { getPublishedArticles } from '@/lib/data/articles';
import { NewsCard } from '@/components/news/NewsCard';
import { Tag as TagIcon, ArrowLeft } from 'lucide-react';

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return MOCK_TAGS.map((tag) => ({
    slug: tag.slug,
  }));
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = MOCK_TAGS.find(t => t.slug === slug);
  const tagName = tag?.name || slug;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tinvanta.vercel.app';
  const canonicalUrl = `${siteUrl}/tag/${slug}`;

  return {
    title: `Chủ đề: #${tagName} - Tin Mới Nhất`,
    description: `Tổng hợp các bài viết phân tích, tin tức về chủ đề ${tagName} trên Báo điện tử TinVanta.`,
    keywords: [tagName, `tin tức ${tagName}`, 'TinVanta', 'báo điện tử TinVanta'],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `Chủ đề: #${tagName} | TinVanta — Tin tức nhanh, thông tin chuẩn`,
      description: `Tổng hợp các bài viết phân tích, tin tức về chủ đề ${tagName} trên Báo điện tử TinVanta.`,
      url: canonicalUrl,
      type: 'website',
    },
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  const tag = MOCK_TAGS.find(t => t.slug === slug);
  const tagName = tag?.name || slug;

  const { articles } = await getPublishedArticles({ tagSlug: slug, limit: 12 });

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-6">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-700 font-medium">
        <ArrowLeft className="w-4 h-4" />
        Về trang chủ
      </Link>

      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <TagIcon className="w-5 h-5 text-[#D71920]" />
          <h1 className="text-2xl sm:text-3xl font-black text-[#172033]">
            Chủ đề: #{tagName}
          </h1>
        </div>
        <p className="text-xs text-gray-500">
          Tổng hợp tất cả các tuyến bài, phóng sự và bình luận liên quan đến từ khóa này.
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-400 text-xs">
          Chưa có bài viết nào thuộc chủ đề này.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} variant="default" />
          ))}
        </div>
      )}
    </div>
  );
}
