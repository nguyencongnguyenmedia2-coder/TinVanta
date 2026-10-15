'use client';

import React, { useState } from 'react';
import { Mail, Send, Users, CheckCircle2, UserCheck, UserX, Download } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  is_verified: boolean;
  status: 'active' | 'pending' | 'unsubscribed';
  subscribed_at: string;
}

const INITIAL_SUBSCRIBERS: Subscriber[] = [
  { id: 's-1', email: 'docgia.vietnam@gmail.com', is_verified: true, status: 'active', subscribed_at: '2026-10-10' },
  { id: 's-2', email: 'kinhdoanh.tech@corp.vn', is_verified: true, status: 'active', subscribed_at: '2026-10-12' },
  { id: 's-3', email: 'investor.capital@fund.com', is_verified: false, status: 'pending', subscribed_at: '2026-10-14' },
  { id: 's-4', email: 'nguoidoc.cu@yahoo.com', is_verified: true, status: 'unsubscribed', subscribed_at: '2026-09-01' },
];

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>(INITIAL_SUBSCRIBERS);
  const [subject, setSubject] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const activeCount = subscribers.filter(s => s.status === 'active').length;
  const pendingCount = subscribers.filter(s => s.status === 'pending').length;
  const unsubscribedCount = subscribers.filter(s => s.status === 'unsubscribed').length;

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    setSentSuccess(true);
    setSubject('');
    setTimeout(() => setSentSuccess(false), 3000);
  };

  const handleExportCSV = () => {
    const headers = 'Mã Độc Giả,Email,Trạng Thái,Xác Thực Double Opt-in,Ngày Đăng Ký\n';
    const rows = subscribers
      .map(s => `"${s.id}","${s.email}","${s.status}","${s.is_verified ? 'Đã xác thực' : 'Chờ xác thực'}","${s.subscribed_at}"`)
      .join('\n');
    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `newshub-newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-black text-[#172033]">
            Quản Lý Bản Tin & Độc Giả Đăng Ký (Newsletter)
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Quản lý danh sách email Double Opt-in, tạo chiến dịch email tóm tắt tin tức sáng và tuân thủ chính sách bảo vệ dữ liệu.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg shadow-2xs transition-colors self-start sm:self-auto"
          title="Xuất file CSV danh sách độc giả"
        >
          <Download className="w-3.5 h-3.5 text-[#D71920]" />
          <span>Xuất danh sách (CSV)</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Đang nhận tin (Active)</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-[#172033]">{activeCount}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Chờ xác thực Opt-in</span>
            <Mail className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-[#172033]">{pendingCount}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Đã hủy nhận tin</span>
            <UserX className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-black text-gray-600">{unsubscribedCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Send Broadcast form (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-100 pb-2">
            Phát bản tin tổng hợp (Broadcast)
          </h2>

          {sentSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Đã lên lịch gửi bản tin tới {activeCount} độc giả hợp lệ!</span>
            </div>
          )}

          <form onSubmit={handleSendBroadcast} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Tiêu đề email bản tin *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ví dụ: Điểm tin thời sự NEWSHUB sáng 15/10/2026..."
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Nội dung vắn tắt
              </label>
              <textarea
                rows={4}
                placeholder="Nhập nội dung thông điệp gửi tới độc giả..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#D71920] hover:bg-[#b8141a] text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Send className="w-4 h-4" />
              Gửi tới toàn bộ độc giả Active
            </button>
          </form>
        </div>

        {/* Subscribers table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <span className="font-bold text-xs text-[#172033]">
              Danh sách email đăng ký
            </span>
            <span className="text-xs text-gray-500">
              Tổng số: {subscribers.length}
            </span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200">
              <tr>
                <th className="py-2.5 px-4">Địa chỉ Email</th>
                <th className="py-2.5 px-4 text-center">Xác thực</th>
                <th className="py-2.5 px-4 text-center">Trạng thái</th>
                <th className="py-2.5 px-4">Ngày đăng ký</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {sub.email}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {sub.is_verified ? (
                      <span className="text-emerald-600 font-bold">✓ Đã xác minh</span>
                    ) : (
                      <span className="text-amber-500">Chờ click mail</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      sub.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                      sub.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {sub.subscribed_at}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
