'use client';

import React, { useState } from 'react';
import { Megaphone, Plus, ExternalLink, MousePointer, Eye, CheckCircle, PauseCircle } from 'lucide-react';
import { MOCK_AD_CREATIVES } from '@/lib/data/mock-data';

export default function AdminAdsPage() {
  const [ads, setAds] = useState(MOCK_AD_CREATIVES);

  const toggleStatus = (id: string) => {
    setAds(ads.map(ad => ad.id === id ? { ...ad, is_active: !ad.is_active } : ad));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-black text-[#172033]">
            Quản Lý Chiến Dịch Quảng Cáo & Banner
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Phát sóng banner tài trợ, tracking impression/click và chống gian lận (Anti-fraud click).
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('Mở form tạo chiến dịch mới')}
          className="bg-[#D71920] hover:bg-[#b8141a] text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Tạo chiến dịch mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ads.map((ad) => {
          const ctr = ad.impressions_count > 0 
            ? ((ad.clicks_count / ad.impressions_count) * 100).toFixed(2) 
            : '0.00';

          return (
            <div key={ad.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Vị trí: {ad.placement_id}
                  </span>
                  <h3 className="text-base font-bold text-[#172033] mt-0.5">
                    {ad.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => toggleStatus(ad.id)}
                  className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 transition-colors ${
                    ad.is_active 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {ad.is_active ? <CheckCircle className="w-3.5 h-3.5" /> : <PauseCircle className="w-3.5 h-3.5" />}
                  {ad.is_active ? 'Đang chạy' : 'Tạm dừng'}
                </button>
              </div>

              {/* Banner Preview */}
              <div className="rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                <img 
                  src={ad.image_url} 
                  alt={ad.title} 
                  className="w-full h-32 object-cover" 
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-lg text-center text-xs">
                <div>
                  <p className="text-gray-400 text-[10px] uppercase font-semibold">Lượt hiển thị</p>
                  <p className="font-extrabold text-[#172033] text-sm mt-0.5">{ad.impressions_count.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-[10px] uppercase font-semibold">Lượt bấm (Clicks)</p>
                  <p className="font-extrabold text-[#172033] text-sm mt-0.5">{ad.clicks_count.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-[10px] uppercase font-semibold">Tỷ lệ CTR</p>
                  <p className="font-extrabold text-[#D71920] text-sm mt-0.5">{ctr}%</p>
                </div>
              </div>

              {/* Destination URL */}
              <div className="text-[11px] text-gray-500 truncate flex items-center gap-1">
                <span>Đích đến:</span>
                <a 
                  href={ad.destination_url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-blue-600 hover:underline truncate"
                >
                  {ad.destination_url}
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
