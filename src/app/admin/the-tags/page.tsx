'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MOCK_TAGS } from '@/lib/data/mock-data';
import { Tags, Plus, Trash2, Edit, Search, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { Tag, Article } from '@/types/database';

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>(MOCK_TAGS);
  const [tagCounts, setTagCounts] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Tính số bài viết thực tế cho từng tag
  useEffect(() => {
    async function calculateTagCounts() {
      try {
        const res = await fetch('/api/admin/articles');
        const data = await res.json();
        if (data.success && Array.isArray(data.articles)) {
          const counts: Record<string, number> = {};
          for (const art of data.articles as Article[]) {
            if (Array.isArray(art.tags)) {
              for (const t of art.tags) {
                const slug = t.slug?.toLowerCase();
                if (slug) {
                  counts[slug] = (counts[slug] || 0) + 1;
                }
              }
            }
          }
          setTagCounts(counts);
        }
      } catch (err) {
        console.error('Lỗi tính số bài theo tag:', err);
      }
    }
    calculateTagCounts();
  }, []);

  const filteredTags = tags.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    const slug = newTagName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newTag: Tag = {
      id: `tag-${Date.now()}`,
      name: newTagName.trim(),
      slug,
      article_count: 0,
      created_at: new Date().toISOString()
    };

    setTags([newTag, ...tags]);
    setNewTagName('');
    showToast(`Đã thêm từ khóa #${newTag.name} thành công!`);
  };

  const handleDeleteTag = (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa thẻ từ khóa "${name}"?`)) {
      setTags(tags.filter(t => t.id !== id));
      showToast('Đã xóa thẻ từ khóa.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#172033] text-white text-xs px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 border border-gray-700 animate-in fade-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-black text-[#172033] flex items-center gap-2">
            <Tags className="w-5 h-5 text-[#D71920]" />
            Quản Lý Thẻ Từ Khóa (Tags & SEO Topics)
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Gắn thẻ đa chiều, tối ưu hóa liên kết nội bộ (Internal Linking) và gợi ý chủ đề liên quan cho bạn đọc.
          </p>
        </div>

        <Link
          href="/admin/bai-viet"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <FileText className="w-4 h-4" />
          Xem tất cả bài viết
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form thêm thẻ mới (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4 h-fit">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-100 pb-2">
            Thêm thẻ từ khóa mới
          </h2>

          <form onSubmit={handleAddTag} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Tên thẻ từ khóa *
              </label>
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Ví dụ: Bán dẫn, Năng lượng sạch, AI..."
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#D71920]"
              />
            </div>

            <p className="text-[11px] text-gray-400">
              Thẻ từ khóa sẽ tự sinh slug URL thân thiện với máy tìm kiếm Google và tự động gợi ý khi phóng viên biên tập bài viết.
            </p>

            <button
              type="submit"
              className="w-full bg-[#D71920] hover:bg-[#b8141a] text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Thêm từ khóa mới
            </button>
          </form>
        </div>

        {/* Danh sách thẻ từ khóa (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm thẻ từ khóa..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#D71920]"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2" />
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {filteredTags.length} thẻ
            </span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Tên thẻ từ khóa</th>
                <th className="py-3 px-4">Slug URL</th>
                <th className="py-3 px-4 text-center">Số bài liên kết</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTags.map((tag) => {
                const count = tagCounts[tag.slug.toLowerCase()] || 0;
                return (
                  <tr key={tag.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-900">
                      <span className="text-[#D71920]">#</span> {tag.name}
                    </td>
                    <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                      /tag/{tag.slug}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        href={`/admin/bai-viet?tag=${tag.slug}`}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-full text-[11px] transition-colors"
                        title="Bấm để xem tất cả bài viết mang thẻ này"
                      >
                        <FileText className="w-3 h-3" />
                        {count} bài viết
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/bai-viet?tag=${tag.slug}`}
                          className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-0.5"
                        >
                          Xem bài <ArrowRight className="w-3 h-3" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteTag(tag.id, tag.name)}
                          className="p-1 text-red-500 hover:text-red-700 font-medium"
                          title="Xóa thẻ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
