'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Megaphone, 
  Plus, 
  ExternalLink, 
  MousePointer, 
  Eye, 
  CheckCircle, 
  PauseCircle, 
  X,
  CheckCircle2,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { MOCK_AD_CREATIVES } from '@/lib/data/mock-data';
import { AdCreative } from '@/types/database';

export default function AdminAdsPage() {
  const [ads, setAds] = useState<AdCreative[]>(MOCK_AD_CREATIVES);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTargetUrl, setNewTargetUrl] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newPlacement, setNewPlacement] = useState('homepage_top');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleStatus = (id: string) => {
    setAds(ads.map(ad => ad.id === id ? { ...ad, is_active: !ad.is_active } : ad));
    showToast('Đã cập nhật trạng thái hiển thị của banner!');
  };

  const handleCreateAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newImageUrl.trim()) return;

    const newAd: AdCreative = {
      id: `ad-${Date.now()}`,
      campaign_id: 'camp-custom',
      placement_id: newPlacement,
      title: newTitle.trim(),
      image_url: newImageUrl.trim(),
      destination_url: newTargetUrl.trim() || 'https://tinvanta.vercel.app',
      is_active: true,
      impressions_count: 0,
      clicks_count: 0,
      created_at: new Date().toISOString(),
    };

    setAds([newAd, ...ads]);
    setNewTitle('');
    setNewTargetUrl('');
    setNewImageUrl('');
    setShowModal(false);
    showToast(`Đã phát động chiến dịch quảng cáo "${newAd.title}"!`);
  };

  const getPlacementInfo = (placement: string) => {
    switch (placement) {
      case 'homepage_top':
      case 'pl-home-top':
        return { name: 'Đỉnh Trang Chủ (Header Banner)', link: '/' };
      case 'article_sidebar':
      case 'pl-art-side':
        return { name: 'Thanh Bên Bài Viết (Sidebar Desktop)', link: '/bai-viet' };
      case 'category_middle':
        return { name: 'Giữa Danh Sách Chuyên Mục', link: '/chuyen-muc/kinh-doanh' };
      default:
        return { name: `Vị trí: ${placement}`, link: '/' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#172033] text-white text-xs px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 border border-gray-700 animate-in fade-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-black text-[#172033] flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[#D71920]" />
            Quản Lý Chiến Dịch Quảng Cáo & Banner Doanh Thu
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Phát sóng banner tài trợ, tracking impression/click theo thời gian thực và phân bổ theo từng chuyên mục bài viết.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
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
          const placementInfo = getPlacementInfo(ad.placement_id);

          return (
            <div key={ad.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded uppercase tracking-wider">
                    {placementInfo.name}
                  </span>
                  <h3 className="text-base font-bold text-[#172033] mt-1.5">
                    {ad.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => toggleStatus(ad.id)}
                  className={`text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 transition-colors ${
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
              <div className="rounded-lg overflow-hidden border border-gray-100 bg-gray-50 h-36 relative">
                <img 
                  src={ad.image_url} 
                  alt={ad.title} 
                  className="w-full h-full object-cover" 
                />
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-lg text-center text-xs">
                <div>
                  <p className="text-gray-400 text-[10px] uppercase font-semibold">Lượt hiển thị</p>
                  <p className="text-sm font-bold text-[#172033] mt-0.5">
                    {ad.impressions_count.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-[10px] uppercase font-semibold">Lượt click</p>
                  <p className="text-sm font-bold text-blue-600 mt-0.5">
                    {ad.clicks_count.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-[10px] uppercase font-semibold">Hiệu suất CTR</p>
                  <p className="text-sm font-bold text-emerald-600 mt-0.5">
                    {ctr}%
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                <Link
                  href={placementInfo.link}
                  target="_blank"
                  className="text-gray-500 hover:text-gray-900 flex items-center gap-1 font-medium"
                >
                  <span>Xem trang phát sóng</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>

                <a 
                  href={ad.destination_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-red-600 hover:underline font-semibold flex items-center gap-1"
                >
                  Đích đến (URL) →
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL TẠO CHIẾN DỊCH QUẢNG CÁO MỚI */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-black text-[#172033] text-base">Tạo Chiến Dịch Banner Mới</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAd} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Tên chiến dịch / Nhà tài trợ *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Banner VinFast Green Tour 2026"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Vị trí phát sóng *
                </label>
                <select
                  value={newPlacement}
                  onChange={(e) => setNewPlacement(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
                >
                  <option value="homepage_top">Đỉnh Trang Chủ (Header Top Banner)</option>
                  <option value="article_sidebar">Thanh Bên Bài Viết (Article Sidebar)</option>
                  <option value="category_middle">Giữa Danh Sách Chuyên Mục</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  URL Hình ảnh Banner *
                </label>
                <input
                  type="url"
                  required
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  URL Trang Đích khi Click
                </label>
                <input
                  type="url"
                  value={newTargetUrl}
                  onChange={(e) => setNewTargetUrl(e.target.value)}
                  placeholder="https://sponsor.com/landing-page"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D71920] hover:bg-[#b8141a] text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                >
                  Kích hoạt phát sóng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
