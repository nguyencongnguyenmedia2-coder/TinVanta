import { NextResponse } from 'next/server';
import { getPublishedArticles } from '@/lib/data/articles';

const STATIC_UTC = 'Thu, 15 Oct 2026 00:00:00 GMT';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const { articles } = await getPublishedArticles({ limit: 30 });

  const itemsXml = articles
    .map((art) => `
    <item>
      <title><![CDATA[${art.title}]]></title>
      <link>${baseUrl}/bai-viet/${art.slug}</link>
      <guid isPermaLink="true">${baseUrl}/bai-viet/${art.slug}</guid>
      <description><![CDATA[${art.sapo}]]></description>
      <pubDate>${art.published_at ? new Date(art.published_at).toUTCString() : STATIC_UTC}</pubDate>
      <category><![CDATA[${art.category?.name || 'Tin tức'}]]></category>
      <author><![CDATA[${art.author?.email || 'toasoan@tinvanta.vn'} (${art.author?.full_name || 'TinVanta'})]]></author>
    </item>`)
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>TinVanta - Báo Điện Tử Tin Tức Nhanh &amp; Chuẩn Xác 24/7</title>
    <link>${baseUrl}</link>
    <description>Kênh thông tin thời sự, kinh tế, công nghệ cập nhật liên tục 24/7 với tôn chỉ: Tin tức nhanh - Thông tin chuẩn</description>
    <language>vi-VN</language>
    <lastBuildDate>${STATIC_UTC}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}
