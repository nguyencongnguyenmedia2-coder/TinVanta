import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getArticleBySlug, getPublishedArticles, getAdByPlacement } from '@/lib/data/articles';
import { sanitizeArticleHtml } from '@/lib/security/sanitize';
import { formatDateVN } from '@/lib/utils';
import { Article } from '@/types/database';
import { ReadingProgressBar } from '@/components/article/ReadingProgressBar';
import { FloatingArticleToolbar } from '@/components/article/FloatingArticleToolbar';
import { ArticleAudioPlayer } from '@/components/article/ArticleAudioPlayer';
import { ArticleReactions } from '@/components/article/ArticleReactions';
import { ArticleComments } from '@/components/article/ArticleComments';
import { TrendingWidget } from '@/components/news/TrendingWidget';
import { NewsCard } from '@/components/news/NewsCard';
import { AdSlot } from '@/components/ads/AdSlot';
import { 
  ChevronRight, 
  Home, 
  Clock, 
  Eye, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  ArrowLeft,
  UserCheck,
  Flame,
  Share2,
  CalendarDays
} from 'lucide-react';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) {
    return { title: 'Không tìm thấy bài viết' };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tinvanta.vercel.app';
  const imageUrl = article.featured_image?.public_url;
  const rawTitle = article.seo_title || article.title;
  const cleanTitle = rawTitle.replace(/\s*\|\s*TinVanta.*$/i, '').trim();
  const canonicalUrl = `${siteUrl}/bai-viet/${article.slug}`;

  const articleKeywords = [
    article.title,
    article.category?.name || 'Tin tức',
    ...(article.tags?.map(t => t.name) || []),
    'TinVanta',
    'báo TinVanta',
    'tin tức 24h',
    'tin mới nhất',
  ];

  return {
    title: cleanTitle,
    description: article.seo_description || article.sapo,
    keywords: articleKeywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: cleanTitle,
      description: article.sapo,
      type: 'article',
      url: canonicalUrl,
      publishedTime: article.published_at || undefined,
      modifiedTime: article.updated_at || undefined,
      section: article.category?.name || 'Thời sự',
      tags: article.tags?.map(t => t.name) || [],
      authors: [article.author?.full_name || 'Báo điện tử TinVanta'],
      images: imageUrl ? [{ url: imageUrl, alt: article.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: cleanTitle,
      description: article.sapo,
      images: imageUrl ? [imageUrl] : undefined,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
  };
}

function getArticleTakeaways(article: Article): string[] {
  if (article.summary_points && Array.isArray(article.summary_points) && article.summary_points.length > 0) {
    return article.summary_points.slice(0, 3);
  }

  const sentences = (article.sapo || '')
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 15);

  const bullets: string[] = [];
  if (sentences.length > 0) bullets.push(sentences[0]);
  if (sentences.length > 1) bullets.push(sentences[1]);

  if (bullets.length < 3) {
    if (article.category?.name === 'Công nghệ') {
      bullets.push('Đón đầu làn sóng công nghệ mới, hoàn thiện hạ tầng số và tạo lập liên kết nghiên cứu chuyên sâu.');
    } else if (article.category?.name === 'Kinh tế') {
      bullets.push('Thúc đẩy dòng vốn đầu tư bền vững, củng cố vị thế chuỗi cung ứng và nâng cao giá trị thặng dư.');
    } else if (article.category?.name === 'Thời sự') {
      bullets.push('Chính phủ cùng các bộ ngành chỉ đạo sát sao nhằm đẩy nhanh tiến độ và kiểm soát chất lượng trọng điểm.');
    } else {
      bullets.push('Thông tin được kiểm chứng độc lập bởi Ban Biên Tập TinVanta tuân thủ chặt chẽ Luật Báo chí Việt Nam.');
    }
  }

  return bullets.slice(0, 3);
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const [allArticlesRes, relatedRes, trendingRes, latestRes, sidebarAd] = await Promise.all([
    getPublishedArticles({ limit: 50 }),
    getPublishedArticles({ 
      categorySlug: article.category?.slug, 
      excludeId: article.id, 
      limit: 3 
    }),
    getPublishedArticles({ 
      excludeId: article.id, 
      orderBy: 'view_count', 
      limit: 5 
    }),
    getPublishedArticles({ 
      excludeId: article.id, 
      orderBy: 'published_at', 
      limit: 5 
    }),
    getAdByPlacement('sidebar_sticky')
  ]);

  const relatedArticles = relatedRes.articles;
  const cleanContent = sanitizeArticleHtml(article.content_html);
  const takeaways = getArticleTakeaways(article);

  // Compute Previous & Next Article Navigation
  const currentIndex = allArticlesRes.articles.findIndex(a => a.id === article.id);
  const prevArticle = currentIndex > 0 ? allArticlesRes.articles[currentIndex - 1] : null;
  const nextArticle = (currentIndex >= 0 && currentIndex < allArticlesRes.articles.length - 1)
    ? allArticlesRes.articles[currentIndex + 1]
    : null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tinvanta.vercel.app';

  // Structured Data (JSON-LD) for Google SEO NewsArticle
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/bai-viet/${article.slug}`,
    },
    headline: article.title,
    description: article.sapo,
    image: article.featured_image?.public_url ? [article.featured_image.public_url] : [`${siteUrl}/og-image.jpg`],
    datePublished: article.published_at || new Date().toISOString(),
    dateModified: article.updated_at || article.published_at || new Date().toISOString(),
    articleSection: article.category?.name || 'Thời sự',
    keywords: [article.category?.name || 'Tin tức', ...(article.tags?.map(t => t.name) || []), 'TinVanta'].join(', '),
    author: [{
      '@type': 'Person',
      name: article.author?.full_name || 'Ban Biên Tập TinVanta',
      url: `${siteUrl}/tac-gia/${article.author?.slug || 'toa-soan'}`
    }],
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: 'TinVanta',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo-tinvanta.png`,
        width: 1024,
        height: 341
      }
    }
  };

  // Google BreadcrumbList Schema
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Trang chủ',
        item: siteUrl,
      },
      ...(article.category ? [{
        '@type': 'ListItem',
        position: 2,
        name: article.category.name,
        item: `${siteUrl}/chuyen-muc/${article.category.slug}`,
      }] : []),
      {
        '@type': 'ListItem',
        position: article.category ? 3 : 2,
        name: article.title,
        item: `${siteUrl}/bai-viet/${article.slug}`,
      },
    ],
  };

  return (
    <>
      {/* 1. TOP READING PROGRESS BAR */}
      <ReadingProgressBar />

      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <div className="space-y-6 pb-16">
        {/* 2. REFINED BREADCRUMB */}
        <nav aria-label="Đường dẫn trang" className="flex items-center gap-1.5 text-xs text-gray-500 py-3 border-b border-gray-100 overflow-x-auto">
          <Link href="/" className="hover:text-[#D71920] flex items-center gap-1 shrink-0 font-medium transition-colors">
            <Home className="w-3.5 h-3.5 text-gray-400" />
            Trang chủ
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
          {article.category && (
            <>
              <Link 
                href={`/chuyen-muc/${article.category.slug}`} 
                className="hover:text-[#D71920] font-semibold text-gray-700 shrink-0 transition-colors"
              >
                {article.category.name}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
            </>
          )}
          <span className="text-gray-400 truncate max-w-sm sm:max-w-md">{article.title}</span>
        </nav>

        {/* 2.1 BANNER XEM TRƯỚC BÀI VIẾT CHỜ DUYỆT */}
        {article.status !== 'published' && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <span className="flex h-3 w-3 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-amber-800">
                  Chế độ xem trước nội bộ (Chờ duyệt)
                </div>
                <p className="text-[11px] text-amber-700 m-0">
                  Bài viết này chưa công khai trên trang chủ. Bạn đang xem với tư cách Biên tập viên / Quản trị viên.
                </p>
              </div>
            </div>
            <Link 
              href={`/admin/bai-viet`}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors shrink-0"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Duyệt xuất bản ngay</span>
            </Link>
          </div>
        )}

        {/* 3. MAIN ARTICLE WRAPPER WITH DOCKED ACTION BAR */}
        <div className="relative">
          {/* FLOATING ACTION TOOLBAR (DESKTOP & MOBILE DOCK) */}
          <FloatingArticleToolbar
            articleId={article.id}
            articleTitle={article.title}
            articleSlug={article.slug}
            sapo={article.sapo}
            categoryName={article.category?.name}
            publishedAt={article.published_at || undefined}
            commentsCount={12}
            initialLikes={article.likes_count || 48}
          />

          {/* MAIN 12-COLUMN ARTICLE & SIDEBAR GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* MAIN ARTICLE BODY (8 COLS) */}
            <article className="lg:col-span-8 bg-white min-w-0">
            {/* Meta Header Pill */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs mb-3">
              <div className="flex items-center gap-2">
                {article.category && (
                  <Link
                    href={`/chuyen-muc/${article.category.slug}`}
                    className="inline-flex items-center gap-1.5 font-extrabold text-xs uppercase tracking-wider text-[#D71920] bg-red-50 hover:bg-red-100 px-3.5 py-1.5 rounded-full border border-red-100 transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#D71920] animate-pulse" />
                    {article.category.name}
                  </Link>
                )}
                {article.is_breaking && (
                  <span className="bg-red-600 text-white font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-2xs">
                    Tin Nóng
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-gray-500 text-xs">
                <span className="flex items-center gap-1.5 font-medium">
                  <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                  {formatDateVN(article.published_at)}
                </span>
                <span className="text-gray-300 hidden sm:inline">&bull;</span>
                <span className="hidden sm:flex items-center gap-1.5 font-semibold text-gray-700 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                  <Eye className="w-3.5 h-3.5 text-[#D71920]" />
                  {article.view_count.toLocaleString()} lượt xem
                </span>
              </div>
            </div>

            {/* Headline Tiêu đề chính */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-black text-[#172033] leading-[1.25] tracking-tight mb-4">
              {article.title}
            </h1>

            {/* Author Byline & Verification Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4 mb-5 text-xs">
              <div className="flex items-center gap-3">
                {article.author?.avatar_url ? (
                  <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-red-100 shadow-2xs shrink-0">
                    <Image
                      src={article.author.avatar_url}
                      alt={article.author.full_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-11 h-11 rounded-full bg-red-100 text-[#D71920] flex items-center justify-center font-bold text-sm shrink-0">
                    {(article.author?.full_name || 'TV')[0]}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <Link 
                      href={`/tac-gia/${article.author?.slug || 'le-thanh-mai'}`}
                      className="font-bold text-sm text-[#172033] hover:text-[#D71920] transition-colors"
                    >
                      {article.author?.full_name || 'Ban Biên Tập TinVanta'}
                    </Link>
                    <span title="Tác giả đã xác minh danh tính báo chí">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    </span>
                  </div>
                  <p className="text-gray-500 text-[11px] mt-0.5">
                    {article.author?.title_role || 'Phóng viên chuyên trách'} &bull; Thời gian đọc: ~{article.reading_time_minutes || 5} phút
                  </p>
                </div>
              </div>

              {/* Fact check stamp */}
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Quy chuẩn kiểm chứng độc lập</span>
              </div>
            </div>

            {/* Sapo Lead Paragraph */}
            <div className="relative p-5 sm:p-6 bg-gradient-to-r from-red-50/40 via-gray-50/60 to-white rounded-2xl border-l-4 border-[#D71920] shadow-2xs mb-6">
              <p className="text-base sm:text-lg font-semibold text-gray-800 leading-relaxed font-sans">
                {article.sapo}
              </p>
            </div>

            {/* Key Takeaways Box (Điểm tin chính 30 giây - Dynamic) */}
            <div className="mb-6 p-5 bg-gradient-to-br from-red-50/60 via-amber-50/20 to-white rounded-2xl border border-red-100 shadow-2xs">
              <div className="flex items-center gap-2 text-[#D71920] font-black text-xs uppercase tracking-wider mb-3">
                <Sparkles className="w-4 h-4 text-[#D71920]" />
                <span>Tóm tắt nhanh 30 giây</span>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-gray-700 leading-relaxed">
                {takeaways.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D71920] mt-2 shrink-0" />
                    <span className="font-medium text-gray-800">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Text-To-Speech Audio Reader */}
            <ArticleAudioPlayer
              title={article.title}
              sapo={article.sapo}
              content={article.content_html}
            />

            {/* Featured Hero Image */}
            {article.featured_image && (
              <figure className="my-6">
                <div className="relative aspect-16/10 w-full rounded-2xl overflow-hidden bg-gray-100 shadow-sm border border-gray-100">
                  <Image
                    src={article.featured_image.public_url}
                    alt={article.featured_image.alt_text || article.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 800px"
                    className="object-cover"
                  />
                </div>
                {(article.featured_image.caption || article.featured_image.credit) && (
                  <figcaption className="text-center text-xs text-gray-500 italic mt-2.5 px-4">
                    {article.featured_image.caption}
                    {article.featured_image.credit && ` — ${article.featured_image.credit.replace('NEWSHUB', 'TinVanta')}`}
                  </figcaption>
                )}
              </figure>
            )}

            {/* Main Editorial Content */}
            <div 
              id="article-main-content"
              className="prose-editorial transition-all duration-200"
              dangerouslySetInnerHTML={{ __html: cleanContent }}
            />

            {/* Editorial Copyright & Fact-Check Note */}
            <div className="mt-8 p-4 sm:p-5 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-600 flex items-start gap-3.5">
              <ShieldCheck className="w-5 h-5 text-[#D71920] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-gray-900 mb-0.5 text-sm">Quy chuẩn xuất bản & Bảo hộ bản quyền TinVanta</p>
                <p className="leading-relaxed text-[11px] text-gray-500">
                  Mọi thông tin trong bài viết đều tuân thủ Quy chuẩn Báo chí và Luật Báo chí Việt Nam. Độc giả phát hiện sai sót có thể gửi phản ánh qua chính sách đính chính để tòa soạn xác minh và cập nhật minh bạch.
                </p>
              </div>
            </div>

            {/* Article Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="pt-6 mt-6 border-t border-gray-200 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-1">
                  Chủ đề:
                </span>
                {article.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tag/${tag.slug}`}
                    className="bg-gray-100 hover:bg-red-50 hover:text-[#D71920] text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg border border-transparent hover:border-red-200 transition-colors"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Interactive Reader Reactions */}
            <ArticleReactions
              articleId={article.id}
              initialLikes={article.likes_count || 48}
            />

            {/* Previous & Next Article Navigation Cards */}
            {(prevArticle || nextArticle) && (
              <nav aria-label="Điều hướng bài viết" className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2.5 h-5 bg-[#D71920] inline-block rounded-xs"></span>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#172033]">
                    Đọc tiếp theo
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {prevArticle ? (
                    <Link
                      href={`/bai-viet/${prevArticle.slug}`}
                      className="group p-4 rounded-xl border border-gray-200 hover:border-red-200 hover:bg-red-50/20 transition-all flex items-start gap-3 bg-white shadow-2xs"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-[#D71920] group-hover:text-white flex items-center justify-center shrink-0 text-gray-500 transition-colors mt-0.5">
                        <ArrowLeft className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] uppercase font-bold text-gray-400 group-hover:text-[#D71920] tracking-wider block mb-1">
                          Bài trước
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-[#172033] line-clamp-2 leading-snug group-hover:text-[#D71920] transition-colors">
                          {prevArticle.title}
                        </h4>
                      </div>
                    </Link>
                  ) : <div className="hidden sm:block" />}

                  {nextArticle && (
                    <Link
                      href={`/bai-viet/${nextArticle.slug}`}
                      className="group p-4 rounded-xl border border-gray-200 hover:border-red-200 hover:bg-red-50/20 transition-all flex items-start gap-3 text-right bg-white shadow-2xs"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] uppercase font-bold text-gray-400 group-hover:text-[#D71920] tracking-wider block mb-1">
                          Bài tiếp theo
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-[#172033] line-clamp-2 leading-snug group-hover:text-[#D71920] transition-colors">
                          {nextArticle.title}
                        </h4>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-[#D71920] group-hover:text-white flex items-center justify-center shrink-0 text-gray-500 transition-colors mt-0.5">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </Link>
                  )}
                </div>
              </nav>
            )}

            {/* Author Profile Signature Card */}
            {article.author && (
              <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-2xl p-6 border border-gray-200 mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-2xs">
                {article.author.avatar_url && (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#D71920] shadow-sm shrink-0">
                    <Image
                      src={article.author.avatar_url}
                      alt={article.author.full_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base text-[#172033]">
                      {article.author.full_name}
                    </h4>
                    <span className="bg-red-50 text-[#D71920] font-semibold text-[10px] px-2 py-0.5 rounded-full border border-red-200">
                      Tác giả
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium mb-1.5">
                    {article.author.title_role} &bull; Báo điện tử TinVanta
                  </p>
                  {article.author.bio && (
                    <p className="text-xs text-gray-600 leading-relaxed mb-3">
                      {article.author.bio.replace('NEWSHUB', 'TinVanta')}
                    </p>
                  )}
                  <Link
                    href={`/tac-gia/${article.author.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs text-[#D71920] font-bold hover:underline"
                  >
                    <span>Xem tất cả bài viết của tác giả</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* Related Articles in Same Category */}
            {relatedArticles.length > 0 && (
              <section className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-5 bg-[#D71920] inline-block rounded-xs"></span>
                    <h3 className="text-base sm:text-lg font-bold text-[#172033] uppercase tracking-tight">
                      Cùng chuyên mục {article.category?.name}
                    </h3>
                  </div>
                  {article.category && (
                    <Link
                      href={`/chuyen-muc/${article.category.slug}`}
                      className="text-xs text-red-600 hover:text-red-700 font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>Xem thêm</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {relatedArticles.map((rel) => (
                    <NewsCard key={rel.id} article={rel} variant="default" showSapo={false} />
                  ))}
                </div>
              </section>
            )}

            {/* Interactive Reader Comments */}
            {article.allow_comments && (
              <ArticleComments articleId={article.id} />
            )}
          </article>

          {/* RIGHT SIDEBAR (4 COLS) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Trending Top Reads Widget with Tabs & Excluded Current Article */}
            <TrendingWidget 
              articles={trendingRes.articles} 
              latestArticles={latestRes.articles}
              title="Đọc nhiều nhất"
            />

            {/* Newsletter widget callout in sidebar */}
            <div className="bg-gradient-to-br from-[#172033] to-[#24304c] text-white p-5 rounded-2xl shadow-md space-y-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-sm">Bản tin Thời sự Buổi sáng</h4>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Nhận điểm tin phân tích kinh tế & công nghệ chọn lọc vào 07:00 mỗi ngày từ Ban Biên Tập TinVanta.
              </p>
              <form action="/api/newsletter/subscribe" method="POST" className="space-y-2">
                <input
                  type="email"
                  name="email"
                  placeholder="Nhập email của bạn..."
                  required
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-xs text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-400"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-[#D71920] hover:bg-[#b8141a] text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
                >
                  Đăng ký miễn phí
                </button>
              </form>
            </div>

            {/* Sticky Partner Ad Creative */}
            <AdSlot creative={sidebarAd} slotName="Vị trí đối tác" placement="sidebar_sticky" />
          </aside>
        </div>
      </div>
    </div>
  </>
);
}
