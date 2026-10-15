'use client';

import React, { useState, useEffect } from 'react';
import { Bookmark, Share2, Printer, Type, Check } from 'lucide-react';
import { isArticleBookmarked, toggleBookmarkArticle } from '@/lib/bookmarks';

interface ArticleActionsProps {
  articleId: string;
  articleTitle: string;
  articleSlug: string;
  sapo?: string;
  categoryName?: string;
  publishedAt?: string;
}

export function ArticleActions({ 
  articleId, 
  articleTitle, 
  articleSlug,
  sapo,
  categoryName,
  publishedAt,
}: ArticleActionsProps) {
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [fontSizeLevel, setFontSizeLevel] = useState<0 | 1 | 2>(0); // 0: normal, 1: medium, 2: large

  useEffect(() => {
    setBookmarked(isArticleBookmarked(articleId));
  }, [articleId]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBookmark = () => {
    const nextState = toggleBookmarkArticle({
      id: articleId,
      title: articleTitle,
      slug: articleSlug,
      sapo,
      categoryName,
      publishedAt,
    });
    setBookmarked(nextState);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const toggleFontSize = () => {
    const nextLevel = ((fontSizeLevel + 1) % 3) as 0 | 1 | 2;
    setFontSizeLevel(nextLevel);
    const contentEl = document.getElementById('article-main-content');
    if (contentEl) {
      if (nextLevel === 0) contentEl.style.fontSize = '1.125rem';
      if (nextLevel === 1) contentEl.style.fontSize = '1.25rem';
      if (nextLevel === 2) contentEl.style.fontSize = '1.375rem';
    }
  };

  return (
    <div className="flex items-center gap-2 py-3 border-y border-gray-100 my-4 text-gray-600 text-xs">
      <span className="font-semibold text-gray-500 mr-2 hidden sm:inline">Tiện ích:</span>

      {/* Font Size Toggle */}
      <button
        type="button"
        onClick={toggleFontSize}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        title="Thay đổi cỡ chữ đọc"
      >
        <Type className="w-3.5 h-3.5" />
        <span>Cỡ chữ {fontSizeLevel > 0 ? `+${fontSizeLevel}` : ''}</span>
      </button>

      {/* Bookmark */}
      <button
        id="btn-bookmark-article"
        type="button"
        onClick={handleBookmark}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-colors ${
          bookmarked 
            ? 'bg-red-50 text-[#D71920] border-red-200 font-semibold' 
            : 'border-gray-200 hover:bg-gray-50'
        }`}
        title="Lưu vào danh sách đọc sau"
      >
        <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
        <span>{bookmarked ? 'Đã lưu' : 'Lưu bài'}</span>
      </button>

      {/* Copy Link */}
      <button
        type="button"
        onClick={handleCopyLink}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        title="Sao chép liên kết"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
        <span>{copied ? 'Đã chép link' : 'Chia sẻ'}</span>
      </button>

      {/* Print */}
      <button
        type="button"
        onClick={handlePrint}
        className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        title="In bài viết"
      >
        <Printer className="w-3.5 h-3.5" />
        <span>In bài</span>
      </button>
    </div>
  );
}
