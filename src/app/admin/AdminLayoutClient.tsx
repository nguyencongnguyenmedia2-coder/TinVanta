'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  FolderTree, 
  Tags, 
  Image as ImageIcon, 
  Megaphone, 
  MessageSquare, 
  Mail, 
  Users, 
  Settings, 
  History, 
  ExternalLink, 
  LogOut, 
  ShieldCheck,
  Menu,
  X,
  Sparkles,
  Lock,
  Loader2
} from 'lucide-react';

interface AdminLayoutClientProps {
  children: React.ReactNode;
}

function AdminLayoutInner({ children }: AdminLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [adminUser, setAdminUser] = useState<{ email?: string; role?: string } | null>(null);

  // AUTH GUARD: Bảo vệ toàn bộ khu vực CMS /admin
  useEffect(() => {
    let isMounted = true;

    async function verifyAuth() {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('tinvanta_admin_session') : null;
        
        const res = await fetch('/api/auth/me', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          cache: 'no-store',
        });

        const data = await res.json();

        if (!res.ok || !data.authenticated) {
          if (isMounted) {
            router.replace(`/tai-khoan/dang-nhap?redirect=${encodeURIComponent(pathname)}`);
          }
          return;
        }

        if (isMounted) {
          setAdminUser(data.admin || { email: 'admin@tinvanta.vn', role: 'super_admin' });
          setCheckingAuth(false);
        }
      } catch (err) {
        if (isMounted) {
          router.replace(`/tai-khoan/dang-nhap?redirect=${encodeURIComponent(pathname)}`);
        }
      }
    }

    verifyAuth();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    try {
      localStorage.removeItem('tinvanta_admin_session');
    } catch {}
    router.replace('/tai-khoan/dang-nhap');
  };

  const navigation = [
    { name: 'Tổng quan', href: '/admin', icon: LayoutDashboard },
    { name: 'Quản lý bài viết', href: '/admin/bai-viet', icon: FileText },
    { name: '⚡ Tự động viết & đăng bài (AI)', href: '/admin/tu-dong-viet-bai', icon: Sparkles },
    { name: 'Chuyên mục', href: '/admin/chuyen-muc', icon: FolderTree },
    { name: 'Thẻ bài viết (Tags)', href: '/admin/the-tags', icon: Tags },
    { name: 'Thư viện Media', href: '/admin/media', icon: ImageIcon },
    { name: 'Chiến dịch Quảng cáo', href: '/admin/quang-cao', icon: Megaphone },
    { name: 'Bình luận & Độc giả', href: '/admin/binh-luan', icon: MessageSquare },
    { name: 'Newsletter Bản tin', href: '/admin/newsletter', icon: Mail },
    { name: 'Nhân sự & Phân quyền', href: '/admin/nguoi-dung', icon: Users },
    { name: 'Cấu hình hệ thống & Bảo mật', href: '/admin/cau-hinh', icon: Settings },
    { name: 'Nhật ký Audit Logs', href: '/admin/nhat-ky', icon: History },
  ];

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 text-white">
        <div className="p-8 bg-gray-800/80 backdrop-blur-md rounded-2xl border border-gray-700 max-w-sm w-full text-center space-y-4 shadow-2xl">
          <div className="relative h-12 w-44 mx-auto bg-white/95 px-3 py-1 rounded-lg">
            <Image
              src="/logo-tinvanta-v2.png"
              alt="TinVanta CMS"
              fill
              sizes="176px"
              className="object-contain"
            />
          </div>
          <div className="flex items-center justify-center gap-2 text-red-500 font-semibold text-xs tracking-wider uppercase">
            <Lock className="w-4 h-4" />
            <span>Khu vực Quản Trị Độc Quyền</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-300 text-sm">
            <Loader2 className="w-4 h-4 animate-spin text-red-500" />
            <span>Đang xác thực thông tin Admin...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* 1. TOP ADMIN BAR */}
      <header className="bg-[#172033] text-white h-14 flex items-center justify-between px-4 sticky top-0 z-50 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="md:hidden p-1 text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="relative h-8 w-32 bg-white px-2 py-0.5 rounded shadow-xs">
              <Image
                src="/logo-tinvanta-v2.png"
                alt="TinVanta CMS"
                fill
                sizes="128px"
                className="object-contain"
              />
            </div>
            <span className="bg-[#D71920] text-white font-black text-[11px] px-1.5 py-0.5 rounded uppercase tracking-wider">
              Tòa Soạn CMS
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1 text-gray-300 hover:text-white bg-white/10 px-2.5 py-1.5 rounded transition-colors"
          >
            <span>Xem website công khai</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="flex items-center gap-2 border-l border-gray-700 pl-4">
            <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center font-bold text-white text-xs">
              AD
            </div>
            <div className="hidden sm:block text-left">
              <p className="font-semibold text-gray-200">
                {adminUser?.email ? adminUser.email.split('@')[0] : 'Admin Quản Trị'}
              </p>
              <p className="text-[10px] text-amber-400 font-medium">Super Admin Tối Cao</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* 2. SIDEBAR NAVIGATION */}
        <aside className={`
          fixed md:static inset-y-14 left-0 w-64 bg-[#111827] text-gray-300 flex flex-col justify-between p-3 z-40 transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Phân hệ tòa soạn
            </div>
            {navigation.map((item) => {
              const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive 
                      ? 'bg-[#D71920] text-white font-bold' 
                      : 'hover:bg-gray-800 text-gray-300 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-gray-800 space-y-2">
            <div className="px-3 py-2 bg-gray-900/60 rounded-lg border border-gray-800 text-[11px] text-gray-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>RLS & RBAC Kích hoạt</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất & Khóa CMS</span>
            </button>
          </div>
        </aside>

        {/* 3. MAIN CMS CONTENT AREA */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

export function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-medium">Đang tải giao diện tòa soạn CMS...</div>}>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </Suspense>
  );
}
