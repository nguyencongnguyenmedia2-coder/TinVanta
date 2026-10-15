'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, X } from 'lucide-react';

export function DecreeConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem('newshub_decree13_consent');
      if (!consent) {
        // Show after a brief delay for a polished UX
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleAccept = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('newshub_decree13_consent', 'accepted');
      setIsVisible(false);
    }
  };

  const handleDecline = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('newshub_decree13_consent', 'declined');
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <aside 
      aria-label="Thông báo bảo vệ dữ liệu cá nhân"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-white/95 backdrop-blur-md border border-gray-200 shadow-2xl rounded-2xl p-4 sm:p-5 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-red-50 text-[#D71920] flex items-center justify-center shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#172033]">
              Bảo vệ dữ liệu cá nhân
            </h4>
            <button
              type="button"
              onClick={handleDecline}
              className="text-gray-400 hover:text-gray-600 p-1"
              title="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
            TinVanta tuân thủ <strong>Nghị định 13/2023/NĐ-CP</strong> về bảo vệ dữ liệu cá nhân. Chúng tôi sử dụng cookie để ghi nhớ tùy chọn đọc bài và tối ưu hóa trải nghiệm của bạn.
          </p>

          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={handleAccept}
              className="px-3.5 py-1.5 bg-[#D71920] hover:bg-[#b01319] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              Đồng ý & Tiếp tục
            </button>
            <Link
              href="/chinh-sach-bao-mat"
              className="text-xs text-gray-500 hover:text-[#D71920] underline font-medium px-2 py-1"
            >
              Chính sách bảo mật
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
