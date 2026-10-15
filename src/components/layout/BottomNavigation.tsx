'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Zap, FolderTree, Bookmark, Search, X, ChevronRight, PhoneCall, CloudSun, ShieldCheck } from 'lucide-react';
import { getStoredBookmarks } from '@/lib/bookmarks';
import { Category } from '@/types/database';

interface BottomNavigationProps {
  categories: Category[];
}

export function BottomNavigation({ categories }: BottomNavigationProps) {
  const pathname = usePathname();
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [categoriesDrawerOpen, setCategoriesDrawerOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setBookmarkCount(getStoredBookmarks().length);

    const updateCount = () => {
      setBookmarkCount(getStoredBookmarks().length);
    };

    window.addEventListener('newshub_bookmarks_change', updateCount);
    return () => window.removeEventListener('newshub_bookmarks_change', updateCount);
  }, []);

  // Không hiển thị trên trang admin
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchModalOpen(false);
      window.location.href = `/tim-kiem?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const navItems = [
    {
      label: 'Trang chủ',
      href: '/',
      icon: Home,
      isActive: pathname === '/',
      onClick: () => {
        setCategoriesDrawerOpen(false);
        setSearchModalOpen(false);
      }
    },
    {
      label: 'Tin mới',
      href: '/tin-moi-nhat',
      icon: Zap,
      badge: 'HOT',
      isActive: pathname === '/tin-moi-nhat',
      onClick: () => {
        setCategoriesDrawerOpen(false);
        setSearchModalOpen(false);
      }
    },
    {
      label: 'Chuyên mục',
      href: '#',
      icon: FolderTree,
      isActive: categoriesDrawerOpen || pathname?.startsWith('/chuyen-muc'),
      onClick: () => {
        setSearchModalOpen(false);
        setCategoriesDrawerOpen(!categoriesDrawerOpen);
      }
    },
    {
      label: 'Đã lưu',
      href: '/tai-khoan/bai-da-luu',
      icon: Bookmark,
      count: bookmarkCount,
      isActive: pathname === '/tai-khoan/bai-da-luu',
      onClick: () => {
        setCategoriesDrawerOpen(false);
        setSearchModalOpen(false);
      }
    },
    {
      label: 'Tìm kiếm',
      href: '#',
      icon: Search,
      isActive: searchModalOpen || pathname === '/tim-kiem',
      onClick: () => {
        setCategoriesDrawerOpen(false);
        setSearchModalOpen(!searchModalOpen);
      }
    }
  ];

  return (
    <>
      {/* 1. BOTTOM NAVIGATION BAR CỐ ĐỊNH CHO MOBILE */}
      <nav 
        aria-label="Mobile Bottom Navigation" 
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-safe"
      >
        <div className="grid grid-cols-5 h-14">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const content = (
              <button
                key={idx}
                type="button"
                onClick={item.onClick}
                className={`relative flex flex-col items-center justify-center w-full h-full transition-colors ${
                  item.isActive ? 'text-[#D71920]' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${item.isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                  
                  {/* Badge số bài đã lưu */}
                  {item.count !== undefined && item.count > 0 && (
                    <span className="absolute -top-1 -right-2 bg-[#D71920] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                      {item.count > 99 ? '99+' : item.count}
                    </span>
                  )}

                  {/* Badge HOT tin mới */}
                  {item.badge && (
                    <span className="absolute -top-1 -right-2.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D71920]"></span>
                    </span>
                  )}
                </div>
                <span className={`text-[10px] mt-1 font-semibold leading-none ${item.isActive ? 'font-bold' : ''}`}>
                  {item.label}
                </span>
                {item.isActive && (
                  <span className="absolute top-0 w-8 h-0.5 bg-[#D71920] rounded-b-full" />
                )}
              </button>
            );

            if (item.href !== '#') {
              return (
                <Link key={idx} href={item.href} onClick={item.onClick} className="w-full h-full">
                  {content}
                </Link>
              );
            }
            return content;
          })}
        </div>
      </nav>

      {/* 2. DRAWER BOTTOM SHEET MỞ DANH SÁCH CHUYÊN MỤC CHO MOBILE */}
      {categoriesDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
          <div 
            className="absolute inset-0" 
            onClick={() => setCategoriesDrawerOpen(false)}
          />
          <div className="relative bg-white rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-300">
            {/* Header Drawer */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-5 bg-[#D71920] rounded-xs" />
                <h3 className="font-black text-base text-[#172033] uppercase tracking-tight">
                  Tất cả chuyên mục TinVanta
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCategoriesDrawerOpen(false)}
                className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid Chuyên Mục */}
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <Link
                href="/"
                onClick={() => setCategoriesDrawerOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl bg-red-50 text-[#D71920] border border-red-100"
              >
                <span className="flex items-center gap-2">
                  <Home className="w-4 h-4" /> Trang chủ
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/tin-moi-nhat"
                onClick={() => setCategoriesDrawerOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl bg-amber-50 text-amber-900 border border-amber-200"
              >
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-600" /> Tin nóng 24/7
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>

              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/chuyen-muc/${cat.slug}`}
                  onClick={() => setCategoriesDrawerOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-100 transition-colors"
                >
                  <span className="truncate">{cat.name}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                </Link>
              ))}
            </div>

            {/* Footer tiện ích */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
              <div className="flex items-center gap-1.5 text-red-600 font-semibold">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Hotline: 1900 6868</span>
              </div>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Thông tin kiểm chứng</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. MODAL TÌM KIẾM NHANH CHO MOBILE */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-xs flex flex-col justify-start animate-in fade-in duration-150">
          <div className="bg-white p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Tìm kiếm bài viết TinVanta
              </span>
              <button
                type="button"
                onClick={() => setSearchModalOpen(false)}
                className="p-1 text-gray-500 hover:text-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập chủ đề, từ khóa, tên sự kiện..."
                className="w-full pl-10 pr-20 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D71920]"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-[#D71920] hover:bg-[#b8141a] text-white text-xs font-bold rounded-lg"
              >
                Tìm
              </button>
            </form>

            <div className="pt-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Gợi ý từ khóa nóng:</span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['Bán dẫn', 'Đường sắt cao tốc', 'Trí tuệ nhân tạo', 'Kinh tế tuần hoàn', 'Bất động sản', 'Giá vàng'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setSearchModalOpen(false);
                      window.location.href = `/tim-kiem?q=${encodeURIComponent(tag)}`;
                    }}
                    className="text-[11px] bg-gray-100 hover:bg-red-50 hover:text-[#D71920] px-2.5 py-1 rounded-full font-medium text-gray-700"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1" onClick={() => setSearchModalOpen(false)} />
        </div>
      )}
    </>
  );
}
