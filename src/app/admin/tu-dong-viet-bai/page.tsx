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
  FileText, 
  Radio, 
  History, 
  Link as LinkIcon, 
  Bot, 
  Newspaper,
  Calendar,
  Layers,
  Edit3,
  Check,
  Zap,
  Save,
  SlidersHorizontal,
  Image as ImageIcon,
  Wand2
} from 'lucide-react';
import { Article } from '@/types/database';
import { AutoCoverModal } from '@/components/admin/AutoCoverModal';

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
  
  // Hành động sau khi AI viết xong: Đăng tự động hoặc Đăng thủ công khi admin bấm đăng
  const [statusMode, setStatusMode] = useState<'published' | 'pending_review'>('published');
  
  // Cho phép cào nhiều bài (Batch count: 1, 3, 5, 10 bài)
  const [batchCount, setBatchCount] = useState<number>(1);
  
  // Cho phép admin chỉnh sửa ngày đăng hoặc giờ đăng
  const [useCustomDate, setUseCustomDate] = useState(false);
  const [customDateTime, setCustomDateTime] = useState('');
  
  const [isBreaking, setIsBreaking] = useState(false);

  // Execution state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [generatedArticles, setGeneratedArticles] = useState<Article[]>([]);
  const [lastSourceInfo, setLastSourceInfo] = useState<{ originalUrl: string; originalTitle: string; sourceName: string } | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Editing publish date state per article
  const [editingDateArticleId, setEditingDateArticleId] = useState<string | null>(null);
  const [editDateTimeValue, setEditDateTimeValue] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [coverModalArticle, setCoverModalArticle] = useState<Article | null>(null);

  // History state
  const [historyList, setHistoryList] = useState<CrawlHistoryItem[]>([]);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);

  // Khởi tạo ngày giờ mặc định (định dạng YYYY-MM-DDTHH:mm cho input datetime-local)
  useEffect(() => {
    const now = new Date();
    const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setCustomDateTime(localIso);
  }, []);

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

    setLoadingStep(`📡 Đang kết nối máy chủ báo chí và quét tìm ${batchCount} bản tin mới nhất...`);

    try {
      const timer1 = setTimeout(() => {
        setLoadingStep('📰 Đang bóc tách bài viết gốc, lọc bỏ mã rác và trích xuất ảnh báo chí...');
      }, 1500);

      const timer2 = setTimeout(() => {
        setLoadingStep('🤖 AI miễn phí đang tái cấu trúc và viết lại bài báo độc quyền cho TinVanta...');
      }, 3500);

      const timer3 = setTimeout(() => {
        setLoadingStep('✨ Đang lưu trữ, thiết lập thời gian phát hành và cập nhật hệ thống...');
      }, 5500);

      const payloadCustomTime = useCustomDate && customDateTime
        ? new Date(customDateTime).toISOString()
        : undefined;

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
          batchCount,
          customPublishedAt: payloadCustomTime,
        }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Có lỗi xảy ra khi cào tin và viết lại bài');
      }

      const receivedArticles: Article[] = Array.isArray(data.articles) && data.articles.length > 0
        ? data.articles
        : data.article ? [data.article] : [];

      setGeneratedArticles(receivedArticles);
      setLastSourceInfo(data.sourceInfo);
      setSuccessMessage(data.message || `Đã cào và viết lại thành công ${receivedArticles.length} bài báo!`);

      if (crawlMode === 'custom_url') {
        setCustomArticleUrl('');
      }

      loadHistory();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi gọi API cào tin';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // Hành động: Đăng thủ công khi admin bấm đăng (Chuyển từ pending_review sang published)
  const handlePublishNow = async (articleId: string) => {
    setIsUpdatingStatus(articleId);
    try {
      const res = await fetch('/api/ai/update-article-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          status: 'published',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi khi xuất bản bài viết');
      }

      // Cập nhật trạng thái trong danh sách bài vừa tạo
      if (data.article) {
        setGeneratedArticles(prev => prev.map(art => 
          (art.id === articleId || art.slug === articleId) 
            ? data.article 
            : art
        ));
      } else {
        setGeneratedArticles(prev => prev.map(art => 
          (art.id === articleId || art.slug === articleId) 
            ? { ...art, status: 'published' as const } 
            : art
        ));
      }

      loadHistory();
      setSuccessMessage(`Đã duyệt và đăng bài viết trực tiếp lên trang chủ thành công!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi xuất bản bài viết';
      setErrorMessage(msg);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  // Hành động: Chỉnh sửa ngày đăng hoặc giờ đăng
  const handleSaveCustomDate = async (articleId: string) => {
    if (!editDateTimeValue) return;
    setIsUpdatingStatus(articleId);

    try {
      const newIsoDate = new Date(editDateTimeValue).toISOString();
      const res = await fetch('/api/ai/update-article-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          publishedAt: newIsoDate,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi khi cập nhật thời gian đăng');
      }

      // Cập nhật ngày đăng trong danh sách bài vừa tạo
      setGeneratedArticles(prev => prev.map(art => 
        (art.id === articleId || art.slug === articleId) 
          ? { ...art, published_at: newIsoDate } 
          : art
      ));

      setEditingDateArticleId(null);
      setSuccessMessage(`Đã cập nhật ngày và giờ đăng thành công!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi cập nhật thời gian';
      setErrorMessage(msg);
    } finally {
      setIsUpdatingStatus(null);
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
              <span>AI Miễn Phí 100% — Cào Hàng Loạt & Duyệt Đăng Linh Hoạt</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Tự Động Cào Báo Chí & Tùy Chọn Xuất Bản
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Hệ thống tự động cào tin từ <strong>VnExpress, Dân Trí, Tuổi Trẻ, Thanh Niên...</strong>. Bạn có thể chọn <strong>Đăng tự động</strong> ngay hoặc <strong>Đăng thủ công khi bấm duyệt</strong>, cào <strong>1 hoặc nhiều bài cùng lúc</strong>, và tùy ý <strong>chỉnh sửa ngày/giờ phát hành</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 px-4 py-3 rounded-xl text-center">
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Quyền Quản Trị</p>
              <div className="flex items-center gap-1.5 justify-center mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-xs text-white">Chủ động duyệt & lên lịch</span>
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
          className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors cursor-pointer ${
            activeTab === 'crawler'
              ? 'border-[#D71920] text-[#D71920]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>🌐 Cào Tin & Xuất Bản</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('schedule')}
          className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors cursor-pointer ${
            activeTab === 'schedule'
              ? 'border-[#D71920] text-[#D71920]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>⏰ Lịch Hàng Ngày (Cron Job)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('history');
            loadHistory();
          }}
          className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors cursor-pointer ${
            activeTab === 'history'
              ? 'border-[#D71920] text-[#D71920]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <History className="w-4 h-4" />
          <span>📜 Kho Lịch Sử Đã Cào ({historyList.length})</span>
        </button>
      </div>

      {/* 3. NOTIFICATIONS */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-900 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm font-medium">
            <p className="font-bold text-emerald-950 mb-0.5">Thao tác thành công!</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* CỘT TRÁI: FORM CẤU HÌNH CÀO BÀI */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleCrawlAndRewrite} className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 space-y-6">
              
              {/* CHỌN HÀNH ĐỘNG SAU KHI AI VIẾT XONG */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2.5">
                  1. Hành động sau khi AI viết xong:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStatusMode('published')}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      statusMode === 'published'
                        ? 'border-emerald-500 bg-emerald-50/60 text-emerald-950 ring-2 ring-emerald-500/20'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <Radio className={`w-4 h-4 mt-0.5 shrink-0 ${statusMode === 'published' ? 'text-emerald-600' : 'text-gray-400'}`} />
                    <div>
                      <div className="font-bold text-sm text-emerald-900 flex items-center gap-1.5">
                        <span>🚀 Đăng tự động</span>
                        <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.2 rounded font-bold">Lên web ngay</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Bài viết tự động đăng tải tức thì lên trang chủ và các chuyên mục tương ứng.</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatusMode('pending_review')}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      statusMode === 'pending_review'
                        ? 'border-amber-500 bg-amber-50/60 text-amber-950 ring-2 ring-amber-500/20'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <Radio className={`w-4 h-4 mt-0.5 shrink-0 ${statusMode === 'pending_review' ? 'text-amber-600' : 'text-gray-400'}`} />
                    <div>
                      <div className="font-bold text-sm text-amber-900 flex items-center gap-1.5">
                        <span>📝 Đăng thủ công</span>
                        <span className="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.2 rounded font-bold">Admin duyệt</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Lưu vào bản nháp chờ admin kiểm tra nội dung và chủ động bấm nút đăng.</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* SỐ LƯỢNG BÀI VIẾT CẦN CÀO (BATCH CRAWL) */}
              <div className="pt-2 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  2. Số lượng bài cần cào cùng lúc:
                </label>
                <div className="grid grid-cols-4 gap-2.5">
                  {[1, 3, 5, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      disabled={crawlMode === 'custom_url'}
                      onClick={() => setBatchCount(num)}
                      className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                        crawlMode === 'custom_url'
                          ? 'opacity-40 cursor-not-allowed bg-gray-50 border-gray-200 text-gray-400'
                          : batchCount === num
                            ? 'border-red-600 bg-red-600 text-white shadow-xs'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                      }`}
                    >
                      {num === 1 ? '1 bài (Đơn lẻ)' : `${num} bài (Hàng loạt)`}
                    </button>
                  ))}
                </div>
                {crawlMode === 'custom_url' && (
                  <p className="text-[11px] text-gray-400 mt-1.5 italic">
                    * Chế độ dán link tùy chọn chỉ cào 1 bài theo URL bạn chỉ định.
                  </p>
                )}
              </div>

              {/* TÙY CHỈNH NGÀY & GIỜ ĐĂNG */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    3. Thời gian đăng bài:
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={useCustomDate}
                      onChange={(e) => setUseCustomDate(e.target.checked)}
                      className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                    />
                    <span>Tùy chỉnh ngày & giờ đăng</span>
                  </label>
                </div>

                {useCustomDate ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 animate-fade-in">
                    <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
                      <Calendar className="w-4 h-4 text-red-600" />
                      <span>Chọn ngày và giờ đăng bài:</span>
                    </div>
                    <input
                      type="datetime-local"
                      value={customDateTime}
                      onChange={(e) => setCustomDateTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                    <p className="text-[11px] text-gray-500 m-0">
                      Bài viết sẽ hiển thị theo đúng mốc thời gian bạn chỉ định (có thể đặt lùi về quá khứ hoặc hẹn giờ trong tương lai).
                    </p>
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                    ⏱️ Mặc định: Lấy thời gian thực tại thời điểm AI viết bài xong.
                  </div>
                )}
              </div>

              {/* CHỌN CHẾ ĐỘ CÀO: TỰ ĐỘNG RSS HAY DÁN LINK */}
              <div className="pt-2 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2.5">
                  4. Nguồn thu thập tin tức:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setCrawlMode('auto_scan');
                    }}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      crawlMode === 'auto_scan'
                        ? 'border-red-500 bg-red-50/50 text-red-950 ring-1 ring-red-500'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <Radio className={`w-4 h-4 mt-0.5 ${crawlMode === 'auto_scan' ? 'text-red-600' : 'text-gray-400'}`} />
                    <div>
                      <div className="font-bold text-xs">Quét tin nóng từ các báo</div>
                      <div className="text-[11px] text-gray-500">VnExpress, Dân Trí, Tuổi Trẻ...</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCrawlMode('custom_url');
                      setBatchCount(1);
                    }}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      crawlMode === 'custom_url'
                        ? 'border-red-500 bg-red-50/50 text-red-950 ring-1 ring-red-500'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <LinkIcon className={`w-4 h-4 mt-0.5 ${crawlMode === 'custom_url' ? 'text-red-600' : 'text-gray-400'}`} />
                    <div>
                      <div className="font-bold text-xs">Dán link bài báo bất kỳ</div>
                      <div className="text-[11px] text-gray-500">Cào chính xác URL bạn nhập</div>
                    </div>
                  </button>
                </div>

                {crawlMode === 'auto_scan' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Nguồn báo chí:
                      </label>
                      <select
                        value={selectedSource}
                        onChange={(e) => setSelectedSource(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-xs font-medium focus:ring-2 focus:ring-red-500"
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
                        Chuyên mục:
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-xs font-medium focus:ring-2 focus:ring-red-500"
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
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Đường dẫn URL bài báo gốc:
                    </label>
                    <input
                      type="url"
                      required={crawlMode === 'custom_url'}
                      value={customArticleUrl}
                      onChange={(e) => setCustomArticleUrl(e.target.value)}
                      placeholder="https://vnexpress.net/thoi-su/bai-viet-mau-123.html"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-xs focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                )}
              </div>

              {/* TIN NÓNG / TIÊU ĐIỂM */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBreaking}
                    onChange={(e) => setIsBreaking(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                  />
                  <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-red-600 fill-red-600" />
                    Đánh dấu là Tin Nóng / Tiêu Điểm
                  </span>
                </label>

                <div className="text-[11px] text-gray-500">
                  Động cơ: <strong>AI Miễn Phí (Auto-cascade)</strong>
                </div>
              </div>

              {/* NÚT THỰC THI */}
              <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-gray-500">
                  {statusMode === 'published' ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Chế độ: Đăng tự động {batchCount} bài lên trang chủ
                    </span>
                  ) : (
                    <span className="text-amber-700 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Chế độ: Cào {batchCount} bài lưu nháp (Admin bấm nút duyệt đăng)
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#D71920] to-[#b3141a] hover:from-[#b3141a] hover:to-[#901015] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang xử lý {batchCount} bài viết...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Bắt Đầu Cào {batchCount > 1 ? `${batchCount} Bài Viết` : 'Bài Viết'} Ngay</span>
                    </>
                  )}
                </button>
              </div>

              {/* TIẾN TRÌNH THỜI GIAN THỰC */}
              {isLoading && (
                <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3 animate-fade-in">
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

          {/* CỘT PHẢI: KẾT QUẢ BÀI VIẾT VỪA CÀO & DUYỆT ĐĂNG THỦ CÔNG */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-600" />
                  <span>Bài viết vừa tạo ({generatedArticles.length})</span>
                </h3>
                {generatedArticles.length > 0 && (
                  <span className="text-xs text-gray-500">
                    Phiên vừa hoàn tất
                  </span>
                )}
              </div>

              {generatedArticles.length > 0 ? (
                <div className="space-y-5 max-h-[680px] overflow-y-auto pr-1">
                  {generatedArticles.map((art, idx) => {
                    const isPublished = art.status === 'published';
                    const isEditingDate = editingDateArticleId === art.id;

                    return (
                      <div key={art.id || idx} className="p-4 rounded-xl border border-gray-200 bg-slate-50/40 space-y-3 relative hover:border-gray-300 transition-all">
                        {/* ẢNH & BADGE TRẠNG THÁI */}
                        <div className="relative w-full h-36 rounded-lg overflow-hidden bg-gray-100">
                          {art.featured_image?.public_url && (
                            <Image
                              src={art.featured_image.public_url}
                              alt={art.title}
                              fill
                              sizes="(max-width: 1024px) 100vw, 450px"
                              className="object-cover"
                              unoptimized
                            />
                          )}
                          <div className="absolute top-2 left-2 flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded bg-black/75 text-white text-[10px] font-bold">
                              {art.category?.name || 'Thời sự'}
                            </span>
                            {art.is_breaking && (
                              <span className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold flex items-center gap-1">
                                <Flame className="w-2.5 h-2.5 fill-white" />
                                Nóng
                              </span>
                            )}
                          </div>

                          <div className="absolute top-2 right-2">
                            {isPublished ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-xs flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                ĐÃ ĐĂNG
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold shadow-xs flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                CHỜ ADMIN DUYỆT
                              </span>
                            )}
                          </div>

                          {/* Quick AI Cover Changer */}
                          <button
                            type="button"
                            onClick={() => setCoverModalArticle(art)}
                            className="absolute bottom-1.5 right-1.5 p-1 px-2 rounded-md bg-black/70 hover:bg-[#D71920] text-white text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Tự tạo ảnh bìa AI hoặc poster đồ họa mới cho bài này"
                          >
                            <Wand2 className="w-2.5 h-2.5 text-amber-300" />
                            <span>Đổi ảnh AI</span>
                          </button>
                        </div>

                        {/* TIÊU ĐỀ */}
                        <div>
                          <h4 className="font-bold text-sm text-gray-900 line-clamp-2 leading-snug">
                            {art.title}
                          </h4>
                          <p className="text-xs text-gray-600 line-clamp-2 mt-1 leading-relaxed">
                            {art.sapo}
                          </p>
                        </div>

                        {/* THÔNG TIN NGÀY GIỜ ĐĂNG & CHỈNH SỬA */}
                        <div className="pt-2 border-t border-gray-200/60 text-xs">
                          {isEditingDate ? (
                            <div className="space-y-2 p-2.5 bg-white border border-red-200 rounded-lg shadow-xs">
                              <label className="block text-[11px] font-bold text-gray-700">
                                Chọn ngày & giờ mới:
                              </label>
                              <input
                                type="datetime-local"
                                value={editDateTimeValue}
                                onChange={(e) => setEditDateTimeValue(e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
                              />
                              <div className="flex items-center gap-2 justify-end">
                                <button
                                  type="button"
                                  onClick={() => setEditingDateArticleId(null)}
                                  className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded text-[11px] cursor-pointer"
                                >
                                  Hủy
                                </button>
                                <button
                                  type="button"
                                  disabled={isUpdatingStatus === art.id}
                                  onClick={() => handleSaveCustomDate(art.id)}
                                  className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-[11px] flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                >
                                  <Save className="w-3 h-3" />
                                  <span>Lưu giờ</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between text-gray-500">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                <span>
                                  {art.published_at ? new Date(art.published_at).toLocaleString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                  }) : 'Chưa đặt ngày'}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingDateArticleId(art.id);
                                  const dateVal = art.published_at ? new Date(art.published_at) : new Date();
                                  const isoStr = new Date(dateVal.getTime() - dateVal.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                                  setEditDateTimeValue(isoStr);
                                }}
                                className="text-blue-600 hover:text-blue-800 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Sửa ngày/giờ</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* NÚT THAO TÁC DUYỆT ĐĂNG & XEM BÀI */}
                        <div className="pt-2 border-t border-gray-200/60 flex items-center gap-2">
                          {!isPublished ? (
                            <button
                              type="button"
                              disabled={isUpdatingStatus === art.id}
                              onClick={() => handlePublishNow(art.id)}
                              className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all disabled:opacity-50"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>{isUpdatingStatus === art.id ? 'Đang xuất bản...' : '🚀 Bấm Đăng Ngay Lên Web'}</span>
                            </button>
                          ) : (
                            <Link
                              href={`/bai-viet/${art.slug}`}
                              target="_blank"
                              className="flex-1 py-2 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs text-center flex items-center justify-center gap-1.5 shadow-xs"
                            >
                              <span>Xem Trên Web</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}

                          <Link
                            href={`/admin/bai-viet/${art.id}/chinh-sua`}
                            className="py-2 px-3 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold text-xs text-center"
                          >
                            Chỉnh sửa
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 px-4 text-gray-400">
                  <Bot className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-xs leading-relaxed">
                    Chưa có bài viết nào được tạo trong phiên này. Hãy chọn số lượng bài và bấm <strong>&quot;Bắt Đầu Cào Bài Viết Ngay&quot;</strong>.
                  </p>
                </div>
              )}
            </div>

            {/* BOX THÔNG BÁO VỀ CƠ CHẾ DUYỆT */}
            <div className="bg-blue-50/70 rounded-xl border border-blue-200 p-4 text-xs space-y-2 text-blue-900">
              <h4 className="font-bold flex items-center gap-1.5 text-blue-950">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <span>Quy trình biên tập & duyệt bài:</span>
              </h4>
              <ul className="space-y-1 list-disc pl-4 text-blue-800">
                <li><strong>Đăng tự động:</strong> Bài xuất hiện ngay trên trang chủ sau khi AI viết xong.</li>
                <li><strong>Đăng thủ công:</strong> Bài nằm ở trạng thái chờ duyệt. Bạn có thể đọc lại, chỉnh sửa tiêu đề/ngày giờ rồi bấm <em>&quot;Bấm Đăng Ngay Lên Web&quot;</em>.</li>
              </ul>
              <div className="pt-2 border-t border-blue-200/60 flex items-center gap-3">
                <Link
                  href="/admin/bai-viet"
                  className="font-bold text-red-700 hover:text-red-900 hover:underline flex items-center gap-1 text-[11px]"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Mở trang Quản lý bài viết CMS →
                </Link>
                <Link
                  href="/admin/media"
                  className="font-bold text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1 text-[11px]"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  Thư viện hình ảnh Media →
                </Link>
              </div>
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
                https://tinvanta.vercel.app/api/cron/crawl-and-publish
              </div>
            </div>

            <div className="pt-2">
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
              Chưa có lịch sử bài viết nào. Hãy thực hiện cào bài đầu tiên ở Tab <strong>&quot;Cào Tin & Xuất Bản&quot;</strong>.
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

      {/* Auto Cover Modal for Generated Articles */}
      {coverModalArticle && (
        <AutoCoverModal
          isOpen={Boolean(coverModalArticle)}
          onClose={() => setCoverModalArticle(null)}
          articleTitle={coverModalArticle.title}
          categoryName={coverModalArticle.category?.name || 'Thời sự'}
          categorySlug={coverModalArticle.category?.slug || 'thoi-su'}
          onSelectImage={(url) => {
            setGeneratedArticles(prev => prev.map(a => a.id === coverModalArticle.id ? {
              ...a,
              featured_image: {
                id: a.featured_image?.id || `img-${Date.now()}`,
                filename: 'cover.jpg',
                storage_path: 'articles/cover.jpg',
                public_url: url,
                mime_type: 'image/jpeg',
                file_size: 400000,
                created_at: new Date().toISOString()
              }
            } : a));
            fetch('/api/admin/articles', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: coverModalArticle.id, featured_image_url: url })
            }).catch(() => {});
            setCoverModalArticle(null);
          }}
        />
      )}
    </div>
  );
}
