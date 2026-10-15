'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!');
        setLoading(false);
        return;
      }

      // Lưu session token vào localStorage làm backup cho cookie
      if (data.token) {
        try {
          localStorage.setItem('tinvanta_admin_session', data.token);
        } catch {}
      }

      // Điều hướng đến trang quản trị hoặc trang trước đó
      router.push(redirectUrl);
      router.refresh();
    } catch (err: any) {
      setError('Không thể kết nối đến máy chủ xác thực. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 sm:p-8 bg-white rounded-2xl border border-gray-200 shadow-md">
      <div className="text-center mb-6">
        <div className="relative h-14 w-52 mx-auto mb-3">
          <Image
            src="/logo-tinvanta-v2.png"
            alt="TinVanta — Tin tức nhanh, thông tin chuẩn"
            fill
            priority
            className="object-contain"
          />
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-[#172033]">
          Đăng Nhập Quản Trị CMS
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Hệ thống bảo mật xác thực danh tính dành riêng cho Ban Biên Tập & Quản Trị Viên
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs mb-4 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
            Email quản trị
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email tài khoản quản trị..."
              required
              autoComplete="username"
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D71920]"
            />
            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
            Mật khẩu
          </label>
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D71920]"
            />
            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded text-red-600 focus:ring-red-500" />
            <span>Ghi nhớ phiên đăng nhập (30 ngày)</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#D71920] hover:bg-[#b8141a] text-white font-bold text-sm py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-70 cursor-pointer"
        >
          {loading ? 'Đang xác thực bảo mật...' : 'Đăng nhập vào hệ thống'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-[11px] text-gray-400">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>Hệ thống bảo mật CMS xác thực phiên 2 lớp</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="max-w-md mx-auto my-12 p-8 text-center text-xs text-gray-500">Đang tải...</div>}>
      <LoginForm />
    </React.Suspense>
  );
}
