import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tinvanta.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/api/*',
          '/tai-khoan/*',
        ],
      },
      {
        userAgent: 'Googlebot-News',
        allow: [
          '/',
          '/bai-viet/*',
          '/chuyen-muc/*',
          '/tin-moi-nhat',
          '/rss.xml',
          '/sitemap.xml',
        ],
        disallow: [
          '/admin/*',
          '/api/*',
          '/tai-khoan/*',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/*',
          '/api/*',
          '/tai-khoan/*',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/admin/*',
          '/api/*',
          '/tai-khoan/*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
