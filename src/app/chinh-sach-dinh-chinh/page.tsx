import React from 'react';
import type { Metadata } from 'next';
import { AlertCircle, CheckCircle, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Chính sách Sửa lỗi & Đính chính | TinVanta',
  description: 'Quy trình tiếp nhận, xác minh và công khai sửa lỗi của tòa soạn báo điện tử TinVanta.',
};

export default function CorrectionsPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-black text-[#172033] mb-3">
          Chính Sách Sửa Lỗi & Đính Chính Thông Tin
        </h1>
        <p className="text-gray-600 text-sm leading-relaxed">
          Báo điện tử TinVanta cam kết tính minh bạch, chính trực và luôn sẵn sàng lắng nghe phản hồi để đính chính kịp thời mọi sai sót trong nội dung đã xuất bản.
        </p>
      </div>

      <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
        <section className="bg-gray-50 border border-gray-200 p-6 rounded-xl space-y-3">
          <h2 className="text-base font-bold text-[#172033] flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            1. Nguyên tắc đính chính công khai
          </h2>
          <p>
            Khi phát hiện thông tin không chính xác về số liệu, nhân vật, bối cảnh hoặc trích dẫn, tòa soạn sẽ lập tức cập nhật lại nội dung chính xác. Đồng thời, ghi chú rõ ràng ở cuối bài viết về nội dung đã thay đổi, thời gian sửa đổi và lý do điều chỉnh.
          </p>
        </section>

        <section className="bg-gray-50 border border-gray-200 p-6 rounded-xl space-y-3">
          <h2 className="text-base font-bold text-[#172033] flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            2. Quy trình tiếp nhận phản hồi từ độc giả
          </h2>
          <p>
            Độc giả, tổ chức hoặc cá nhân có liên quan khi phát hiện sai sót có thể gửi thư phản hồi về Ban Kiểm duyệt & Đính chính theo địa chỉ: <strong>dinhchinh@newshub.vn</strong> kèm theo các bằng chứng hoặc tài liệu xác minh đối chứng.
          </p>
          <p>
            Ban Biên tập sẽ xử lý và phản hồi bằng văn bản hoặc cập nhật trên bài viết trong vòng tối đa <strong>24 giờ làm việc</strong>.
          </p>
        </section>

        <section className="bg-gray-50 border border-gray-200 p-6 rounded-xl space-y-3">
          <h2 className="text-base font-bold text-[#172033] flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#D71920]" />
            3. Kênh tiếp nhận đường dây nóng
          </h2>
          <p>
            Hotline tiếp nhận khiếu nại và phản ánh báo chí: <strong>1900 6868</strong> (Hoạt động từ 08:00 đến 20:00 các ngày trong tuần).
          </p>
        </section>
      </div>
    </div>
  );
}
