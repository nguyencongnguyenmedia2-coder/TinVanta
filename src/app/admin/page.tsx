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
  ArrowUpRight,
  Sparkles,
  FolderTree,
  Tags,
  Image as ImageIcon,
  MessageSquare,
  Users,
  Settings,
  History,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { getAllCombinedArticles } from '@/lib/data/article-store';
import { getCategories } from '@/lib/data/articles';
import { MOCK_AD_CREATIVES } from '@/lib/data/mock-data';
import { formatDateVN } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const allArticles = getAllCombinedArticles();
  const categories = await getCategories();

  // Metrics tính toán thực tế từ kho dữ liệu
  const totalArticles = allArticles.length;
  const publishedCount = allArticles.filter(a => a.status === 'published').length;
  const pendingCount = allArticles.filter(a => a.status === 'pending_review').length;
  const draftCount = allArticles.filter(a => a.status === 'draft').length;
  const aiCount = allArticles.filter(a => a.author?.email?.includes('ai') || a.id.startsWith('crawl-')).length;
  const totalViews = allArticles.reduce((acc, curr) => acc + (curr.view_count || 0), 0);
  const activeAdsCount = MOCK_AD_CREATIVES.filter(ad => ad.is_active).length;

  // Bài viết lượt xem cao nhất
  const topArticles = [...allArticles]
    .filter(a => a.status === 'published')
    .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
    .slice(0, 5);

  // Bài viết mới cập nhật hoặc chờ duyệt
  const recentQueue = [...allArticles]
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* 1. DASHBOARD HEADER & QUICK ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#172033]">
            Bảng Điều Khiển Tòa Soạn Tổng Hợp
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Trung tâm kết nối và điều phối các bộ phận: Biên tập, Tự động hóa AI, Chuyên mục, Quảng cáo và Bạn đọc.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/admin/tu-dong-viet-bai"
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Sparkles className="w-4 h-4" />
            ⚡ Cào tin & Viết bài AI
          </Link>

          <Link
            href="/admin/bai-viet/tao-moi"
            className="bg-[#D71920] hover:bg-[#b8141a] text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            Soạn bài mới
          </Link>
        </div>
      </div>

      {/* 2. KPI METRICS CARDS (LIÊN KẾT TRỰC TIẾP TỚI CÁC TRANG QUẢN LÝ) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng bài viết */}
        <Link 
          href="/admin/bai-viet"
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-2 hover:border-blue-400 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold group-hover:text-blue-600">Tổng bài viết</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-[#172033]">{totalArticles}</p>
          <span className="text-[11px] text-gray-500 flex items-center">
            {aiCount} bài do AI viết • {totalArticles - aiCount} bài BTV
          </span>
        </Link>

        {/* Card 2: Đã xuất bản */}
        <Link 
          href="/admin/bai-viet?status=published"
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-2 hover:border-emerald-400 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold group-hover:text-emerald-600">Đã xuất bản</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600">{publishedCount}</p>
          <span className="text-[11px] text-gray-500">Đang hiển thị công khai trên website</span>
        </Link>

        {/* Card 3: Chờ duyệt */}
        <Link 
          href="/admin/bai-viet?status=pending_review"
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-2 hover:border-amber-400 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold group-hover:text-amber-600">Chờ duyệt (Hàng đợi)</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">{pendingCount}</p>
          <span className="text-[11px] text-amber-600 font-medium flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Cần BTV xử lý xuất bản →
          </span>
        </Link>

        {/* Card 4: Tổng lượt xem */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold">Lượt xem tích lũy</span>
            <Eye className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-[#172033]">{totalViews.toLocaleString()}</p>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center">
            <TrendingUp className="w-3 h-3 mr-0.5" /> Đồng bộ thời gian thực
          </span>
        </div>
      </div>

      {/* 3. BẢN ĐỒ LIÊN KẾT NHANH CÁC BỘ PHẬN TÒA SOẠN */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
          Chuỗi liên kết các bộ phận điều hành tòa soạn
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            href="/admin/bai-viet"
            className="p-3 bg-gray-50 hover:bg-red-50 hover:border-red-200 border border-gray-200 rounded-lg text-center transition-all group"
          >
            <FileText className="w-5 h-5 mx-auto text-gray-600 group-hover:text-red-600 mb-1" />
            <div className="text-xs font-bold text-gray-800 group-hover:text-red-700">Ban Biên Tập</div>
            <div className="text-[10px] text-gray-400">{totalArticles} bài viết</div>
          </Link>

          <Link
            href="/admin/tu-dong-viet-bai"
            className="p-3 bg-gray-50 hover:bg-purple-50 hover:border-purple-200 border border-gray-200 rounded-lg text-center transition-all group"
          >
            <Sparkles className="w-5 h-5 mx-auto text-gray-600 group-hover:text-purple-600 mb-1" />
            <div className="text-xs font-bold text-gray-800 group-hover:text-purple-700">Tự động hóa AI</div>
            <div className="text-[10px] text-purple-600 font-medium">Cào báo & Rewrite</div>
          </Link>

          <Link
            href="/admin/chuyen-muc"
            className="p-3 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 border border-gray-200 rounded-lg text-center transition-all group"
          >
            <FolderTree className="w-5 h-5 mx-auto text-gray-600 group-hover:text-blue-600 mb-1" />
            <div className="text-xs font-bold text-gray-800 group-hover:text-blue-700">Chuyên Mục</div>
            <div className="text-[10px] text-gray-400">{categories.length} chuyên mục</div>
          </Link>

          <Link
            href="/admin/media"
            className="p-3 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-200 border border-gray-200 rounded-lg text-center transition-all group"
          >
            <ImageIcon className="w-5 h-5 mx-auto text-gray-600 group-hover:text-emerald-600 mb-1" />
            <div className="text-xs font-bold text-gray-800 group-hover:text-emerald-700">Thư Viện Media</div>
            <div className="text-[10px] text-gray-400">Ảnh báo & Tư liệu</div>
          </Link>

          <Link
            href="/admin/quang-cao"
            className="p-3 bg-gray-50 hover:bg-amber-50 hover:border-amber-200 border border-gray-200 rounded-lg text-center transition-all group"
          >
            <Megaphone className="w-5 h-5 mx-auto text-gray-600 group-hover:text-amber-600 mb-1" />
            <div className="text-xs font-bold text-gray-800 group-hover:text-amber-700">Chiến Dịch Ads</div>
            <div className="text-[10px] text-gray-400">{activeAdsCount} vị trí banner</div>
          </Link>

          <Link
            href="/admin/binh-luan"
            className="p-3 bg-gray-50 hover:bg-rose-50 hover:border-rose-200 border border-gray-200 rounded-lg text-center transition-all group"
          >
            <MessageSquare className="w-5 h-5 mx-auto text-gray-600 group-hover:text-rose-600 mb-1" />
            <div className="text-xs font-bold text-gray-800 group-hover:text-rose-700">Bạn Đọc & Comment</div>
            <div className="text-[10px] text-gray-400">Kiểm duyệt độc giả</div>
          </Link>
        </div>
      </div>

      {/* 4. BẢNG TOP BÀI VIẾT NỔI BẬT & DANH SÁCH HÀNG ĐỢI GẦN ĐÂY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Bài Viết */}
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-bold text-sm text-[#172033] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Bài viết hiệu suất cao nhất
            </h3>
            <Link href="/admin/bai-viet" className="text-xs text-red-600 hover:underline flex items-center font-medium">
              Xem tất cả bài viết <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
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
                {topArticles.map((art) => {
                  const isAi = art.author?.email?.includes('ai') || art.id.startsWith('crawl-');
                  return (
                    <tr key={art.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-3 font-semibold text-gray-800 max-w-xs truncate">
                        <div className="flex items-center gap-1.5">
                          {isAi && (
                            <span className="bg-purple-100 text-purple-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded shrink-0">
                              AI
                            </span>
                          )}
                          <Link href={`/admin/bai-viet/${art.id}/chinh-sua`} className="hover:text-red-700 truncate">
                            {art.title}
                          </Link>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-gray-600 whitespace-nowrap">
                        <Link href={`/admin/chuyen-muc`} className="hover:underline">
                          {art.category?.name || 'Thời sự'}
                        </Link>
                      </td>
                      <td className="py-3 px-3 text-gray-600 whitespace-nowrap">
                        {art.author?.full_name || 'Tòa soạn'}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-gray-800">
                        {(art.view_count || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          Xuất bản
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cột Phải: Hàng đợi kiểm duyệt & Chiến dịch Ads */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="font-bold text-sm text-[#172033] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" />
                Bài mới cập nhật gần đây
              </h3>
              <Link href="/admin/bai-viet?status=pending_review" className="text-[11px] text-amber-600 hover:underline">
                Xem chờ duyệt
              </Link>
            </div>

            <ul className="space-y-2.5 text-xs">
              {recentQueue.map((art) => (
                <li key={art.id} className="flex items-start justify-between gap-2 p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors">
                  <div className="min-w-0">
                    <Link 
                      href={`/admin/bai-viet/${art.id}/chinh-sua`}
                      className="font-medium text-gray-800 hover:text-red-600 line-clamp-1"
                    >
                      {art.title}
                    </Link>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {formatDateVN(art.created_at, 'dd/MM HH:mm')} • {art.category?.name || 'Tin tức'}
                    </p>
                  </div>
                  <span className={`shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    art.status === 'published' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : art.status === 'pending_review'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {art.status === 'published' ? 'Đã đăng' : art.status === 'pending_review' ? 'Chờ duyệt' : 'Nháp'}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-[#172033] to-[#25324d] text-white p-5 rounded-xl shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Megaphone className="w-4 h-4" />
              Chiến dịch Ads & Doanh thu
            </div>
            <p className="text-xl font-bold">{activeAdsCount} vị trí banner đang chạy</p>
            <p className="text-xs text-gray-300">
              Kiểm soát click fraud, theo dõi tỷ lệ CTR và hiển thị theo chuyên mục bài viết.
            </p>
            <Link
              href="/admin/quang-cao"
              className="inline-block text-xs font-semibold text-amber-300 hover:text-amber-200 hover:underline pt-2"
            >
              Quản lý vị trí quảng cáo →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
