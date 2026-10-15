import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Điều Khoản Sử Dụng | TinVanta',
  description: 'Điều khoản sử dụng và quy định khai thác nội dung trên báo điện tử TinVanta.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6 text-gray-700 text-xs sm:text-sm leading-relaxed">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-black text-[#172033] mb-2">
          Điều Khoản Sử Dụng
        </h1>
        <p className="text-xs text-gray-400">Có hiệu lực từ ngày 15/10/2026</p>
      </div>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-[#172033]">1. Chấp thuận điều khoản</h2>
        <p>
          Khi truy cập, đọc báo và sử dụng các dịch vụ trên nền tảng TinVanta, quý độc giả mặc nhiên đồng ý và tuân thủ các điều khoản, quy định được nêu rõ trong tài liệu này.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-[#172033]">2. Quyền sở hữu trí tuệ & Dẫn nguồn bài viết</h2>
        <p>
          Toàn bộ bài viết, phóng sự, hình ảnh tư liệu, video và đồ họa thông tin trên TinVanta thuộc quyền sở hữu của tòa soạn hoặc các đối tác đã được cấp phép hợp pháp.
        </p>
        <p>
          Các tổ chức, cá nhân khi trích dẫn nội dung bắt buộc phải:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Ghi rõ "Theo TinVanta" hoặc tác giả bài viết.</li>
          <li>Đặt liên kết ngược (hyperlink) trực tiếp đến bài viết gốc trên website.</li>
          <li>Không tự ý biên tập, thay đổi ý đồ hoặc câu chữ làm sai lệch bản chất sự việc.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-[#172033]">3. Quy tắc tham gia bình luận</h2>
        <p>
          Độc giả có quyền tự do bày tỏ quan điểm dưới mỗi bài viết nhưng phải tuân thủ chuẩn mực văn hóa ứng xử, không sử dụng ngôn từ kích động bạo lực, xúc phạm danh dự nhân phẩm người khác hoặc vi phạm pháp luật nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.
        </p>
      </section>
    </div>
  );
}
