import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Camera, Headphones, Sparkles, ChevronRight } from 'lucide-react';

interface MultimediaItem {
  id: string;
  type: 'video' | 'photo' | 'podcast' | 'emagazine';
  title: string;
  category: string;
  duration?: string;
  imageUrl: string;
  slug: string;
}

const MULTIMEDIA_ITEMS: MultimediaItem[] = [
  {
    id: 'mm-1',
    type: 'emagazine',
    title: 'Hành trình bán dẫn Việt Nam: Từ phòng thí nghiệm đến bản đồ công nghệ thế giới',
    category: 'E-MAGAZINE',
    duration: '10 phút đọc',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
    slug: 'viet-nam-but-pha-trong-chuoi-cung-ung-vi-mach-ban-dan-toan-cau'
  },
  {
    id: 'mm-2',
    type: 'video',
    title: 'Phóng sự: Tuyến đường sắt tốc độ cao Bắc - Nam sẽ thay đổi diện mạo kinh tế ra sao?',
    category: 'VIDEO',
    duration: '06:45',
    imageUrl: 'https://images.unsplash.com/photo-1541427468627-a89a96e5ca1d?w=800&auto=format&fit=crop&q=80',
    slug: 'day-nhanh-tien-do-du-an-duong-sat-toc-do-cao-truc-bac-nam'
  },
  {
    id: 'mm-3',
    type: 'photo',
    title: 'Toàn cảnh những cánh đồng năng lượng gió và mặt trời lớn nhất Việt Nam',
    category: 'PHOTO STORY',
    duration: '18 hình ảnh',
    imageUrl: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&auto=format&fit=crop&q=80',
    slug: 'kinh-te-tuan-hoan-va-tai-chinh-xanh-loi-mo-cho-doanh-nghiep-xuat-khau'
  },
  {
    id: 'mm-4',
    type: 'podcast',
    title: 'Podcast Podcast Hôm Nay: AI y tế và tương lai khám chữa bệnh không khoảng cách',
    category: 'PODCAST',
    duration: '22:15',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
    slug: 'dot-pha-ung-dung-tri-tue-nhan-tao-trong-chan-doan-y-khoa-tu-xa'
  }
];

export function MultimediaShowcase() {
  const leadItem = MULTIMEDIA_ITEMS[0];
  const subItems = MULTIMEDIA_ITEMS.slice(1);

  const getBadgeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="w-3 h-3 fill-current" />;
      case 'photo':
        return <Camera className="w-3 h-3" />;
      case 'podcast':
        return <Headphones className="w-3 h-3" />;
      default:
        return <Sparkles className="w-3 h-3" />;
    }
  };

  return (
    <section className="bg-[#101726] text-white rounded-3xl p-6 sm:p-8 my-10 shadow-xl overflow-hidden border border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-[#D71920] animate-ping"></span>
          <div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              Đa Phương Tiện & E-Magazine
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Trải nghiệm báo chí đồ họa tương tác, phóng sự ảnh và video chất lượng cao 4K.
            </p>
          </div>
        </div>

        <Link
          href="/tin-moi-nhat"
          className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
        >
          <span>Khám phá thêm</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Grid: 1 Hero Story Left + 3 Side Stories Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Hero Story (7 Cols) */}
        <div className="lg:col-span-7">
          <Link 
            href={`/bai-viet/${leadItem.slug}`}
            className="group relative block aspect-16/10 w-full rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 shadow-md"
          >
            <Image
              src={leadItem.imageUrl}
              alt={leadItem.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 bg-[#D71920] text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                <Sparkles className="w-3 h-3" />
                {leadItem.category}
              </span>
              <span className="bg-black/60 backdrop-blur-xs text-gray-300 text-[10px] font-medium px-2 py-0.5 rounded-full">
                {leadItem.duration}
              </span>
            </div>

            <div className="absolute bottom-5 left-5 right-5 space-y-2">
              <h3 className="text-lg sm:text-2xl font-black text-white leading-snug group-hover:text-red-300 transition-colors">
                {leadItem.title}
              </h3>
              <p className="text-xs text-gray-300 line-clamp-2 hidden sm:block">
                Tuyến bài E-Magazine đặc biệt với trải nghiệm đọc toàn màn hình, đồ họa tương tác và góc nhìn cận cảnh từ các chuyên gia đầu ngành.
              </p>
            </div>
          </Link>
        </div>

        {/* Right 3 Sub Stories (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          {subItems.map((item) => (
            <Link
              key={item.id}
              href={`/bai-viet/${item.slug}`}
              className="group flex items-center gap-4 bg-gray-900/60 hover:bg-gray-800/80 p-3 rounded-xl border border-gray-800/80 transition-all duration-300"
            >
              <div className="relative w-28 h-20 sm:w-32 sm:h-22 rounded-lg overflow-hidden shrink-0 bg-gray-800">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors" />
                <div className="absolute bottom-1.5 left-1.5">
                  <span className="w-6 h-6 rounded-full bg-black/70 backdrop-blur-xs text-white flex items-center justify-center text-[10px]">
                    {getBadgeIcon(item.type)}
                  </span>
                </div>
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                    {item.category}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    • {item.duration}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-gray-100 group-hover:text-red-300 transition-colors line-clamp-2 leading-snug">
                  {item.title}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
