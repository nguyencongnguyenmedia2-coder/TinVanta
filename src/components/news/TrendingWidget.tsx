'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types/database';
import { TrendingUp, Clock, Eye, Flame, ChevronRight } from 'lucide-react';
import { formatTimeAgoVN } from '@/lib/utils';

interface TrendingWidgetProps {
  articles: Article[];
  latestArticles?: Article[];
  title?: string;
}

function formatViews(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  return views.toLocaleString();
}

export function TrendingWidget({ 
  articles, 
  latestArticles, 
  title = 'Đọc nhiều nhất' 
}: TrendingWidgetProps) {
  const [activeTab, setActiveTab] = useState<'trending' | 'latest'>('trending');

  const displayList = (activeTab === 'latest' && latestArticles && latestArticles.length > 0)
    ? latestArticles
    : articles;

  if (!displayList || displayList.length === 0) return null;

  const top1 = displayList[0];
  const rest = displayList.slice(1, 5);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
      {/* Header with Tabs or Single Title */}
      <div className="border-b border-gray-100 bg-gray-50/70 p-1.5 flex items-center justify-between">
        {latestArticles && latestArticles.length > 0 ? (
          <div className="flex w-full gap-1 p-0.5 bg-gray-200/60 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('trending')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'trending'
                  ? 'bg-white text-[#D71920] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${activeTab === 'trending' ? 'text-[#D71920]' : 'text-gray-400'}`} />
              <span>Đọc nhiều nhất</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('latest')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'latest'
                  ? 'bg-white text-[#172033] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Clock className={`w-3.5 h-3.5 ${activeTab === 'latest' ? 'text-[#172033]' : 'text-gray-400'}`} />
              <span>Mới cập nhật</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2">
            <span className="p-1 rounded-md bg-red-50 text-[#D71920]">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#172033]">
              {title}
            </h3>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* RANK #1 FEATURE CARD */}
        {top1 && (
          <div className="group border-b border-gray-100 pb-4">
            <Link href={`/bai-viet/${top1.slug}`} className="block relative mb-3">
              <div className="relative aspect-16/9 w-full rounded-xl overflow-hidden bg-gray-100 shadow-2xs">
                {top1.featured_image?.public_url ? (
                  <Image
                    src={top1.featured_image.public_url}
                    alt={top1.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 360px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-100 to-gray-200 flex items-center justify-center text-gray-400">
                    <TrendingUp className="w-8 h-8 opacity-40" />
                  </div>
                )}
                {/* Rank #1 Gold-Red Medal Badge */}
                <div className="absolute top-2.5 left-2.5 bg-gradient-to-r from-[#D71920] to-amber-500 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-white" />
                  <span>TOP 1</span>
                </div>
              </div>
            </Link>

            <div className="space-y-1.5">
              {top1.category && (
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D71920]" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#D71920]">
                    {top1.category.name}
                  </span>
                </div>
              )}
              <h4 className="text-sm sm:text-base font-bold text-[#172033] line-clamp-2 leading-snug group-hover:text-[#D71920] transition-colors">
                <Link href={`/bai-viet/${top1.slug}`}>
                  {top1.title}
                </Link>
              </h4>
              <div className="flex items-center gap-3 text-[11px] text-gray-500 pt-0.5">
                <span className="flex items-center gap-1 font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                  <Eye className="w-3 h-3 text-amber-600" />
                  {formatViews(top1.view_count)} lượt xem
                </span>
                <span>•</span>
                <span>{formatTimeAgoVN(top1.published_at)}</span>
              </div>
            </div>
          </div>
        )}

        {/* RANKS #2 THROUGH #5 */}
        <div className="space-y-3.5">
          {rest.map((article, idx) => {
            const rank = idx + 2;
            const rankBadgeClass =
              rank === 2
                ? 'bg-amber-500 text-white shadow-2xs'
                : rank === 3
                ? 'bg-[#172033] text-white'
                : 'bg-gray-100 text-gray-600 font-bold';

            return (
              <div 
                key={article.id} 
                className="group flex items-start gap-3 p-2 -mx-2 rounded-xl hover:bg-gray-50/80 transition-colors"
              >
                {/* Ranking number */}
                <span 
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 mt-0.5 ${rankBadgeClass}`}
                >
                  {rank}
                </span>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  {article.category && (
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-0.5">
                      {article.category.name}
                    </span>
                  )}
                  <h4 className="text-xs sm:text-[13px] font-semibold text-[#172033] line-clamp-2 leading-snug group-hover:text-[#D71920] transition-colors">
                    <Link href={`/bai-viet/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                    <span className="font-medium text-gray-600">
                      {formatViews(article.view_count)} xem
                    </span>
                    <span>•</span>
                    <span>{formatTimeAgoVN(article.published_at)}</span>
                  </div>
                </div>

                {/* Small Thumbnail */}
                {article.featured_image?.public_url && (
                  <Link 
                    href={`/bai-viet/${article.slug}`} 
                    className="relative w-16 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0 group-hover:opacity-95"
                  >
                    <Image
                      src={article.featured_image.public_url}
                      alt={article.title}
                      fill
                      sizes="64px"
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* View all trending link */}
        <div className="pt-2 border-t border-gray-100">
          <Link
            href="/tin-nong"
            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-gray-600 hover:text-[#D71920] hover:bg-red-50/60 rounded-xl transition-all"
          >
            <span>Xem bảng xếp hạng 24h</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
