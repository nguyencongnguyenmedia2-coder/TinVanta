import React from 'react';
import Link from 'next/link';
import { Category, Article } from '@/types/database';
import { NewsCard } from './NewsCard';
import { ChevronRight, ArrowRight } from 'lucide-react';

interface CategoryBlockProps {
  category: Category;
  articles: Article[];
}

export function CategoryBlock({ category, articles }: CategoryBlockProps) {
  if (!articles || articles.length === 0) return null;

  const lead = articles[0];
  const list = articles.slice(1, 5);

  // Nhận diện màu sắc theo từng chuyên mục
  const getCategoryColor = (slug: string) => {
    switch (slug) {
      case 'thoi-su':
        return { border: 'border-[#D71920]', bg: 'bg-[#D71920]', text: 'text-[#D71920]', lightBg: 'bg-red-50' };
      case 'kinh-te':
        return { border: 'border-blue-700', bg: 'bg-blue-700', text: 'text-blue-700', lightBg: 'bg-blue-50' };
      case 'cong-nghe':
        return { border: 'border-purple-700', bg: 'bg-purple-700', text: 'text-purple-700', lightBg: 'bg-purple-50' };
      case 'xa-hoi':
        return { border: 'border-emerald-700', bg: 'bg-emerald-700', text: 'text-emerald-700', lightBg: 'bg-emerald-50' };
      default:
        return { border: 'border-[#172033]', bg: 'bg-[#172033]', text: 'text-[#172033]', lightBg: 'bg-gray-50' };
    }
  };

  const theme = getCategoryColor(category.slug);

  return (
    <section className="my-6 sm:my-8 bg-white p-4 sm:p-6 rounded-2xl border border-gray-200/90 shadow-2xs">
      {/* Category Section Header */}
      <div className={`flex items-center justify-between border-b-2 ${theme.border} pb-2.5 mb-4 sm:mb-5`}>
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-5 ${theme.bg} inline-block rounded-xs`} />
          <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-[#172033]">
            <Link href={`/chuyen-muc/${category.slug}`} className="hover:opacity-80 transition-opacity">
              {category.name}
            </Link>
          </h2>
        </div>

        <Link 
          href={`/chuyen-muc/${category.slug}`}
          className={`text-xs font-bold ${theme.text} hover:opacity-80 flex items-center transition-colors group`}
        >
          <span>Xem tất cả</span>
          <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Grid: 1 Main Story (Trái) + 3 List stories (Phải) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">
        <div className="md:col-span-6 lg:col-span-7">
          <NewsCard article={lead} variant="default" showSapo={true} />
        </div>

        <div className="md:col-span-6 lg:col-span-5 flex flex-col justify-between divide-y divide-gray-100">
          {list.map((item) => (
            <NewsCard key={item.id} article={item} variant="horizontal" showSapo={false} />
          ))}
        </div>
      </div>
    </section>
  );
}
