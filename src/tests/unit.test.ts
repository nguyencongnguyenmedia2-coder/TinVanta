import { describe, it, expect } from 'vitest';
import { generateVietnameseSlug, calculateReadingTime, formatDateVN, formatTimeAgoVN } from '@/lib/utils';
import { sanitizeArticleHtml } from '@/lib/security/sanitize';
import { ROLE_PERMISSIONS_MAP } from '@/lib/auth/rbac';

describe('1. Tiện ích xử lý ngôn ngữ tiếng Việt (Utilities)', () => {
  it('Tạo slug tiếng Việt chuẩn xác từ tiêu đề có dấu', () => {
    const title = 'Đột phá Trí tuệ Nhân tạo & Bán dẫn tại Việt Nam 2026!';
    const slug = generateVietnameseSlug(title);
    expect(slug).toBe('dot-pha-tri-tue-nhan-tao-ban-dan-tai-viet-nam-2026');
  });

  it('Tính toán thời gian đọc (Reading Time) hợp lý', () => {
    const text = 'Một hai ba bốn năm '.repeat(100); // 500 từ
    const minutes = calculateReadingTime(text);
    expect(minutes).toBe(2);
  });

  it('Định dạng ngày tháng tiếng Việt chuẩn xác', () => {
    const date = '2026-10-15T08:30:00.000Z';
    const formatted = formatDateVN(date, 'dd/MM/yyyy');
    expect(formatted).toBe('15/10/2026');
  });
});

describe('2. Kiểm tra an toàn bảo mật (Sanitization & XSS Prevention)', () => {
  it('Loại bỏ hoàn toàn thẻ <script> độc hại', () => {
    const maliciousHtml = '<p>Tin tức bình thường</p><script>alert("XSS Attack!")</script>';
    const cleaned = sanitizeArticleHtml(maliciousHtml);
    expect(cleaned).not.toContain('<script>');
    expect(cleaned).not.toContain('alert');
    expect(cleaned).toContain('<p>Tin tức bình thường</p>');
  });

  it('Loại bỏ thuộc tính onload/onerror bắt sự kiện nguy hiểm', () => {
    const maliciousImg = '<img src="invalid.jpg" onerror="alert(1)" /><p>Ảnh minh họa</p>';
    const cleaned = sanitizeArticleHtml(maliciousImg);
    expect(cleaned).not.toContain('onerror');
    expect(cleaned).toContain('src="invalid.jpg"');
  });

  it('Chặn liên kết javascript: giả mạo trong thẻ a', () => {
    const maliciousLink = '<a href="javascript:stealCookie()">Xem thêm</a>';
    const cleaned = sanitizeArticleHtml(maliciousLink);
    expect(cleaned).not.toContain('javascript:');
    expect(cleaned).toContain('href="#"');
  });
});

describe('3. Ma trận phân quyền RBAC (Role-Based Access Control)', () => {
  it('Super Admin có quyền toàn bộ wildcard (*)', () => {
    const perms = ROLE_PERMISSIONS_MAP.super_admin;
    expect(perms).toContain('*');
  });

  it('Phóng viên (Reporter) chỉ có quyền viết và sửa bài của chính mình, không có quyền publish', () => {
    const perms = ROLE_PERMISSIONS_MAP.reporter;
    expect(perms).toContain('articles.create');
    expect(perms).toContain('articles.update_own');
    expect(perms).not.toContain('articles.publish');
    expect(perms).not.toContain('articles.approve');
  });

  it('Tổng biên tập có quyền phê duyệt (approve) và xuất bản (publish)', () => {
    const perms = ROLE_PERMISSIONS_MAP.editor_in_chief;
    expect(perms).toContain('articles.approve');
    expect(perms).toContain('articles.publish');
    expect(perms).toContain('articles.schedule');
  });

  it('Độc giả chỉ có quyền đọc bài đã xuất bản', () => {
    const perms = ROLE_PERMISSIONS_MAP.reader;
    expect(perms).toEqual(['articles.read_published']);
  });
});
