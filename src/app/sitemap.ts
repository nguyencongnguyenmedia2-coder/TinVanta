import { MetadataRoute } from 'next';
import { getPublishedArticles, getCategories } from '@/lib/data/articles';

const STATIC_DATE = new Date('2026-10-15T00:00:00.000Z');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const [categories, articlesRes] = await Promise.all([
    getCategories(),
    getPublishedArticles({ limit: 100 })
  ]);

  // Static routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: STATIC_DATE,
      changeFrequency: 'always',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tin-moi-nhat`,
      lastModified: STATIC_DATE,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tim-kiem`,
      lastModified: STATIC_DATE,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/gioi-thieu`,
      lastModified: STATIC_DATE,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Category routes
  categories.forEach((cat) => {
    routes.push({
      url: `${baseUrl}/chuyen-muc/${cat.slug}`,
      lastModified: STATIC_DATE,
      changeFrequency: 'hourly',
      priority: 0.8,
    });
  });

  // Article routes
  articlesRes.articles.forEach((art) => {
    routes.push({
      url: `${baseUrl}/bai-viet/${art.slug}`,
      lastModified: art.updated_at ? new Date(art.updated_at) : STATIC_DATE,
      changeFrequency: 'weekly',
      priority: 0.85,
    });
  });

  return routes;
}
