import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublishedArticles } from '@/lib/data/articles';
import { NewsCard } from '@/components/news/NewsCard';
import { Clock, Radio, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Dòng Tin Mới Nhất 24/7',
  description: 'Dòng thời sự cập nhật từng phút các sự kiện trong nước và quốc tế nóng hổi nhất.',
};

export default async function LatestNewsPage() {
  const { articles } = await getPublishedArticles({ limit: 20 });

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-700 font-medium">
        <ArrowLeft className="w-4 h-4" />
        Về trang chủ
      </Link>

      <div className="bg-gradient-to-r from-[#172033] to-[#25324d] text-white p-6 sm:p-8 rounded-2xl flex items-center justify-between shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-red-400 font-bold uppercase tracking-wider text-xs">Trực tiếp 24/7</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Dòng Thời Sự Mới Nhất
          </h1>
          <p className="text-xs text-gray-300 mt-1">
            Cập nhật liên tục tin tức theo trình tự thời gian từ mạng lưới phóng viên toàn quốc.
          </p>
        </div>

        <Radio className="w-12 h-12 text-red-500/80 hidden sm:block" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 divide-y divide-gray-100 shadow-2xs">
        {articles.map((article) => (
          <div key={article.id} className="py-4 first:pt-0 last:pb-0">
            <NewsCard article={article} variant="horizontal" />
          </div>
        ))}
      </div>
    </div>
  );
}
