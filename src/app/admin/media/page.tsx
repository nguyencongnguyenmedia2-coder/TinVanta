'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  UploadCloud, 
  Search, 
  Image as ImageIcon, 
  Copy, 
  Check, 
  Trash2, 
  Eye, 
  FileCheck,
  ExternalLink,
  PlusCircle,
  FileText
} from 'lucide-react';
import { MediaAsset, Article } from '@/types/database';

interface LinkedMediaAsset extends MediaAsset {
  usedInArticleTitle?: string;
  usedInArticleSlug?: string;
  usedInArticleId?: string;
}

const INITIAL_MEDIA: LinkedMediaAsset[] = [
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
  const [mediaList, setMediaList] = useState<LinkedMediaAsset[]>(INITIAL_MEDIA);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<LinkedMediaAsset | null>(INITIAL_MEDIA[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Tự động quét và tổng hợp ảnh từ toàn bộ bài viết trong hệ thống
  useEffect(() => {
    async function loadMediaFromArticles() {
      try {
        const res = await fetch('/api/admin/articles');
        const data = await res.json();
        if (data.success && Array.isArray(data.articles)) {
          const articleMedia: LinkedMediaAsset[] = [];
          const seenUrls = new Set<string>(INITIAL_MEDIA.map(m => m.public_url));

          for (const art of data.articles as Article[]) {
            const img = art.featured_image;
            if (img && img.public_url && !seenUrls.has(img.public_url)) {
              seenUrls.add(img.public_url);
              articleMedia.push({
                id: img.id || `m-art-${art.id}`,
                filename: img.filename || 'article-featured.jpg',
                storage_path: img.storage_path || 'articles/featured.jpg',
                public_url: img.public_url,
                mime_type: img.mime_type || 'image/jpeg',
                file_size: img.file_size || 350000,
                width: img.width || 1200,
                height: img.height || 800,
                alt_text: img.alt_text || art.title,
                caption: img.caption || art.title,
                credit: img.credit || `Nguồn: ${art.author?.full_name || 'Tòa soạn'}`,
                created_at: art.created_at || new Date().toISOString(),
                usedInArticleTitle: art.title,
                usedInArticleSlug: art.slug,
                usedInArticleId: art.id,
              });
            }
          }

          if (articleMedia.length > 0) {
            setMediaList(prev => [...articleMedia, ...prev]);
            setSelectedAsset(articleMedia[0]);
          }
        }
      } catch (err) {
        console.error('Lỗi tải media từ bài viết:', err);
      }
    }
    loadMediaFromArticles();
  }, []);

  const filtered = mediaList.filter(m => 
    m.filename.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (m.caption && m.caption.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (m.usedInArticleTitle && m.usedInArticleTitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSimulateUpload = () => {
    const url = window.prompt('Nhập URL hình ảnh tải lên thư viện:');
    if (!url) return;
    const name = window.prompt('Nhập tên ảnh (vd: hoi-nghi-kinh-te.jpg):', 'photo-asset.jpg') || 'photo-asset.jpg';

    const newAsset: LinkedMediaAsset = {
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
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-black text-[#172033] flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#D71920]" />
            Thư Viện Media Báo Chí & Kho Tư Liệu
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Tự động tổng hợp hình ảnh từ bài viết AI cào tin, bài phóng viên và quản lý bản quyền tác nghiệp.
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
          <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm ảnh theo tên, chú thích hoặc bài viết đang dùng..."
                className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D71920]"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2" />
            </div>
            <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
              {filtered.length} tài nguyên media
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[600px] overflow-y-auto p-1">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedAsset(item)}
                className={`relative group rounded-lg overflow-hidden border-2 cursor-pointer transition-all aspect-video bg-gray-100 ${
                  selectedAsset?.id === item.id 
                    ? 'border-[#D71920] ring-2 ring-red-500/20' 
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                <img
                  src={item.public_url}
                  alt={item.alt_text || item.filename}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {item.usedInArticleTitle && (
                  <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded backdrop-blur-xs font-semibold max-w-[90%] truncate">
                    Bài viết
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Media Details Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {selectedAsset ? (
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                <img
                  src={selectedAsset.public_url}
                  alt={selectedAsset.alt_text || ''}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h3 className="font-bold text-sm text-[#172033] break-all">
                  {selectedAsset.filename}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedAsset.caption || 'Chưa có chú thích'}
                </p>
              </div>

              {/* Thông tin liên kết bài viết đang sử dụng */}
              {selectedAsset.usedInArticleTitle && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-xs space-y-1">
                  <div className="font-bold text-blue-900 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    Đang dùng trong bài viết:
                  </div>
                  <p className="text-blue-800 line-clamp-2 font-medium">
                    {selectedAsset.usedInArticleTitle}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    {selectedAsset.usedInArticleSlug && (
                      <Link
                        href={`/bai-viet/${selectedAsset.usedInArticleSlug}`}
                        target="_blank"
                        className="text-[11px] text-blue-700 hover:underline flex items-center gap-0.5 font-bold"
                      >
                        Xem bài ngoài web <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                    {selectedAsset.usedInArticleId && (
                      <Link
                        href={`/admin/bai-viet/${selectedAsset.usedInArticleId}/chinh-sua`}
                        className="text-[11px] text-red-600 hover:underline font-bold"
                      >
                        Sửa bài trong CMS →
                      </Link>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2 border-t border-gray-100 pt-3 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Credit bản quyền:</span>
                  <span className="font-medium text-gray-800">{selectedAsset.credit || 'NEWSHUB'}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Kích thước:</span>
                  <span className="font-medium text-gray-800">{selectedAsset.width} x {selectedAsset.height} px</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(selectedAsset.public_url, selectedAsset.id)}
                  className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copiedId === selectedAsset.id ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      Đã sao chép link ảnh!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Sao chép URL hình ảnh
                    </>
                  )}
                </button>

                <Link
                  href="/admin/bai-viet/tao-moi"
                  className="w-full py-2 bg-[#D71920] hover:bg-[#b8141a] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  Soạn bài mới với ảnh này
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-xs text-gray-400">
              Chọn một hình ảnh bên trái để xem thông tin chi tiết và bài viết liên kết.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
