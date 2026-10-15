'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TipTapEditor } from '@/components/editor/TipTapEditor';
import { generateVietnameseSlug, calculateReadingTime } from '@/lib/utils';
import { MOCK_CATEGORIES } from '@/lib/data/mock-data';
import { AutoCoverModal } from '@/components/admin/AutoCoverModal';
import { 
  ArrowLeft, 
  Save, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Globe, 
  Tag, 
  Image as ImageIcon,
  Calendar,
  Clock,
  Wand2,
  Palette,
  Trash2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Suspense } from 'react';

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

function CreateArticleInner() {
  const router = useRouter();

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [sapo, setSapo] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [categoryId, setCategoryId] = useState(MOCK_CATEGORIES[0]?.id || '');
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBreaking, setIsBreaking] = useState(false);
  const [publishedAtLocal, setPublishedAtLocal] = useState('');

  // SEO State
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // AI Assistant Drawer State
  const [aiLoading, setAiLoading] = useState(false);
  const [fullArticleLoading, setFullArticleLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiNotice, setAiNotice] = useState<string>('');

  // Auto Cover Modal State
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Title change -> auto slug
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug || slug === generateVietnameseSlug(title)) {
      setSlug(generateVietnameseSlug(val));
    }
  };

  // 1. TỰ ĐỘNG VIẾT TOÀN BỘ BÀI BÁO (FULL CONTENT GENERATOR)
  const handleGenerateFullArticle = async () => {
    const topic = title.trim() || 'Đổi mới sáng tạo trong kỷ nguyên số';
    setFullArticleLoading(true);
    setStatusMessage(null);
    setAiNotice('');

    try {
      const selectedCategory = MOCK_CATEGORIES.find(c => c.id === categoryId);
      const res = await fetch('/api/ai/editorial-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_full_article',
          content: topic,
          categorySlug: selectedCategory?.slug || 'thoi-su',
        }),
      });

      const data = await res.json();

      if (res.ok && data.status === 'success' && data.data) {
        const art = data.data;
        setTitle(art.title);
        setSlug(art.slug);
        setSapo(art.sapo);
        setContentHtml(art.contentHtml);
        if (art.categoryId) setCategoryId(art.categoryId);
        if (art.seoTitle) setSeoTitle(art.seoTitle);
        if (art.seoDescription) setSeoDescription(art.seoDescription);
        
        // Tự động gán ảnh bìa AI nếu chưa có ảnh
        if (art.coverImageUrl && !imageUrl) {
          setImageUrl(art.coverImageUrl);
          setImageCaption(`Ảnh AI tạo tự động: ${art.title}`);
        }

        setStatusMessage({
          type: 'success',
          text: `✨ AI đã tạo xong toàn bộ bài viết (${art.wordCount} từ, đầy đủ tiêu đề, sapo, chuyên mục và ảnh bìa)! Bạn có thể tinh chỉnh trước khi xuất bản.`
        });
      } else {
        alert(data.error || 'Có lỗi xảy ra khi tạo bài viết AI.');
      }
    } catch {
      alert('Không thể kết nối đến máy chủ AI.');
    } finally {
      setFullArticleLoading(false);
    }
  };

  // 2. AI Quick Actions Handler (Human-in-the-loop)
  const handleAiAction = async (action: 'suggest_headlines' | 'generate_sapo' | 'suggest_tags') => {
    const contextContent = contentHtml ? contentHtml.replace(/<[^>]+>/g, ' ') : title;
    if (!contextContent || contextContent.length < 5) {
      alert('Vui lòng nhập tiêu đề hoặc nội dung tối thiểu 5 ký tự để AI có dữ liệu phân tích.');
      return;
    }

    setAiLoading(true);
    setAiSuggestions([]);
    try {
      const res = await fetch('/api/ai/editorial-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, content: contextContent }),
      });
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        if (action === 'suggest_headlines') {
          setAiSuggestions(data.data.suggestions || []);
          setAiNotice(data.data.disclaimer || '');
        } else if (action === 'generate_sapo') {
          setSapo(data.data.sapo || '');
          setAiNotice(data.data.disclaimer || '');
        } else if (action === 'suggest_tags') {
          setAiSuggestions(data.data.tags || []);
          setAiNotice('Gợi ý từ khóa AI phù hợp với chủ đề.');
        }
      } else {
        alert(data.error || 'Có lỗi xảy ra từ máy chủ AI.');
      }
    } catch {
      alert('Không thể kết nối đến hệ thống AI.');
    } finally {
      setAiLoading(false);
    }
  };

  // Submit Handler
  const handleSaveArticle = async (status: 'draft' | 'pending_review' | 'published') => {
    if (!title.trim()) {
      setStatusMessage({ type: 'error', text: 'Vui lòng nhập tiêu đề bài viết.' });
      return;
    }
    if (!sapo.trim()) {
      setStatusMessage({ type: 'error', text: 'Vui lòng nhập tóm tắt Sapo của bài viết.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug: slug ? slug.trim().toLowerCase() : undefined,
          sapo,
          content_html: contentHtml,
          category_id: categoryId,
          status,
          published_at: publishedAtLocal ? new Date(publishedAtLocal).toISOString() : undefined,
          featured_image_url: imageUrl,
          is_featured: isFeatured,
          is_breaking: isBreaking,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({
          type: 'success',
          text: status === 'published' 
            ? 'Bài viết đã được xuất bản thành công lên website!' 
            : status === 'pending_review'
            ? 'Bài viết đã được nộp vào hàng đợi chờ Ban Biên Tập duyệt.'
            : 'Đã lưu bản nháp thành công.',
        });

        setTimeout(() => {
          router.push('/admin/bai-viet');
        }, 1200);
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || 'Có lỗi xảy ra khi lưu bài viết.',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: 'Không thể kết nối đến máy chủ tòa soạn.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategoryObj = MOCK_CATEGORIES.find(c => c.id === categoryId);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* 1. TOP HEADER & WORKFLOW CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/bai-viet"
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-[#172033]">
              Soạn Thảo Bài Viết Mới
            </h1>
            <p className="text-xs text-gray-400">
              Trạng thái bài viết: <span className="font-semibold text-gray-600">Bản nháp (Draft)</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSaveArticle('draft')}
            className="px-3.5 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4 text-gray-500" />
            Lưu nháp
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSaveArticle('pending_review')}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Send className="w-4 h-4" />
            Gửi duyệt bài
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSaveArticle('published')}
            className="px-4 py-2 bg-[#D71920] hover:bg-[#b8141a] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
            Xuất bản ngay
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl flex items-center gap-2 text-sm ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" /> : <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* 2. MAIN EDITORIAL FORM (8 COLS) + METADATA & AI (4 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CỘT TRÁI: TIÊU ĐỀ, SAPO & TIPTAP */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs space-y-4">
            {/* Tiêu đề bài viết */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Tiêu đề bài viết *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Ví dụ: Đổi mới sáng tạo trong kinh tế số 2026..."
                className="w-full px-4 py-2.5 text-base sm:text-lg font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D71920] text-gray-900"
              />
            </div>

            {/* Slug URL */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                Đường dẫn tĩnh (Slug URL thân thiện SEO):
              </label>
              <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-3 py-2 border border-gray-200 rounded-lg">
                <span className="shrink-0 font-mono text-gray-400">/bai-viet/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="duong-dan-bai-viet-chuan-seo"
                  className="w-full bg-transparent border-none focus:outline-none text-gray-700 font-mono text-xs px-1"
                />
              </div>
            </div>

            {/* Đoạn mở đầu (Sapo) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Đoạn mở đầu (Sapo) *
              </label>
              <textarea
                rows={3}
                value={sapo}
                onChange={(e) => setSapo(e.target.value)}
                placeholder="Tóm tắt ngắn gọn 1-2 câu chứa đựng thông điệp cốt lõi của bài báo..."
                className="w-full p-3 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D71920]"
              />
            </div>

            {/* Trình soạn thảo TipTap Rich Text */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                Nội dung chi tiết (TipTap Rich Text) *
              </label>
              <TipTapEditor content={contentHtml} onChange={setContentHtml} />
            </div>
          </div>

          {/* SEO Metadata Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
              <span>Tối ưu hóa công cụ tìm kiếm (SEO Metadata)</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold uppercase">Google Snippet</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  SEO Title (Tối đa 70 ký tự)
                </label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder={title || 'Tiêu đề hiển thị trên Google'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#D71920]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  SEO Meta Description (Tối đa 160 ký tự)
                </label>
                <textarea
                  rows={2}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder={sapo || 'Mô tả ngắn gọn hiển thị trên kết quả tìm kiếm Google'}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#D71920]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: AI COPILOT, CHUYÊN MỤC & MEDIA */}
        <aside className="lg:col-span-4 space-y-6">
          {/* AI Editorial Copilot Box */}
          <div className="bg-gradient-to-br from-[#172033] to-[#25324d] text-white p-5 rounded-xl shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-700 pb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                AI Trợ Lý Biên Tập
              </span>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-mono">
                Mã nguồn mở Free
              </span>
            </div>

            {/* HERO FEATURE: TỰ ĐỘNG VIẾT TOÀN BỘ BÀI BÁO */}
            <div className="p-3.5 bg-gradient-to-r from-red-600/30 to-amber-500/20 border border-amber-400/40 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-amber-300 uppercase tracking-wide flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Viết Báo Tự Động
                </span>
                <span className="text-[9px] bg-emerald-500/25 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                  Pollinations LLM
                </span>
              </div>

              <button
                type="button"
                disabled={fullArticleLoading}
                onClick={handleGenerateFullArticle}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-[#D71920] to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {fullArticleLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Đang nghiên cứu & viết bài...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 text-amber-300" />
                    <span>Tự Động Viết Toàn Bộ Bài Báo</span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-gray-300 italic text-center m-0 leading-tight">
                Nhập tiêu đề hoặc ý tưởng, AI sẽ viết trọn bài gồm các phần H2, số liệu, sapo và ảnh bìa.
              </p>
            </div>

            {/* NÚT TẠO ẢNH BÌA TỰ ĐỘNG */}
            <div>
              <button
                type="button"
                onClick={() => setIsCoverModalOpen(true)}
                className="w-full py-2 px-3 bg-white/10 hover:bg-white/15 border border-white/10 text-white rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Tạo ảnh bìa tự động (Cover AI)</span>
                </span>
                <span className="text-[9px] text-cyan-300 bg-cyan-950 px-1.5 py-0.5 rounded">
                  Flux / Poster
                </span>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 pt-1 border-t border-gray-700/60">
              <button
                type="button"
                disabled={aiLoading}
                onClick={() => handleAiAction('suggest_headlines')}
                className="w-full text-left bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>💡 Gợi ý tiêu đề báo chí</span>
                {aiLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              </button>

              <button
                type="button"
                disabled={aiLoading}
                onClick={() => handleAiAction('generate_sapo')}
                className="w-full text-left bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>📝 Viết sapo tóm tắt tự động</span>
                {aiLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              </button>

              <button
                type="button"
                disabled={aiLoading}
                onClick={() => handleAiAction('suggest_tags')}
                className="w-full text-left bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>🏷️ Đề xuất từ khóa & thẻ tags</span>
                {aiLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              </button>
            </div>

            {/* AI Suggestions Results */}
            {aiSuggestions.length > 0 && (
              <div className="bg-black/40 p-3 rounded-lg border border-gray-700 space-y-2 text-xs">
                <p className="font-semibold text-amber-300">Gợi ý từ AI:</p>
                <ul className="space-y-1.5">
                  {aiSuggestions.map((item, idx) => (
                    <li 
                      key={idx}
                      onClick={() => setTitle(item)}
                      className="cursor-pointer hover:text-white text-gray-300 p-1.5 rounded hover:bg-white/10 transition-colors"
                      title="Bấm để chọn tiêu đề này"
                    >
                      • {item}
                    </li>
                  ))}
                </ul>
                {aiNotice && <p className="text-[10px] text-gray-400 italic pt-1">{aiNotice}</p>}
              </div>
            )}
          </div>

          {/* Cài đặt Ngày & Giờ Đăng Bài (Lập lịch phát hành) */}
          <div className="bg-white p-5 rounded-xl border-2 border-red-100 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2.5">
              <Calendar className="w-4 h-4 text-[#D71920]" />
              <h3 className="font-black text-xs uppercase tracking-wider text-[#172033]">
                Cài Đặt Ngày & Giờ Đăng Bài
              </h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Thời gian xuất bản:
              </label>
              <input
                type="datetime-local"
                value={publishedAtLocal}
                onChange={(e) => setPublishedAtLocal(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-gray-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D71920]"
              />
              <p className="text-[11px] text-gray-400 mt-1 italic">
                * Nếu để trống, hệ thống sẽ tự động dùng thời điểm hiện tại khi xuất bản.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setPublishedAtLocal(toDatetimeLocalString(new Date().toISOString()))}
                className="px-2 py-1.5 bg-gray-50 hover:bg-red-50 hover:text-[#D71920] border border-gray-200 rounded-lg text-[11px] font-bold text-gray-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Clock className="w-3 h-3 text-[#D71920]" />
                <span>Bây giờ</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  tomorrow.setHours(8, 0, 0, 0);
                  setPublishedAtLocal(toDatetimeLocalString(tomorrow.toISOString()));
                }}
                className="px-2 py-1.5 bg-gray-50 hover:bg-red-50 hover:text-[#D71920] border border-gray-200 rounded-lg text-[11px] font-bold text-gray-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>📅 Sáng mai</span>
              </button>
            </div>
          </div>

          {/* Phân loại & Chuyên mục */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700 border-b border-gray-100 pb-2">
              Phân loại chuyên mục
            </h3>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Chuyên mục chính *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D71920]"
              >
                {MOCK_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Checkbox Tin tiêu điểm & Tin nóng */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                />
                <span className="font-semibold">Đặt làm tin tiêu điểm (Spotlight)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBreaking}
                  onChange={(e) => setIsBreaking(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                />
                <span className="font-semibold text-red-600">Ghim vào thanh tin nóng</span>
              </label>
            </div>
          </div>

          {/* Ảnh đại diện & Media */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-gray-500" />
                <span>Ảnh đại diện & Media</span>
              </h3>
            </div>

            {/* Nút Tạo ảnh bìa tự động */}
            <button
              type="button"
              onClick={() => setIsCoverModalOpen(true)}
              className="w-full py-2.5 px-3 bg-red-50 hover:bg-red-100 text-[#D71920] border border-red-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
            >
              <Wand2 className="w-4 h-4 text-[#D71920]" />
              <span>🎨 Tự Tạo Ảnh Bìa AI / Poster Tòa Soạn</span>
            </button>

            {/* Image Preview if exists */}
            {imageUrl ? (
              <div className="space-y-2">
                <div className="relative aspect-video rounded-xl overflow-hidden border border-gray-200 bg-gray-100 group">
                  <img
                    src={imageUrl}
                    alt={title || 'Ảnh đại diện'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800';
                    }}
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="p-1.5 rounded-lg bg-black/60 hover:bg-red-600 text-white transition-colors cursor-pointer"
                      title="Xóa ảnh"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Link URL ảnh đại diện:
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://image.pollinations.ai/prompt/..."
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D71920]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Chú thích & Tác quyền ảnh:
              </label>
              <input
                type="text"
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
                placeholder="Ảnh: TinVanta / Phóng viên hoặc AI minh họa"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D71920]"
              />
            </div>
          </div>
        </aside>
      </div>

      {/* Auto Cover Generator Modal */}
      <AutoCoverModal
        isOpen={isCoverModalOpen}
        onClose={() => setIsCoverModalOpen(false)}
        articleTitle={title}
        categoryName={selectedCategoryObj?.name || 'Thời sự'}
        categorySlug={selectedCategoryObj?.slug || 'thoi-su'}
        onSelectImage={(url, caption) => {
          setImageUrl(url);
          if (caption) setImageCaption(caption);
        }}
      />
    </div>
  );
}

export default function CreateArticlePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Đang nạp trình tạo bài viết...</div>}>
      <CreateArticleInner />
    </Suspense>
  );
}
