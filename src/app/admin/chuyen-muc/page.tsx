'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MOCK_CATEGORIES } from '@/lib/data/mock-data';
import { 
  FolderTree, 
  Plus, 
  Edit, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  FileText, 
  CheckCircle2, 
  X,
  Search
} from 'lucide-react';
import { Category, Article } from '@/types/database';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [articleCounts, setArticleCounts] = useState<Record<string, number>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Tính số bài viết thực tế cho từng chuyên mục từ API bài viết
  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/admin/articles');
        const data = await res.json();
        if (data.success && Array.isArray(data.articles)) {
          const counts: Record<string, number> = {};
          for (const art of data.articles as Article[]) {
            const catId = art.primary_category_id || art.category?.id;
            if (catId) {
              counts[catId] = (counts[catId] || 0) + 1;
            }
          }
          setArticleCounts(counts);
        }
      } catch (err) {
        console.error('Lỗi tính số bài chuyên mục:', err);
      }
    }
    loadStats();
  }, []);

  const toggleVisibility = (id: string) => {
    setCategories(cats => cats.map(c => c.id === id ? { ...c, is_active: !c.is_active } : c));
    showToast('Đã cập nhật trạng thái hiển thị chuyên mục.');
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const slug = newCatName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      slug,
      description: newCatDesc.trim() || undefined,
      sort_order: categories.length + 1,
      is_active: true,
      show_in_menu: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setCategories([...categories, newCat]);
    setNewCatName('');
    setNewCatDesc('');
    setShowAddModal(false);
    showToast(`Đã thêm chuyên mục "${newCat.name}" thành công!`);
  };

  const filtered = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#172033] text-white text-xs px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 border border-gray-700 animate-in fade-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-black text-[#172033] flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-[#D71920]" />
            Quản Lý Chuyên Mục Tin Tức
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Phân loại luồng thông tin, đồng bộ với thanh điều hướng chính và quản lý phân quyền theo ban chuyên môn.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="bg-[#D71920] hover:bg-[#b8141a] text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Thêm chuyên mục mới
        </button>
      </div>

      {/* 2. SEARCH & STATS BAR */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm chuyên mục..."
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D71920]"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        <div className="text-xs text-gray-500 flex items-center gap-3">
          <span>Tổng số: <strong className="text-[#172033]">{categories.length}</strong> chuyên mục</span>
          <span>•</span>
          <Link href="/admin/bai-viet" className="text-red-600 hover:underline flex items-center gap-1 font-medium">
            <FileText className="w-3.5 h-3.5" /> Xem toàn bộ bài viết
          </Link>
        </div>
      </div>

      {/* 3. CATEGORIES TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200">
            <tr>
              <th className="py-3 px-4">Thứ tự</th>
              <th className="py-3 px-4">Tên chuyên mục</th>
              <th className="py-3 px-4">Đường dẫn (Slug)</th>
              <th className="py-3 px-4 text-center">Số bài viết</th>
              <th className="py-3 px-4">Mô tả tóm tắt</th>
              <th className="py-3 px-4 text-center">Hiển thị Menu</th>
              <th className="py-3 px-4 text-right">Thao tác liên kết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((cat, idx) => {
              const count = articleCounts[cat.id] || 0;
              return (
                <tr key={cat.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-gray-500">
                    #{cat.sort_order || idx + 1}
                  </td>
                  <td className="py-3 px-4 font-bold text-gray-900">
                    {cat.name}
                  </td>
                  <td className="py-3 px-4 text-gray-500 font-mono">
                    /chuyen-muc/{cat.slug}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Link
                      href={`/admin/bai-viet?category=${cat.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-full text-[11px] transition-colors"
                      title="Xem danh sách bài viết thuộc chuyên mục này"
                    >
                      <FileText className="w-3 h-3" />
                      {count} bài viết
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-gray-600 max-w-xs truncate">
                    {cat.description || 'Chưa có mô tả'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => toggleVisibility(cat.id)}
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full transition-colors ${
                        cat.is_active 
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {cat.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {cat.is_active ? 'Hiển thị' : 'Đang ẩn'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/chuyen-muc/${cat.slug}`}
                        target="_blank"
                        className="p-1 text-gray-400 hover:text-gray-700"
                        title="Xem trang chuyên mục ngoài website"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/bai-viet?category=${cat.id}`}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Quản lý bài →
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL THÊM CHUYÊN MỤC MỚI */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-black text-[#172033] text-base">Thêm Chuyên Mục Tin Tức Mới</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Tên chuyên mục *
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Ví dụ: Công nghệ Số, Đổi mới sáng tạo..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Mô tả chuyên mục
                </label>
                <textarea
                  rows={3}
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Mô tả tóm tắt định hướng nội dung của chuyên mục..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D71920] hover:bg-[#b8141a] text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                >
                  Tạo chuyên mục
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
