'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { TipTapEditor } from '@/components/editor/TipTapEditor';
import { MOCK_ARTICLES, MOCK_CATEGORIES } from '@/lib/data/mock-data';
import { 
  ArrowLeft, 
  Save, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileCheck,
  History,
  RotateCcw
} from 'lucide-react';
import { Suspense } from 'react';
import { ArticleStatus } from '@/types/database';

function EditArticleInner() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const article = MOCK_ARTICLES.find(a => a.id === id) || MOCK_ARTICLES[0];

  const [title, setTitle] = useState(article.title);
  const [slug, setSlug] = useState(article.slug);
  const [sapo, setSapo] = useState(article.sapo);
  const [contentHtml, setContentHtml] = useState(article.content_html);
  const [status, setStatus] = useState<ArticleStatus>(article.status);
  const [categoryId, setCategoryId] = useState(article.primary_category_id);
  const [version, setVersion] = useState(article.version);
  const [notification, setNotification] = useState<string | null>(null);

  const handleStatusChange = (newStatus: ArticleStatus) => {
    setStatus(newStatus);
    setVersion(v => v + 1);
    setNotification(`Trạng thái bài viết đã cập nhật: ${newStatus.toUpperCase()}`);
    setTimeout(() => setNotification(null), 3000);
  };

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
              Mã bài: <span className="font-mono text-gray-600">{id}</span> • Phiên bản: v{version}
            </p>
          </div>
        </div>

        {/* Workflow Transition Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {status === 'pending_review' && (
            <>
              <button
                type="button"
                onClick={() => handleStatusChange('changes_requested')}
                className="px-3.5 py-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Yêu cầu sửa bài
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange('approved')}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <FileCheck className="w-4 h-4" />
                Phê duyệt
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => handleStatusChange('published')}
            className="px-4 py-2 bg-[#D71920] hover:bg-[#b8141a] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            Cập nhật & Xuất bản
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
                Nội dung TipTap
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
              Tự động lưu lịch sử sửa đổi giúp phục hồi nội dung khi có tranh chấp bản quyền hoặc đính chính bài viết.
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
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function EditArticlePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Đang tải trình biên tập bài viết...</div>}>
      <EditArticleInner />
    </Suspense>
  );
}
