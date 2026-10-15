'use client';

import React, { useState, useEffect } from 'react';
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
  BarChart3,
  Edit,
  Trash2,
  Film,
  Image as ImageIcon,
  Sparkles,
  Save,
  Loader2,
  RefreshCw,
  Play
} from 'lucide-react';
import { AdCreative } from '@/types/database';

// Danh mục mẫu Banner & GIF chuyển động có sẵn cho Admin bấm chọn nhanh 1-Click
const AD_PRESETS = [
  {
    type: 'gif',
    name: '🎬 GIF Động: Công nghệ AI & Chip Bán dẫn',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=970&h=250&fit=crop&q=80',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3h0Ymg1bW12MjlhbnVtbjlqd2lybXN0YnNpNXc4MWU3cXpnN2xyeSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3oKIPnAiaMCws8nOsE/giphy.gif',
    target: 'https://tinvanta.vercel.app/chuyen-muc/cong-nghe',
  },
  {
    type: 'gif',
    name: '🎬 GIF Động: Ưu đãi Tín dụng & Ngân hàng số',
    url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&h=300&fit=crop&q=80',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHpsajFldGNra3M4cm93NDRndXptb3FvczNsc2h1Mm9wbDhlOXlkbyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/LdOyjZ7io5M88/giphy.gif',
    target: 'https://tinvanta.vercel.app/chuyen-muc/kinh-te',
  },
  {
    type: 'gif',
    name: '🎬 GIF Động: Siêu Sale Khuyến Mãi Flash-Deal',
    url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=970&h=250&fit=crop&q=80',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWc2dHF1cGg4MmJic2w2OTd5anR2Z3ZubnNxZG9hMWd6NHF1ZDN5ZSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3o6Mb5XhuST6WV0TGg/giphy.gif',
    target: 'https://tinvanta.vercel.app',
  },
  {
    type: 'image',
    name: '🖼️ Ảnh tĩnh: VinFast Xe Điện Toàn Cầu 2026',
    url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=970&h=250&fit=crop&q=80',
    target: 'https://vinfastauto.com',
  },
  {
    type: 'image',
    name: '🖼️ Ảnh tĩnh: Năng lượng Xanh & Điện gió Bền vững',
    url: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=970&h=250&fit=crop&q=80',
    target: 'https://tinvanta.vercel.app',
  }
];

export default function AdminAdsPage() {
  const [ads, setAds] = useState<AdCreative[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal State: 'create' | 'edit' | null
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingAdId, setEditingAdId] = useState<string | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formPlacement, setFormPlacement] = useState('header_top');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formTargetUrl, setFormTargetUrl] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Đồng bộ danh sách quảng cáo vào localStorage và bắn sự kiện cho AdSlot toàn trang
  const syncAdsToLocalAndNotify = (newAds: AdCreative[]) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('tinvanta_ads_override', JSON.stringify(newAds));
        window.dispatchEvent(new Event('tinvanta_ads_updated'));
      }
    } catch (e) {
      console.error('Lỗi sync quảng cáo sang LocalStorage:', e);
    }
  };

  // Nạp danh sách quảng cáo từ API
  const fetchAds = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/ads', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.ads)) {
        setAds(data.ads);
        syncAdsToLocalAndNotify(data.ads);
      }
    } catch (err) {
      console.error('Lỗi nạp quảng cáo:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Bật / Tắt trạng thái hiển thị
  const handleToggleStatus = async (ad: AdCreative) => {
    try {
      const updatedStatus = !ad.is_active;
      const res = await fetch('/api/admin/ads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ad.id, is_active: updatedStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const nextList = data.ads || ads.map(item => item.id === ad.id ? { ...item, is_active: updatedStatus } : item);
        setAds(nextList);
        syncAdsToLocalAndNotify(nextList);
        showToast(updatedStatus ? 'Đã kích hoạt phát sóng banner!' : 'Đã tạm dừng phát sóng banner.');
      } else {
        alert(data.error || 'Có lỗi khi đổi trạng thái');
      }
    } catch {
      alert('Không thể kết nối đến máy chủ.');
    }
  };

  // Mở modal tạo mới
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingAdId(null);
    setFormTitle('');
    setFormPlacement('header_top');
    setFormImageUrl('');
    setFormTargetUrl('');
    setFormIsActive(true);
  };

  // Mở modal chỉnh sửa
  const handleOpenEditModal = (ad: AdCreative) => {
    setModalMode('edit');
    setEditingAdId(ad.id);
    setFormTitle(ad.title || '');
    setFormPlacement(ad.placement_id || 'header_top');
    setFormImageUrl(ad.image_url || '');
    setFormTargetUrl(ad.destination_url || '');
    setFormIsActive(ad.is_active !== undefined ? ad.is_active : true);
  };

  // Xóa quảng cáo
  const handleDeleteAd = async (ad: AdCreative) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa chiến dịch: "${ad.title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/ads?id=${encodeURIComponent(ad.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const nextList = data.ads || ads.filter(item => item.id !== ad.id);
        setAds(nextList);
        syncAdsToLocalAndNotify(nextList);
        showToast('Đã xóa chiến dịch quảng cáo thành công.');
      } else {
        alert(data.error || 'Không thể xóa quảng cáo');
      }
    } catch {
      alert('Lỗi kết nối máy chủ.');
    }
  };

  // Submit Lưu (Tạo mới hoặc Cập nhật)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formImageUrl.trim()) {
      alert('Vui lòng nhập đầy đủ Tiêu đề và Link Ảnh/GIF quảng cáo.');
      return;
    }

    setSaving(true);
    try {
      if (modalMode === 'edit' && editingAdId) {
        // Cập nhật quảng cáo
        const res = await fetch('/api/admin/ads', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingAdId,
            title: formTitle.trim(),
            placement_id: formPlacement.trim(),
            image_url: formImageUrl.trim(),
            destination_url: formTargetUrl.trim() || 'https://tinvanta.vercel.app',
            is_active: formIsActive,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          if (data.ads) {
            setAds(data.ads);
            syncAdsToLocalAndNotify(data.ads);
          } else {
            fetchAds();
          }
          showToast(`Đã cập nhật chiến dịch "${formTitle}" thành công!`);
          setModalMode(null);
        } else {
          alert(data.error || 'Lỗi khi cập nhật quảng cáo');
        }
      } else {
        // Tạo quảng cáo mới
        const res = await fetch('/api/admin/ads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formTitle.trim(),
            placement_id: formPlacement.trim(),
            image_url: formImageUrl.trim(),
            destination_url: formTargetUrl.trim() || 'https://tinvanta.vercel.app',
            is_active: formIsActive,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          if (data.ads) {
            setAds(data.ads);
            syncAdsToLocalAndNotify(data.ads);
          } else {
            fetchAds();
          }
          showToast(`Đã tạo chiến dịch quảng cáo "${formTitle}" thành công!`);
          setModalMode(null);
        } else {
          alert(data.error || 'Lỗi khi tạo quảng cáo');
        }
      }
    } catch {
      alert('Không thể kết nối đến máy chủ.');
    } finally {
      setSaving(false);
    }
  };

  // Kiểm tra xem URL có phải là GIF chuyển động hay không
  const isGifUrl = (url: string) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.includes('.gif') || lower.includes('giphy.com') || lower.includes('/gif');
  };

  const getPlacementInfo = (placement: string) => {
    switch (placement) {
      case 'header_top':
      case 'homepage_top':
      case 'pl-home-top':
        return { name: 'Đỉnh Trang Chủ (Header 970x90 / 728x90)', link: '/' };
      case 'sidebar_top':
        return { name: 'Thanh Bên Trang Chủ (Sidebar 300x250)', link: '/' };
      case 'sidebar_sticky':
      case 'article_sidebar':
      case 'pl-art-side':
        return { name: 'Thanh Bên Bài Viết (Sticky Sidebar)', link: '/bai-viet' };
      case 'category_middle':
        return { name: 'Giữa Danh Sách Chuyên Mục', link: '/chuyen-muc/kinh-te' };
      default:
        return { name: `Vị trí: ${placement}`, link: '/' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#172033] text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 border border-gray-700 animate-in fade-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#172033] flex items-center gap-2 tracking-tight">
            <Megaphone className="w-6 h-6 text-[#D71920]" />
            Quản Lý Chiến Dịch Quảng Cáo & Banner Doanh Thu
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Hỗ trợ phát sóng <strong>Hình ảnh tĩnh (JPG, PNG, WebP)</strong> hoặc <strong>Ảnh GIF chuyển động (Animated GIF)</strong>, theo dõi CTR và tối ưu doanh thu tài trợ.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="bg-[#D71920] hover:bg-[#b8141a] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo chiến dịch mới</span>
        </button>
      </div>

      {/* Danh sách thẻ quảng cáo */}
      {loading ? (
        <div className="p-16 text-center text-gray-500 text-xs flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#D71920]" />
          <span>Đang tải danh sách chiến dịch banner...</span>
        </div>
      ) : ads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center text-gray-500 space-y-3">
          <Megaphone className="w-10 h-10 mx-auto text-gray-300" />
          <p className="font-bold text-sm text-gray-700">Chưa có chiến dịch quảng cáo nào được thiết lập.</p>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-[#D71920] text-white font-bold text-xs rounded-xl hover:bg-[#b8141a]"
          >
            Tạo quảng cáo đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ads.map((ad) => {
            const ctr = ad.impressions_count > 0 
              ? ((ad.clicks_count / ad.impressions_count) * 100).toFixed(2) 
              : '0.00';
            const placementInfo = getPlacementInfo(ad.placement_id);
            const isGif = isGifUrl(ad.image_url);

            return (
              <div key={ad.id} className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-2xs space-y-4 hover:shadow-md transition-shadow">
                {/* Header Card: Vị trí & Trạng thái & Nút sửa */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {placementInfo.name}
                      </span>
                      {isGif ? (
                        <span className="text-[10px] font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full uppercase flex items-center gap-1 animate-pulse">
                          <Film className="w-3 h-3" /> GIF Chuyển động
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" /> Ảnh tĩnh
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-[#172033] line-clamp-1">
                      {ad.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Nút sửa quảng cáo */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(ad)}
                      className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Chỉnh sửa nội dung & đổi ảnh/GIF quảng cáo"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {/* Nút bật/tắt quảng cáo */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(ad)}
                      className={`text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                        ad.is_active 
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={ad.is_active ? 'Nhấn để tạm dừng phát sóng' : 'Nhấn để kích hoạt phát sóng'}
                    >
                      {ad.is_active ? <CheckCircle className="w-3.5 h-3.5" /> : <PauseCircle className="w-3.5 h-3.5" />}
                      <span>{ad.is_active ? 'Đang chạy' : 'Tạm dừng'}</span>
                    </button>

                    {/* Nút xóa quảng cáo */}
                    <button
                      type="button"
                      onClick={() => handleDeleteAd(ad)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Xóa chiến dịch này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Banner Preview (Hỗ trợ hình ảnh hoặc GIF chuyển động mượt mà) */}
                <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-900/5 h-40 relative group flex items-center justify-center">
                  <img 
                    src={ad.image_url} 
                    alt={ad.title} 
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800';
                    }}
                  />
                  {isGif && (
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                      <Play className="w-2.5 h-2.5 fill-current" /> GIF ANIMATED
                    </div>
                  )}
                </div>

                {/* Performance Stats */}
                <div className="grid grid-cols-3 gap-2 bg-gray-50/80 p-3.5 rounded-xl text-center text-xs border border-gray-100">
                  <div>
                    <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Lượt hiển thị</p>
                    <p className="text-sm font-black text-[#172033] mt-0.5">
                      {ad.impressions_count.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Lượt click</p>
                    <p className="text-sm font-black text-blue-600 mt-0.5">
                      {ad.clicks_count.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Hiệu suất CTR</p>
                    <p className="text-sm font-black text-emerald-600 mt-0.5">
                      {ctr}%
                    </p>
                  </div>
                </div>

                {/* Link xem trang phát sóng & Link đích */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                  <Link
                    href={placementInfo.link}
                    target="_blank"
                    className="text-gray-500 hover:text-gray-900 flex items-center gap-1 font-medium transition-colors"
                  >
                    <span>Xem trang phát sóng</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>

                  <a 
                    href={ad.destination_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-red-600 hover:underline font-bold flex items-center gap-1"
                  >
                    <span>Đích đến (URL) →</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL CHỈNH SỬA & TẠO MỚI CHIẾN DỊCH QUẢNG CÁO */}
      {modalMode && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-[#D71920]" />
                <h3 className="font-black text-[#172033] text-base sm:text-lg">
                  {modalMode === 'edit' ? 'Chỉnh Sửa Chiến Dịch Quảng Cáo' : 'Tạo Chiến Dịch Quảng Cáo Mới'}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setModalMode(null)} 
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* TÊN CHIẾN DỊCH */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Tên chiến dịch / Nhà tài trợ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ví dụ: Banner VinFast Green Tour 2026 hoặc Khuyến mãi Flash Sale"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D71920]"
                />
              </div>

              {/* VỊ TRÍ PHÁT SÓNG */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Vị trí phát sóng trên website <span className="text-red-500">*</span>
                </label>
                <select
                  value={formPlacement}
                  onChange={(e) => setFormPlacement(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#D71920]"
                >
                  <option value="header_top">Đỉnh Trang Chủ (Header Top Leaderboard - 970x90 / 728x90)</option>
                  <option value="sidebar_top">Thanh Bên Trang Chủ (Sidebar Top Banner - 300x250)</option>
                  <option value="sidebar_sticky">Thanh Bên Bài Viết (Article Sticky Sidebar - 300x250 / 300x600)</option>
                  <option value="category_middle">Giữa Danh Sách Chuyên Mục (Category Feed Banner - 728x90)</option>
                </select>
              </div>

              {/* URL HÌNH ẢNH HOẶC GIF CHUYỂN ĐỘNG */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span>URL Hình ảnh hoặc GIF chuyển động</span>
                    <span className="text-red-500">*</span>
                  </label>
                  {isGifUrl(formImageUrl) && (
                    <span className="text-[10px] font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Film className="w-3 h-3" /> Nhận diện định dạng GIF động
                    </span>
                  )}
                </div>
                <input
                  type="url"
                  required
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="Dán link ảnh (.jpg, .png) hoặc ảnh động (.gif)..."
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#D71920]"
                />
              </div>

              {/* KHO MẪU BANNER & GIF CÓ SẴN (BẤM 1-CLICK ĐỂ ĐỔI) */}
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200/80 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Kho mẫu GIF chuyển động & Ảnh có sẵn (Bấm 1-Click để áp dụng):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {AD_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setFormImageUrl(preset.gifUrl || preset.url);
                        if (!formTargetUrl) setFormTargetUrl(preset.target);
                        if (!formTitle && modalMode === 'create') setFormTitle(preset.name.replace(/^[^\w\s]*\s*/, ''));
                      }}
                      className="px-2.5 py-1.5 bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-gray-700 border border-gray-200 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* KHUNG XEM TRƯỚC TRỰC TIẾP (LIVE PREVIEW BANNER HOẶC GIF) */}
              {formImageUrl && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Xem trước trực tiếp (Live Banner Preview):
                  </span>
                  <div className="rounded-xl overflow-hidden border border-gray-300 bg-gray-950/5 h-32 flex items-center justify-center relative">
                    <img
                      src={formImageUrl}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800';
                      }}
                    />
                    {isGifUrl(formImageUrl) && (
                      <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Play className="w-2.5 h-2.5 fill-current" /> Đang phát GIF
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* URL TRANG ĐÍCH KHI CLICK */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  URL Trang Đích (Destination Link khi người xem bấm vào)
                </label>
                <input
                  type="url"
                  value={formTargetUrl}
                  onChange={(e) => setFormTargetUrl(e.target.value)}
                  placeholder="https://sponsor.com/landing-page"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#D71920]"
                />
              </div>

              {/* CHECKBOX TRẠNG THÁI PHÁT SÓNG */}
              <label className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                />
                <span className="text-xs font-bold text-gray-800">
                  Kích hoạt phát sóng ngay sau khi lưu
                </span>
              </label>

              {/* CÁC NÚT ACTION MODAL */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#D71920] hover:bg-[#b8141a] text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{modalMode === 'edit' ? 'Lưu thay đổi banner' : 'Kích hoạt phát sóng'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
