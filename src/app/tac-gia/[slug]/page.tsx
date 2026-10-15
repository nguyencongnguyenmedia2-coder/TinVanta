import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { MOCK_AUTHORS } from '@/lib/data/mock-data';
import { getPublishedArticles } from '@/lib/data/articles';
import { NewsCard } from '@/components/news/NewsCard';
import { Award, Mail, ArrowLeft, Newspaper } from 'lucide-react';

interface AuthorPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return MOCK_AUTHORS.map((author) => ({
    slug: author.slug,
  }));
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const author = MOCK_AUTHORS.find(a => a.slug === slug);
  if (!author) return { title: 'Không tìm thấy tác giả' };

  return {
    title: `${author.full_name} - Tác Giả & Phóng Viên`,
    description: author.bio || `Hồ sơ tác giả ${author.full_name} tại Báo điện tử TinVanta`,
  };
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { slug } = await params;
  const author = MOCK_AUTHORS.find(a => a.slug === slug) || MOCK_AUTHORS[0];

  const { articles: authorArticles } = await getPublishedArticles({ authorSlug: slug, limit: 20 });

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-700 font-medium">
        <ArrowLeft className="w-4 h-4" />
        Về trang chủ
      </Link>

      {/* Author Profile Header Box */}
      <div className="bg-gradient-to-r from-gray-50 to-white p-6 sm:p-8 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-xs">
        {author.avatar_url && (
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white shadow-md shrink-0">
            <Image
              src={author.avatar_url}
              alt={author.full_name}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="space-y-2 text-center sm:text-left flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[#172033]">
              {author.full_name}
            </h1>
            <span className="bg-red-50 text-[#D71920] font-bold text-xs px-2.5 py-0.5 rounded-full inline-block self-center sm:self-auto">
              {author.title_role}
            </span>
          </div>

          <p className="text-xs text-gray-500 flex items-center justify-center sm:justify-start gap-1">
            <Mail className="w-3.5 h-3.5" />
            {author.email}
          </p>

          {author.bio && (
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-2xl pt-1">
              {author.bio}
            </p>
          )}
        </div>
      </div>

      {/* Articles by Author */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
          <Newspaper className="w-5 h-5 text-[#D71920]" />
          <h2 className="text-lg font-bold text-[#172033]">
            Bài viết đã xuất bản ({authorArticles.length})
          </h2>
        </div>

        {authorArticles.length === 0 ? (
          <p className="text-gray-400 text-xs py-6 text-center">
            Tác giả đang biên soạn các bài viết mới. Vui lòng quay lại sau!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {authorArticles.map((article) => (
              <NewsCard key={article.id} article={article} variant="default" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
