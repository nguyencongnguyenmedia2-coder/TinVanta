'use client';

import React, { useState, useEffect, Suspense, useTransition } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
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
  ExternalLink,
  Sparkles,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Tag
} from 'lucide-react';
import { Article, ArticleStatus } from '@/types/database';
import { MOCK_CATEGORIES } from '@/lib/data/mock-data';
import { formatDateVN } from '@/lib/utils';

function AdminArticlesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Đọc query parameters ban đầu nếu được dẫn từ trang khác
  const rawCategory = searchParams.get('category') || 'all';
  const matchedCat = MOCK_CATEGORIES.find(c => c.id === rawCategory || c.slug === rawCategory);
  const initialCategory = matchedCat ? matchedCat.slug : rawCategory;
  const initialStatus = searchParams.get('status') || 'all';
  const initialTag = searchParams.get('tag') || '';

  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState({ total: 0, published: 0, pending: 0, draft: 0, aiCount: 0 });
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>(initialTag);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedStatus !== 'all') params.set('status', selectedStatus);
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (selectedSource !== 'all') params.set('source', selectedSource);
      if (tagFilter) params.set('tag', tagFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/admin/articles?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setArticles(data.articles || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách bài viết:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [selectedStatus, selectedCategory, selectedSource, tagFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchArticles();
  };

  // Nhanh chóng thay đổi trạng thái bài viết (Duyệt xuất bản / Hạ xuống nháp)
  const handleQuickStatusChange = async (articleId: string, newStatus: ArticleStatus) => {
    try {
      const res = await fetch('/api/admin/articles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: articleId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(newStatus === 'published' ? 'Đã duyệt xuất bản bài viết thành công!' : 'Đã chuyển bài viết về bản nháp.');
        fetchArticles();
      } else {
        alert(data.error || 'Có lỗi xảy ra khi đổi trạng thái.');
      }
    } catch (err: any) {
      alert('Không thể kết nối đến máy chủ.');
    }
  };

  // Xóa bài viết
  const handleDeleteArticle = async (article: Article) => {
    if (!confirm(`Bạn có chắc muốn xóa bài viết: "${article.title}"?`)) return;

    // Cập nhật lạc quan (Optimistic update) để bài viết biến mất khỏi bảng ngay lập tức
    setArticles(prev => prev.filter(a => a.id !== article.id && a.slug !== article.slug));

    try {
      const res = await fetch(`/api/admin/articles?id=${encodeURIComponent(article.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('Đã xóa bài viết thành công.');
        fetchArticles();
      } else {
        alert(data.error || 'Không thể xóa bài viết.');
        fetchArticles();
      }
    } catch {
      alert('Lỗi kết nối máy chủ.');
      fetchArticles();
    }
  };

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
      default:
        return <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">{status}</span>;
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

      {/* 1. TOP HEADER & QUICK WORKFLOW ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-black text-[#172033] flex items-center gap-2">
            Quản Lý Bài Viết & Quy Trình Xuất Bản
            {tagFilter && (
              <span className="text-xs bg-red-100 text-red-700 font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Tag className="w-3 h-3" /> #{tagFilter}
                <button onClick={() => setTagFilter('')} className="hover:text-red-900 ml-1">×</button>
              </span>
            )}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Trung tâm kiểm duyệt tin bài: Cào tin tự động từ AI, BTV duyệt đăng và phát hành lên website.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/admin/tu-dong-viet-bai"
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Sparkles className="w-4 h-4" />
            ⚡ Cào tin & Viết bài AI
          </Link>

          <Link
            href="/admin/bai-viet/tao-moi"
            className="bg-[#D71920] hover:bg-[#b8141a] text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Viết bài mới
          </Link>
        </div>
      </div>

      {/* 2. STATS PILLS (BẤM ĐỂ LỌC TRẠNG THÁI NHANH) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => setSelectedStatus('all')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedStatus === 'all' 
              ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20' 
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
        >
          <div className="text-[11px] text-gray-500 font-medium">Tất cả bài viết</div>
          <div className="text-xl font-black text-[#172033] mt-0.5">{stats.total}</div>
        </button>

        <button
          onClick={() => setSelectedStatus('published')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedStatus === 'published' 
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20' 
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
        >
          <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Đã xuất bản
          </div>
          <div className="text-xl font-black text-emerald-700 mt-0.5">{stats.published}</div>
        </button>

        <button
          onClick={() => setSelectedStatus('pending_review')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedStatus === 'pending_review' 
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20' 
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
        >
          <div className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Chờ duyệt
          </div>
          <div className="text-xl font-black text-amber-700 mt-0.5">{stats.pending}</div>
        </button>

        <button
          onClick={() => setSelectedStatus('draft')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedStatus === 'draft' 
              ? 'bg-gray-100 border-gray-400 ring-2 ring-gray-500/20' 
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
        >
          <div className="text-[11px] text-gray-600 font-semibold flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" /> Bản nháp
          </div>
          <div className="text-xl font-black text-gray-700 mt-0.5">{stats.draft}</div>
        </button>

        <button
          onClick={() => setSelectedSource(selectedSource === 'ai' ? 'all' : 'ai')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedSource === 'ai' 
              ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500/20' 
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
        >
          <div className="text-[11px] text-purple-700 font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Do AI Cào & Viết
          </div>
          <div className="text-xl font-black text-purple-700 mt-0.5">{stats.aiCount}</div>
        </button>
      </div>

      {/* 3. FILTERS BAR */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tiêu đề, sapo hoặc từ khóa..."
            className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D71920]"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <button type="submit" className="absolute right-2.5 top-2 text-[10px] bg-gray-200 hover:bg-gray-300 px-2 py-0.5 rounded font-bold text-gray-700">
            Tìm
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {/* Lọc trạng thái bài viết */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D71920]"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đã xuất bản</option>
            <option value="pending_review">Chờ duyệt (Hàng đợi)</option>
            <option value="draft">Bản nháp</option>
            <option value="changes_requested">Yêu cầu sửa</option>
          </select>

          {/* Lọc chuyên mục */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D71920]"
          >
            <option value="all">Tất cả chuyên mục (Đầy đủ)</option>
            {MOCK_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Lọc nguồn */}
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D71920]"
          >
            <option value="all">Tất cả nguồn</option>
            <option value="ai">⚡ AI Crawler tự động</option>
            <option value="editorial">✍️ Phóng viên / Tòa soạn</option>
          </select>

          {/* Nút reset / refresh */}
          <button
            onClick={() => {
              setSelectedStatus('all');
              setSelectedCategory('all');
              setSelectedSource('all');
              setTagFilter('');
              setSearchQuery('');
              fetchArticles();
            }}
            className="p-2 border border-gray-200 hover:bg-gray-50 rounded-lg text-gray-500 text-xs flex items-center gap-1"
            title="Làm mới bộ lọc"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. ARTICLES TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Tiêu đề bài viết</th>
                <th className="py-3 px-4">Chuyên mục</th>
                <th className="py-3 px-4">Tác giả & Nguồn</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4">Ngày cập nhật</th>
                <th className="py-3 px-4 text-right">Lượt đọc</th>
                <th className="py-3 px-4 text-right">Hành động duyệt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-gray-400" />
                    Đang nạp dữ liệu bài viết tòa soạn...
                  </td>
                </tr>
              ) : articles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    Không tìm thấy bài viết nào thỏa mãn điều kiện lọc.
                  </td>
                </tr>
              ) : (
                articles.map((art) => {
                  const isAi = art.author?.email?.includes('ai') || art.id.startsWith('crawl-');

                  return (
                    <tr key={art.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 px-4 max-w-sm">
                        <div className="font-bold text-gray-900 line-clamp-1 flex items-center gap-1.5">
                          {isAi && (
                            <span className="shrink-0 bg-purple-100 text-purple-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                              AI
                            </span>
                          )}
                          <Link 
                            href={`/admin/bai-viet/${art.id}/chinh-sua`}
                            className="hover:text-red-700 transition-colors"
                          >
                            {art.title}
                          </Link>
                        </div>
                        <div className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                          {art.sapo}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-gray-600 font-medium whitespace-nowrap">
                        <Link 
                          href={`/admin/chuyen-muc`}
                          className="hover:text-red-700"
                        >
                          {art.category?.name || 'Thời sự'}
                        </Link>
                      </td>

                      <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                        <div className="font-medium text-gray-800">
                          {art.author?.full_name || 'Tòa soạn'}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {isAi ? 'Hệ thống tự động' : 'Phóng viên'}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {getStatusBadge(art.status)}
                      </td>

                      <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                        {formatDateVN(art.published_at || art.created_at, 'dd/MM/yyyy HH:mm')}
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-gray-800 whitespace-nowrap">
                        {(art.view_count || 0).toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1-Click Publish / Duyệt xuất bản */}
                          {art.status !== 'published' ? (
                            <button
                              type="button"
                              onClick={() => handleQuickStatusChange(art.id, 'published')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded flex items-center gap-1 transition-colors shadow-2xs"
                              title="Duyệt xuất bản ngay lên website"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Duyệt đăng
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleQuickStatusChange(art.id, 'draft')}
                              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-medium rounded transition-colors"
                              title="Gỡ bài xuống bản nháp"
                            >
                              Hạ bài
                            </button>
                          )}

                          {/* Link xem bài trên website công khai */}
                          {art.status === 'published' && (
                            <Link
                              href={`/bai-viet/${art.slug}`}
                              target="_blank"
                              className="p-1 text-gray-400 hover:text-gray-700"
                              title="Xem bài viết trên website"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          )}

                          {/* Chỉnh sửa */}
                          <Link
                            href={`/admin/bai-viet/${art.id}/chinh-sua`}
                            className="p-1 text-blue-600 hover:text-blue-800 font-medium"
                            title="Sửa / Biên tập nội dung"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {/* Xóa bài */}
                          <button
                            type="button"
                            onClick={() => handleDeleteArticle(art)}
                            className="p-1 text-red-500 hover:text-red-700 font-medium"
                            title="Xóa bài viết"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminArticlesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">Đang tải quản lý tin bài...</div>}>
      <AdminArticlesContent />
    </Suspense>
  );
}
