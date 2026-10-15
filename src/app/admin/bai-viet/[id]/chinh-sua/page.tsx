'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { TipTapEditor } from '@/components/editor/TipTapEditor';
import { MOCK_CATEGORIES } from '@/lib/data/mock-data';
import { generateVietnameseSlug } from '@/lib/utils';
import { 
  ArrowLeft, 
  Save, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileCheck,
  History,
  RotateCcw,
  ExternalLink,
  Loader2,
  Calendar,
  Sparkles,
  Image as ImageIcon,
  Flame,
  Star,
  Globe,
  RefreshCw,
  Wand2
} from 'lucide-react';
import { Suspense } from 'react';
import { Article, ArticleStatus } from '@/types/database';
import { AutoCoverModal } from '@/components/admin/AutoCoverModal';

function toDatetimeLocalString(isoDate?: string | null): string {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function EditArticleInner() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [article, setArticle] = useState<Article | null>(null);

  // Core Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [sapo, setSapo] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [status, setStatus] = useState<ArticleStatus>('draft');
  const [categoryId, setCategoryId] = useState(MOCK_CATEGORIES[0]?.id || '');
  const [version, setVersion] = useState(1);

  // Ngày & Giờ Đăng Bài (Published Date-Time)
  const [publishedAtLocal, setPublishedAtLocal] = useState('');

  // Media & Highlighting Flags
  const [imageUrl, setImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBreaking, setIsBreaking] = useState(false);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);

  // Load article data from unified API
  useEffect(() => {
    async function loadArticle() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/articles`);
        const data = await res.json();
        if (data.success && Array.isArray(data.articles)) {
          const found = data.articles.find((a: Article) => a.id === id || a.slug === id);
          if (found) {
            setArticle(found);
            setTitle(found.title || '');
            setSlug(found.slug || '');
            setSapo(found.sapo || '');
            setContentHtml(found.content_html || '');
            setStatus(found.status || 'draft');
            setCategoryId(found.primary_category_id || MOCK_CATEGORIES[0]?.id || '');
            setVersion(found.version || 1);
            setImageUrl(found.featured_image?.public_url || '');
            setIsFeatured(Boolean(found.is_featured));
            setIsBreaking(Boolean(found.is_breaking));

            // Khởi tạo ngày giờ đăng bài
            const initDate = found.published_at || found.created_at;
            setPublishedAtLocal(toDatetimeLocalString(initDate));
          }
        }
      } catch (err) {
        console.error('Lỗi nạp bài viết:', err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadArticle();
    }
  }, [id]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  // Nút chỉnh nhanh ngày giờ
  const handleSetTimeToNow = () => {
    setPublishedAtLocal(toDatetimeLocalString(new Date().toISOString()));
  };

  const handleSetTimePlus1Hour = () => {
    const nextHour = new Date(Date.now() + 60 * 60 * 1000);
    setPublishedAtLocal(toDatetimeLocalString(nextHour.toISOString()));
  };

  const handleSetTimeToTomorrowMorning = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);
    setPublishedAtLocal(toDatetimeLocalString(tomorrow.toISOString()));
  };

  const handleRegenerateSlug = () => {
    if (title.trim()) {
      setSlug(generateVietnameseSlug(title));
    }
  };

  // Submit Handler
  const handleSave = async (targetStatus?: ArticleStatus) => {
    const finalStatus = targetStatus || status;
    setSaving(true);

    try {
      // Chuẩn hóa ngày giờ sang ISO
      let finalPublishedAtIso: string | undefined = undefined;
      if (publishedAtLocal) {
        const parsed = new Date(publishedAtLocal);
        if (!isNaN(parsed.getTime())) {
          finalPublishedAtIso = parsed.toISOString();
        }
      } else if (finalStatus === 'published') {
        finalPublishedAtIso = new Date().toISOString();
      }

      const res = await fetch('/api/admin/articles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          title: title.trim(),
          slug: slug.trim().toLowerCase(),
          sapo: sapo.trim(),
          content_html: contentHtml,
          category_id: categoryId,
          status: finalStatus,
          published_at: finalPublishedAtIso,
          featured_image_url: imageUrl.trim() || undefined,
          is_featured: isFeatured,
          is_breaking: isBreaking,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus(finalStatus);
        setVersion(v => v + 1);
        if (data.article) {
          setArticle(data.article);
          if (data.article.slug) setSlug(data.article.slug);
        }
        showToast(
          finalStatus === 'published' 
            ? 'Đã duyệt & xuất bản bài viết thành công lên trang chủ!' 
            : 'Đã lưu bản cập nhật nội dung bài viết thành công!',
          'success'
        );
      } else {
        showToast(data.error || 'Có lỗi xảy ra khi cập nhật.', 'error');
      }
    } catch {
      showToast('Không thể kết nối đến máy chủ tòa soạn.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-gray-500 text-xs flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-[#D71920]" />
        <span>Đang nạp dữ liệu bài viết #{id}...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* 1. TOP HEADER & EDITORIAL ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/bai-viet"
            className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
            title="Quay lại danh sách bài viết"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#172033] tracking-tight">
              Sửa & Cập Nhật Nội Dung Bài Viết
            </h1>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5 flex-wrap">
              <span>Mã bài: <strong className="font-mono text-gray-700">{id}</strong></span>
              <span>•</span>
              <span>Phiên bản: <strong className="text-gray-700">v{version}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                Trạng thái: 
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  status === 'published' ? 'bg-emerald-100 text-emerald-800' :
                  status === 'pending_review' ? 'bg-amber-100 text-amber-800' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {status === 'published' ? 'Đã xuất bản' : status === 'pending_review' ? 'Chờ duyệt' : 'Bản nháp'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Workflow Transition Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {slug && (
            <Link
              href={`/bai-viet/${slug}`}
              target="_blank"
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Xem trên Web</span>
            </Link>
          )}

          {status === 'published' && (
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('draft')}
              className="px-3.5 py-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Gỡ bài xuống trạng thái bản nháp"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Hạ bài (Nháp)</span>
            </button>
          )}

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave(status)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-gray-600" />}
            <span>Lưu cập nhật</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('published')}
            className="px-4 py-2 bg-[#D71920] hover:bg-[#b8141a] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{status === 'published' ? 'Lưu & Đăng lại' : '🚀 Duyệt & Xuất bản ngay'}</span>
          </button>
        </div>
      </div>

      {/* Thông báo Toast */}
      {notification && (
        <div className={`p-4 rounded-xl flex items-center gap-2.5 text-xs font-bold border shadow-xs animate-in fade-in slide-in-from-top-2 ${
          notification.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* 2. FORM GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CỘT TRÁI (8 COLS): NỘI DUNG CHÍNH */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-5">
            {/* TIÊU ĐỀ BÀI VIẾT */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Tiêu đề bài viết <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề tin bài thu hút, chuẩn SEO..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base font-bold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#D71920] transition-all"
              />
            </div>

            {/* SLUG TÙY CHỈNH */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Đường dẫn tĩnh (Slug URL)
                </label>
                <button
                  type="button"
                  onClick={handleRegenerateSlug}
                  className="text-xs text-[#D71920] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Tạo lại từ tiêu đề</span>
                </button>
              </div>
              <div className="flex items-center rounded-xl border border-gray-300 bg-gray-50 overflow-hidden focus-within:ring-2 focus-within:ring-[#D71920]">
                <span className="px-3 text-xs text-gray-500 border-r border-gray-200 bg-gray-100/70 font-mono py-2.5">
                  /bai-viet/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="duong-dan-tinh-bai-viet"
                  className="flex-1 px-3 py-2.5 text-xs text-gray-900 bg-white font-mono focus:outline-none"
                />
              </div>
            </div>

            {/* TÓM TẮT SAPO */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Tóm tắt Sapo dẫn dắt <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={sapo}
                onChange={(e) => setSapo(e.target.value)}
                placeholder="Nhập phần tóm tắt ngắn gọn 2 - 3 câu chứa đựng thông điệp cốt lõi của bài viết..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#D71920] transition-all"
              />
            </div>

            {/* NỘI DUNG CHI TIẾT TIPTAP EDITOR */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Nội dung chi tiết bài viết <span className="text-red-500">*</span>
              </label>
              <div className="rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
                <TipTapEditor content={contentHtml} onChange={setContentHtml} />
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI (4 COLS): CÀI ĐẶT NGÀY GIỜ ĐĂNG & THUỘC TÍNH */}
        <aside className="lg:col-span-4 space-y-6">
          {/* KHỐI 1: CÀI ĐẶT NGÀY & GIỜ ĐĂNG BÀI (YÊU CẦU TRỌNG TÂM) */}
          <div className="bg-white p-5 rounded-2xl border-2 border-red-100 shadow-xs space-y-4 relative overflow-hidden">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Calendar className="w-4 h-4 text-[#D71920]" />
              <h3 className="font-black text-xs uppercase tracking-wider text-[#172033]">
                Cài Đặt Ngày & Giờ Đăng Bài
              </h3>
            </div>

            {/* Ô CHỌN DATETIME-LOCAL */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Thời gian xuất bản:
              </label>
              <input
                type="datetime-local"
                value={publishedAtLocal}
                onChange={(e) => setPublishedAtLocal(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#D71920]"
              />
              <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed">
                * Bài viết sẽ được sắp xếp và hiển thị trên Trang chủ & Chuyên mục tương ứng với mốc thời gian này.
              </p>
            </div>

            {/* CÁC NÚT ĐẶT NHANH MỐC THỜI GIAN */}
            <div className="space-y-1.5 pt-1 border-t border-gray-100">
              <span className="text-[11px] font-bold text-gray-500 block mb-1">
                Thiết lập nhanh:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={handleSetTimeToNow}
                  className="px-2.5 py-1.5 bg-gray-50 hover:bg-red-50 hover:text-[#D71920] border border-gray-200 rounded-lg text-[11px] font-bold text-gray-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Clock className="w-3 h-3 text-[#D71920]" />
                  <span>Bây giờ</span>
                </button>

                <button
                  type="button"
                  onClick={handleSetTimePlus1Hour}
                  className="px-2.5 py-1.5 bg-gray-50 hover:bg-red-50 hover:text-[#D71920] border border-gray-200 rounded-lg text-[11px] font-bold text-gray-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>+1 Giờ nữa</span>
                </button>

                <button
                  type="button"
                  onClick={handleSetTimeToTomorrowMorning}
                  className="col-span-2 px-2.5 py-1.5 bg-gray-50 hover:bg-red-50 hover:text-[#D71920] border border-gray-200 rounded-lg text-[11px] font-bold text-gray-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>📅 Sáng mai (08:00 AM)</span>
                </button>
              </div>
            </div>
          </div>

          {/* KHỐI 2: CHUYÊN MỤC & TRẠNG THÁI */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
            <h3 className="font-black text-xs uppercase tracking-wider text-gray-700 border-b border-gray-100 pb-2">
              Chuyên Mục & Trạng Thái
            </h3>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Chuyên mục hiển thị <span className="text-red-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#D71920]"
              >
                {MOCK_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Trạng thái xuất bản
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ArticleStatus)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-black text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#D71920]"
              >
                <option value="draft">Bản nháp (Draft)</option>
                <option value="pending_review">Chờ duyệt (Pending Review)</option>
                <option value="published">Xuất bản công khai (Published)</option>
              </select>
            </div>
          </div>

          {/* KHỐI 3: ẢNH ĐẠI DIỆN BÀI VIẾT */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
            <h3 className="font-black text-xs uppercase tracking-wider text-gray-700 border-b border-gray-100 pb-2 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-gray-500" />
              <span>Ảnh Đại Diện (Thumbnail)</span>
            </h3>

            {imageUrl ? (
              <div className="relative aspect-16/9 rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                <img
                  src={imageUrl}
                  alt={title || 'Thumbnail'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800';
                  }}
                />
              </div>
            ) : (
              <div className="aspect-16/9 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                Chưa có ảnh đại diện
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsCoverModalOpen(true)}
              className="w-full py-2.5 px-3 bg-red-50 hover:bg-red-100 text-[#D71920] border border-red-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>🎨 Tự Tạo Ảnh Bìa AI / Poster Đồ Họa</span>
            </button>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">
                Link URL ảnh:
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#D71920]"
              />
            </div>
          </div>

          {/* KHỐI 4: TÙY CHỌN NỔI BẬT */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
            <h3 className="font-black text-xs uppercase tracking-wider text-gray-700 border-b border-gray-100 pb-2">
              Vị Trí & Đánh Dấu Đặc Biệt
            </h3>

            <label className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
              />
              <div>
                <div className="text-xs font-bold text-gray-800 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Tin tiêu điểm (Hero Featured)</span>
                </div>
                <div className="text-[10px] text-gray-400">Hiển thị ở khối tiêu điểm lớn nhất trang chủ</div>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={isBreaking}
                onChange={(e) => setIsBreaking(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
              />
              <div>
                <div className="text-xs font-bold text-gray-800 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-red-600 fill-red-600" />
                  <span>Tin nóng khẩn cấp (Breaking News)</span>
                </div>
                <div className="text-[10px] text-gray-400">Bật huy hiệu tin khẩn cấp màu đỏ nổi bật</div>
              </div>
            </label>
          </div>
        </aside>
      </div>
      {/* Auto Cover Generator Modal */}
      <AutoCoverModal
        isOpen={isCoverModalOpen}
        onClose={() => setIsCoverModalOpen(false)}
        articleTitle={title}
        categoryName={MOCK_CATEGORIES.find(c => c.id === categoryId)?.name || 'Thời sự'}
        categorySlug={MOCK_CATEGORIES.find(c => c.id === categoryId)?.slug || 'thoi-su'}
        onSelectImage={(url) => {
          setImageUrl(url);
          showToast('Đã áp dụng ảnh bìa mới cho bài viết!');
        }}
      />
    </div>
  );
}

export default function EditArticlePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400 text-xs">Đang tải trình biên tập bài viết...</div>}>
      <EditArticleInner />
    </Suspense>
  );
}
