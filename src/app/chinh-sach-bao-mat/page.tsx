import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chính Sách Bảo Mật Thông Tin Cá Nhân',
  description: 'Chính sách bảo vệ dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP trên NEWSHUB VIỆT NAM.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6 text-gray-700 text-xs sm:text-sm leading-relaxed">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-black text-[#172033] mb-2">
          Chính Sách Bảo Mật Dữ Liệu Cá Nhân
        </h1>
        <p className="text-xs text-gray-400">Tuân thủ Nghị định số 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân</p>
      </div>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-[#172033]">1. Thu thập dữ liệu</h2>
        <p>
          NEWSHUB VIỆT NAM chỉ thu thập các thông tin tối thiểu cần thiết phục vụ cho trải nghiệm của độc giả:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Địa chỉ email khi bạn tự nguyện đăng ký nhận bản tin (Newsletter) hoặc tạo tài khoản bình luận.</li>
          <li>Thông tin kỹ thuật ẩn danh (IP băm hash, loại trình duyệt) phục vụ phân tích tải trang và chống gian lận lượt nhấp quảng cáo.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-[#172033]">2. Cam kết bảo vệ và không chia sẻ dữ liệu</h2>
        <p>
          Chúng tôi cam kết tuyệt đối không bán, trao đổi hoặc chia sẻ thông tin cá nhân của bạn đọc cho bất kỳ bên thứ ba nào vì mục đích thương mại khi chưa có sự đồng thuận rõ ràng.
        </p>
        <p>
          Dữ liệu được lưu trữ trên cơ sở dữ liệu Supabase PostgreSQL có mã hóa dữ liệu khi nghỉ (Encryption at Rest) và mã hóa đường truyền qua SSL/TLS 1.3.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-[#172033]">3. Quyền của chủ thể dữ liệu</h2>
        <p>
          Độc giả có toàn quyền yêu cầu tra cứu, chỉnh sửa hoặc xóa vĩnh viễn thông tin cá nhân của mình khỏi hệ thống bằng cách gửi yêu cầu tới: <strong>privacy@newshub.vn</strong>.
        </p>
      </section>
    </div>
  );
}
