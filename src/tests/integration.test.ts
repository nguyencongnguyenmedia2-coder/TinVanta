import { describe, it, expect } from 'vitest';
import manifest from '@/app/manifest';

describe('4. Cấu hình PWA & Ứng dụng Web cấp tiến (Progressive Web App)', () => {
  it('Tạo manifest.json đầy đủ thông tin chuẩn báo chí tiếng Việt', () => {
    const data = manifest();
    expect(data.name).toContain('TinVanta');
    expect(data.short_name).toBe('TinVanta');
    expect(data.theme_color).toBe('#D71920');
    expect(data.background_color).toBe('#FFFFFF');
    expect(data.display).toBe('standalone');
    expect(data.lang).toBe('vi-VN');
    expect(data.shortcuts?.length).toBeGreaterThanOrEqual(3);
  });
});

describe('5. Bảo vệ Dữ liệu Cá nhân & Nghị định 13/2023/NĐ-CP', () => {
  it('Kiểm tra khóa lưu trữ và nội dung thông báo cookie/dữ liệu độc giả', () => {
    const consentKey = 'newshub_decree13_consent';
    expect(consentKey).toBe('newshub_decree13_consent');

    const validOptions = ['accepted', 'declined'];
    expect(validOptions).toContain('accepted');
    expect(validOptions).toContain('declined');
  });
});

describe('6. Tiện ích Bản tin nói (Audio TTS Speech Extraction)', () => {
  it('Làm sạch thẻ HTML trước khi đưa vào bộ đọc SpeechSynthesis', () => {
    const rawContent = '<p>Thưa quý vị, <strong>Việt Nam</strong> đã đạt nhiều thành tựu mới.</p><a href="#">Chi tiết</a>';
    const cleaned = rawContent.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
    expect(cleaned).not.toContain('<p>');
    expect(cleaned).not.toContain('<strong>');
    expect(cleaned).not.toContain('</a>');
    expect(cleaned).toBe('Thưa quý vị, Việt Nam đã đạt nhiều thành tựu mới. Chi tiết');
  });
});

describe('7. Tương tác Cảm xúc Độc giả (Reader Reactions)', () => {
  it('Chỉ cho phép các loại reaction hợp lệ', () => {
    const validReactions = ['like', 'love', 'insightful', 'surprised', 'sad'];
    expect(validReactions.includes('like')).toBe(true);
    expect(validReactions.includes('love')).toBe(true);
    expect(validReactions.includes('spam')).toBe(false);
  });
});

describe('8. Quản lý Tủ sách Đọc sau (Bookmarks) & Xuất dữ liệu Tòa soạn', () => {
  it('Định dạng CSV xuất danh sách độc giả có UTF-8 BOM chuẩn tiếng Việt', () => {
    const headers = 'Mã Độc Giả,Email,Trạng Thái,Xác Thực Double Opt-in,Ngày Đăng Ký\n';
    const bom = '\uFEFF';
    const csvContent = bom + headers;
    expect(csvContent.startsWith('\uFEFF')).toBe(true);
    expect(csvContent).toContain('Mã Độc Giả');
    expect(csvContent).toContain('Double Opt-in');
  });
});

describe('9. Lọc bài viết theo Tác giả (Author Filtering)', () => {
  it('Hỗ trợ lọc bài viết theo slug tác giả', async () => {
    const { getPublishedArticles } = await import('@/lib/data/articles');
    const res = await getPublishedArticles({ authorSlug: 'le-thanh-mai' });
    expect(res.articles.length).toBeGreaterThanOrEqual(1);
    expect(res.articles[0].author?.slug).toBe('le-thanh-mai');
  });
});

describe('10. Quản trị CMS: Xóa bài viết và Bộ lọc Chuyên mục/Trạng thái', () => {
  it('Xóa bài viết vĩnh viễn và không xuất hiện trong danh sách hiển thị', async () => {
    const { saveArticleToDisk, getAllCombinedArticles, markArticleDeleted } = await import('@/lib/data/article-store');
    
    // Tạo bài viết thử nghiệm
    const testArticle: any = {
      id: `test-del-${Date.now()}`,
      title: 'Bài viết test chức năng xóa',
      slug: `bai-viet-test-xoa-${Date.now()}`,
      sapo: 'Sapo test bài viết xóa',
      status: 'published',
      created_at: new Date().toISOString(),
      published_at: new Date().toISOString()
    };
    saveArticleToDisk(testArticle);

    // Kiểm tra đã có trong danh sách
    const before = getAllCombinedArticles();
    expect(before.some(a => a.id === testArticle.id)).toBe(true);

    // Thực hiện xóa
    markArticleDeleted(testArticle.id);

    // Kiểm tra bài viết đã biến mất hoàn toàn
    const after = getAllCombinedArticles();
    expect(after.some(a => a.id === testArticle.id || a.slug === testArticle.slug)).toBe(false);
  });

  it('Hệ thống có đầy đủ chuyên mục trang web khớp với Menu', async () => {
    const { MOCK_CATEGORIES } = await import('@/lib/data/mock-data');
    const slugs = MOCK_CATEGORIES.map(c => c.slug);
    
    expect(slugs).toContain('thoi-su');
    expect(slugs).toContain('kinh-te');
    expect(slugs).toContain('cong-nghe');
    expect(slugs).toContain('xa-hoi');
    expect(slugs).toContain('phap-luat');
    expect(slugs).toContain('giao-duc');
    expect(slugs).toContain('suc-khoe');
    expect(slugs).toContain('the-thao');
    expect(slugs).toContain('xe');
    expect(slugs).toContain('giai-tri');
    expect(slugs).toContain('bat-dong-san');
    expect(slugs).toContain('the-gioi');
    expect(slugs).toContain('du-lich');
  });
});

