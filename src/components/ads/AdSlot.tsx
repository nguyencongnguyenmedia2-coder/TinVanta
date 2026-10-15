'use client';

import React from 'react';
import Image from 'next/image';
import { AdCreative } from '@/types/database';

interface AdSlotProps {
  creative: AdCreative | null;
  slotName?: string;
  className?: string;
}

export function AdSlot({ creative, slotName = 'Quảng cáo', className = '' }: AdSlotProps) {
  if (!creative || !creative.is_active) {
    return null;
  }

  const handleAdClick = () => {
    // Gọi tracking endpoint qua fetch không chặn luồng
    fetch(`/api/ads/track/click?id=${encodeURIComponent(creative.id)}`, { method: 'POST' }).catch(() => {});
  };

  return (
    <div className={`my-6 text-center ${className}`}>
      <div className="inline-block relative max-w-full">
        <span className="block text-[10px] text-gray-400 uppercase tracking-widest text-right mb-1">
          {slotName}
        </span>
        <a
          href={creative.destination_url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleAdClick}
          className="block rounded-lg overflow-hidden border border-gray-200 shadow-xs hover:opacity-95 transition-opacity"
        >
          <img
            src={creative.image_url}
            alt={creative.title}
            className="w-full max-h-[160px] md:max-h-[250px] object-cover"
            loading="lazy"
          />
        </a>
      </div>
    </div>
  );
}
