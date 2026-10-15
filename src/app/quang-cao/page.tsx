import React from 'react';
import type { Metadata } from 'next';
import { Megaphone, BarChart3, Users, Zap, CheckCircle2, Mail, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Hợp Tác Quảng Cáo & Truyền Thông | TinVanta',
  description: 'Báo giá dịch vụ quảng cáo, tài trợ chuyên mục và giải pháp truyền thông thương hiệu trên báo điện tử TinVanta.',
};

export default function AdvertisingPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-black text-[#172033] mb-2">
          Giải Pháp Quảng Cáo & Truyền Thông Thương Hiệu
        </h1>
        <p className="text-xs text-gray-500">
          Kết nối trực tiếp doanh nghiệp tới hơn 10 triệu độc giả có học thức, thu nhập khá và quan tâm sâu sắc tới thời sự, kinh tế.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-2 text-center">
          <Users className="w-8 h-8 text-[#D71920] mx-auto" />
          <h3 className="font-bold text-sm text-[#172033]">Độc giả chất lượng cao</h3>
          <p className="text-xs text-gray-500">65% độc giả trong độ tuổi 25 - 45, bao gồm giới chuyên gia, chủ doanh nghiệp và nhân sự quản lý.</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-2 text-center">
          <BarChart3 className="w-8 h-8 text-[#D71920] mx-auto" />
          <h3 className="font-bold text-sm text-[#172033]">Hiệu suất đo lường thực tế</h3>
          <p className="text-xs text-gray-500">Báo cáo lượt xem, lượt click minh bạch theo chuẩn IAB quốc tế, tích hợp công nghệ chống click fraud.</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-2 text-center">
          <Zap className="w-8 h-8 text-[#D71920] mx-auto" />
          <h3 className="font-bold text-sm text-[#172033]">Đa dạng định dạng</h3>
          <p className="text-xs text-gray-500">Banner Leaderboard, Native Sponsored Content, bài phân tích chuyên sâu (e-Magazine) và Video tài trợ.</p>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4">
        <h2 className="text-base font-bold text-[#172033] flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          Nguyên tắc quảng cáo có trách nhiệm
        </h2>
        <ul className="space-y-2 text-xs text-gray-600 list-disc pl-5 leading-relaxed">
          <li>Mọi bài viết tài trợ, nội dung truyền thông doanh nghiệp đều được gắn nhãn rõ ràng ("Tài trợ", "Quảng cáo") theo Luật Quảng cáo Việt Nam.</li>
          <li>Tuyệt đối không chèn quảng cáo làm che khuất nội dung bài báo hoặc gây nhầm lẫn cho độc giả.</li>
          <li>Không tiếp nhận quảng cáo cho các dịch vụ tài chính trái phép, cờ bạc hoặc thông tin chưa được kiểm chứng.</li>
        </ul>
      </div>

      <div className="bg-gradient-to-r from-[#172033] to-[#25324d] text-white p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold">Liên hệ Ban Quảng cáo & Hợp tác Doanh nghiệp</h3>
          <p className="text-xs text-gray-300">Nhận Media Kit và bảng báo giá chi tiết từng vị trí phát sóng.</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="font-bold text-amber-300">quangcao@tinvanta.vn</span>
          <span className="text-gray-400">|</span>
          <span className="font-bold text-white">Hotline: 1900 6868</span>
        </div>
      </div>
    </div>
  );
}
