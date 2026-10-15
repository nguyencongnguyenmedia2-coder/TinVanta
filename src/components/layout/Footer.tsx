'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  ShieldCheck, 
  Mail, 
  MapPin, 
  Phone, 
  Newspaper, 
  ArrowUp, 
  Rss, 
  Globe, 
  Award, 
  Bookmark, 
  CheckCircle2,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import { Category } from '@/types/database';

interface FooterProps {
  categories: Category[];
}

export function Footer({ categories }: FooterProps) {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="w-full bg-[#f8f9fa] border-t-2 border-[#D71920] text-gray-700 text-xs mt-16">
      {/* 1. TOP BRANDING & CONTACT HIGHLIGHT BAR */}
      <div className="bg-white border-b border-gray-200 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Logo & Slogan */}
          <div className="space-y-2 max-w-lg">
            <Link href="/" className="inline-block group">
              <div className="relative h-14 w-52 sm:h-16 sm:w-64">
                <Image
                  src="/logo-tinvanta-v2.png"
                  alt="TinVanta — Tin tức nhanh, thông tin chuẩn"
                  fill
                  sizes="(max-width: 640px) 208px, 256px"
                  className="object-contain object-left group-hover:scale-101 transition-transform duration-300"
                />
              </div>
            </Link>
            <p className="text-gray-500 text-xs leading-relaxed">
              Trang tin tức số tổng hợp, phân tích thời sự, kinh tế, công nghệ và xã hội 24/7. Cung cấp thông tin đa chiều, kiểm chứng khách quan và dẫn nguồn chuẩn xác.
            </p>
          </div>

          {/* Quick Communication Contact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/80 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-[#D71920]" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-semibold">Đường dây nóng 24/7</p>
                <p className="font-bold text-sm text-[#172033]">1900 6868</p>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/80 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-semibold">Email Ban Biên Tập</p>
                <a href="mailto:toasoan@tinvanta.vn" className="font-bold text-xs text-[#172033] hover:text-[#D71920]">
                  toasoan@tinvanta.vn
                </a>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/80 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-semibold">Quảng cáo & Hợp tác</p>
                <a href="mailto:quangcao@tinvanta.vn" className="font-bold text-xs text-[#172033] hover:text-[#D71920]">
                  quangcao@tinvanta.vn
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STRUCTURED CATEGORIES & PRESS DIRECTORY COLUMNS */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Col 1: Chuyên mục Chính (Nhóm 1) */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#172033] text-xs uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-gray-200">
              <Newspaper className="w-3.5 h-3.5 text-[#D71920]" />
              Thời sự & Kinh tế
            </h4>
            <ul className="space-y-2 text-xs">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/chuyen-muc/${cat.slug}`}
                    className="text-gray-600 hover:text-[#D71920] hover:font-medium transition-colors block py-0.5"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 2: Chuyên mục Xã hội & Đời sống (Nhóm 2) */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#172033] text-xs uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-gray-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Xã hội & Đời sống
            </h4>
            <ul className="space-y-2 text-xs">
              {categories.slice(5, 10).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/chuyen-muc/${cat.slug}`}
                    className="text-gray-600 hover:text-[#D71920] hover:font-medium transition-colors block py-0.5"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Đa phương tiện & Đặc san */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#172033] text-xs uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-gray-200">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Chuyên trang & Kênh
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/tin-moi-nhat" className="text-gray-600 hover:text-[#D71920] flex items-center gap-1.5 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  Luồng tin nóng 24/7
                </Link>
              </li>
              <li>
                <Link href="/tag/tri-tue-nhan-tao" className="text-gray-600 hover:text-[#D71920] block py-0.5">
                  Chuyên đề Trí tuệ nhân tạo (AI)
                </Link>
              </li>
              <li>
                <Link href="/tag/ban-dan" className="text-gray-600 hover:text-[#D71920] block py-0.5">
                  Chiến lược Bán dẫn Quốc gia
                </Link>
              </li>
              <li>
                <Link href="/tai-khoan/bai-da-luu" className="text-gray-600 hover:text-[#D71920] flex items-center gap-1.5 py-0.5">
                  <Bookmark className="w-3 h-3 text-[#D71920]" />
                  Tủ bài viết đã lưu
                </Link>
              </li>
              <li>
                <Link href="/rss.xml" className="text-gray-600 hover:text-[#D71920] flex items-center gap-1.5 py-0.5">
                  <Rss className="w-3 h-3 text-orange-500" />
                  Kênh cấp tin RSS 2.0
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Chính sách & Pháp lý Tòa soạn */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#172033] text-xs uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-gray-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Chính sách & Pháp lý
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/gioi-thieu" className="text-gray-600 hover:text-[#D71920] block py-0.5">
                  Giới thiệu TinVanta
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach-dinh-chinh" className="text-gray-600 hover:text-[#D71920] block py-0.5">
                  Quy trình đính chính thông tin
                </Link>
              </li>
              <li>
                <Link href="/dieu-khoan" className="text-gray-600 hover:text-[#D71920] block py-0.5">
                  Điều khoản sử dụng & bản quyền
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach-bao-mat" className="text-gray-600 hover:text-[#D71920] block py-0.5">
                  Chính sách bảo vệ dữ liệu cá nhân
                </Link>
              </li>
              <li>
                <Link href="/quang-cao" className="text-gray-600 hover:text-[#D71920] block py-0.5 font-semibold text-[#D71920]">
                  Báo giá quảng cáo & truyền thông
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Văn phòng liên hệ & Tiếp nhận thông tin */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 space-y-3">
            <h4 className="font-bold text-[#172033] text-xs uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-gray-200">
              <MapPin className="w-3.5 h-3.5 text-[#D71920]" />
              Địa chỉ liên hệ
            </h4>
            <div className="space-y-2 text-[11px] text-gray-600 leading-normal">
              <p>
                <strong className="text-gray-900 block">Văn phòng Hà Nội:</strong>
                Tầng 8, Tòa nhà Detech Tower, Số 8 Tôn Thất Thuyết, P. Mỹ Đình 2, Q. Nam Từ Liêm, Hà Nội.
              </p>
              <p>
                <strong className="text-gray-900 block">Văn phòng TP.HCM:</strong>
                Tầng 6, Tòa nhà Dreamplex, 195 Điện Biên Phủ, Phường 15, Q. Bình Thạnh, TP. Hồ Chí Minh.
              </p>
            </div>
          </div>
        </div>

        {/* 3. OFFICIAL EDITORIAL & REGULATORY DECLARATION PANEL */}
        <div className="mt-10 p-5 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-gray-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-black text-[#172033] text-sm tracking-wide">TINVANTA - TRANG TIN TỨC SỐ TỔNG HỢP</span>
              <span className="bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2 py-0.5 rounded border border-emerald-200">
                TRANG TIN TỔNG HỢP
              </span>
            </div>
            <p className="text-[11px] text-gray-500">
              Chuyên trang thông tin điện tử tổng hợp & phân tích tri thức số trực tuyến 24/7.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-gray-600 leading-relaxed">
            <div>
              <p><strong>Đơn vị vận hành:</strong> TinVanta Media Network</p>
              <p><strong>Quản lý & Biên tập:</strong> Ban Biên Tập TinVanta</p>
            </div>
            <div>
              <p><strong>Đơn vị phát triển:</strong> TinVanta Media & Technology Network</p>
              <p><strong>Quy trình biên tập:</strong> Tổng hợp, phân tích đa chiều và dẫn nguồn báo chí chính thống</p>
            </div>
            <div className="text-gray-500">
              <p>© 2026 TinVanta. Toàn quyền bảo lưu bản quyền nội dung số.</p>
              <p>Thông tin được trích dẫn theo Luật Sở hữu trí tuệ. Ghi rõ nguồn <em>"Theo TinVanta"</em> và gắn link gốc khi phát hành lại.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM COPYRIGHT & UTILITY BAR */}
      <div className="bg-[#172033] text-gray-400 py-3.5 px-4 text-[11px]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-center sm:text-left">
            TinVanta vận hành 24/7 trên nền tảng Next.js App Router tốc độ cao & bảo vệ dữ liệu theo Nghị định 13/2023/NĐ-CP.
          </p>

          <div className="flex items-center gap-4">
            <Link href="/sitemap.xml" className="hover:text-white transition-colors">
              Sitemap XML
            </Link>
            <span className="text-gray-600">|</span>
            <Link href="/rss.xml" className="hover:text-white transition-colors">
              RSS Feed
            </Link>
            <span className="text-gray-600">|</span>
            <button
              type="button"
              onClick={scrollToTop}
              className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors font-medium cursor-pointer"
            >
              <span>Về đầu trang</span>
              <ArrowUp className="w-3.5 h-3.5 text-red-400" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
