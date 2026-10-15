'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { TipTapEditor } from '@/components/editor/TipTapEditor';
import { MOCK_CATEGORIES } from '@/lib/data/mock-data';
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
  Loader2
} from 'lucide-react';
import { Suspense } from 'react';
import { Article, ArticleStatus } from '@/types/database';

function EditArticleInner() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [article, setArticle] = useState<Article | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [sapo, setSapo] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [status, setStatus] = useState<ArticleStatus>('draft');
  const [categoryId, setCategoryId] = useState(MOCK_CATEGORIES[0]?.id || '');
  const [version, setVersion] = useState(1);
  const [notification, setNotification] = useState<string | null>(null);

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

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSave = async (targetStatus?: ArticleStatus) => {
    const finalStatus = targetStatus || status;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/articles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          title,
          sapo,
          content_html: contentHtml,
          category_id: categoryId,
          status: finalStatus,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus(finalStatus);
        setVersion(v => v + 1);
        showToast(
          finalStatus === 'published' 
            ? 'Đã duyệt & xuất bản bài viết thành công!' 
            : 'Đã lưu bản cập nhật bài viết thành công!'
        );
      } else {
        alert(data.error || 'Có lỗi xảy ra khi cập nhật.');
      }
    } catch {
      alert('Không thể kết nối đến máy chủ.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500 text-xs flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-[#D71920]" />
        Đang nạp dữ liệu bài viết #{id}...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* 1. TOP HEADER & EDITORIAL ACTIONS */}
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
              Biên Tập Bài Viết & Phê Duyệt
            </h1>
            <p className="text-xs text-gray-400">
              Mã bài: <span className="font-mono text-gray-600">{id}</span> • Phiên bản: v{version} • 
              Trạng thái: <strong className="text-gray-700 uppercase">{status}</strong>
            </p>
          </div>
        </div>

        {/* Workflow Transition Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {slug && status === 'published' && (
            <Link
              href={`/bai-viet/${slug}`}
              target="_blank"
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Xem trên web
            </Link>
          )}

          {status === 'pending_review' && (
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('draft')}
              className="px-3.5 py-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Trả về nháp
            </button>
          )}

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('draft')}
            className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-4 h-4" />
            Lưu nháp
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('published')}
            className="px-4 py-2 bg-[#D71920] hover:bg-[#b8141a] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {status === 'published' ? 'Lưu thay đổi' : 'Duyệt & Xuất bản'}
          </button>
        </div>
      </div>

      {notification && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* 2. FORM GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Tiêu đề bài viết
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-bold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#D71920]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Sapo bài viết
              </label>
              <textarea
                rows={3}
                value={sapo}
                onChange={(e) => setSapo(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#D71920]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                Nội dung bài viết
              </label>
              <TipTapEditor content={contentHtml} onChange={setContentHtml} />
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700 border-b border-gray-100 pb-2">
              Lịch sử phiên bản (Audit)
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <History className="w-4 h-4 text-blue-600" />
              <span>Phiên bản hiện tại: <strong>v{version}</strong></span>
            </div>
            <p className="text-[11px] text-gray-400">
              Mọi thay đổi được đồng bộ vào hệ thống tòa soạn và lưu trữ để theo dõi quy trình xuất bản.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700 border-b border-gray-100 pb-2">
              Trạng thái & Chuyên mục
            </h3>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Chuyên mục</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              >
                {MOCK_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Trạng thái xuất bản</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ArticleStatus)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold"
              >
                <option value="draft">Bản nháp (Draft)</option>
                <option value="pending_review">Chờ duyệt (Pending Review)</option>
                <option value="published">Xuất bản công khai (Published)</option>
              </select>
            </div>
          </div>
        </aside>
      </div>
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
