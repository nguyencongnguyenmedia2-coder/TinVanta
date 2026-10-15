'use client';

import React, { useState, useEffect } from 'react';
import { AdCreative } from '@/types/database';

interface AdSlotProps {
  creative: AdCreative | null;
  slotName?: string;
  className?: string;
  placement?: string;
}

export function AdSlot({ 
  creative, 
  slotName = 'Quảng cáo', 
  className = '',
  placement
}: AdSlotProps) {
  const [ad, setAd] = useState<AdCreative | null>(creative);

  // Đồng bộ banner mới nhất qua LocalStorage, Custom Event và Realtime API
  useEffect(() => {
    const targetPlacement = (placement || creative?.placement_id || '').toLowerCase().trim();

    // 1. Kiểm tra bộ nhớ cục bộ trình duyệt (có tác dụng tức thì ngay khi admin vừa bấm lưu trên máy)
    const checkLocalOverride = () => {
      try {
        const raw = localStorage.getItem('tinvanta_ads_override');
        if (raw) {
          const list: AdCreative[] = JSON.parse(raw);
          if (Array.isArray(list)) {
            const found = list.find(a => {
              if (!a.is_active) return false;
              const p = (a.placement_id || '').toLowerCase();
              if (targetPlacement && p === targetPlacement) return true;
              if (targetPlacement === 'header_top' && (p === 'homepage_top' || p === 'pl-home-top')) return true;
              if (targetPlacement === 'sidebar_top' && (p === 'article_sidebar' || p === 'pl-art-side')) return true;
              if (creative && a.id === creative.id) return true;
              return false;
            });
            if (found) {
              setAd(found);
              return true;
            }
          }
        }
      } catch {}
      return false;
    };

    checkLocalOverride();

    // 2. Gọi API để lấy banner mới nhất được cập nhật trên server Vercel (bỏ qua HTTP Cache)
    const fetchLatestAd = async () => {
      try {
        const res = await fetch('/api/admin/ads', { cache: 'no-store' });
        const data = await res.json();
        if (data.success && Array.isArray(data.ads)) {
          const list: AdCreative[] = data.ads;
          const found = list.find(a => {
            if (!a.is_active) return false;
            const p = (a.placement_id || '').toLowerCase();
            if (targetPlacement && p === targetPlacement) return true;
            if (targetPlacement === 'header_top' && (p === 'homepage_top' || p === 'pl-home-top')) return true;
            if (targetPlacement === 'sidebar_top' && (p === 'article_sidebar' || p === 'pl-art-side')) return true;
            if (creative && a.id === creative.id) return true;
            return false;
          });

          if (found) {
            setAd(found);
          } else if (creative) {
            // Kiểm tra xem creative ban đầu có bị tắt không
            const matchingInitial = list.find(a => a.id === creative.id);
            if (matchingInitial && !matchingInitial.is_active) {
              setAd(null);
            }
          }
        }
      } catch {}
    };

    fetchLatestAd();

    // 3. Lắng nghe sự kiện cập nhật tức thời từ Admin CMS mà không cần tải lại trang
    const handleAdsUpdated = () => {
      checkLocalOverride();
      fetchLatestAd();
    };

    window.addEventListener('tinvanta_ads_updated', handleAdsUpdated);
    window.addEventListener('storage', handleAdsUpdated);

    return () => {
      window.removeEventListener('tinvanta_ads_updated', handleAdsUpdated);
      window.removeEventListener('storage', handleAdsUpdated);
    };
  }, [creative, placement]);

  if (!ad || !ad.is_active) {
    return null;
  }

  const handleAdClick = () => {
    fetch(`/api/ads/track/click?id=${encodeURIComponent(ad.id)}`, { method: 'POST' }).catch(() => {});
  };

  const isGif = ad.image_url?.toLowerCase().includes('.gif') || ad.image_url?.toLowerCase().includes('giphy.com');

  return (
    <div className={`my-4 sm:my-6 text-center w-full ${className}`}>
      <div className="inline-block relative max-w-full w-full">
        <div className="flex items-center justify-between text-[10px] text-gray-400 uppercase tracking-widest mb-1 px-1">
          <span className="font-semibold text-gray-400">{slotName}</span>
          {isGif && (
            <span className="text-[9px] font-black text-purple-600 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
              GIF
            </span>
          )}
        </div>
        <a
          href={ad.destination_url || 'https://tinvanta.vercel.app'}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleAdClick}
          className="block rounded-xl overflow-hidden border border-gray-200 shadow-2xs hover:shadow-md hover:border-gray-300 transition-all bg-gray-50 group"
        >
          <img
            src={ad.image_url}
            alt={ad.title}
            className="w-full h-auto max-h-[140px] sm:max-h-[220px] object-cover group-hover:opacity-95 transition-opacity"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=970&h=250&fit=crop&q=80';
            }}
          />
        </a>
      </div>
    </div>
  );
}
