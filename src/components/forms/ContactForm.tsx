'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
      <h2 className="text-base font-bold text-[#172033]">
        Gửi tin tức phản ánh hoặc liên hệ
      </h2>

      {submitted ? (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Cảm ơn bạn! Thông tin phản ánh đã được gửi thành công tới Ban Bạn đọc của tòa soạn.</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Họ và tên của bạn *</label>
            <input type="text" required placeholder="Nguyễn Văn A" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email liên lạc *</label>
            <input type="email" required placeholder="email@example.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Số điện thoại</label>
            <input type="tel" placeholder="0901 234 567" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Nội dung phản ánh / yêu cầu *</label>
            <textarea rows={4} required placeholder="Mô tả sự việc, kèm địa điểm và chi tiết phản ánh..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs" />
          </div>

          <button
            type="submit"
            className="w-full bg-[#D71920] hover:bg-[#b8141a] text-white font-bold text-xs py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <Send className="w-4 h-4" />
            Gửi thông tin về tòa soạn
          </button>
        </form>
      )}
    </div>
  );
}
