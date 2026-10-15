import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types/database';
import { Flame, Clock, Sparkles, ChevronRight, Zap, TrendingUp, Eye } from 'lucide-react';
import { formatTimeAgoVN } from '@/lib/utils';

interface FeaturedSpotlightProps {
  articles: Article[];
}

export function FeaturedSpotlight({ articles }: FeaturedSpotlightProps) {
  if (!articles || articles.length === 0) return null;

  const leadArticle = articles[0];
  const subLeadArticle = articles[1] || articles[0];
  const sideArticles = articles.slice(2, 5);

  return (
    <section className="my-3 sm:my-5 space-y-3 sm:space-y-4">
      {/* 1. HOT TOPICS CHIPS BAR (TRƯỢT NGANG MƯỢT MÀ CHO MOBILE & DESKTOP) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs">
        <div className="flex items-center gap-1.5 shrink-0 bg-red-50 text-[#D71920] px-2.5 py-1 rounded-full font-black text-[11px] uppercase tracking-wider">
          <Flame className="w-3.5 h-3.5 fill-[#D71920]" />
          <span>Tiêu điểm:</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {[
            { label: 'Chiến lược Bán dẫn 2030', href: '/tim-kiem?q=Bán dẫn' },
            { label: 'Đường sắt tốc độ cao', href: '/tim-kiem?q=Đường sắt' },
            { label: 'Kinh tế tuần hoàn & ESG', href: '/tim-kiem?q=Kinh tế tuần hoàn' },
            { label: 'Trí tuệ nhân tạo Y tế', href: '/tim-kiem?q=Trí tuệ nhân tạo' },
            { label: 'Quy hoạch Năng lượng xanh', href: '/tim-kiem?q=Năng lượng' },
          ].map((topic, i) => (
            <Link
              key={i}
              href={topic.href}
              className="bg-white hover:bg-gray-100 text-gray-700 hover:text-[#D71920] px-3 py-1 rounded-full border border-gray-200 transition-colors shrink-0 font-medium text-[11px] shadow-2xs"
            >
              #{topic.label}
            </Link>
          ))}
        </div>
      </div>

      {/* 2. MAIN HERO MAGAZINE EDITORIAL GRID */}
      <div className="bg-white p-3.5 sm:p-6 rounded-2xl border border-gray-200/90 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          {/* Lead Story (Cột Trái 7 Cols) */}
          <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-gray-100 pb-5 lg:pb-0 lg:pr-6">
            <article className="group flex flex-col h-full justify-between">
              <div>
                <Link 
                  href={`/bai-viet/${leadArticle.slug}`}
                  className="relative aspect-16/10 w-full rounded-xl sm:rounded-2xl overflow-hidden block bg-gray-100 shadow-2xs mb-3.5 sm:mb-4"
                >
                  <Image
                    src={leadArticle.featured_image?.public_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80'}
                    alt={leadArticle.title}
                    fill
                    priority
                    className="object-cover group-hover:scale-103 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  
                  <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex items-center gap-1.5">
                    <span className="bg-[#D71920] text-white text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-md shadow uppercase tracking-wider">
                      {leadArticle.category?.name || 'Tiêu điểm'}
                    </span>
                    <span className="bg-amber-400 text-black text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-md shadow uppercase flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-black" />
                      Đặc biệt
                    </span>
                  </div>
                </Link>

                <h1 className="text-lg sm:text-2xl lg:text-3xl font-black text-[#172033] leading-tight sm:leading-snug group-hover:text-[#D71920] transition-colors mb-2.5">
                  <Link href={`/bai-viet/${leadArticle.slug}`}>
                    {leadArticle.title}
                  </Link>
                </h1>

                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-3 mb-3 sm:mb-4">
                  {leadArticle.sapo}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] sm:text-xs text-gray-400 pt-3 border-t border-gray-100">
                <span className="font-semibold text-gray-700 truncate max-w-[150px]">
                  {leadArticle.author?.full_name || 'Ban Biên Tập'}
                </span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-gray-500">
                    <Clock className="w-3 h-3 text-gray-400" />
                    {formatTimeAgoVN(leadArticle.published_at || leadArticle.created_at)}
                  </span>
                  <span className="flex items-center gap-1 text-gray-500">
                    <Eye className="w-3 h-3 text-gray-400" />
                    {(leadArticle.view_count || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </article>
          </div>

          {/* Supporting Featured Stories (Cột Phải 5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4 sm:space-y-5">
            {/* Sub-Lead story */}
            {subLeadArticle && (
              <article className="group flex gap-3 sm:gap-4 pb-4 border-b border-gray-100">
                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <div>
                    <span className="text-[10px] font-bold text-[#D71920] uppercase tracking-wider block mb-1">
                      {subLeadArticle.category?.name || 'Thời sự'}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-[#172033] leading-snug group-hover:text-[#D71920] transition-colors line-clamp-2">
                      <Link href={`/bai-viet/${subLeadArticle.slug}`}>
                        {subLeadArticle.title}
                      </Link>
                    </h3>
                    <p className="hidden sm:line-clamp-2 text-xs text-gray-500 mt-1.5 leading-relaxed">
                      {subLeadArticle.sapo}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-2">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimeAgoVN(subLeadArticle.published_at || subLeadArticle.created_at)}</span>
                  </div>
                </div>

                <Link
                  href={`/bai-viet/${subLeadArticle.slug}`}
                  className="relative w-28 h-20 sm:w-36 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-gray-100 shadow-2xs"
                >
                  <Image
                    src={subLeadArticle.featured_image?.public_url || 'https://images.unsplash.com/photo-1541427468627-a89a96e5ca1d?w=800&auto=format&fit=crop&q=80'}
                    alt={subLeadArticle.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
              </article>
            )}

            {/* List of other featured stories */}
            <div className="space-y-3">
              {sideArticles.map((art) => (
                <article key={art.id} className="group flex items-start gap-3 py-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#D71920] mt-1.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-[#D71920] transition-colors line-clamp-2 leading-snug">
                      <Link href={`/bai-viet/${art.slug}`}>
                        {art.title}
                      </Link>
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                      <span className="text-[#D71920] font-semibold">{art.category?.name}</span>
                      <span>•</span>
                      <span>{formatTimeAgoVN(art.published_at || art.created_at)}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
