'use client';

import React, { useState } from 'react';
import { MOCK_CATEGORIES } from '@/lib/data/mock-data';
import { FolderTree, Plus, Edit, Eye, EyeOff } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState(MOCK_CATEGORIES);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-black text-[#172033]">
            Quản Lý Chuyên Mục Tin Tức
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Cấu hình thứ tự thanh điều hướng, metadata SEO và trạng thái hiển thị của các ban chuyên môn.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('Mở form tạo chuyên mục mới')}
          className="bg-[#D71920] hover:bg-[#b8141a] text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Thêm chuyên mục
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200">
            <tr>
              <th className="py-3 px-4">Thứ tự</th>
              <th className="py-3 px-4">Tên chuyên mục</th>
              <th className="py-3 px-4">Đường dẫn (Slug)</th>
              <th className="py-3 px-4">Mô tả tóm tắt</th>
              <th className="py-3 px-4 text-center">Hiển thị menu</th>
              <th className="py-3 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((cat, idx) => (
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
                <td className="py-3 px-4 text-gray-600 max-w-xs truncate">
                  {cat.description || 'Chưa có mô tả'}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <Eye className="w-3 h-3" /> Hiển thị
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button 
                    type="button" 
                    className="p-1 text-blue-600 hover:text-blue-800 font-medium"
                    onClick={() => alert(`Chỉnh sửa chuyên mục: ${cat.name}`)}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
