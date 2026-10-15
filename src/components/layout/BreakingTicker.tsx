'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flame } from 'lucide-react';

interface BreakingTickerProps {
  text: string;
  link: string;
}

export function BreakingTicker({ text, link }: BreakingTickerProps) {
  const pathname = usePathname();

  if (!text || pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-red-600 to-red-700 text-white text-xs md:text-sm font-medium py-1.5 px-4 shadow-sm border-b border-red-800">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <span className="flex items-center gap-1.5 bg-white text-red-700 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider text-[11px] shrink-0 animate-pulse">
          <Flame className="w-3.5 h-3.5 fill-current" />
          Tin nóng
        </span>
        <Link 
          href={link} 
          className="truncate hover:underline transition-all duration-200 text-white/95 hover:text-white"
        >
          {text}
        </Link>
      </div>
    </div>
  );
}
