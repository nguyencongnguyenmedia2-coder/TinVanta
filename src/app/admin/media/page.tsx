'use client';

import React, { useState } from 'react';
import { 
  UploadCloud, 
  Search, 
  Image as ImageIcon, 
  Copy, 
  Check, 
  Trash2, 
  Eye, 
  FileCheck 
} from 'lucide-react';
import { MediaAsset } from '@/types/database';

const INITIAL_MEDIA: MediaAsset[] = [
  {
    id: 'm1',
    filename: 'semiconductor-tech.jpg',
    storage_path: 'articles/semiconductor-tech.jpg',
    public_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
    mime_type: 'image/jpeg',
    file_size: 420000,
    width: 1200,
    height: 800,
    alt_text: 'Dây chuyền thiết kế và chế tạo vi mạch bán dẫn',
    caption: 'Kỹ sư công nghệ làm việc tại phòng thí nghiệm vi mạch bán dẫn tiên tiến',
    credit: 'Ảnh: NEWSHUB / Lê Mai',
    created_at: '2026-10-15T00:00:00.000Z'
  },
  {
    id: 'm2',
    filename: 'high-speed-rail.jpg',
    storage_path: 'articles/high-speed-rail.jpg',
    public_url: 'https://images.unsplash.com/photo-1541427468627-a89a96e5ca1d?w=1200&auto=format&fit=crop&q=80',
    mime_type: 'image/jpeg',
    file_size: 512000,
    width: 1200,
    height: 800,
    alt_text: 'Đoàn tàu tốc độ cao hiện đại',
    caption: 'Phối cảnh đoàn tàu tốc độ cao vận hành trên cầu cạn',
    credit: 'Ảnh: Tư liệu NEWSHUB',
    created_at: '2026-10-15T00:00:00.000Z'
  },
  {
    id: 'm3',
    filename: 'green-economy.jpg',
    storage_path: 'articles/green-economy.jpg',
    public_url: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=1200&auto=format&fit=crop&q=80',
    mime_type: 'image/jpeg',
    file_size: 480000,
    width: 1200,
    height: 800,
    alt_text: 'Trang trại điện gió và năng lượng tái tạo',
    caption: 'Năng lượng tái tạo tạo đòn bẩy cho nền kinh tế carbon thấp',
    credit: 'Ảnh: Tuấn Anh',
    created_at: '2026-10-15T00:00:00.000Z'
  },
  {
    id: 'm4',
    filename: 'ai-healthcare.jpg',
    storage_path: 'articles/ai-healthcare.jpg',
    public_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80',
    mime_type: 'image/jpeg',
    file_size: 410000,
    width: 1200,
    height: 800,
    alt_text: 'Bác sĩ kiểm tra kết quả chẩn đoán trên màn hình',
    caption: 'Bác sĩ sử dụng công cụ AI phân tích hình ảnh hỗ trợ hội chẩn',
    credit: 'Ảnh: Getty / NEWSHUB',
    created_at: '2026-10-15T00:00:00.000Z'
  }
];

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<MediaAsset[]>(INITIAL_MEDIA);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(INITIAL_MEDIA[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = mediaList.filter(m => 
    m.filename.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (m.caption && m.caption.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSimulateUpload = () => {
    const url = window.prompt('Nhập URL hình ảnh tải lên thư viện:');
    if (!url) return;
    const name = window.prompt('Nhập tên file (vd: tech-event.jpg):', 'photo-asset.jpg') || 'photo-asset.jpg';

    const newAsset: MediaAsset = {
      id: `m-${Date.now()}`,
      filename: name,
      storage_path: `articles/${name}`,
      public_url: url,
      mime_type: 'image/jpeg',
      file_size: 350000,
      width: 1200,
      height: 800,
      alt_text: 'Ảnh báo chí mới tải lên',
      caption: 'Ảnh tư liệu tác nghiệp của tòa soạn',
      credit: 'Ảnh: Tòa soạn NEWSHUB',
      created_at: new Date().toISOString()
    };

    setMediaList([newAsset, ...mediaList]);
    setSelectedAsset(newAsset);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-black text-[#172033]">
            Thư Viện Media Báo Chí (Media Library)
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Quản lý tập trung hình ảnh, metadata bản quyền, credit tác giả và tối ưu hóa WebP/AVIF.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSimulateUpload}
          className="bg-[#D71920] hover:bg-[#b8141a] text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors self-start sm:self-auto shadow-xs"
        >
          <UploadCloud className="w-4 h-4" />
          Tải ảnh lên thư viện
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Media Grid (8 cols) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm file theo tên hoặc chú thích..."
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D71920]"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {filtered.length} hình ảnh
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filtered.map((asset) => {
              const isSelected = selectedAsset?.id === asset.id;
              return (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`group relative rounded-lg overflow-hidden border-2 cursor-pointer aspect-square bg-gray-100 transition-all ${
                    isSelected ? 'border-[#D71920] ring-2 ring-red-200' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img
                    src={asset.public_url}
                    alt={asset.alt_text || asset.filename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1.5 text-[10px] text-white truncate backdrop-blur-2xs">
                    {asset.filename}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Media Metadata Inspector (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-100 pb-2">
            Thông tin chi tiết & Bản quyền
          </h2>

          {selectedAsset ? (
            <div className="space-y-4 text-xs">
              <div className="rounded-lg overflow-hidden border border-gray-200 aspect-16/10 bg-gray-50">
                <img
                  src={selectedAsset.public_url}
                  alt={selectedAsset.filename}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <p className="font-bold text-[#172033] text-sm break-all">{selectedAsset.filename}</p>
                <p className="text-[11px] text-gray-400">
                  {selectedAsset.width} x {selectedAsset.height} px • {(selectedAsset.file_size / 1024).toFixed(0)} KB
                </p>
              </div>

              <div>
                <label className="block text-gray-500 text-[11px] font-semibold mb-1">
                  Văn bản thay thế (Alt text cho SEO):
                </label>
                <input
                  type="text"
                  value={selectedAsset.alt_text || ''}
                  onChange={(e) => setSelectedAsset({ ...selectedAsset, alt_text: e.target.value })}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs"
                />
              </div>

              <div>
                <label className="block text-gray-500 text-[11px] font-semibold mb-1">
                  Chú thích ảnh (Caption):
                </label>
                <textarea
                  rows={2}
                  value={selectedAsset.caption || ''}
                  onChange={(e) => setSelectedAsset({ ...selectedAsset, caption: e.target.value })}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs"
                />
              </div>

              <div>
                <label className="block text-gray-500 text-[11px] font-semibold mb-1">
                  Tác quyền (Credit):
                </label>
                <input
                  type="text"
                  value={selectedAsset.credit || ''}
                  onChange={(e) => setSelectedAsset({ ...selectedAsset, credit: e.target.value })}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(selectedAsset.public_url, selectedAsset.id)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copiedId === selectedAsset.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedId === selectedAsset.id ? 'Đã sao chép link' : 'Sao chép URL ảnh'}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-xs">Vui lòng chọn một hình ảnh để xem và chỉnh sửa metadata.</p>
          )}
        </div>
      </div>
    </div>
  );
}
