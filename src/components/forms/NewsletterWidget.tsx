'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export function NewsletterWidget() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'Đăng ký nhận bản tin thành công! Vui lòng kiểm tra hộp thư.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Có lỗi xảy ra, vui lòng thử lại sau.');
      }
    } catch {
      setStatus('error');
      setMessage('Không thể kết nối đến máy chủ. Vui lòng thử lại.');
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#172033] to-[#24304c] text-white p-6 rounded-2xl shadow-md my-8">
      <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Mail className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-bold">Bản tin Thời sự TinVanta Buổi Sáng</h3>
          </div>
          <p className="text-xs text-gray-300">
            Tổng hợp tin tức phân tích chuyên sâu gửi trực tiếp vào hòm thư lúc 07:00 mỗi ngày.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full md:w-auto flex-1 max-w-md">
          <div className="flex items-center gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn..."
              disabled={status === 'loading'}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-[#D71920] hover:bg-[#b8141a] text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
            >
              {status === 'loading' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Đăng ký
            </button>
          </div>

          {status === 'success' && (
            <p className="flex items-center gap-1 text-emerald-400 text-xs mt-2">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              {message}
            </p>
          )}

          {status === 'error' && (
            <p className="flex items-center gap-1 text-red-300 text-xs mt-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
