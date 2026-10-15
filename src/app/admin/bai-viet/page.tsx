'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Eye, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Archive,
  ExternalLink
} from 'lucide-react';
import { MOCK_ARTICLES, MOCK_CATEGORIES } from '@/lib/data/mock-data';
import { formatDateVN } from '@/lib/utils';
import { ArticleStatus } from '@/types/database';

export default function AdminArticlesPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredArticles = MOCK_ARTICLES.filter((article) => {
    if (selectedStatus !== 'all' && article.status !== selectedStatus) return false;
    if (selectedCategory !== 'all' && article.primary_category_id !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return article.title.toLowerCase().includes(q) || article.sapo.toLowerCase().includes(q);
    }
    return true;
  });

  const getStatusBadge = (status: ArticleStatus) => {
    switch (status) {
      case 'published':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">Xuất bản</span>;
      case 'pending_review':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">Chờ duyệt</span>;
      case 'changes_requested':
        return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">Yêu cầu sửa</span>;
      case 'draft':
        return <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">Bản nháp</span>;
      case 'scheduled':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">Lên lịch</span>;
      case 'archived':
        return <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">Lưu trữ</span>;
      default:
        return <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-black text-[#172033]">
            Quản Lý Tin Bài & Quy Trình Xuất Bản
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Quy trình biên tập 7 bước: Phóng viên nộp bài → Biên tập viên rà soát → Tổng biên tập duyệt xuất bản.
          </p>
        </div>

        <Link
          href="/admin/bai-viet/tao-moi"
          className="bg-[#D71920] hover:bg-[#b8141a] text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Viết bài mới
        </Link>
      </div>

      {/* 2. FILTERS BAR */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tiêu đề, sapo hoặc từ khóa..."
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D71920]"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D71920]"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đã xuất bản</option>
            <option value="pending_review">Chờ duyệt</option>
            <option value="draft">Bản nháp</option>
            <option value="changes_requested">Yêu cầu sửa</option>
            <option value="scheduled">Đã lên lịch</option>
            <option value="archived">Lưu trữ</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D71920]"
          >
            <option value="all">Tất cả chuyên mục</option>
            {MOCK_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. ARTICLES TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Tiêu đề bài viết</th>
                <th className="py-3 px-4">Chuyên mục</th>
                <th className="py-3 px-4">Tác giả</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4">Ngày xuất bản</th>
                <th className="py-3 px-4 text-right">Lượt đọc</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    Không tìm thấy bài viết nào thỏa mãn điều kiện lọc.
                  </td>
                </tr>
              ) : (
                filteredArticles.map((art) => (
                  <tr key={art.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4 max-w-sm">
                      <div className="font-bold text-gray-900 line-clamp-1">
                        {art.title}
                      </div>
                      <div className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                        {art.sapo}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-medium whitespace-nowrap">
                      {art.category?.name || 'Thời sự'}
                    </td>
                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                      {art.author?.full_name}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {getStatusBadge(art.status)}
                    </td>
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                      {formatDateVN(art.published_at, 'dd/MM/yyyy HH:mm')}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-gray-800 whitespace-nowrap">
                      {art.view_count.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {art.status === 'published' && (
                          <Link
                            href={`/bai-viet/${art.slug}`}
                            target="_blank"
                            className="p-1 text-gray-400 hover:text-gray-700"
                            title="Xem trang web công khai"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        )}
                        <Link
                          href={`/admin/bai-viet/${art.id}/chinh-sua`}
                          className="p-1 text-blue-600 hover:text-blue-800 font-medium"
                          title="Sửa / Biên tập"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
