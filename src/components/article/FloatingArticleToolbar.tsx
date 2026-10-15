'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bookmark, 
  Share2, 
  MessageSquare, 
  Heart, 
  Type, 
  Check, 
  Headphones, 
  Printer,
  ChevronUp
} from 'lucide-react';
import { isArticleBookmarked, toggleBookmarkArticle } from '@/lib/bookmarks';

interface FloatingArticleToolbarProps {
  articleId: string;
  articleTitle: string;
  articleSlug: string;
  sapo?: string;
  categoryName?: string;
  publishedAt?: string;
  commentsCount?: number;
  initialLikes?: number;
}

export function FloatingArticleToolbar({
  articleId,
  articleTitle,
  articleSlug,
  sapo,
  categoryName,
  publishedAt,
  commentsCount = 8,
  initialLikes = 42,
}: FloatingArticleToolbarProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [fontSizeLevel, setFontSizeLevel] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    setBookmarked(isArticleBookmarked(articleId));
    if (typeof window !== 'undefined') {
      const savedLike = localStorage.getItem(`tinvanta_like_${articleId}`);
      if (savedLike) setHasLiked(true);
    }
  }, [articleId]);

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

  const handleLike = () => {
    if (!hasLiked) {
      setLikes(prev => prev + 1);
      setHasLiked(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`tinvanta_like_${articleId}`, 'true');
      }
    } else {
      setLikes(prev => Math.max(0, prev - 1));
      setHasLiked(false);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`tinvanta_like_${articleId}`);
      }
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const scrollToComments = () => {
    const el = document.getElementById('article-comments');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToAudio = () => {
    const el = document.getElementById('article-audio-player');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleFontSize = () => {
    const nextLevel = ((fontSizeLevel + 1) % 3) as 0 | 1 | 2;
    setFontSizeLevel(nextLevel);
    const contentEl = document.getElementById('article-main-content');
    if (contentEl) {
      if (nextLevel === 0) {
        contentEl.style.fontSize = '1.125rem';
        contentEl.style.lineHeight = '1.85';
      } else if (nextLevel === 1) {
        contentEl.style.fontSize = '1.25rem';
        contentEl.style.lineHeight = '1.9';
      } else {
        contentEl.style.fontSize = '1.375rem';
        contentEl.style.lineHeight = '2.0';
      }
    }
  };

  return (
    <>
      {/* 1. DESKTOP LEFT FLOATING DOCK (CỐ ĐỊNH BÊN TRÁI BÀI BÁO) */}
      <aside className="hidden xl:flex flex-col items-center gap-2.5 fixed left-[max(0.75rem,calc(50%-690px))] top-32 z-30">
        {/* Heart / Thả tim */}
        <button
          type="button"
          onClick={handleLike}
          className={`flex flex-col items-center justify-center w-11 h-11 rounded-full border shadow-xs transition-all ${
            hasLiked 
              ? 'bg-red-50 border-red-200 text-[#D71920] scale-105' 
              : 'bg-white border-gray-200 text-gray-600 hover:text-[#D71920] hover:border-red-200'
          }`}
          title={hasLiked ? 'Đã thích bài viết' : 'Thích bài viết'}
        >
          <Heart className={`w-4 h-4 ${hasLiked ? 'fill-[#D71920]' : ''}`} />
          <span className="text-[10px] font-bold mt-0.5">{likes}</span>
        </button>

        {/* Bookmark */}
        <button
          type="button"
          onClick={handleBookmark}
          className={`flex flex-col items-center justify-center w-11 h-11 rounded-full border shadow-xs transition-all ${
            bookmarked 
              ? 'bg-red-50 border-red-200 text-[#D71920] scale-105 font-bold' 
              : 'bg-white border-gray-200 text-gray-600 hover:text-[#D71920] hover:border-red-200'
          }`}
          title={bookmarked ? 'Bỏ lưu bài viết' : 'Lưu đọc sau'}
        >
          <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
          <span className="text-[9px] mt-0.5">{bookmarked ? 'Đã lưu' : 'Lưu'}</span>
        </button>

        {/* Scroll to Comments */}
        <button
          type="button"
          onClick={scrollToComments}
          className="flex flex-col items-center justify-center w-11 h-11 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200 shadow-xs transition-all"
          title="Bình luận độc giả"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-[10px] font-bold mt-0.5">{commentsCount}</span>
        </button>

        {/* Scroll to Audio Player */}
        <button
          type="button"
          onClick={scrollToAudio}
          className="flex flex-col items-center justify-center w-11 h-11 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-amber-600 hover:border-amber-200 shadow-xs transition-all"
          title="Nghe đọc bài bằng AI"
        >
          <Headphones className="w-4 h-4" />
          <span className="text-[9px] mt-0.5">Nghe</span>
        </button>

        {/* Font size toggle */}
        <button
          type="button"
          onClick={toggleFontSize}
          className="flex flex-col items-center justify-center w-11 h-11 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-gray-900 shadow-xs transition-all"
          title="Thay đổi cỡ chữ (Nhỏ / Vừa / Lớn)"
        >
          <Type className="w-4 h-4" />
          <span className="text-[9px] font-semibold mt-0.5">
            {fontSizeLevel === 0 ? 'A' : fontSizeLevel === 1 ? 'A+' : 'A++'}
          </span>
        </button>

        {/* Copy Link */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="flex flex-col items-center justify-center w-11 h-11 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-[#D71920] shadow-xs transition-all relative"
          title="Sao chép liên kết bài viết"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          <span className="text-[9px] mt-0.5">{copied ? 'Xong' : 'Chia sẻ'}</span>
        </button>
      </aside>

      {/* 2. MOBILE BOTTOM FLOATING ACTION BAR (THÂN THIỆN ĐIỆN THOẠI) */}
      <div className="xl:hidden fixed bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md border border-gray-200 shadow-xl rounded-full px-4 py-2 z-40 flex items-center justify-between text-xs max-w-md mx-auto">
        <button
          type="button"
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-colors ${
            hasLiked ? 'text-[#D71920] font-bold' : 'text-gray-600'
          }`}
        >
          <Heart className={`w-4 h-4 ${hasLiked ? 'fill-[#D71920]' : ''}`} />
          <span>{likes}</span>
        </button>

        <button
          type="button"
          onClick={handleBookmark}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-colors ${
            bookmarked ? 'text-[#D71920] font-bold' : 'text-gray-600'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
          <span>{bookmarked ? 'Đã lưu' : 'Lưu'}</span>
        </button>

        <button
          type="button"
          onClick={scrollToComments}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-gray-600 hover:text-blue-600"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{commentsCount}</span>
        </button>

        <button
          type="button"
          onClick={toggleFontSize}
          className="flex items-center gap-1 px-2.5 py-1.5 text-gray-600 hover:text-gray-900"
        >
          <Type className="w-4 h-4" />
          <span className="text-[10px] font-bold">{fontSizeLevel === 0 ? 'A' : fontSizeLevel === 1 ? 'A+' : 'A++'}</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-gray-600 hover:text-[#D71920]"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          <span>{copied ? 'Đã chép' : 'Chia sẻ'}</span>
        </button>
      </div>
    </>
  );
}
