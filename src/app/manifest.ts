import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TinVanta — Báo Điện Tử Tin Tức Nhanh & Chuẩn Xác 24/7',
    short_name: 'TinVanta',
    description: 'TinVanta - Báo điện tử tin tức chính luận, kinh tế, công nghệ và xã hội hàng đầu Việt Nam. Tôn chỉ: Tin tức nhanh - Thông tin chuẩn.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#D71920',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    categories: ['news', 'magazines', 'politics'],
    lang: 'vi-VN',
    dir: 'ltr',
    orientation: 'portrait-primary',
    shortcuts: [
      {
        name: 'Tin Mới Nhất',
        short_name: 'Mới Nhất',
        description: 'Xem các luồng tin thời sự mới nhất 24/7',
        url: '/tin-moi-nhat',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Thời Sự',
        short_name: 'Thời Sự',
        description: 'Tin tức thời sự chính trị, xã hội trong nước',
        url: '/chuyen-muc/thoi-su',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Kinh Tế',
        short_name: 'Kinh Tế',
        description: 'Thị trường tài chính, chứng khoán, bất động sản',
        url: '/chuyen-muc/kinh-te',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
    ],
  };
}
