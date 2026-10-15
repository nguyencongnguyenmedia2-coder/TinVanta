import { MetadataRoute } from 'next';
import { getPublishedArticles, getCategories } from '@/lib/data/articles';
import { MOCK_AUTHORS, MOCK_TAGS } from '@/lib/data/mock-data';

const STATIC_DATE = new Date('2026-10-15T00:00:00.000Z');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tinvanta.vercel.app';

  const [categories, articlesRes] = await Promise.all([
    getCategories(),
    getPublishedArticles({ limit: 150 })
  ]);

  // 1. Static Core Landing & Policy Routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tin-moi-nhat`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/tim-kiem`,
      lastModified: STATIC_DATE,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/gioi-thieu`,
      lastModified: STATIC_DATE,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/lien-he`,
      lastModified: STATIC_DATE,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/chinh-sach-bao-mat`,
      lastModified: STATIC_DATE,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/dieu-khoan`,
      lastModified: STATIC_DATE,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/chinh-sach-dinh-chinh`,
      lastModified: STATIC_DATE,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // 2. Category Chuyên mục Routes
  categories.forEach((cat) => {
    routes.push({
      url: `${baseUrl}/chuyen-muc/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    });
  });

  // 3. Published Articles Routes
  articlesRes.articles.forEach((art) => {
    routes.push({
      url: `${baseUrl}/bai-viet/${art.slug}`,
      lastModified: art.updated_at ? new Date(art.updated_at) : (art.published_at ? new Date(art.published_at) : STATIC_DATE),
      changeFrequency: 'daily',
      priority: art.is_featured ? 0.9 : 0.85,
    });
  });

  // 4. Authors Tác giả Routes
  MOCK_AUTHORS.forEach((author) => {
    routes.push({
      url: `${baseUrl}/tac-gia/${author.slug}`,
      lastModified: STATIC_DATE,
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  });

  // 5. Trending Tags Chủ đề Routes
  MOCK_TAGS.forEach((tag) => {
    routes.push({
      url: `${baseUrl}/tag/${tag.slug}`,
      lastModified: STATIC_DATE,
      changeFrequency: 'daily',
      priority: 0.75,
    });
  });

  return routes;
}
