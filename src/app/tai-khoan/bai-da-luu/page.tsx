'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, Trash2, ArrowLeft, Clock, Sparkles, BookOpen } from 'lucide-react';
import { 
  getStoredBookmarks, 
  removeStoredBookmark, 
  clearAllStoredBookmarks, 
  StoredBookmark 
} from '@/lib/bookmarks';
import { MOCK_ARTICLES } from '@/lib/data/mock-data';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<StoredBookmark[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const load = () => {
      setBookmarks(getStoredBookmarks());
    };
    load();

    window.addEventListener('newshub_bookmarks_change', load);
    return () => window.removeEventListener('newshub_bookmarks_change', load);
  }, []);

  const handleRemove = (id: string) => {
    const updated = removeStoredBookmark(id);
    setBookmarks(updated);
  };

  const handleClearAll = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ danh sách bài viết đã lưu?')) {
      clearAllStoredBookmarks();
      setBookmarks([]);
    }
  };

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-100 rounded w-1/2 mb-8"></div>
        <div className="space-y-4">
          <div className="h-24 bg-gray-100 rounded-xl"></div>
          <div className="h-24 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Header toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <Link 
            href="/" 
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            title="Quay lại trang chủ"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#172033] flex items-center gap-2">
              <Bookmark className="w-6 h-6 text-[#D71920] fill-[#D71920]" />
              Tin Bài Đã Lưu Đọc Sau
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Tủ sách cá nhân lưu trữ các bài báo bạn quan tâm để xem lại trên thiết bị này.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-semibold bg-red-50 text-red-700 px-3 py-1.5 rounded-full border border-red-100">
            {bookmarks.length} bài viết
          </span>

          {bookmarks.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-gray-500 hover:text-red-600 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-red-50 transition-colors"
              title="Xóa toàn bộ"
            >
              Xóa tất cả
            </button>
          )}
        </div>
      </div>

      {/* Main list */}
      {bookmarks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 sm:p-12 text-center space-y-4">
          <div className="w-14 h-14 bg-red-50 text-[#D71920] rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#172033]">
              Chưa có bài viết nào được lưu
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto mt-1 leading-relaxed">
              Khi đọc bất kỳ tin tức nào, hãy bấm nút <strong>"Lưu bài"</strong> trên thanh công cụ để đưa bài viết vào tủ đọc sau của bạn.
            </p>
          </div>

          {/* Quick suggestions */}
          <div className="pt-6 border-t border-gray-100 max-w-xl mx-auto text-left">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D71920]" />
              Gợi ý bài viết đọc nhiều hôm nay:
            </div>
            <div className="space-y-2.5">
              {MOCK_ARTICLES.slice(0, 3).map((sug) => (
                <div key={sug.id} className="p-3 rounded-xl border border-gray-100 hover:border-red-200 hover:bg-red-50/40 transition-colors">
                  <span className="text-[10px] font-bold text-[#D71920] uppercase">
                    {sug.category?.name}
                  </span>
                  <Link 
                    href={`/bai-viet/${sug.slug}`} 
                    className="block font-bold text-xs sm:text-sm text-[#172033] hover:text-[#D71920] transition-colors mt-0.5 line-clamp-1"
                  >
                    {sug.title}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {bookmarks.map((article) => (
            <div 
              key={article.id} 
              className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-2xs hover:shadow-xs transition-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {article.categoryName && (
                    <span className="text-[11px] font-bold text-[#D71920] uppercase tracking-wide">
                      {article.categoryName}
                    </span>
                  )}
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Đã lưu {new Date(article.savedAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-[#172033] hover:text-[#D71920] transition-colors mt-1 line-clamp-2">
                  <Link href={`/bai-viet/${article.slug}`}>
                    {article.title}
                  </Link>
                </h3>

                {article.sapo && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {article.sapo}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <Link
                  href={`/bai-viet/${article.slug}`}
                  className="px-3 py-1.5 text-xs font-semibold text-[#D71920] bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  Đọc ngay
                </Link>

                <button
                  type="button"
                  onClick={() => handleRemove(article.id)}
                  className="text-xs text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  title="Bỏ lưu bài này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
