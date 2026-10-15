import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BreakingTicker } from '@/components/layout/BreakingTicker';
import { DecreeConsentBanner } from '@/components/layout/DecreeConsentBanner';
import { getCategories, getSiteSettings } from '@/lib/data/articles';
import { MainContentWrapper } from '@/components/layout/MainContentWrapper';
import { Suspense } from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: {
    template: '%s | TinVanta — Tin tức nhanh, thông tin chuẩn',
    default: 'TinVanta - Báo Điện Tử Tin Tức Hàng Đầu 24/7 | Tin Nhanh & Chuẩn Xác',
  },
  description: 'TinVanta - Nền tảng báo điện tử tin tức chính luận, kinh tế, công nghệ và đời sống xã hội hàng đầu Việt Nam. Cập nhật liên tục 24/7 với tôn chỉ: Tin tức nhanh - Thông tin chuẩn.',
  keywords: [
    'TinVanta',
    'tin tức',
    'báo điện tử',
    'tin nhanh',
    'thông tin chuẩn',
    'thời sự 24h',
    'kinh tế việt nam',
    'công nghệ bán dẫn',
    'trí tuệ nhân tạo',
    'thị trường tài chính',
    'đời sống xã hội'
  ],
  authors: [{ name: 'Ban Biên Tập TinVanta', url: `${SITE_URL}/gioi-thieu` }],
  creator: 'TinVanta Editorial Team',
  publisher: 'TinVanta',
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': [{ url: '/rss.xml', title: 'TinVanta RSS 2.0 Feed' }],
    },
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: '/',
    siteName: 'TinVanta',
    title: 'TinVanta - Báo Điện Tử Tin Tức Hàng Đầu 24/7 | Tin Nhanh & Chuẩn Xác',
    description: 'Cập nhật liên tục tin tức thời sự, kinh tế, công nghệ, xã hội, thể thao nhanh chóng và chuẩn xác nhất tại Việt Nam.',
    images: [
      {
        url: '/logo-tinvanta.png',
        width: 1024,
        height: 341,
        alt: 'TinVanta — Tin tức nhanh, thông tin chuẩn',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TinVanta - Tin Tức Nhanh, Thông Tin Chuẩn',
    description: 'Báo điện tử tin tức tổng hợp 24/7 hàng đầu Việt Nam.',
    images: ['/logo-tinvanta.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/logo-tinvanta.png',
    shortcut: '/logo-tinvanta.png',
    apple: '/logo-tinvanta.png',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, settings] = await Promise.all([
    getCategories(),
    getSiteSettings()
  ]);

  const breakingEnabled = Boolean(settings.value?.breaking_news_enabled);
  const breakingText = String(settings.value?.breaking_news_text || '');
  const breakingLink = String(settings.value?.breaking_news_link || '/');
  const siteName = String(settings.value?.site_name || 'TinVanta');
  const siteSlogan = String(settings.value?.site_slogan || 'Tin tức nhanh — Thông tin chuẩn');

  // GOOGLE E-E-A-T & NEWS MEDIA ORGANIZATION STRUCTURED DATA
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: 'TinVanta',
    alternateName: 'TinVanta News',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo-tinvanta.png`,
      width: 1024,
      height: 341,
    },
    publishingPrinciples: `${SITE_URL}/chinh-sach-dinh-chinh`,
    correctionsPolicy: `${SITE_URL}/chinh-sach-dinh-chinh`,
    ethicsPolicy: `${SITE_URL}/dieu-khoan`,
    diversityPolicy: `${SITE_URL}/gioi-thieu`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+84-1900-6868',
      contactType: 'editorial newsroom',
      areaServed: 'VN',
      availableLanguage: ['Vietnamese'],
    },
  };

  // GOOGLE SITELINKS SEARCHBOX SCHEMA
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'TinVanta',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/tim-kiem?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="vi" className="h-full antialiased scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-[#202124]">
        <Suspense fallback={null}>
          {breakingEnabled && breakingText && (
            <BreakingTicker text={breakingText} link={breakingLink} />
          )}
          <Header 
            categories={categories} 
            siteName={siteName} 
            siteSlogan={siteSlogan} 
          />
        </Suspense>

        <Suspense fallback={<main className="flex-1 max-w-7xl w-full mx-auto px-4 py-4">{children}</main>}>
          <MainContentWrapper>
            {children}
          </MainContentWrapper>
        </Suspense>

        <Suspense fallback={null}>
          <Footer categories={categories} />
          <DecreeConsentBanner />
        </Suspense>
      </body>
    </html>
  );
}
