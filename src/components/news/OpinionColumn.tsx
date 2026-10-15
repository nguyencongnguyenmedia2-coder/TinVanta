import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Quote, ChevronRight } from 'lucide-react';

interface OpinionItem {
  id: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  title: string;
  quote: string;
  slug: string;
}

const OPINIONS: OpinionItem[] = [
  {
    id: 'op-1',
    authorName: 'TS. Nguyễn Trí Dũng',
    authorRole: 'Viện trưởng Viện Nghiên cứu Đổi mới Sáng tạo',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    title: 'Việt Nam không thể chậm chân trong cuộc đua công nghệ bán dẫn',
    quote: 'Nửa thế kỷ trước là dầu mỏ, còn thế kỷ 21 là vi mạch. Nắm giữ công nghệ lõi là chìa khóa định vị tương lai kinh tế quốc gia.',
    slug: 'viet-nam-but-pha-trong-chuoi-cung-ung-vi-mach-ban-dan-toan-cau'
  },
  {
    id: 'op-2',
    authorName: 'PGS. Trần Hải Nam',
    authorRole: 'Chuyên gia Kinh tế Tài chính & Thị trường Vốn',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    title: 'Kinh tế tuần hoàn: Không chỉ là trào lưu mà là mệnh lệnh sinh tồn',
    quote: 'Nếu doanh nghiệp xuất khẩu không đáp ứng tiêu chuẩn xanh ESG từ hôm nay, cánh cửa tiếp cận thị trường toàn cầu sẽ sớm khép lại.',
    slug: 'kinh-te-tuan-hoan-va-tai-chinh-xanh-loi-mo-cho-doanh-nghiep-xuat-khau'
  },
  {
    id: 'op-3',
    authorName: 'Nhà báo Lê Thanh Mai',
    authorRole: 'Trưởng ban Công nghệ & Đời sống số',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    title: 'Trí tuệ nhân tạo y tế: Trợ lý đắc lực hay phép thử đạo đức?',
    quote: 'AI có thể đọc phim X-quang trong vài giây, nhưng sự thấu cảm và lương tri của bác sĩ mới là yếu tố quyết định sự hồi phục của người bệnh.',
    slug: 'dot-pha-ung-dung-tri-tue-nhan-tao-trong-chan-doan-y-khoa-tu-xa'
  }
];

export function OpinionColumn() {
  return (
    <section className="bg-gradient-to-br from-amber-50/70 via-white to-red-50/40 rounded-2xl border border-amber-200/80 p-5 sm:p-6 shadow-xs my-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-200/60 pb-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#D71920] text-white flex items-center justify-center shadow-xs">
            <Quote className="w-4 h-4 fill-current" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-[#172033] tracking-tight uppercase">
              Góc Nhìn & Bình Luận Chuyên Gia
            </h2>
            <p className="text-[11px] text-gray-500">
              Phân tích đa chiều, tiếng nói sắc sảo và giải pháp từ các học giả, chuyên gia đầu ngành.
            </p>
          </div>
        </div>

        <Link 
          href="/chuyen-muc/thoi-su" 
          className="text-xs font-bold text-[#D71920] hover:underline flex items-center gap-0.5 shrink-0"
        >
          <span>Xem tất cả</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 3 Columns Opinions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {OPINIONS.map((item) => (
          <article 
            key={item.id}
            className="bg-white/90 rounded-xl p-4 sm:p-5 border border-amber-100 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group hover:-translate-y-0.5"
          >
            <div>
              {/* Author info */}
              <div className="flex items-center gap-3 mb-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#D71920]/20 shrink-0">
                  <Image 
                    src={item.authorAvatar} 
                    alt={item.authorName} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-xs text-[#172033] truncate">
                    {item.authorName}
                  </h4>
                  <p className="text-[10px] text-gray-500 line-clamp-1">
                    {item.authorRole}
                  </p>
                </div>
              </div>

              {/* Title */}
              <h3 className="font-bold text-sm text-[#172033] group-hover:text-[#D71920] transition-colors leading-snug mb-2 line-clamp-2">
                <Link href={`/bai-viet/${item.slug}`}>
                  {item.title}
                </Link>
              </h3>

              {/* Quote text */}
              <blockquote className="text-xs text-gray-600 italic border-l-2 border-amber-400 pl-2.5 my-2 line-clamp-3 leading-relaxed">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
            </div>

            <div className="pt-3 border-t border-gray-100 mt-2">
              <Link 
                href={`/bai-viet/${item.slug}`}
                className="text-[11px] font-bold text-[#D71920] hover:underline inline-flex items-center gap-1"
              >
                Đọc toàn văn bình luận
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
