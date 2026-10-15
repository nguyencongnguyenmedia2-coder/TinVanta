'use client';

import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle2 } from 'lucide-react';

interface ArticleCommentsProps {
  articleId: string;
}

export function ArticleComments({ articleId }: ArticleCommentsProps) {
  const [content, setContent] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitted(true);
    setContent('');
  };

  return (
    <section id="article-comments" className="mt-12 pt-8 border-t border-gray-200 scroll-mt-24">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-[#D71920]" />
        <h3 className="text-lg font-bold text-[#172033]">Ý kiến độc giả (Bình luận)</h3>
      </div>

      {submitted ? (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-2 text-sm mb-6">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Ý kiến của bạn đã được gửi và đang chờ kiểm duyệt từ ban biên tập. Cảm ơn bạn đã đóng góp!</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-8">
          <div className="mb-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Họ và tên của bạn (tùy chọn)..."
              className="w-full sm:w-80 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D71920]"
            />
          </div>
          <div className="mb-3">
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Chia sẻ quan điểm của bạn về bài viết này..."
              required
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D71920]"
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-gray-500">
              * Bình luận cần tuân thủ quy tắc văn minh và chính sách của TinVanta.
            </p>
            <button
              type="submit"
              className="bg-[#D71920] hover:bg-[#b8141a] text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              Gửi bình luận
            </button>
          </div>
        </form>
      )}

      {/* Demo comment list */}
      <div className="space-y-4">
        <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-gray-800">Hoàng Minh Quân</span>
            <span className="text-gray-400">2 giờ trước</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            Bài viết phân tích rất toàn diện và kịp thời. Chiến lược phát triển hạ tầng và công nghệ chính là đòn bẩy đưa đất nước bước vào kỷ nguyên vươn mình.
          </p>
        </div>
      </div>
    </section>
  );
}
