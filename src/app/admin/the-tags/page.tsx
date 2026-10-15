'use client';

import React, { useState } from 'react';
import { MOCK_TAGS } from '@/lib/data/mock-data';
import { Tags, Plus, Trash2, Edit, Search } from 'lucide-react';

export default function AdminTagsPage() {
  const [tags, setTags] = useState(MOCK_TAGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTagName, setNewTagName] = useState('');

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

    const newTag = {
      id: `tag-${Date.now()}`,
      name: newTagName.trim(),
      slug,
      article_count: 0,
      created_at: new Date().toISOString()
    };

    setTags([newTag, ...tags]);
    setNewTagName('');
  };

  const handleDeleteTag = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa thẻ từ khóa này?')) {
      setTags(tags.filter(t => t.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-black text-[#172033]">
            Quản Lý Thẻ Từ Khóa (Tags)
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Phân loại chủ đề bài viết đa chiều, tăng cường liên kết nội bộ và tối ưu hóa SEO.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form thêm thẻ mới (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
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
                placeholder="Ví dụ: Bán dẫn, Năng lượng sạch..."
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#D71920]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#D71920] hover:bg-[#b8141a] text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Thêm từ khóa
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
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            <span className="text-xs text-gray-500 font-semibold whitespace-nowrap">
              {filteredTags.length} thẻ
            </span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200">
              <tr>
                <th className="py-2.5 px-4">Tên thẻ</th>
                <th className="py-2.5 px-4">Slug URL</th>
                <th className="py-2.5 px-4 text-center">Số bài viết</th>
                <th className="py-2.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTags.map((tag) => (
                <tr key={tag.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-gray-900">
                    #{tag.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-gray-500">
                    /tag/{tag.slug}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full text-[11px]">
                      {tag.article_count}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDeleteTag(tag.id)}
                      className="p-1 text-red-500 hover:text-red-700 transition-colors"
                      title="Xóa thẻ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
