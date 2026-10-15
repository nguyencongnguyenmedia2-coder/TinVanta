import React from 'react';
import Link from 'next/link';
import { Category, Article } from '@/types/database';
import { NewsCard } from './NewsCard';
import { ChevronRight } from 'lucide-react';

interface CategoryBlockProps {
  category: Category;
  articles: Article[];
}

export function CategoryBlock({ category, articles }: CategoryBlockProps) {
  if (!articles || articles.length === 0) return null;

  const lead = articles[0];
  const list = articles.slice(1, 4);

  return (
    <section className="my-8">
      {/* Category Section Header */}
      <div className="flex items-center justify-between border-b-2 border-[#172033] pb-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-5 bg-[#D71920] inline-block rounded-xs"></span>
          <h2 className="text-lg font-extrabold uppercase tracking-tight text-[#172033]">
            <Link href={`/chuyen-muc/${category.slug}`} className="hover:text-[#D71920] transition-colors">
              {category.name}
            </Link>
          </h2>
        </div>

        <Link 
          href={`/chuyen-muc/${category.slug}`}
          className="text-xs font-semibold text-gray-500 hover:text-[#D71920] flex items-center transition-colors"
        >
          Xem tất cả
          <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
        </Link>
      </div>

      {/* Grid: 1 Main Story + 3 List stories */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-6 lg:col-span-7">
          <NewsCard article={lead} variant="default" showSapo={true} />
        </div>

        <div className="md:col-span-6 lg:col-span-5 flex flex-col justify-between divide-y divide-gray-100">
          {list.map((item) => (
            <NewsCard key={item.id} article={item} variant="horizontal" />
          ))}
        </div>
      </div>
    </section>
  );
}
