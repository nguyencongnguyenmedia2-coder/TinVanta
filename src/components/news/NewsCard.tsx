'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types/database';
import { formatTimeAgoVN } from '@/lib/utils';
import { Clock, Eye, Bookmark, Sparkles, Flame, Check } from 'lucide-react';
import { isArticleBookmarked, toggleBookmarkArticle } from '@/lib/bookmarks';

interface NewsCardProps {
  article: Article;
  variant?: 'default' | 'horizontal' | 'compact' | 'lead' | 'spotlight';
  showSapo?: boolean;
  priority?: boolean;
}

export function NewsCard({ 
  article, 
  variant = 'default', 
  showSapo = true,
  priority = false 
}: NewsCardProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);

  const categoryName = article.category?.name || 'Tin tức';
  const categorySlug = article.category?.slug || 'thoi-su';
  const authorName = article.author?.full_name || 'Ban Biên Tập';
  const isAi = article.author?.email?.includes('ai') || article.id.startsWith('crawl-');

  useEffect(() => {
    if (article?.id) {
      setBookmarked(isArticleBookmarked(article.id));
    }
  }, [article?.id]);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = toggleBookmarkArticle({
      id: article.id,
      title: article.title,
      slug: article.slug,
      sapo: article.sapo,
      categoryName,
      publishedAt: article.published_at || undefined,
    });
    setBookmarked(updated);
  };

  const imageUrl = article.featured_image?.public_url || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80';

  // 1. LEAD HERO VARIANT (TIN ĐINH TIÊU ĐIỂM ĐẦU TRANG)
  if (variant === 'lead') {
    return (
      <article className="group relative bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col h-full">
        <Link href={`/bai-viet/${article.slug}`} className="relative aspect-16/9 w-full overflow-hidden block bg-gray-100">
          <Image
            src={imageUrl}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, 65vw"
            priority={priority}
            className="object-cover group-hover:scale-103 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-80 md:opacity-40 group-hover:opacity-60 transition-opacity" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
            <span className="bg-[#D71920] text-white text-[11px] font-black px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider">
              {categoryName}
            </span>
            {article.is_breaking && (
              <span className="bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 rounded-md shadow-md uppercase flex items-center gap-1">
                <Flame className="w-3 h-3 fill-black" />
                Tiêu điểm
              </span>
            )}
            {isAi && (
              <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md uppercase">
                AI Tổng Hợp
              </span>
            )}
          </div>

          {/* Quick Bookmark Button */}
          <button
            type="button"
            onClick={handleBookmarkClick}
            aria-label={bookmarked ? 'Bỏ lưu bài' : 'Lưu bài viết'}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs transition-colors"
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </button>
        </Link>

        <div className="p-4 sm:p-6 flex flex-col justify-between flex-1">
          <div>
            <h2 className="text-lg sm:text-2xl font-black text-[#172033] leading-snug group-hover:text-[#D71920] transition-colors mb-2.5">
              <Link href={`/bai-viet/${article.slug}`}>
                {article.title}
              </Link>
            </h2>

            {showSapo && (
              <p className="text-gray-600 text-xs sm:text-sm line-clamp-3 leading-relaxed mb-4">
                {article.sapo}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] sm:text-xs text-gray-500 pt-3 border-t border-gray-100">
            <span className="font-semibold text-gray-800 truncate max-w-[150px]">{authorName}</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-gray-500">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                {formatTimeAgoVN(article.published_at || article.created_at)}
              </span>
              <span className="flex items-center gap-1 text-gray-500">
                <Eye className="w-3.5 h-3.5 text-gray-400" />
                {(article.view_count || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // 2. HORIZONTAL VARIANT (CHO DANH SÁCH BÀI VIẾT VÀ TỐI ƯU CỰC MẠNH TRÊN MOBILE)
  if (variant === 'horizontal') {
    return (
      <article className="group relative flex items-center justify-between gap-3 sm:gap-4 py-3 sm:py-3.5 border-b border-gray-100 last:border-b-0">
        <div className="flex flex-col justify-between flex-1 min-w-0 pr-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link 
                href={`/chuyen-muc/${categorySlug}`}
                className="text-[10px] sm:text-[11px] font-black text-[#D71920] hover:underline uppercase tracking-wider"
              >
                {categoryName}
              </Link>
              {isAi && (
                <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-1 rounded">
                  AI
                </span>
              )}
            </div>

            <h3 className="text-sm sm:text-base font-bold text-[#172033] line-clamp-2 sm:line-clamp-2 leading-snug group-hover:text-[#D71920] transition-colors">
              <Link href={`/bai-viet/${article.slug}`}>
                {article.title}
              </Link>
            </h3>

            {showSapo && (
              <p className="hidden sm:line-clamp-2 text-xs text-gray-500 mt-1.5 leading-relaxed">
                {article.sapo}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 text-[10px] sm:text-[11px] text-gray-400 mt-2">
            <span className="font-medium text-gray-600 flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-400" />
              {formatTimeAgoVN(article.published_at || article.created_at)}
            </span>
            <span>•</span>
            <span>{article.reading_time_minutes || 3} phút đọc</span>
          </div>
        </div>

        {/* Thumbnail ảnh tỉ lệ 4:3 bo góc mềm mại */}
        <div className="relative shrink-0">
          <Link 
            href={`/bai-viet/${article.slug}`} 
            className="relative w-24 h-18 sm:w-36 sm:h-24 rounded-xl overflow-hidden block bg-gray-100 shadow-2xs"
          >
            <Image
              src={imageUrl}
              alt={article.title}
              fill
              sizes="(max-width: 640px) 100px, 160px"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </Link>
          <button
            type="button"
            onClick={handleBookmarkClick}
            aria-label={bookmarked ? 'Bỏ lưu bài' : 'Lưu bài viết'}
            className="absolute bottom-1 right-1 p-1 rounded bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition-colors"
          >
            <Bookmark className={`w-3 h-3 ${bookmarked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </button>
        </div>
      </article>
    );
  }

  // 3. COMPACT VARIANT (Text-only tin vắn / mini feed)
  if (variant === 'compact') {
    return (
      <article className="group py-2.5 border-b border-gray-100 last:border-b-0">
        <h4 className="text-xs sm:text-sm font-bold text-[#172033] line-clamp-2 leading-snug group-hover:text-[#D71920] transition-colors">
          <Link href={`/bai-viet/${article.slug}`}>
            {article.title}
          </Link>
        </h4>
        <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
          <span className="text-[#D71920] font-bold uppercase">{categoryName}</span>
          <span>•</span>
          <span>{formatTimeAgoVN(article.published_at || article.created_at)}</span>
        </div>
      </article>
    );
  }

  // 4. DEFAULT CARD VARIANT (GRID CARD 3 CỘT)
  return (
    <article className="group bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col h-full">
      <div className="relative aspect-16/10 w-full overflow-hidden block bg-gray-100">
        <Link href={`/bai-viet/${article.slug}`} className="block w-full h-full">
          <Image
            src={imageUrl}
            alt={article.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-104 transition-transform duration-500"
          />
        </Link>
        <span className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
          {categoryName}
        </span>
        <button
          type="button"
          onClick={handleBookmarkClick}
          aria-label={bookmarked ? 'Bỏ lưu bài' : 'Lưu bài viết'}
          className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs transition-colors"
        >
          <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
        </button>
      </div>

      <div className="p-4 sm:p-4.5 flex flex-col justify-between flex-1">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#172033] line-clamp-2 leading-snug group-hover:text-[#D71920] transition-colors mb-2">
            <Link href={`/bai-viet/${article.slug}`}>
              {article.title}
            </Link>
          </h3>

          {showSapo && (
            <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed mb-3">
              {article.sapo}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2.5 border-t border-gray-100">
          <span className="flex items-center gap-1 font-medium text-gray-600">
            <Clock className="w-3 h-3 text-gray-400" />
            {formatTimeAgoVN(article.published_at || article.created_at)}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3 text-gray-400" />
            {(article.view_count || 0).toLocaleString()}
          </span>
        </div>
      </div>
    </article>
  );
}
