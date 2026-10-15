'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Sun, CloudRain, DollarSign, Coins } from 'lucide-react';

interface MarketItem {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  type: 'stock' | 'gold' | 'fx' | 'weather';
}

const MARKET_ITEMS: MarketItem[] = [
  { label: 'VN-INDEX', value: '1,288.50', change: '+8.45 (+0.66%)', isPositive: true, type: 'stock' },
  { label: 'HNX-INDEX', value: '235.12', change: '+1.20 (+0.51%)', isPositive: true, type: 'stock' },
  { label: 'VÀNG SJC', value: '89.50 tr', change: '+300K', isPositive: true, type: 'gold' },
  { label: 'USD/VND', value: '25,420', change: '-10 (-0.04%)', isPositive: false, type: 'fx' },
  { label: 'EUR/VND', value: '27,650', change: '+45 (+0.16%)', isPositive: true, type: 'fx' },
  { label: 'HÀ NỘI', value: '28°C', change: 'Nắng nhẹ', isPositive: true, type: 'weather' },
  { label: 'TP. HỒ CHÍ MINH', value: '32°C', change: 'Mây có lúc mưa rào', isPositive: false, type: 'weather' },
  { label: 'ĐÀ NẴNG', value: '29°C', change: 'Trời đẹp', isPositive: true, type: 'weather' },
];

export function MarketDataBar() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="bg-gray-50/90 border-y border-gray-200 text-xs py-1.5 px-4 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left Badge */}
        <div className="flex items-center gap-1.5 shrink-0 pr-3 border-r border-gray-200 text-gray-500 font-bold text-[11px] uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Thị trường & Thời tiết:</span>
        </div>

        {/* Scrolling / Flex Ticker */}
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap text-[11px]">
          {MARKET_ITEMS.map((item, idx) => (
            <div key={idx} className="inline-flex items-center gap-1.5 shrink-0 text-gray-700">
              <span className="font-bold text-gray-800">{item.label}</span>
              <span className="font-mono font-semibold">{item.value}</span>
              <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${
                item.type === 'weather'
                  ? 'text-gray-500 font-normal'
                  : item.isPositive
                  ? 'text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded'
                  : 'text-red-700 bg-red-50 px-1 py-0.2 rounded'
              }`}>
                {item.type !== 'weather' && (
                  item.isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />
                )}
                {item.change}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
