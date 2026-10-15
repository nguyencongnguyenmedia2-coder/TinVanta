import React from 'react';
import type { Metadata } from 'next';
import { Newspaper, Target, Award, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Giới thiệu Tòa soạn | TinVanta',
  description: 'Tôn chỉ, mục đích và sứ mệnh của nền tảng báo điện tử TinVanta.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-black text-[#172033] mb-3">
          Về TinVanta
        </h1>
        <p className="text-gray-600 text-base leading-relaxed">
          Nền tảng tin tức số tổng hợp và phân tích đa phương tiện thế hệ mới, ứng dụng chuyển đổi số toàn diện trong quy trình thu thập, phân tích và cung cấp tri thức số.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
          <Target className="w-8 h-8 text-[#D71920] mb-3" />
          <h3 className="font-bold text-base text-[#172033] mb-2">Tôn chỉ hoạt động</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Trung thực, khách quan, tốc độ và có trách nhiệm xã hội. Đem lại giá trị thông tin xác thực cho độc giả.
          </p>
        </div>

        <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
          <Award className="w-8 h-8 text-[#D71920] mb-3" />
          <h3 className="font-bold text-base text-[#172033] mb-2">Chuẩn mực thông tin</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Quy trình kiểm chứng thông tin đa tầng chặt chẽ, đối chiếu nguồn báo chí chính thống và kiểm tra tính xác thực của dữ liệu.
          </p>
        </div>

        <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
          <Users className="w-8 h-8 text-[#D71920] mb-3" />
          <h3 className="font-bold text-base text-[#172033] mb-2">Độc giả là trung tâm</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Cung cấp trải nghiệm đọc văn minh, tốc độ tải trang dưới 2 giây và bảo vệ quyền riêng tư cá nhân tuyệt đối.
          </p>
        </div>
      </div>

      <div className="prose-editorial">
        <h2>Cơ cấu tổ chức vận hành</h2>
        <p>
          TinVanta vận hành theo mô hình trung tâm thông tin số hiện đại với các ban chuyên môn: Ban Thời sự & Chính sách, Ban Kinh tế & Thị trường, Ban Công nghệ & Đổi mới sáng tạo, Ban Đời sống xã hội và Trung tâm Kỹ thuật Dữ liệu.
        </p>
        <p>
          Hệ sinh thái công nghệ được xây dựng trên nền tảng đám mây mở rộng linh hoạt, tích hợp các công cụ hỗ trợ thông minh nhằm tối ưu năng suất lao động cho đội ngũ biên tập viên và chuyên viên phân tích dữ liệu.
        </p>
      </div>
    </div>
  );
}
