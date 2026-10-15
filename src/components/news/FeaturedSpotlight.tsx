import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types/database';
import { NewsCard } from './NewsCard';
import { Flame, Clock, Sparkles, ChevronRight, Zap } from 'lucide-react';
import { formatDateVN } from '@/lib/utils';

interface FeaturedSpotlightProps {
  articles: Article[];
}

export function FeaturedSpotlight({ articles }: FeaturedSpotlightProps) {
  if (!articles || articles.length === 0) return null;

  const leadArticle = articles[0];
  const subLeadArticle = articles[1] || articles[0];
  const sideArticles = articles.slice(2, 4);

  return (
    <section className="my-5 space-y-4">
      {/* 1. HOT TOPICS CHIPS BAR */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 text-xs">
        <div className="flex items-center gap-1.5 shrink-0 bg-red-50 text-[#D71920] px-2.5 py-1 rounded-full font-black text-[11px] uppercase tracking-wider">
          <Flame className="w-3.5 h-3.5 fill-[#D71920]" />
          <span>Sự kiện nóng:</span>
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

      {/* 2. MAIN HERO EDITORIAL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-xs">
        {/* Lead Story (Left 7 Cols) */}
        <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-gray-100 pb-6 lg:pb-0 lg:pr-6">
          <article className="group flex flex-col h-full justify-between">
            <div>
              <Link 
                href={`/bai-viet/${leadArticle.slug}`}
                className="relative aspect-16/10 w-full rounded-xl overflow-hidden block bg-gray-100 shadow-xs mb-4"
              >
                <Image
                  src={leadArticle.featured_image?.public_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80'}
                  alt={leadArticle.title}
                  fill
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="bg-[#D71920] text-white text-[11px] font-black px-2.5 py-0.5 rounded shadow uppercase tracking-wider">
                    {leadArticle.category?.name || 'Tiêu điểm'}
                  </span>
                  <span className="bg-amber-400 text-black text-[10px] font-bold px-2 py-0.5 rounded shadow uppercase">
                    Đặc biệt
                  </span>
                </div>
              </Link>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#172033] leading-tight group-hover:text-[#D71920] transition-colors mb-3">
                <Link href={`/bai-viet/${leadArticle.slug}`}>
                  {leadArticle.title}
                </Link>
              </h1>

              <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4">
                {leadArticle.sapo}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
              <span className="font-semibold text-gray-700">
                {leadArticle.author?.full_name || 'Ban Biên Tập'}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatDateVN(leadArticle.published_at || '2026-10-15T09:00:00.000Z')}
              </span>
            </div>
          </article>
        </div>

        {/* Supporting Featured Stories (Right 5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
          {/* Sub-Lead horizontal story */}
          {subLeadArticle && (
            <article className="group pb-4 border-b border-gray-100">
              <div className="flex gap-4">
                <Link 
                  href={`/bai-viet/${subLeadArticle.slug}`}
                  className="relative w-36 sm:w-44 aspect-16/10 rounded-lg overflow-hidden shrink-0 bg-gray-100 shadow-2xs"
                >
                  <Image
                    src={subLeadArticle.featured_image?.public_url || 'https://images.unsplash.com/photo-1541427468627-a89a96e5ca1d?w=800&auto=format&fit=crop&q=80'}
                    alt={subLeadArticle.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-1.5 left-1.5 bg-[#172033]/90 text-white text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                    {subLeadArticle.category?.name}
                  </span>
                </Link>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm sm:text-base text-[#172033] group-hover:text-[#D71920] transition-colors leading-snug line-clamp-3">
                    <Link href={`/bai-viet/${subLeadArticle.slug}`}>
                      {subLeadArticle.title}
                    </Link>
                  </h3>
                  <span className="text-[11px] text-gray-400 block mt-1.5">
                    {formatDateVN(subLeadArticle.published_at || '2026-10-15T07:00:00.000Z')}
                  </span>
                </div>
              </div>
            </article>
          )}

          {/* Quick editorial list picks */}
          <div className="space-y-3">
            {sideArticles.map((art, idx) => (
              <div key={art.id} className="group pl-3 border-l-2 border-red-500 hover:border-[#D71920] transition-colors">
                <span className="text-[10px] font-bold text-[#D71920] uppercase tracking-wide">
                  {art.category?.name}
                </span>
                <h4 className="font-bold text-xs sm:text-sm text-[#172033] group-hover:text-[#D71920] transition-colors line-clamp-2 leading-snug mt-0.5">
                  <Link href={`/bai-viet/${art.slug}`}>
                    {art.title}
                  </Link>
                </h4>
              </div>
            ))}
          </div>

          {/* 60 Seconds Quick Briefs Banner */}
          <div className="bg-gradient-to-r from-red-50 to-amber-50/70 p-3.5 rounded-xl border border-red-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#D71920] fill-[#D71920]" />
              <div>
                <span className="text-[11px] font-bold text-[#172033] block">
                  Bản tin nhanh 60 giây
                </span>
                <span className="text-[10px] text-gray-500">
                  Tổng hợp các diễn biến quan trọng sáng nay
                </span>
              </div>
            </div>
            <Link
              href="/tin-moi-nhat"
              className="text-xs font-bold text-[#D71920] hover:underline shrink-0"
            >
              Xem ngay →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
