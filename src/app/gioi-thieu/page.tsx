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
          Về Báo Điện Tử TinVanta
        </h1>
        <p className="text-gray-600 text-base leading-relaxed">
          Nền tảng báo điện tử tin tức đa phương tiện thế hệ mới, ứng dụng chuyển đổi số toàn diện trong quy trình thu thập, biên tập và phân phối thông tin.
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
          <h3 className="font-bold text-base text-[#172033] mb-2">Chuẩn mực báo chí</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Quy trình kiểm chứng thông tin 3 cấp độ chặt chẽ từ phóng viên cơ sở đến biên tập viên và hội đồng biên tập.
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
        <h2>Cơ cấu tổ chức tòa soạn</h2>
        <p>
          TinVanta vận hành theo mô hình tòa soạn hội tụ hiện đại với các ban chuyên môn: Ban Thời sự - Chính trị, Ban Kinh tế & Thị trường, Ban Công nghệ & Đổi mới sáng tạo, Ban Xã hội & Đời sống, Ban Đa phương tiện Multimedia và Trung tâm Phân tích dữ liệu & Độc giả.
        </p>
        <p>
          Hệ sinh thái công nghệ được xây dựng trên nền tảng đám mây mở rộng linh hoạt, tích hợp các công cụ hỗ trợ thông minh nhằm tối ưu năng suất lao động cho đội ngũ nhà báo, phóng viên trên khắp các vùng miền.
        </p>
      </div>
    </div>
  );
}
