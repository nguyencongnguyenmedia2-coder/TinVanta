'use client';

import React, { useState } from 'react';
import { History, Shield, Lock, Search } from 'lucide-react';
import { AuditLog } from '@/types/database';

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    user_id: 'u-1',
    action: 'PUBLISH_ARTICLE',
    entity: 'articles',
    entity_id: 'art-001',
    details: { title: 'Việt Nam bứt phá trong chuỗi cung ứng vi mạch bán dẫn toàn cầu', status: 'published' },
    ip_address: '14.241.120.45',
    created_at: '2026-10-15T02:00:00.000Z',
    user: {
      id: 'u-1',
      email: 'tongbientap@newshub.vn',
      full_name: 'Nguyễn Văn Hoài (Tổng BT)',
      slug: 'nguyen-van-hoai',
      title_role: 'Tổng biên tập',
      is_author: true,
      is_active: true,
      created_at: '2026-10-01T00:00:00.000Z',
      updated_at: '2026-10-01T00:00:00.000Z'
    }
  },
  {
    id: 'log-2',
    user_id: 'u-2',
    action: 'ASSIGN_ROLE',
    entity: 'user_roles',
    entity_id: 'u-rep-2',
    details: { assigned_role: 'reporter', target_email: 'tran.nam@newshub.vn' },
    ip_address: '14.241.120.45',
    created_at: '2026-10-14T09:30:00.000Z',
    user: {
      id: 'u-2',
      email: 'admin@newshub.vn',
      full_name: 'Tổng Quản Trị Viên',
      slug: 'admin',
      title_role: 'Super Admin',
      is_author: false,
      is_active: true,
      created_at: '2026-10-01T00:00:00.000Z',
      updated_at: '2026-10-01T00:00:00.000Z'
    }
  },
  {
    id: 'log-3',
    user_id: 'u-3',
    action: 'UPDATE_SETTINGS',
    entity: 'site_settings',
    entity_id: 'editorial',
    details: { breaking_news_enabled: true, key: 'breaking_news_text' },
    ip_address: '113.161.78.12',
    created_at: '2026-10-14T08:15:00.000Z',
    user: {
      id: 'u-3',
      email: 'admin@newshub.vn',
      full_name: 'Tổng Quản Trị Viên',
      slug: 'admin',
      title_role: 'Super Admin',
      is_author: false,
      is_active: true,
      created_at: '2026-10-01T00:00:00.000Z',
      updated_at: '2026-10-01T00:00:00.000Z'
    }
  },
  {
    id: 'log-4',
    user_id: 'u-4',
    action: 'REQUEST_CHANGES',
    entity: 'articles',
    entity_id: 'art-005',
    details: { reason: 'Yêu cầu kiểm tra lại số liệu trạm sạc xe điện', editor: 'Lê Thanh Mai' },
    ip_address: '27.72.60.18',
    created_at: '2026-10-13T14:20:00.000Z',
    user: {
      id: 'u-4',
      email: 'le.mai@newshub.vn',
      full_name: 'Lê Thanh Mai',
      slug: 'le-thanh-mai',
      title_role: 'Biên tập viên',
      is_author: true,
      is_active: true,
      created_at: '2026-10-01T00:00:00.000Z',
      updated_at: '2026-10-01T00:00:00.000Z'
    }
  }
];

export default function AdminAuditLogsPage() {
  const [logs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = logs.filter(l => 
    l.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (l.user?.full_name && l.user.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-black text-[#172033]">
            Nhật Ký Hoạt Động & Bảo Mật (Audit Logs)
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Lưu vết toàn bộ thao tác nhạy cảm: xuất bản tin bài, thay đổi vai trò RBAC, cấu hình hệ thống và địa chỉ IP.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-semibold">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Ghi nhận bất biến (Append-Only)</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="relative w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo hành động hoặc người thực hiện..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#D71920]"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          <span className="text-xs text-gray-500 font-semibold">
            {filtered.length} bản ghi
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200">
            <tr>
              <th className="py-2.5 px-4">Thời gian (VN)</th>
              <th className="py-2.5 px-4">Hành động</th>
              <th className="py-2.5 px-4">Người thực hiện</th>
              <th className="py-2.5 px-4">Thực thể</th>
              <th className="py-2.5 px-4">Chi tiết thao tác</th>
              <th className="py-2.5 px-4 font-mono">Địa chỉ IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50/70 transition-colors">
                <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                  {log.created_at.slice(0, 19).replace('T', ' ')}
                </td>
                <td className="py-3 px-4 font-mono font-bold text-gray-900">
                  <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-[11px]">
                    {log.action}
                  </span>
                </td>
                <td className="py-3 px-4 font-medium text-gray-800">
                  {log.user?.full_name || 'Hệ thống'}
                </td>
                <td className="py-3 px-4 text-gray-600 font-mono">
                  {log.entity}
                </td>
                <td className="py-3 px-4 text-gray-600 max-w-xs truncate">
                  {JSON.stringify(log.details)}
                </td>
                <td className="py-3 px-4 font-mono text-gray-400 text-[11px]">
                  {log.ip_address}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
