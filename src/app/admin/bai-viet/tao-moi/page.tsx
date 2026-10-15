'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TipTapEditor } from '@/components/editor/TipTapEditor';
import { generateVietnameseSlug, calculateReadingTime } from '@/lib/utils';
import { MOCK_CATEGORIES } from '@/lib/data/mock-data';
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
  Image as ImageIcon 
} from 'lucide-react';
import { Suspense } from 'react';

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

  // SEO State
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // AI Assistant Drawer State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiNotice, setAiNotice] = useState<string>('');

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

  // AI Actions Handler
  const handleAiAction = async (action: 'suggest_headlines' | 'generate_sapo' | 'suggest_tags') => {
    const contextContent = contentHtml ? contentHtml.replace(/<[^>]+>/g, ' ') : title;
    if (!contextContent || contextContent.length < 10) {
      alert('Vui lòng nhập tiêu đề hoặc nội dung tối thiểu 10 ký tự để AI có dữ liệu phân tích.');
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
          sapo,
          content_html: contentHtml,
          category_id: categoryId,
          status,
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
            className="px-3.5 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-4 h-4 text-gray-500" />
            Lưu nháp
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSaveArticle('pending_review')}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Send className="w-4 h-4" />
            Gửi duyệt bài
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSaveArticle('published')}
            className="px-4 py-2 bg-[#D71920] hover:bg-[#b8141a] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
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
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
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
                placeholder="Nhập tiêu đề tin bài rõ ràng, hấp dẫn và chính xác..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-bold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#D71920]"
              />
            </div>

            {/* Đường dẫn Slug */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                Đường dẫn tĩnh (Slug URL thân thiện SEO):
              </label>
              <div className="flex items-center text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <span>/bai-viet/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="bg-transparent text-gray-900 font-medium flex-1 focus:outline-none ml-0.5"
                />
              </div>
            </div>

            {/* Sapo bài viết */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Đoạn mở đầu (Sapo) *
              </label>
              <textarea
                rows={3}
                value={sapo}
                onChange={(e) => setSapo(e.target.value)}
                placeholder="Tóm tắt thông tin quan trọng nhất của bài viết trong 2 - 3 câu..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#D71920]"
              />
            </div>

            {/* TipTap Rich Text Editor */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                Nội dung chi tiết (TipTap Rich Text) *
              </label>
              <TipTapEditor content={contentHtml} onChange={setContentHtml} />
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: AI COPILOT, CHUYÊN MỤC & SEO SETTINGS */}
        <aside className="lg:col-span-4 space-y-6">
          {/* AI Editorial Copilot Box */}
          <div className="bg-gradient-to-br from-[#172033] to-[#25324d] text-white p-5 rounded-xl shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-700 pb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                AI Trợ Lý Biên Tập
              </span>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-mono">
                Human-in-loop
              </span>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Hỗ trợ phóng viên và BTV tối ưu hóa tiêu đề, tự động viết sapo và gợi ý từ khóa chuẩn xác.
            </p>

            <div className="space-y-2">
              <button
                type="button"
                disabled={aiLoading}
                onClick={() => handleAiAction('suggest_headlines')}
                className="w-full text-left bg-white/10 hover:bg-white/15 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between"
              >
                <span>💡 Gợi ý tiêu đề báo chí</span>
                {aiLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              </button>

              <button
                type="button"
                disabled={aiLoading}
                onClick={() => handleAiAction('generate_sapo')}
                className="w-full text-left bg-white/10 hover:bg-white/15 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between"
              >
                <span>📝 Viết sapo tóm tắt tự động</span>
                {aiLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              </button>

              <button
                type="button"
                disabled={aiLoading}
                onClick={() => handleAiAction('suggest_tags')}
                className="w-full text-left bg-white/10 hover:bg-white/15 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between"
              >
                <span>🏷️ Đề xuất từ khóa & thẻ tags</span>
                {aiLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              </button>
            </div>

            {/* AI Suggestions Results */}
            {aiSuggestions.length > 0 && (
              <div className="bg-black/30 p-3 rounded-lg border border-gray-700 space-y-2 text-xs">
                <p className="font-semibold text-amber-300">Gợi ý từ AI:</p>
                <ul className="space-y-1.5">
                  {aiSuggestions.map((item, idx) => (
                    <li 
                      key={idx}
                      onClick={() => setTitle(item)}
                      className="cursor-pointer hover:text-white text-gray-300 p-1 rounded hover:bg-white/5 transition-colors truncate"
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

          {/* Ảnh đại diện & Bản quyền */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700 border-b border-gray-100 pb-2">
              Ảnh đại diện & Media
            </h3>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                URL ảnh đại diện
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D71920]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Chú thích & Tác quyền ảnh
              </label>
              <input
                type="text"
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
                placeholder="Ảnh: NEWSHUB / Phóng viên"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D71920]"
              />
            </div>
          </div>
        </aside>
      </div>
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
