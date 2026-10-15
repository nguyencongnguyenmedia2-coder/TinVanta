import React from 'react';
import Link from 'next/link';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  Eye, 
  PlusCircle, 
  TrendingUp, 
  AlertCircle,
  Megaphone,
  ArrowUpRight
} from 'lucide-react';
import { getPublishedArticles, getCategories } from '@/lib/data/articles';
import { MOCK_ARTICLES, MOCK_AD_CREATIVES } from '@/lib/data/mock-data';
import { formatDateVN } from '@/lib/utils';

export default async function AdminDashboardPage() {
  const { articles, total } = await getPublishedArticles({ limit: 10 });
  const categories = await getCategories();

  // Metrics tính toán
  const totalArticles = MOCK_ARTICLES.length;
  const publishedCount = MOCK_ARTICLES.filter(a => a.status === 'published').length;
  const pendingCount = MOCK_ARTICLES.filter(a => a.status === 'pending_review').length;
  const draftCount = MOCK_ARTICLES.filter(a => a.status === 'draft').length;
  const totalViews = MOCK_ARTICLES.reduce((acc, curr) => acc + curr.view_count, 0);
  const activeAdsCount = MOCK_AD_CREATIVES.filter(ad => ad.is_active).length;

  return (
    <div className="space-y-6">
      {/* 1. DASHBOARD HEADER & QUICK ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#172033]">
            Bảng Điều Khiển Tòa Soạn
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Tổng hợp dữ liệu vận hành nội dung, hiệu suất chuyên mục và lượt đọc theo thời gian thực.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/bai-viet/tao-moi"
            className="bg-[#D71920] hover:bg-[#b8141a] text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            Soạn bài mới
          </Link>
        </div>
      </div>

      {/* 2. KPI METRICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng bài viết */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold">Tổng bài viết</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-[#172033]">{totalArticles}</p>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center">
            <TrendingUp className="w-3 h-3 mr-0.5" /> +12% so với tháng trước
          </span>
        </div>

        {/* Card 2: Đã xuất bản */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold">Đã xuất bản</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-[#172033]">{publishedCount}</p>
          <span className="text-[11px] text-gray-500">Đang hiển thị trên trang chủ</span>
        </div>

        {/* Card 3: Chờ duyệt */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold">Chờ duyệt (Hàng đợi)</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">{pendingCount}</p>
          <span className="text-[11px] text-amber-600 font-medium">Cần BTV xử lý</span>
        </div>

        {/* Card 4: Tổng lượt xem */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold">Lượt xem tích lũy</span>
            <Eye className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-[#172033]">{totalViews.toLocaleString()}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Bảo đảm Core Web Vitals</span>
        </div>
      </div>

      {/* 3. BẢNG TOP BÀI VIẾT NỔI BẬT & RECENT AUDIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Bài Viết */}
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <h3 className="font-bold text-sm text-[#172033]">
              Bài viết hiệu suất cao nhất
            </h3>
            <Link href="/admin/bai-viet" className="text-xs text-red-600 hover:underline flex items-center">
              Xem tất cả <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-3">Tiêu đề bài viết</th>
                  <th className="py-2.5 px-3">Chuyên mục</th>
                  <th className="py-2.5 px-3">Tác giả</th>
                  <th className="py-2.5 px-3 text-right">Lượt đọc</th>
                  <th className="py-2.5 px-3 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {MOCK_ARTICLES.slice(0, 5).map((art) => (
                  <tr key={art.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-3 font-semibold text-gray-800 max-w-xs truncate">
                      <Link href={`/admin/bai-viet/${art.id}/chinh-sua`} className="hover:text-red-700">
                        {art.title}
                      </Link>
                    </td>
                    <td className="py-3 px-3 text-gray-600">
                      {art.category?.name || 'Thời sự'}
                    </td>
                    <td className="py-3 px-3 text-gray-600">
                      {art.author?.full_name}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-gray-800">
                      {art.view_count.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        Xuất bản
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cột Phải: Trạng Thái Tòa Soạn & Chiến Dịch Quảng Cáo */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-[#172033] border-b border-gray-100 pb-2">
              Hoạt động tòa soạn gần đây
            </h3>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5 text-gray-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                <div>
                  <p className="font-medium text-gray-800">Xuất bản bài viết vi mạch bán dẫn</p>
                  <p className="text-[10px] text-gray-400">Bởi BTV Lê Thanh Mai • 2 giờ trước</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5 text-gray-600">
                <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                <div>
                  <p className="font-medium text-gray-800">Biên tập viên yêu cầu bổ sung nguồn số liệu</p>
                  <p className="text-[10px] text-gray-400">Bài viết hạ tầng sạc • 4 giờ trước</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5 text-gray-600">
                <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
                <div>
                  <p className="font-medium text-gray-800">Cập nhật chiến dịch banner tài trợ Header</p>
                  <p className="text-[10px] text-gray-400">Bởi Ads Manager • Hôm qua</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-[#172033] to-[#25324d] text-white p-5 rounded-xl shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Megaphone className="w-4 h-4" />
              Chiến dịch Ads Engine
            </div>
            <p className="text-xl font-bold">{activeAdsCount} vị trí đang phát</p>
            <p className="text-xs text-gray-300">
              Kiểm soát click fraud và bảo vệ quyền riêng tư người xem.
            </p>
            <Link
              href="/admin/quang-cao"
              className="inline-block text-xs font-semibold text-amber-300 hover:text-amber-200 hover:underline pt-2"
            >
              Xem chi tiết chiến dịch →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
