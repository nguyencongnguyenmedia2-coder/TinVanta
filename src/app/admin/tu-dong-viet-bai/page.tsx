'use client';

import React, { useState, useEffect } from 'react';
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
  Globe, 
  Layers, 
  ArrowRight, 
  Zap, 
  FileText, 
  Sliders, 
  Check, 
  Compass, 
  Radio, 
  History, 
  Link as LinkIcon, 
  Bot, 
  Newspaper 
} from 'lucide-react';
import { Article } from '@/types/database';

interface CrawlHistoryItem {
  sourceUrl: string;
  sourceDomain: string;
  originalTitle: string;
  articleId: string;
  articleSlug: string;
  articleTitle: string;
  categorySlug: string;
  wordCount: number;
  aiProvider: string;
  crawledAt: string;
}

const NEWS_SOURCES_UI = [
  { id: 'all', name: '🌐 Tất cả các báo lớn (Tự động săn tin nóng)', domain: 'Đa nguồn' },
  { id: 'vnexpress', name: 'VnExpress (Báo tiếng Việt nhiều người xem nhất)', domain: 'vnexpress.net' },
  { id: 'dantri', name: 'Dân Trí (Tin tức xã hội & dân sinh hàng đầu)', domain: 'dantri.com.vn' },
  { id: 'tuoitre', name: 'Tuổi Trẻ Online (Thời sự & điều tra)', domain: 'tuoitre.vn' },
  { id: 'thanhnien', name: 'Thanh Niên (Tin tức đời sống & công nghệ)', domain: 'thanhnien.vn' },
  { id: 'vietnamnet', name: 'VietnamNet (Chính sách & kinh tế)', domain: 'vietnamnet.vn' },
];

const CATEGORIES_LIST = [
  { slug: 'all', name: '🎲 Mọi chuyên mục (Tự động theo tin nóng)' },
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
  const [activeTab, setActiveTab] = useState<'crawler' | 'schedule' | 'history'>('crawler');
  
  // Crawler options
  const [crawlMode, setCrawlMode] = useState<'auto_scan' | 'custom_url'>('auto_scan');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [customArticleUrl, setCustomArticleUrl] = useState('');
  const [aiProvider, setAiProvider] = useState<'auto' | 'pollinations_free' | 'gemini_free' | 'smart_synthesizer'>('auto');
  const [statusMode, setStatusMode] = useState<'published' | 'pending_review'>('published');
  const [isBreaking, setIsBreaking] = useState(false);

  // Execution state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [lastGeneratedArticle, setLastGeneratedArticle] = useState<Article | null>(null);
  const [lastSourceInfo, setLastSourceInfo] = useState<{ originalUrl: string; originalTitle: string; sourceName: string } | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // History state
  const [historyList, setHistoryList] = useState<CrawlHistoryItem[]>([]);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);

  // Fetch crawl history
  const loadHistory = async () => {
    setIsFetchingHistory(true);
    try {
      const res = await fetch('/api/ai/crawler-status');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.history)) {
          setHistoryList(data.history);
        }
      }
    } catch {
      // Ignored
    } finally {
      setIsFetchingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Handle Trigger Crawl & Rewrite
  const handleCrawlAndRewrite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    setLastGeneratedArticle(null);
    setLastSourceInfo(null);

    setLoadingStep('📡 Đang kết nối tới máy chủ báo chí và quét luồng tin tức mới nhất...');

    try {
      const stepTimer1 = setTimeout(() => {
        setLoadingStep('📰 Đang bóc tách bài viết gốc, lọc nội dung và trích xuất hình ảnh...');
      }, 1200);

      const stepTimer2 = setTimeout(() => {
        setLoadingStep('🤖 AI miễn phí đang phân tích sự kiện và viết lại 100% bài báo mới độc quyền...');
      }, 2800);

      const stepTimer3 = setTimeout(() => {
        setLoadingStep('✨ Đang tối ưu hóa chuẩn SEO, tạo điểm tin cốt lõi và xuất bản lên TinVanta...');
      }, 4500);

      const res = await fetch('/api/ai/crawl-and-rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customUrl: crawlMode === 'custom_url' ? customArticleUrl.trim() : undefined,
          sourceId: selectedSource,
          categorySlug: selectedCategory,
          status: statusMode,
          aiProvider,
          isBreaking,
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Có lỗi xảy ra khi cào tin và viết lại bài');
      }

      setLastGeneratedArticle(data.article);
      setLastSourceInfo(data.sourceInfo);
      setSuccessMessage(data.message || 'Bài viết đã được cào, viết lại và xuất bản thành công!');
      if (crawlMode === 'custom_url') {
        setCustomArticleUrl('');
      }

      // Tải lại lịch sử
      loadHistory();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi gọi API cào tin';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* 1. HERO HEADER */}
      <div className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden border border-slate-700">
        <div className="absolute right-0 top-0 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              <span>AI Miễn Phí 100% — Tự Động Cào Tin & Đăng Báo 24/7</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Tự Động Cào Báo Chí & Viết Lại Bài Viết Hàng Ngày
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Hệ thống tự động cào tin tức nóng hổi từ các trang báo lớn (<strong>VnExpress, Dân Trí, Tuổi Trẻ, Thanh Niên, VietnamNet</strong>), AI miễn phí viết lại hoàn toàn thành bài báo độc quyền cho TinVanta và tự động xuất bản trực tiếp lên trang chủ.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 px-4 py-3 rounded-xl text-center">
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Công nghệ AI</p>
              <div className="flex items-center gap-1.5 justify-center mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-xs text-white">Pollinations & Gemini Free</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab('crawler')}
          className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors ${
            activeTab === 'crawler'
              ? 'border-[#D71920] text-[#D71920]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>🌐 Cào Tin & Viết Lại Ngay</span>
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
          <span>⏰ Lịch Tự Động Hàng Ngày (Cron)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('history');
            loadHistory();
          }}
          className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-[#D71920] text-[#D71920]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <History className="w-4 h-4" />
          <span>📜 Lịch Sử Đã Cào ({historyList.length})</span>
        </button>
      </div>

      {/* 3. NOTIFICATIONS */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-900 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm font-medium">
            <p className="font-bold text-emerald-950 mb-0.5">Xuất bản thành công!</p>
            <p className="text-emerald-800 m-0">{successMessage}</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-900 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm font-medium">
            <p className="font-bold text-red-950 mb-0.5">Không thể xử lý</p>
            <p className="text-red-800 m-0">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* 4. TAB 1: CÀO TIN TỨC & VIẾT LẠI */}
      {activeTab === 'crawler' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* CỘT TRÁI: FORM CẤU HÌNH & KÍCH HOẠT */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleCrawlAndRewrite} className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 space-y-6">
              {/* CHỌN CHẾ ĐỘ CÀO */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">
                  Chế độ săn tin tức
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCrawlMode('auto_scan')}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                      crawlMode === 'auto_scan'
                        ? 'border-red-500 bg-red-50/50 text-red-950 ring-1 ring-red-500'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <Radio className={`w-4 h-4 mt-0.5 ${crawlMode === 'auto_scan' ? 'text-red-600' : 'text-gray-400'}`} />
                    <div>
                      <div className="font-bold text-sm">Quét tự động tin nóng từ báo</div>
                      <div className="text-xs text-gray-500 mt-0.5">Tự động săn tin mới nhất từ VnExpress, Dân Trí, Tuổi Trẻ...</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCrawlMode('custom_url')}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                      crawlMode === 'custom_url'
                        ? 'border-red-500 bg-red-50/50 text-red-950 ring-1 ring-red-500'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <LinkIcon className={`w-4 h-4 mt-0.5 ${crawlMode === 'custom_url' ? 'text-red-600' : 'text-gray-400'}`} />
                    <div>
                      <div className="font-bold text-sm">Dán link bài báo bất kỳ</div>
                      <div className="text-xs text-gray-500 mt-0.5">AI tự cào toàn bộ nội dung từ đường link bạn cung cấp</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* CHẾ ĐỘ 1: CHỌN NGUỒN BÁO & CHUYÊN MỤC */}
              {crawlMode === 'auto_scan' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Nguồn báo chí cần cào:
                    </label>
                    <select
                      value={selectedSource}
                      onChange={(e) => setSelectedSource(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-medium focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      {NEWS_SOURCES_UI.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Chuyên mục quan tâm:
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-medium focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      {CATEGORIES_LIST.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                /* CHẾ ĐỘ 2: NHẬP URL BÀI BÁO */
                <div className="pt-2 border-t border-gray-100">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Đường dẫn bài báo cần viết lại (URL):
                  </label>
                  <input
                    type="url"
                    required={crawlMode === 'custom_url'}
                    value={customArticleUrl}
                    onChange={(e) => setCustomArticleUrl(e.target.value)}
                    placeholder="Ví dụ: https://vnexpress.net/thoi-su/bai-viet-mau-123456.html"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Hỗ trợ các trang tin lớn như VnExpress, Dân Trí, Tuổi Trẻ, Thanh Niên, VietnamNet, VietNamPlus...
                  </p>
                </div>
              )}

              {/* CHỌN CÔNG NGHỆ AI MIỄN PHÍ */}
              <div className="pt-2 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Động cơ AI viết bài (Hoàn toàn Miễn phí)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="ai_engine"
                      value="auto"
                      checked={aiProvider === 'auto'}
                      onChange={() => setAiProvider('auto')}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <div>
                      <span className="font-bold text-xs text-gray-900 block">🤖 Tự động chọn tầng AI tối ưu (Khuyến nghị)</span>
                      <span className="text-[11px] text-gray-500 block">Gemini Free ➔ Pollinations Free ➔ Báo chí thông minh</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="ai_engine"
                      value="pollinations_free"
                      checked={aiProvider === 'pollinations_free'}
                      onChange={() => setAiProvider('pollinations_free')}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <div>
                      <span className="font-bold text-xs text-emerald-700 block">🟢 Pollinations AI (Miễn phí 100% không cần Key)</span>
                      <span className="text-[11px] text-gray-500 block">Dùng ngay lập tức, không tốn phí, không cần đăng ký</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* TÙY CHỌN TRẠNG THÁI VÀ GẮN NHÃN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Hành động sau khi AI viết xong:
                  </label>
                  <select
                    value={statusMode}
                    onChange={(e) => setStatusMode(e.target.value as 'published' | 'pending_review')}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium focus:ring-2 focus:ring-red-500"
                  >
                    <option value="published">🚀 Tự động đăng ngay lên trang website</option>
                    <option value="pending_review">📝 Lưu vào bản nháp để duyệt trước</option>
                  </select>
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isBreaking}
                      onChange={(e) => setIsBreaking(e.target.checked)}
                      className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                    />
                    <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-red-600 fill-red-600" />
                      Gắn nhãn Tin Nóng / Tiêu Điểm
                    </span>
                  </label>
                </div>
              </div>

              {/* NÚT THỰC THI */}
              <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-gray-500">
                  <span className="font-semibold text-gray-700">Cơ chế chống trùng lặp:</span> Hệ thống tự động bỏ qua những bài báo đã cào trong quá khứ.
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#D71920] to-[#b3141a] hover:from-[#b3141a] hover:to-[#901015] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang săn tin & viết lại...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Cào Tin Tức & Tự Động Đăng Ngay</span>
                    </>
                  )}
                </button>
              </div>

              {/* PROGRESS BAR KHI ĐANG CÀO */}
              {isLoading && (
                <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>{loadingStep}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-red-500 to-emerald-400 h-full w-full animate-pulse" />
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* CỘT PHẢI: KẾT QUẢ VỪA XUẤT BẢN */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5">
              <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-red-600" />
                <span>Bài viết vừa cào & xuất bản</span>
              </h3>

              {lastGeneratedArticle ? (
                <div className="space-y-4">
                  {lastGeneratedArticle.featured_image?.public_url && (
                    <div className="relative w-full h-44 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={lastGeneratedArticle.featured_image.public_url}
                        alt={lastGeneratedArticle.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 text-white text-[10px] font-bold">
                        {lastGeneratedArticle.category?.name || 'Tin mới'}
                      </span>
                    </div>
                  )}

                  {lastSourceInfo && (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs space-y-1">
                      <p className="font-bold text-gray-600 m-0">Nguồn bài báo gốc:</p>
                      <p className="text-gray-800 italic line-clamp-2 m-0">&quot;{lastSourceInfo.originalTitle}&quot;</p>
                      <a
                        href={lastSourceInfo.originalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center gap-1 mt-1 font-semibold"
                      >
                        <span>Xem bài gốc trên {lastSourceInfo.sourceName}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wide">
                      Tiêu đề mới độc quyền (TinVanta):
                    </span>
                    <h4 className="font-bold text-base text-gray-900 line-clamp-3 leading-snug">
                      {lastGeneratedArticle.title}
                    </h4>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                    {lastGeneratedArticle.sapo}
                  </p>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span>Độ dài: ~{lastGeneratedArticle.reading_time_minutes * 220} từ</span>
                    <span>Đọc: {lastGeneratedArticle.reading_time_minutes} phút</span>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <Link
                      href={`/bai-viet/${lastGeneratedArticle.slug}`}
                      target="_blank"
                      className="w-full py-2.5 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs text-center flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <span>Xem bài viết trên Website</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      href="/"
                      target="_blank"
                      className="w-full py-2 px-3 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs text-center"
                    >
                      Kiểm tra hiển thị trên Trang Chủ
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 px-4 text-gray-400">
                  <Bot className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-xs leading-relaxed">
                    Chưa có bài viết nào được tạo trong phiên này. Hãy nhấn nút <strong>&quot;Cào Tin Tức & Tự Động Đăng Ngay&quot;</strong> để trải nghiệm AI tự động viết bài.
                  </p>
                </div>
              )}
            </div>

            {/* THÔNG TIN NGUỒN CÀO */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs space-y-2 text-slate-700">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Newspaper className="w-4 h-4 text-blue-600" />
                <span>Nguồn báo chí tự động cập nhật:</span>
              </h4>
              <ul className="space-y-1.5 list-disc pl-4 text-slate-600">
                <li><strong>VnExpress:</strong> Thời sự, Kinh doanh, Công nghệ, Xe...</li>
                <li><strong>Dân Trí:</strong> Xã hội, Kinh tế, Sức mạnh số, Giáo dục...</li>
                <li><strong>Tuổi Trẻ:</strong> Tin mới nhất, Pháp luật, Đời sống...</li>
                <li><strong>Thanh Niên:</strong> Thời sự, Game/Tech, Thể thao...</li>
                <li><strong>VietnamNet:</strong> Chính sách, Đổi mới sáng tạo...</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 2: LỊCH TỰ ĐỘNG HÀNG NGÀY (CRON) */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 space-y-6">
          <div className="max-w-3xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-600" />
              <span>Cơ chế Tự Động Hóa 24/7 (Đăng bài không cần mở máy)</span>
            </h3>

            <p className="text-sm text-gray-600 leading-relaxed">
              Bạn có thể lên lịch để robot AI tự động cào tin mới từ các báo mỗi ngày (hoặc mỗi giờ một bài) và đăng tải tự động lên website TinVanta mà không cần người quản trị phải can thiệp thủ công.
            </p>

            <div className="p-4 bg-slate-900 text-slate-200 rounded-xl space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
                <span>Webhook Endpoint Cron:</span>
                <span className="text-emerald-400">GET Method</span>
              </div>
              <div className="p-2 bg-slate-950 rounded select-all text-emerald-300 break-all">
                https://tinvanta.vn/api/cron/crawl-and-publish
              </div>
              <p className="text-[11px] text-slate-400 m-0">
                * Kèm Header xác thực: <code className="text-amber-300">Authorization: Bearer mock-cron-secret</code>
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-sm text-gray-800">Các cách triển khai chạy tự động hàng ngày:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/50 space-y-1">
                  <span className="font-bold text-gray-900 block">1. Dùng Cron-job.org (Miễn phí 100%)</span>
                  <p className="text-gray-600 m-0 leading-relaxed">
                    Tạo tài khoản miễn phí tại cron-job.org, điền URL Webhook ở trên, đặt lịch 1 tiếng/lần hoặc mỗi sáng lúc 7:00 AM.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/50 space-y-1">
                  <span className="font-bold text-gray-900 block">2. Dùng Vercel Cron Jobs</span>
                  <p className="text-gray-600 m-0 leading-relaxed">
                    Nếu deploy trên Vercel, định cấu hình file <code className="text-red-600">vercel.json</code> với path <code className="text-red-600">/api/cron/crawl-and-publish</code> để kích hoạt tự động theo cron chuẩn.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={async () => {
                  setIsLoading(true);
                  setErrorMessage('');
                  setSuccessMessage('');
                  try {
                    const res = await fetch('/api/cron/crawl-and-publish');
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || 'Lỗi khi kích hoạt cron');
                    setSuccessMessage(`Cron kích hoạt thành công! Đã cào từ báo "${data.source_newspaper}" và đăng bài: "${data.published_article.title}"`);
                    loadHistory();
                  } catch (err: unknown) {
                    const msg = err instanceof Error ? err.message : 'Lỗi gọi cron';
                    setErrorMessage(msg);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Chạy thử Cron Cào Tin ngay bây giờ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 3: LỊCH SỬ ĐÃ CÀO */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-base text-gray-900">Danh sách các bài viết đã cào & xuất bản</h3>
              <p className="text-xs text-gray-500">Toàn bộ bài báo được AI cào và viết lại độc quyền lưu trữ tại đây</p>
            </div>
            <button
              type="button"
              onClick={loadHistory}
              disabled={isFetchingHistory}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetchingHistory ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </button>
          </div>

          {historyList.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              Chưa có lịch sử bài viết nào. Hãy thực hiện cào bài đầu tiên ở Tab <strong>&quot;Cào Tin & Viết Lại Ngay&quot;</strong>.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-3">Thời gian</th>
                    <th className="py-3 px-3">Nguồn báo gốc</th>
                    <th className="py-3 px-3">Bài viết mới độc quyền</th>
                    <th className="py-3 px-3">Chuyên mục</th>
                    <th className="py-3 px-3">Số từ</th>
                    <th className="py-3 px-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {historyList.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-3 whitespace-nowrap text-gray-500">
                        {new Date(item.crawledAt).toLocaleDateString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-gray-800 block">{item.sourceDomain}</span>
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-blue-600 hover:underline line-clamp-1 inline-flex items-center gap-1"
                        >
                          <span>{item.originalTitle || item.sourceUrl}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      </td>
                      <td className="py-3 px-3 font-semibold text-gray-900 max-w-xs">
                        <span className="line-clamp-2">{item.articleTitle}</span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
                          {item.categorySlug}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-gray-600">
                        {item.wordCount} từ
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <Link
                          href={`/bai-viet/${item.articleSlug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 font-bold text-[11px]"
                        >
                          <span>Xem bài</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
