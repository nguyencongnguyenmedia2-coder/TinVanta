import React from 'react';
import type { Metadata } from 'next';
import { Mail, Phone, MapPin } from 'lucide-react';
import { ContactForm } from '@/components/forms/ContactForm';

export const metadata: Metadata = {
  title: 'Liên Hệ Tòa Soạn',
  description: 'Thông tin liên hệ tòa soạn, đường dây nóng và gửi thông tin phản ánh báo chí.',
};

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-black text-[#172033] mb-2">
          Liên Hệ TinVanta
        </h1>
        <p className="text-xs text-gray-500">
          Tiếp nhận thông tin bạn đọc, hợp tác truyền thông, tài trợ và quảng cáo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Info (Left) */}
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4 text-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#172033]">
              Văn phòng Hà Nội
            </h2>
            <p className="flex items-start gap-2.5 text-gray-600">
              <MapPin className="w-4 h-4 text-[#D71920] shrink-0 mt-0.5" />
              <span>Tầng 8, Tòa nhà Detech Tower, Số 8 Tôn Thất Thuyết, P. Mỹ Đình 2, Q. Nam Từ Liêm, Hà Nội</span>
            </p>
            <p className="flex items-center gap-2.5 text-gray-600">
              <Phone className="w-4 h-4 text-[#D71920] shrink-0" />
              <span>Đường dây nóng 24/7: <strong>1900 6868</strong></span>
            </p>
            <p className="flex items-center gap-2.5 text-gray-600">
              <Mail className="w-4 h-4 text-[#D71920] shrink-0" />
              <span>Email ban bạn đọc: bandoctoasoan@tinvanta.vn</span>
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4 text-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#172033]">
              Văn phòng TP. Hồ Chí Minh
            </h2>
            <p className="flex items-start gap-2.5 text-gray-600">
              <MapPin className="w-4 h-4 text-[#D71920] shrink-0 mt-0.5" />
              <span>Tầng 6, Tòa nhà Dreamplex, 195 Điện Biên Phủ, Phường 15, Q. Bình Thạnh, TP. Hồ Chí Minh</span>
            </p>
            <p className="flex items-center gap-2.5 text-gray-600">
              <Phone className="w-4 h-4 text-[#D71920] shrink-0" />
              <span>Điện thoại: <strong>(028) 3822 6868</strong></span>
            </p>
          </div>
        </div>

        {/* Contact Form (Right) */}
        <ContactForm />
      </div>
    </div>
  );
}
