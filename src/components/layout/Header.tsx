'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Category } from '@/types/database';
import { Search, Menu, X, User, PhoneCall, Bookmark, CloudSun, Clock, Flame, Home } from 'lucide-react';
import { formatDateVN } from '@/lib/utils';
import { getStoredBookmarks } from '@/lib/bookmarks';

interface HeaderProps {
  categories: Category[];
  siteName?: string;
  siteSlogan?: string;
}

export function Header({ categories, siteName = 'TinVanta', siteSlogan = 'Tin tức nhanh — Thông tin chuẩn' }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const [todayStr, setTodayStr] = useState("Thứ Năm, ngày 15/10/2026");
  const [bookmarkCount, setBookmarkCount] = useState(0);

  React.useEffect(() => {
    setTodayStr(formatDateVN(new Date(), "EEEE, 'ngày' dd/MM/yyyy"));
    setBookmarkCount(getStoredBookmarks().length);

    const updateCount = () => {
      setBookmarkCount(getStoredBookmarks().length);
    };
    window.addEventListener('newshub_bookmarks_change', updateCount);
    return () => window.removeEventListener('newshub_bookmarks_change', updateCount);
  }, []);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/tim-kiem?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs">
      {/* 1. TOPBAR TIỆN ÍCH QUỐC GIA (Không lộ CMS) */}
      <div className="bg-[#172033] text-gray-300 text-xs py-1.5 px-4 hidden md:block border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="capitalize text-gray-200">{todayStr}</span>
            <span className="text-gray-600">|</span>
            <span className="flex items-center gap-1.5 text-red-400 font-semibold">
              <PhoneCall className="w-3.5 h-3.5" />
              Đường dây nóng: 1900 6868
            </span>
            <span className="text-gray-600">|</span>
            <span className="flex items-center gap-1.5 text-gray-400 text-[11px]">
              <CloudSun className="w-3.5 h-3.5 text-amber-400" />
              Hà Nội 26°C &bull; TP.HCM 31°C
            </span>
          </div>

          <div className="flex items-center gap-5 text-xs">
            <Link href="/tin-moi-nhat" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Tin mới 24/7</span>
            </Link>
            <Link href="/rss.xml" className="text-gray-400 hover:text-white transition-colors">
              RSS Feed
            </Link>
            <Link href="/tai-khoan/bai-da-luu" className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors">
              <Bookmark className="w-3.5 h-3.5 text-red-400" />
              <span>Bài đã lưu</span>
              {bookmarkCount > 0 && (
                <span className="bg-[#D71920] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {bookmarkCount}
                </span>
              )}
            </Link>
            <Link href="/tai-khoan/dang-nhap" className="flex items-center gap-1 text-gray-300 hover:text-white font-medium transition-colors">
              <User className="w-3.5 h-3.5" />
              <span>Đăng nhập</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. BRANDING & INTEGRATED SEARCH BAR */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            className="md:hidden p-1.5 text-gray-700 hover:text-gray-900 focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-gray-800" />}
          </button>

          <Link href="/" className="group flex items-center">
            <div className="relative h-12 w-48 sm:h-14 sm:w-56 lg:h-16 lg:w-64">
              <Image
                src="/logo-tinvanta-v2.png"
                alt="TinVanta — Tin tức nhanh, thông tin chuẩn"
                fill
                priority
                className="object-contain object-left group-hover:scale-101 transition-transform duration-300"
              />
            </div>
          </Link>
        </div>

        {/* Integrated Center Search for Desktop */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-lg mx-6">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm tin tức, sự kiện, bài phân tích chuyên sâu..."
              className="w-full bg-gray-50 hover:bg-gray-100/90 focus:bg-white pl-10 pr-24 py-2 border border-gray-200 rounded-full text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D71920]/25 focus:border-[#D71920] transition-all shadow-2xs"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-4 bg-[#D71920] hover:bg-[#b8141a] text-white rounded-full text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-xs"
            >
              Tìm kiếm
            </button>
          </div>
        </form>

        {/* Right Reader Utilities (Thanh lịch & Chuyên nghiệp) */}
        <div className="flex items-center gap-3">
          {/* Mobile search trigger */}
          <button
            type="button"
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden p-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
            aria-label="Tìm kiếm"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Quick Bookmark link on tablet/desktop */}
          <Link
            href="/tai-khoan/bai-da-luu"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs text-gray-700 hover:border-red-300 hover:text-[#D71920] hover:bg-red-50/50 transition-all"
            title="Xem danh sách bài viết đã lưu"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#D71920]" />
            <span className="font-medium">Đã lưu</span>
            {bookmarkCount > 0 && (
              <span className="bg-[#D71920] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {bookmarkCount}
              </span>
            )}
          </Link>

          {/* Reader Account Button */}
          <Link
            href="/tai-khoan/dang-nhap"
            className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-[#172033] text-white text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all shadow-2xs"
          >
            <User className="w-3.5 h-3.5" />
            <span>Tài khoản</span>
          </Link>
        </div>
      </div>

      {/* 3. MOBILE SEARCH EXPANDABLE BAR */}
      {searchOpen && (
        <div className="md:hidden bg-gray-50 border-t border-b border-gray-200 px-4 py-3 animate-in fade-in duration-200">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập từ khóa tìm kiếm tin bài..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#D71920] bg-white"
                autoFocus
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </div>
            <button
              type="submit"
              className="bg-[#D71920] hover:bg-[#b8141a] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Tìm
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="p-1.5 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}

      {/* 4. MAIN NAVIGATION (DESKTOP BAR SANG TRỌNG) */}
      <nav className="bg-[#172033] border-t border-gray-800 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center overflow-x-auto no-scrollbar">
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${
                pathname === '/' 
                  ? 'text-white border-[#D71920] bg-white/5' 
                  : 'text-gray-300 border-transparent hover:text-white hover:border-gray-400'
              }`}
              title="Trang chủ TinVanta"
            >
              <Home className="w-3.5 h-3.5 text-red-400" />
              <span>Trang chủ</span>
            </Link>

            {categories.map((cat) => {
              const isActive = pathname === `/chuyen-muc/${cat.slug}`;
              return (
                <Link
                  key={cat.id}
                  href={`/chuyen-muc/${cat.slug}`}
                  className={`px-3 py-2.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${
                    isActive 
                      ? 'text-white border-[#D71920] bg-white/5' 
                      : 'text-gray-300 border-transparent hover:text-white hover:border-gray-400'
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>

          {/* Right Feature Pill on Nav */}
          <div className="hidden xl:flex items-center gap-2 pl-4 text-xs font-semibold">
            <Link
              href="/tin-moi-nhat"
              className="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-full transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>Tin Mới 24/7</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* 5. MOBILE DRAWER NAVIGATION (Không lộ CMS) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-4 space-y-4 animate-in slide-in-from-top duration-200 shadow-lg">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm tin bài..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#D71920]"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </form>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1.5 p-2.5 rounded-lg bg-gray-50 text-gray-900 font-bold border border-gray-100"
            >
              <Home className="w-3.5 h-3.5 text-[#D71920]" />
              <span>Trang chủ</span>
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/chuyen-muc/${cat.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg hover:bg-gray-50 text-gray-700 border border-transparent hover:border-gray-200"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600">
            <Link 
              href="/tai-khoan/bai-da-luu" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1.5 text-gray-800 font-medium"
            >
              <Bookmark className="w-3.5 h-3.5 text-[#D71920]" />
              <span>Bài đã lưu ({bookmarkCount})</span>
            </Link>
            <Link 
              href="/tai-khoan/dang-nhap" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1 text-[#D71920] font-bold"
            >
              <User className="w-3.5 h-3.5" />
              <span>Đăng nhập độc giả</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
