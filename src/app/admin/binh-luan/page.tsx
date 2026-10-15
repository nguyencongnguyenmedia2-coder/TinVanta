'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Trash2, 
  Filter, 
  Search,
  ExternalLink,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { Comment, Article } from '@/types/database';

interface EnhancedComment extends Comment {
  articleTitle?: string;
  articleSlug?: string;
}

const INITIAL_COMMENTS: EnhancedComment[] = [
  {
    id: 'c-1',
    article_id: 'art-001',
    user_id: 'u-1',
    content: 'Bài viết phân tích rất toàn diện và kịp thời. Chiến lược phát triển hạ tầng và công nghệ chính là đòn bẩy đưa đất nước bước vào kỷ nguyên vươn mình.',
    status: 'approved',
    created_at: '2026-10-15T02:30:00.000Z',
    updated_at: '2026-10-15T02:35:00.000Z',
    user: {
      id: 'u-1',
      email: 'hoang.quan@gmail.com',
      full_name: 'Hoàng Minh Quân',
      slug: 'hoang-minh-quan',
      title_role: 'Độc giả',
      is_author: false,
      is_active: true,
      created_at: '2026-10-01T00:00:00.000Z',
      updated_at: '2026-10-01T00:00:00.000Z'
    }
  },
  {
    id: 'c-2',
    article_id: 'art-002',
    user_id: 'u-2',
    content: 'Mong dự án đường sắt cao tốc sớm khởi công đoạn Hà Nội - Vinh và TP.HCM - Nha Trang để phục vụ nhu cầu đi lại của bà con.',
    status: 'pending',
    created_at: '2026-10-15T03:15:00.000Z',
    updated_at: '2026-10-15T03:15:00.000Z',
    user: {
      id: 'u-2',
      email: 'thanh.tuan@outlook.com',
      full_name: 'Trần Thanh Tuấn',
      slug: 'tran-thanh-tuan',
      title_role: 'Độc giả',
      is_author: false,
      is_active: true,
      created_at: '2026-10-05T00:00:00.000Z',
      updated_at: '2026-10-05T00:00:00.000Z'
    }
  },
  {
    id: 'c-3',
    article_id: 'art-003',
    user_id: 'u-3',
    content: 'Quảng cáo vay tiền nhanh gọi ngay số 0909xxxxxx lãi suất cực thấp...',
    status: 'spam',
    created_at: '2026-10-15T01:00:00.000Z',
    updated_at: '2026-10-15T01:05:00.000Z',
    user: {
      id: 'u-3',
      email: 'spam.bot@mail.com',
      full_name: 'Dịch vụ Tài chính',
      slug: 'dich-vu-tai-chinh',
      title_role: 'Khách',
      is_author: false,
      is_active: false,
      created_at: '2026-10-15T00:00:00.000Z',
      updated_at: '2026-10-15T00:00:00.000Z'
    }
  }
];

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<EnhancedComment[]>(INITIAL_COMMENTS);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Nạp thông tin bài viết thật để liên kết chính xác
  useEffect(() => {
    async function attachArticleInfo() {
      try {
        const res = await fetch('/api/admin/articles');
        const data = await res.json();
        if (data.success && Array.isArray(data.articles)) {
          const articles = data.articles as Article[];
          setComments(prev => prev.map(c => {
            const matched = articles.find(a => a.id === c.article_id) || articles[0];
            return {
              ...c,
              articleTitle: matched?.title || 'Bài viết thời sự',
              articleSlug: matched?.slug || '',
              article_id: matched?.id || c.article_id
            };
          }));
        }
      } catch (err) {
        console.error('Lỗi nạp bài viết cho bình luận:', err);
      }
    }
    attachArticleInfo();
  }, []);

  const handleAction = (id: string, action: 'approved' | 'rejected' | 'spam' | 'delete') => {
    if (action === 'delete') {
      setComments(comments.filter(c => c.id !== id));
      showToast('Đã xóa vĩnh viễn bình luận.');
    } else {
      setComments(comments.map(c => c.id === id ? { ...c, status: action } : c));
      const text = action === 'approved' ? 'Đã duyệt hiển thị bình luận' : action === 'spam' ? 'Đã đánh dấu bình luận rác (Spam)' : 'Đã từ chối bình luận';
      showToast(text);
    }
  };

  const filtered = comments.filter(c => filterStatus === 'all' || c.status === filterStatus);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#172033] text-white text-xs px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 border border-gray-700 animate-in fade-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-black text-[#172033] flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#D71920]" />
            Kiểm Duyệt Bình Luận & Tương Tác Bạn Đọc
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Duyệt ý kiến độc giả, ngăn chặn tin nhắn rác (spam) và liên kết trực tiếp với bài viết tương ứng.
          </p>
        </div>

        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#D71920]"
          >
            <option value="all">Tất cả bình luận ({comments.length})</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
            <option value="spam">Spam / Rác</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-400 text-xs">
            Không có bình luận nào trong danh mục này.
          </div>
        ) : (
          filtered.map((comment) => (
            <div key={comment.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700 text-xs">
                    {comment.user?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 text-xs">{comment.user?.full_name}</span>
                    <span className="text-[11px] text-gray-400 ml-2">({comment.user?.email})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                    comment.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                    comment.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                    comment.status === 'spam' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {comment.status === 'approved' ? 'Đã duyệt' :
                     comment.status === 'pending' ? 'Chờ kiểm duyệt' :
                     comment.status === 'spam' ? 'Spam rác' : 'Từ chối'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-800 bg-gray-50 p-3 rounded-lg leading-relaxed">
                "{comment.content}"
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-[11px] border-t border-gray-100">
                {/* Liên kết bài viết chính xác */}
                <div className="flex items-center gap-1.5 text-gray-600">
                  <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="text-gray-400">Bài viết:</span>
                  {comment.articleSlug ? (
                    <Link
                      href={`/bai-viet/${comment.articleSlug}`}
                      target="_blank"
                      className="font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 truncate max-w-md"
                    >
                      {comment.articleTitle || 'Xem bài viết'}
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </Link>
                  ) : (
                    <span className="font-medium text-gray-700">{comment.articleTitle || comment.article_id}</span>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {comment.status !== 'approved' && (
                    <button
                      type="button"
                      onClick={() => handleAction(comment.id, 'approved')}
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded font-semibold flex items-center gap-1 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Duyệt hiển thị
                    </button>
                  )}

                  {comment.status !== 'spam' && (
                    <button
                      type="button"
                      onClick={() => handleAction(comment.id, 'spam')}
                      className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded font-semibold flex items-center gap-1 transition-colors"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" /> Báo Spam
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleAction(comment.id, 'delete')}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Xóa bình luận"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
