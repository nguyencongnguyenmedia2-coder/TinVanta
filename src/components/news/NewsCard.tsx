import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types/database';
import { formatTimeAgoVN } from '@/lib/utils';
import { Clock, Eye } from 'lucide-react';

interface NewsCardProps {
  article: Article;
  variant?: 'default' | 'horizontal' | 'compact' | 'lead';
  showSapo?: boolean;
  priority?: boolean;
}

export function NewsCard({ 
  article, 
  variant = 'default', 
  showSapo = true,
  priority = false 
}: NewsCardProps) {
  const imageUrl = article.featured_image?.public_url || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80';
  const categoryName = article.category?.name || 'Tin tức';
  const categorySlug = article.category?.slug || 'thoi-su';
  const authorName = article.author?.full_name || 'Ban Biên Tập';

  // 1. LEAD HERO VARIANT
  if (variant === 'lead') {
    return (
      <article className="group relative bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
        <Link href={`/bai-viet/${article.slug}`} className="relative aspect-16/9 w-full overflow-hidden block bg-gray-100">
          <Image
            src={imageUrl}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, 65vw"
            priority={priority}
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="bg-[#D71920] text-white text-xs font-bold px-2.5 py-1 rounded shadow-md uppercase tracking-wider">
              {categoryName}
            </span>
            {article.is_breaking && (
              <span className="bg-amber-500 text-black text-xs font-bold px-2 py-1 rounded shadow-md uppercase">
                Tiêu điểm
              </span>
            )}
          </div>
        </Link>

        <div className="p-5 flex flex-col justify-between flex-1">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#172033] leading-snug group-hover:text-[#D71920] transition-colors mb-3">
              <Link href={`/bai-viet/${article.slug}`}>
                {article.title}
              </Link>
            </h2>

            {showSapo && (
              <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed mb-4">
                {article.sapo}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
            <span className="font-medium text-gray-700">{authorName}</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                {formatTimeAgoVN(article.published_at)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-gray-400" />
                {article.view_count.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // 2. HORIZONTAL VARIANT (for list feeds and sidebar)
  if (variant === 'horizontal') {
    return (
      <article className="group flex gap-3 py-3 border-b border-gray-100 last:border-b-0">
        <Link 
          href={`/bai-viet/${article.slug}`} 
          className="relative w-28 sm:w-36 aspect-16/10 shrink-0 rounded-lg overflow-hidden bg-gray-100"
        >
          <Image
            src={imageUrl}
            alt={article.title}
            fill
            sizes="150px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        <div className="flex flex-col justify-between flex-1 min-w-0">
          <div>
            <Link 
              href={`/chuyen-muc/${categorySlug}`}
              className="text-[11px] font-bold text-[#D71920] hover:underline uppercase tracking-wide inline-block mb-1"
            >
              {categoryName}
            </Link>
            <h3 className="text-sm font-bold text-[#172033] line-clamp-2 leading-snug group-hover:text-[#D71920] transition-colors">
              <Link href={`/bai-viet/${article.slug}`}>
                {article.title}
              </Link>
            </h3>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-2">
            <span>{formatTimeAgoVN(article.published_at)}</span>
            <span>•</span>
            <span>{article.reading_time_minutes} phút đọc</span>
          </div>
        </div>
      </article>
    );
  }

  // 3. COMPACT VARIANT (Text-only or mini)
  if (variant === 'compact') {
    return (
      <article className="group py-2.5 border-b border-gray-100 last:border-b-0">
        <h4 className="text-sm font-semibold text-[#172033] line-clamp-2 leading-snug group-hover:text-[#D71920] transition-colors">
          <Link href={`/bai-viet/${article.slug}`}>
            {article.title}
          </Link>
        </h4>
        <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-1">
          <span className="text-[#D71920] font-medium">{categoryName}</span>
          <span>•</span>
          <span>{formatTimeAgoVN(article.published_at)}</span>
        </div>
      </article>
    );
  }

  // 4. DEFAULT CARD VARIANT
  return (
    <article className="group bg-white rounded-xl overflow-hidden border border-gray-200 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col h-full">
      <Link href={`/bai-viet/${article.slug}`} className="relative aspect-16/10 w-full overflow-hidden block bg-gray-100">
        <Image
          src={imageUrl}
          alt={article.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-xs text-white text-[11px] font-semibold px-2 py-0.5 rounded uppercase">
          {categoryName}
        </span>
      </Link>

      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          <h3 className="text-base font-bold text-[#172033] line-clamp-2 leading-snug group-hover:text-[#D71920] transition-colors mb-2">
            <Link href={`/bai-viet/${article.slug}`}>
              {article.title}
            </Link>
          </h3>

          {showSapo && (
            <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed mb-3">
              {article.sapo}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2.5 border-t border-gray-100">
          <span>{formatTimeAgoVN(article.published_at)}</span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3 text-gray-400" />
            {article.view_count.toLocaleString()}
          </span>
        </div>
      </div>
    </article>
  );
}
