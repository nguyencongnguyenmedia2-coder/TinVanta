'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Sparkles, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  RefreshCw, 
  Flame, 
  Settings, 
  BookOpen, 
  FileText, 
  Eye, 
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Article } from '@/types/database';

const CATEGORIES_LIST = [
  { slug: 'random', name: '🎲 Ngẫu nhiên xoay tua 10 chuyên mục (Khuyến nghị)' },
  { slug: 'thoi-su', name: 'Thời sự' },
  { slug: 'kinh-te', name: 'Kinh tế' },
  { slug: 'cong-nghe', name: 'Công nghệ' },
  { slug: 'xa-hoi', name: 'Xã hội' },
  { slug: 'phap-luat', name: 'Pháp luật' },
  { slug: 'giao-duc', name: 'Giáo dục' },
  { slug: 'suc-khoe', name: 'Sức khỏe' },
  { slug: 'the-thao', name: 'Thể thao' },
  { slug: 'giai-tri', name: 'Giải trí' },
  { slug: 'xe', name: 'Xe & Đời sống' },
];

export default function AutoPublishAdminPage() {
  const [activeTab, setActiveTab] = useState<'generate' | 'schedule' | 'history'>('generate');
  const [selectedCategory, setSelectedCategory] = useState('random');
  const [customTopic, setCustomTopic] = useState('');
  const [statusMode, setStatusMode] = useState<'published' | 'pending_review'>('published');
  const [isBreaking, setIsBreaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [lastGeneratedArticle, setLastGeneratedArticle] = useState<Article | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Schedule settings
  const [autoScheduleActive, setAutoScheduleActive] = useState(true);
  const [frequency, setFrequency] = useState('every_2_hours');

  // Trigger Instant Generation
  const handleGenerateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    setLastGeneratedArticle(null);

    setLoadingStep('🔍 Đang phân tích xu hướng và thu thập thông tin mới nhất...');

    try {
      setTimeout(() => {
        setLoadingStep('✍️ AI đang soạn thảo bài báo chuẩn SEO, xây dựng dẫn chứng và lập dàn ý...');
      }, 700);

      setTimeout(() => {
        setLoadingStep('🖼️ Đang tối ưu hình ảnh báo chí độ phân giải cao và gán siêu dữ liệu...');
      }, 1400);

      const res = await fetch('/api/ai/auto-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categorySlug: selectedCategory,
          customTopic: customTopic.trim() || undefined,
          status: statusMode,
          isBreaking,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Có lỗi xảy ra khi tạo bài viết');
      }

      setLastGeneratedArticle(data.article);
      setSuccessMessage(data.message || 'Bài viết đã được tạo và xuất bản thành công!');
      setCustomTopic('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi gọi API tạo bài';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* 1. HERO HEADER */}
      <div className="bg-gradient-to-r from-[#172033] via-[#24304c] to-[#172033] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden border border-gray-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-red-300 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>TinVanta AI Editorial Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Tự Động Hóa Viết Bài & Săn Tin Tức 24/7
            </h1>
            <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
              Hệ thống tự động theo dõi xu hướng, soạn thảo bài báo chuyên nghiệp 800 - 1.200 chữ, tối ưu SEO, gắn ảnh bản quyền và tự động xuất bản đa chủ đề mỗi ngày.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 px-4 py-2.5 rounded-xl text-center">
              <p className="text-[11px] text-gray-300 uppercase tracking-wider font-semibold">Trạng thái Bot</p>
              <div className="flex items-center gap-1.5 justify-center mt-0.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-xs text-white">Sẵn sàng 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab('generate')}
          className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors ${
            activeTab === 'generate'
              ? 'border-[#D71920] text-[#D71920]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>⚡ Tạo & Đăng Bài Ngay</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('schedule')}
          className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors ${
            activeTab === 'schedule'
              ? 'border-[#D71920] text-[#D71920]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>⏰ Lịch Trình Tự Động Mỗi Ngày</span>
        </button>
      </div>

      {/* 3. TAB 1: INSTANT GENERATOR */}
      {activeTab === 'generate' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: FORM CẤU HÌNH TẠO BÀI (7 COLS) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <FileText className="w-4 h-4 text-[#D71920]" />
              <h2 className="font-bold text-sm text-[#172033] uppercase tracking-wider">
                Thiết Lập Viết Bài Nhanh
              </h2>
            </div>

            <form onSubmit={handleGenerateArticle} className="space-y-5">
              {/* Chuyên mục */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  1. Chọn chuyên mục bài viết
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {CATEGORIES_LIST.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-500 mt-1">
                  Nếu chọn ngẫu nhiên, AI sẽ tự động xoay tua để đảm bảo các chuyên mục đều có bài mới liên tục.
                </p>
              </div>

              {/* Từ khóa / Chủ đề gợi ý */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  2. Chủ đề hoặc từ khóa gợi ý (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="Ví dụ: Đột phá công nghệ bán dẫn, Thị trường bất động sản quý 4, Xe điện..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Để trống ô này nếu bạn muốn AI tự động săn tin nóng và sự kiện nổi bật nhất trong ngày.
                </p>
              </div>

              {/* Trạng thái bài viết & Tin nóng */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    3. Trạng thái sau khi tạo
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs text-gray-800 cursor-pointer">
                      <input
                        type="radio"
                        name="statusMode"
                        checked={statusMode === 'published'}
                        onChange={() => setStatusMode('published')}
                        className="text-[#D71920] focus:ring-red-500"
                      />
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Xuất bản ngay lên trang chủ
                      </span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-gray-800 cursor-pointer">
                      <input
                        type="radio"
                        name="statusMode"
                        checked={statusMode === 'pending_review'}
                        onChange={() => setStatusMode('pending_review')}
                        className="text-[#D71920] focus:ring-red-500"
                      />
                      <span>Lưu chờ biên tập viên duyệt</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    4. Đánh dấu đặc biệt
                  </label>
                  <label className="flex items-center gap-2 text-xs text-gray-800 cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={isBreaking}
                      onChange={(e) => setIsBreaking(e.target.checked)}
                      className="rounded text-[#D71920] focus:ring-red-500"
                    />
                    <span className="font-semibold text-red-700 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 fill-red-600 text-red-600" />
                      Gắn huy hiệu Tin Nóng (Breaking News)
                    </span>
                  </label>
                </div>
              </div>

              {/* Nút hành động Submit */}
              <div className="pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-md transition-all ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#D71920] to-red-600 hover:from-red-600 hover:to-red-700 hover:shadow-lg active:scale-98'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang tạo bài viết chuyên sâu...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>⚡ Bắt Đầu Tạo & Xuất Bản Ngay (1-Click)</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Loading Steps Live Indicator */}
            {isLoading && (
              <div className="p-4 bg-red-50/70 border border-red-200 rounded-xl space-y-2 animate-pulse">
                <div className="flex items-center gap-2 text-xs font-bold text-[#D71920]">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Tiến trình xử lý của AI:</span>
                </div>
                <p className="text-xs text-gray-700 font-medium">
                  {loadingStep}
                </p>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* RIGHT: KẾT QUẢ PREVIEW BÀI VIẾT (5 COLS) */}
          <div className="lg:col-span-5 space-y-6">
            {lastGeneratedArticle ? (
              <div className="bg-white rounded-2xl border-2 border-emerald-500/30 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Bài viết đã tạo thành công</span>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                    {lastGeneratedArticle.status === 'published' ? 'Đã xuất bản' : 'Chờ duyệt'}
                  </span>
                </div>

                {/* Thumbnail Image */}
                {lastGeneratedArticle.featured_image && (
                  <div className="relative aspect-16/9 w-full rounded-xl overflow-hidden bg-gray-100">
                    <Image
                      src={lastGeneratedArticle.featured_image.public_url}
                      alt={lastGeneratedArticle.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-[#D71920] text-white font-bold text-[10px] px-2 py-0.5 rounded uppercase">
                      {lastGeneratedArticle.category?.name}
                    </div>
                  </div>
                )}

                {/* Article Info */}
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-[#172033] leading-snug">
                    {lastGeneratedArticle.title}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                    {lastGeneratedArticle.sapo}
                  </p>
                </div>

                {/* Action Links */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                  <Link
                    href={`/bai-viet/${lastGeneratedArticle.slug}`}
                    target="_blank"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#D71920] hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-2xs"
                  >
                    <span>Xem bài trên website</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href={`/admin/bai-viet`}
                    className="flex items-center justify-center gap-1 py-2 px-3 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs transition-colors"
                  >
                    <span>Vào CMS</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50/70 border border-dashed border-gray-300 rounded-2xl p-8 text-center text-gray-500 space-y-3">
                <div className="w-12 h-12 rounded-full bg-red-50 text-[#D71920] flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-gray-800">Chưa có bài viết nào được tạo trong phiên này</h4>
                <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
                  Hãy chọn chuyên mục và bấm nút <strong className="text-[#D71920]">"⚡ Bắt Đầu Tạo & Xuất Bản Ngay"</strong> bên trái để xem kết quả trực tiếp tại đây.
                </p>
              </div>
            )}

            {/* Thông tin hỗ trợ & Chuẩn báo chí */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-3 text-xs text-gray-600">
              <div className="flex items-center gap-2 font-bold text-gray-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Quy chuẩn biên tập tự động</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-gray-500">
                <li>&bull; Độ dài tiêu chuẩn từ 800 - 1.200 chữ với cấu trúc 3 phần rõ ràng.</li>
                <li>&bull; Đoạn sapo đúc kết và trích dẫn chuyên gia trong thẻ blockquote.</li>
                <li>&bull; Tự động tối ưu ảnh HD, tạo thẻ hashtags và gắn link bài đọc tiếp theo.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 2: SCHEDULE SETTINGS */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-[#172033]">Cấu Hình Lịch Trình Tự Động Đăng Bài Hàng Ngày</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Thiết lập tần suất và thời gian AI tự động quét tin tức, tạo bài và xuất bản đều đặn.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${autoScheduleActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                {autoScheduleActive ? 'Đang bật' : 'Đang tắt'}
              </span>
              <button
                type="button"
                onClick={() => setAutoScheduleActive(!autoScheduleActive)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  autoScheduleActive ? 'bg-emerald-500' : 'bg-gray-300'
                }`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  autoScheduleActive ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Tần suất xuất bản tự động
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="every_2_hours">Mỗi 2 giờ (Khoảng 12 bài viết / ngày)</option>
                <option value="every_4_hours">Mỗi 4 giờ (Khoảng 6 bài viết / ngày)</option>
                <option value="every_6_hours">Mỗi 6 giờ (Khoảng 4 bài viết / ngày)</option>
                <option value="golden_hours">Khung giờ vàng (06:30, 11:30, 18:30, 20:30)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Chuyên mục tự động luân phiên
              </label>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600 font-medium">
                ✅ Toàn bộ 10 chuyên mục (Thời sự, Kinh tế, Công nghệ, Xã hội, Pháp luật, Giáo dục, Sức khỏe, Thể thao, Giải trí, Xe)
              </div>
            </div>
          </div>

          {/* Vercel Cron Integration Box */}
          <div className="p-5 bg-gradient-to-br from-gray-50 to-red-50/30 rounded-2xl border border-gray-200 space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-gray-900">
              <Zap className="w-4 h-4 text-[#D71920]" />
              <span>Cấu hình Cron Job trên Vercel / Cloud Server</span>
            </div>
            <p className="text-gray-600 leading-relaxed text-[11px]">
              Dự án đã tích hợp sẵn API Endpoint Cron tự động. Bạn có thể gọi API này định kỳ từ Vercel Cron hoặc bất kỳ dịch vụ hẹn giờ nào:
            </p>
            <div className="bg-white p-3 rounded-lg border border-gray-200 font-mono text-[11px] text-gray-800 break-all select-all">
              GET /api/cron/auto-generate
            </div>
            <p className="text-[10px] text-gray-400">
              * Header xác thực: <code className="bg-gray-100 px-1 py-0.5 rounded">Authorization: Bearer CRON_SECRET</code>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
