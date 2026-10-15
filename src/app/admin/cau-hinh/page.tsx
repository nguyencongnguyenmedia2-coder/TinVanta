'use client';

import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, ShieldCheck, Activity, RefreshCw, Database, Server } from 'lucide-react';
import { MOCK_SITE_SETTINGS } from '@/lib/data/mock-data';

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState(String(MOCK_SITE_SETTINGS.value.site_name || 'NEWSHUB VIỆT NAM'));
  const [siteSlogan, setSiteSlogan] = useState(String(MOCK_SITE_SETTINGS.value.site_slogan || ''));
  const [primaryColor, setPrimaryColor] = useState(String(MOCK_SITE_SETTINGS.value.primary_color || '#D71920'));
  const [hotline, setHotline] = useState(String(MOCK_SITE_SETTINGS.value.hotline || '1900 6868'));
  const [emailContact, setEmailContact] = useState(String(MOCK_SITE_SETTINGS.value.email_contact || 'toasoan@newshub.vn'));
  const [breakingEnabled, setBreakingEnabled] = useState(Boolean(MOCK_SITE_SETTINGS.value.breaking_news_enabled));
  const [breakingText, setBreakingText] = useState(String(MOCK_SITE_SETTINGS.value.breaking_news_text || ''));
  const [saved, setSaved] = useState(false);
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthData, setHealthData] = useState<any>(null);

  const handleCheckHealth = async () => {
    setHealthLoading(true);
    try {
      const res = await fetch('/api/admin/system/health');
      const data = await res.json();
      setHealthData(data);
    } catch (e: any) {
      setHealthData({ status: 'error', error: e?.message });
    } finally {
      setHealthLoading(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-black text-[#172033]">
            Cấu Hình Hệ Thống & Nhận Diện Thương Hiệu
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Tùy biến tên thương hiệu, đường dây nóng, màu sắc chủ đạo và thanh tin nóng thời sự.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="bg-[#D71920] hover:bg-[#b8141a] text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-xs"
        >
          <Save className="w-4 h-4" />
          Lưu cấu hình
        </button>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Cấu hình hệ thống đã được lưu thành công!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Brand identity */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-100 pb-2">
            Nhận diện thương hiệu & Tòa soạn
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Tên thương hiệu tòa soạn
              </label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Màu sắc chủ đạo (Primary Hex)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-9 h-9 p-0.5 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Khẩu hiệu / Slogan tòa soạn
            </label>
            <input
              type="text"
              value={siteSlogan}
              onChange={(e) => setSiteSlogan(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Đường dây nóng (Hotline)
              </label>
              <input
                type="text"
                value={hotline}
                onChange={(e) => setHotline(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email tòa soạn
              </label>
              <input
                type="email"
                value={emailContact}
                onChange={(e) => setEmailContact(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>

        {/* Breaking News Banner Switch */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-100 pb-2">
            Thanh thông báo tin nóng (Breaking News Ticker)
          </h2>

          <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={breakingEnabled}
              onChange={(e) => setBreakingEnabled(e.target.checked)}
              className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
            />
            <span className="font-bold text-gray-900">Bật hiển thị thanh tin nóng trên đầu website</span>
          </label>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nội dung tin nóng
            </label>
            <input
              type="text"
              value={breakingText}
              onChange={(e) => setBreakingText(e.target.value)}
              placeholder="Nhập tiêu đề sự kiện khẩn cấp..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
            />
          </div>
        </div>
      </form>

      {/* System Health & Diagnostics Card */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#D71920]" />
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800">
                Chẩn đoán & Trạng thái hạ tầng hệ thống
              </h2>
              <p className="text-[11px] text-gray-500">
                Kiểm tra tính sẵn sàng của PostgreSQL Supabase, RLS policies, bộ máy tin tức và môi trường runtime.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCheckHealth}
            disabled={healthLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${healthLoading ? 'animate-spin text-[#D71920]' : ''}`} />
            <span>{healthLoading ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}</span>
          </button>
        </div>

        {healthData && (
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3 text-xs animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-600">Trạng thái tổng thể:</span>
              <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                healthData.status === 'healthy' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {healthData.status === 'healthy' ? '● Hoạt động tốt' : '● Cần lưu ý'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-200">
              <div className="flex items-start gap-2">
                <Database className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-gray-700">Cơ sở dữ liệu:</span>
                  <p className="text-gray-500 text-[11px]">
                    {healthData.database?.mode === 'live_supabase_postgresql' 
                      ? 'Supabase PostgreSQL (Live Production)' 
                      : 'Mock In-Memory Repository (Ready for Live Config)'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Trạng thái kết nối: {healthData.database?.status}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Server className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-gray-700">Runtime Engine:</span>
                  <p className="text-gray-500 text-[11px]">
                    Next.js App Router 16.4.1 (Node {healthData.system?.nodeVersion})
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Độ trễ phản hồi: {healthData.system?.responseTimeMs}ms
                  </p>
                </div>
              </div>
            </div>

            {healthData.system?.features && (
              <div className="pt-2 border-t border-gray-200">
                <span className="font-semibold text-gray-600 block mb-1">Tính năng lõi đã kích hoạt:</span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-medium">✓ Quy trình duyệt 7 bước</span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-medium">✓ Row Level Security (RLS)</span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-medium">✓ Tìm kiếm tiếng Việt Unaccent FTS</span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-medium">✓ Web Speech TTS Audio</span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-medium">✓ PWA Web Manifest</span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-medium">✓ Nghị định 13/2023/NĐ-CP</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
