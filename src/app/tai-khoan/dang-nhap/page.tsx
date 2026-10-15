'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ thông tin đăng nhập.');
      return;
    }

    setLoading(true);
    setError('');

    // Giả lập đăng nhập nhanh cho demo hoặc quản trị
    setTimeout(() => {
      setLoading(false);
      if (email.includes('admin') || email.includes('tinvanta') || email.includes('newshub')) {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }, 600);
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
          Đăng Nhập Tài Khoản
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Dành cho độc giả tương tác và đội ngũ cán bộ phóng viên tòa soạn
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
            Email đăng nhập
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@tinvanta.vn hoặc email cá nhân"
              required
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
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D71920]"
            />
            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded text-red-600 focus:ring-red-500" />
            <span>Ghi nhớ đăng nhập</span>
          </label>
          <a href="#" className="hover:text-red-700">Quên mật khẩu?</a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#D71920] hover:bg-[#b8141a] text-white font-bold text-sm py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
        >
          {loading ? 'Đang xác thực...' : 'Đăng nhập vào hệ thống'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
        Chưa có tài khoản độc giả?{' '}
        <Link href="/tai-khoan/dang-ky" className="font-bold text-[#D71920] hover:underline">
          Đăng ký miễn phí
        </Link>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200 text-[11px] text-gray-500">
        💡 <strong>Tài khoản Demo CMS:</strong> Nhập <code>admin@tinvanta.vn</code> với mật khẩu bất kỳ để truy cập ngay bảng điều khiển tòa soạn.
      </div>
    </div>
  );
}
