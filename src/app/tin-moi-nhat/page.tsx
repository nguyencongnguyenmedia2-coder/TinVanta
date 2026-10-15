import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublishedArticles } from '@/lib/data/articles';
import { NewsCard } from '@/components/news/NewsCard';
import { Clock, Radio, ArrowLeft, Zap, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Dòng Tin Mới Nhất 24/7 | Tin Nóng Cập Nhật Từng Phút',
  description: 'Dòng thời sự cập nhật từng phút các sự kiện trong nước và quốc tế nóng hổi nhất trên Báo điện tử TinVanta.',
};

export default async function LatestNewsPage() {
  const { articles } = await getPublishedArticles({ limit: 25 });

  return (
    <div className="max-w-4xl mx-auto py-3 sm:py-6 space-y-4 sm:space-y-6">
      {/* Back button */}
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#D71920] font-semibold transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Về trang chủ</span>
      </Link>

      {/* Hero Banner Header */}
      <div className="bg-gradient-to-r from-[#172033] via-[#1f2b42] to-[#D71920] text-white p-5 sm:p-7 rounded-2xl flex items-center justify-between shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-amber-300 font-extrabold uppercase tracking-wider text-[11px] sm:text-xs">
              Dòng Thời Sự Trực Tuyến 24/7
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black tracking-tight">
            Tin Mới Phát Hành Trong Ngày
          </h1>
          <p className="text-xs text-gray-300 mt-1 max-w-lg leading-relaxed">
            Cập nhật liên tục theo trình tự thời gian thực. Tin tức nóng từ phóng viên và hệ thống tự động kiểm chứng.
          </p>
        </div>

        <Radio className="w-10 h-10 sm:w-12 sm:h-12 text-white/40 hidden sm:block shrink-0 animate-pulse" />
      </div>

      {/* Danh sách bài viết Timeline */}
      <div className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-6 shadow-xs divide-y divide-gray-100">
        {articles.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-xs">
            Hiện chưa có tin bài mới phát hành. Vui lòng quay lại sau ít phút!
          </div>
        ) : (
          articles.map((article) => (
            <div key={article.id} className="py-3 sm:py-4 first:pt-0 last:pb-0">
              <NewsCard article={article} variant="horizontal" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
