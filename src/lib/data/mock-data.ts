import { Article, Category, Tag, AdCreative, SiteSettings, Profile } from '@/types/database';

const STATIC_NOW = '2026-10-15T04:00:00.000Z';
const STATIC_PAST_1H = '2026-10-15T03:00:00.000Z';
const STATIC_PAST_2H = '2026-10-15T02:00:00.000Z';
const STATIC_PAST_4H = '2026-10-15T00:00:00.000Z';
const STATIC_PAST_1D = '2026-10-14T08:00:00.000Z';
const STATIC_PAST_2D = '2026-10-13T08:00:00.000Z';

export const MOCK_AUTHORS: Profile[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    email: 'nguyen.anh@newshub.vn',
    full_name: 'Nguyễn Tuấn Anh',
    slug: 'nguyen-tuan-anh',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Trưởng ban Thời sự - Chính trị NEWSHUB. Hơn 15 năm kinh nghiệm theo dõi các chính sách phát triển kinh tế vĩ mô và đối ngoại.',
    title_role: 'Trưởng ban Thời sự',
    is_author: true,
    is_active: true,
    created_at: '2025-10-15T00:00:00.000Z',
    updated_at: STATIC_NOW,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    email: 'le.mai@newshub.vn',
    full_name: 'Lê Thanh Mai',
    slug: 'le-thanh-mai',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    bio: 'Biên tập viên cao cấp Ban Công nghệ & Đổi mới sáng tạo. Chuyên sâu về Trí tuệ nhân tạo, Bán dẫn và Kinh tế số.',
    title_role: 'Biên tập viên Công nghệ',
    is_author: true,
    is_active: true,
    created_at: '2025-12-15T00:00:00.000Z',
    updated_at: STATIC_NOW,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    email: 'tran.nam@newshub.vn',
    full_name: 'Trần Hải Nam',
    slug: 'tran-hai-nam',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Phóng viên Ban Kinh tế & Đầu tư. Theo dõi thị trường tài chính, chứng khoán và chuyển dịch năng lượng xanh.',
    title_role: 'Phóng viên Kinh tế',
    is_author: true,
    is_active: true,
    created_at: '2026-01-15T00:00:00.000Z',
    updated_at: STATIC_NOW,
  }
];

export const MOCK_CATEGORIES: Category[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    name: 'Thời sự',
    slug: 'thoi-su',
    description: 'Tin tức sự kiện thời sự trong nước và quốc tế nóng hổi, bình luận chính sách đa chiều',
    sort_order: 1,
    is_active: true,
    show_in_menu: true,
    created_at: STATIC_NOW,
    updated_at: STATIC_NOW,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    name: 'Kinh tế',
    slug: 'kinh-te',
    description: 'Tài chính, ngân hàng, thị trường chứng khoán, bất động sản và hoạt động doanh nghiệp',
    sort_order: 2,
    is_active: true,
    show_in_menu: true,
    created_at: STATIC_NOW,
    updated_at: STATIC_NOW,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    name: 'Công nghệ',
    slug: 'cong-nghe',
    description: 'Đổi mới sáng tạo, trí tuệ nhân tạo, bán dẫn, an toàn thông tin và thiết bị số',
    sort_order: 3,
    is_active: true,
    show_in_menu: true,
    created_at: STATIC_NOW,
    updated_at: STATIC_NOW,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000004',
    name: 'Xã hội',
    slug: 'xa-hoi',
    description: 'Đời sống dân sinh, việc làm, đô thị và an sinh xã hội',
    sort_order: 4,
    is_active: true,
    show_in_menu: true,
    created_at: STATIC_NOW,
    updated_at: STATIC_NOW,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000005',
    name: 'Pháp luật',
    slug: 'phap-luat',
    description: 'Phổ biến pháp luật, phòng chống tội phạm và tư vấn pháp lý',
    sort_order: 5,
    is_active: true,
    show_in_menu: true,
    created_at: STATIC_NOW,
    updated_at: STATIC_NOW,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000006',
    name: 'Giáo dục',
    slug: 'giao-duc',
    description: 'Tuyển sinh, đổi mới giảng dạy, du học và khoa học học đường',
    sort_order: 6,
    is_active: true,
    show_in_menu: true,
    created_at: STATIC_NOW,
    updated_at: STATIC_NOW,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000007',
    name: 'Sức khỏe',
    slug: 'suc-khoe',
    description: 'Y tế, phòng ngừa dịch bệnh, dinh dưỡng hợp lý và chăm sóc sức khỏe gia đình',
    sort_order: 7,
    is_active: true,
    show_in_menu: true,
    created_at: STATIC_NOW,
    updated_at: STATIC_NOW,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000008',
    name: 'Thể thao',
    slug: 'the-thao',
    description: 'Bóng đá trong nước và quốc tế, quần vợt, thể thao điện tử và phong trào',
    sort_order: 8,
    is_active: true,
    show_in_menu: true,
    created_at: STATIC_NOW,
    updated_at: STATIC_NOW,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000009',
    name: 'Xe & Đời sống',
    slug: 'xe',
    description: 'Thị trường ô tô, xe máy điện, công nghệ di chuyển xanh và trải nghiệm lái xe',
    sort_order: 9,
    is_active: true,
    show_in_menu: true,
    created_at: STATIC_NOW,
    updated_at: STATIC_NOW,
  }
];

export const MOCK_TAGS: Tag[] = [
  { id: 't1', name: 'Trí tuệ nhân tạo', slug: 'tri-tue-nhan-tao', article_count: 24, created_at: STATIC_NOW },
  { id: 't2', name: 'Bán dẫn', slug: 'ban-dan', article_count: 18, created_at: STATIC_NOW },
  { id: 't3', name: 'Kinh tế xanh', slug: 'kinh-te-xanh', article_count: 15, created_at: STATIC_NOW },
  { id: 't4', name: 'Đường sắt tốc độ cao', slug: 'duong-sat-toc-do-cao', article_count: 12, created_at: STATIC_NOW },
  { id: 't5', name: 'Chuyển đổi số', slug: 'chuyen-doi-so', article_count: 30, created_at: STATIC_NOW },
];

export const MOCK_ARTICLES: Article[] = [
  {
    id: 'art-001',
    title: 'Việt Nam bứt phá trong chuỗi cung ứng vi mạch bán dẫn toàn cầu',
    slug: 'viet-nam-but-pha-trong-chuoi-cung-ung-vi-mach-ban-dan-toan-cau',
    sapo: 'Với sự tham gia của các tập đoàn công nghệ hàng đầu thế giới và chính sách đào tạo 50.000 kỹ sư, ngành công nghiệp bán dẫn Việt Nam đang bước vào giai đoạn tăng trưởng thần tốc với nhiều dự án trị giá hàng tỷ USD.',
    content_html: `
      <p>Việt Nam đang nhanh chóng định hình vị thế là một trong những trung tâm nghiên cứu, thiết kế và đóng gói vi mạch quan trọng của khu vực Đông Nam Á. Nhiều dự án quy mô lớn liên tiếp được triển khai tại Hà Nội, Đà Nẵng và TP.HCM.</p>
      
      <h2>Chính sách đào tạo nguồn nhân lực chất lượng cao</h2>
      <p>Theo chiến lược phát triển công nghiệp bán dẫn đến năm 2030, tầm nhìn 2050, trọng tâm then chốt là xây dựng đội ngũ kỹ sư vi mạch chất lượng cao, gắn kết trực tiếp giữa các viện nghiên cứu, trường đại học hàng đầu với các doanh nghiệp quốc tế.</p>
      
      <blockquote>
        "Đầu tư vào bán dẫn không chỉ là câu chuyện công nghệ mà là nền tảng bảo đảm tự chủ kinh tế và nâng tầm giá trị gia tăng quốc gia trong kỷ nguyên số."
      </blockquote>

      <p>Các trung tâm R&D mới được trang bị phòng thí nghiệm hiện đại, cho phép các kỹ sư trẻ tiếp cận sớm với các công nghệ thiết kế chip tiên tiến nhất hiện nay.</p>
      
      <h2>Hấp dẫn dòng vốn FDI công nghệ cao</h2>
      <p>Môi trường đầu tư thông thoáng, hạ tầng năng lượng xanh và cam kết bảo hộ sở hữu trí tuệ mạnh mẽ tiếp tục là những điểm cộng lớn giúp Việt Nam thu hút làn sóng dịch chuyển chuỗi cung ứng toàn cầu.</p>
    `,
    primary_category_id: 'c0000000-0000-0000-0000-000000000003',
    status: 'published',
    version: 3,
    published_at: STATIC_PAST_2H,
    reading_time_minutes: 5,
    is_featured: true,
    is_breaking: true,
    allow_comments: true,
    seo_title: 'Việt Nam bứt phá trong chuỗi cung ứng vi mạch bán dẫn toàn cầu',
    seo_description: 'Chiến lược phát triển công nghiệp bán dẫn Việt Nam bứt phá với các trung tâm R&D và đào tạo kỹ sư công nghệ cao.',
    view_count: 18450,
    created_by: 'a0000000-0000-0000-0000-000000000002',
    created_at: STATIC_PAST_2D,
    updated_at: STATIC_PAST_2H,
    category: MOCK_CATEGORIES[2],
    author: MOCK_AUTHORS[1],
    tags: [MOCK_TAGS[0], MOCK_TAGS[1]],
    featured_image: {
      id: 'm1',
      filename: 'semiconductor-tech.jpg',
      storage_path: 'articles/semiconductor-tech.jpg',
      public_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
      mime_type: 'image/jpeg',
      file_size: 420000,
      width: 1200,
      height: 800,
      alt_text: 'Dây chuyền thiết kế và chế tạo vi mạch bán dẫn',
      caption: 'Kỹ sư công nghệ làm việc tại phòng thí nghiệm vi mạch bán dẫn tiên tiến',
      credit: 'Ảnh: NEWSHUB / Lê Mai',
      created_at: STATIC_NOW
    }
  },
  {
    id: 'art-002',
    title: 'Đẩy nhanh tiến độ dự án đường sắt tốc độ cao trục Bắc - Nam',
    slug: 'day-nhanh-tien-do-du-an-duong-sat-toc-do-cao-truc-bac-nam',
    sapo: 'Bộ Giao thông Vận tải phối hợp cùng các địa phương rà soát phương án tuyến, hướng tới mục tiêu khởi công các đoạn tuyến ưu tiên trước năm 2027.',
    content_html: `
      <p>Dự án đường sắt tốc độ cao Bắc - Nam với chiều dài hơn 1.500 km là công trình hạ tầng thế kỷ, đóng vai trò kiến tạo trục giao thương huyết mạch xuyên suốt đất nước.</p>
      <h2>Kết nối đồng bộ kinh tế vùng</h2>
      <p>Tuyến đường sắt khi hoàn thành sẽ rút ngắn thời gian di chuyển giữa Hà Nội và TP.HCM xuống còn hơn 5 giờ, tạo động lực đột phá cho các trung tâm đô thị ven biển và giảm tải bền vững cho mạng lưới đường bộ và hàng không.</p>
    `,
    primary_category_id: 'c0000000-0000-0000-0000-000000000001',
    status: 'published',
    version: 2,
    published_at: STATIC_PAST_4H,
    reading_time_minutes: 4,
    is_featured: true,
    is_breaking: false,
    allow_comments: true,
    view_count: 12890,
    created_by: 'a0000000-0000-0000-0000-000000000001',
    created_at: STATIC_PAST_1D,
    updated_at: STATIC_PAST_4H,
    category: MOCK_CATEGORIES[0],
    author: MOCK_AUTHORS[0],
    tags: [MOCK_TAGS[3]],
    featured_image: {
      id: 'm2',
      filename: 'high-speed-rail.jpg',
      storage_path: 'articles/high-speed-rail.jpg',
      public_url: 'https://images.unsplash.com/photo-1541427468627-a89a96e5ca1d?w=1200&auto=format&fit=crop&q=80',
      mime_type: 'image/jpeg',
      file_size: 512000,
      width: 1200,
      height: 800,
      alt_text: 'Đoàn tàu tốc độ cao hiện đại',
      caption: 'Phối cảnh đoàn tàu tốc độ cao vận hành trên cầu cạn',
      credit: 'Ảnh: Tư liệu NEWSHUB',
      created_at: STATIC_NOW
    }
  },
  {
    id: 'art-003',
    title: 'Kinh tế tuần hoàn và tài chính xanh: Lối mở cho doanh nghiệp Việt xuất khẩu',
    slug: 'kinh-te-tuan-hoan-va-tai-chinh-xanh-loi-mo-cho-doanh-nghiep-viet',
    sapo: 'Đáp ứng các tiêu chuẩn khắt khe về phát thải carbon và chứng chỉ ESG của thị trường EU và Mỹ là điều kiện tiên quyết để hàng hóa Việt Nam giữ vững vị thế cạnh tranh.',
    content_html: `
      <p>Việc chuyển đổi năng lượng sang điện mặt trời mái nhà, tái sử dụng nguyên phụ liệu và tối ưu chuỗi cung ứng logistics đang được các doanh nghiệp dệt may, da giày, chế biến gỗ quyết liệt triển khai.</p>
    `,
    primary_category_id: 'c0000000-0000-0000-0000-000000000002',
    status: 'published',
    version: 1,
    published_at: STATIC_PAST_4H,
    reading_time_minutes: 3,
    is_featured: false,
    is_breaking: false,
    allow_comments: true,
    view_count: 8730,
    created_by: 'a0000000-0000-0000-0000-000000000003',
    created_at: STATIC_PAST_1D,
    updated_at: STATIC_PAST_4H,
    category: MOCK_CATEGORIES[1],
    author: MOCK_AUTHORS[2],
    tags: [MOCK_TAGS[2]],
    featured_image: {
      id: 'm3',
      filename: 'green-economy.jpg',
      storage_path: 'articles/green-economy.jpg',
      public_url: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=1200&auto=format&fit=crop&q=80',
      mime_type: 'image/jpeg',
      file_size: 480000,
      width: 1200,
      height: 800,
      alt_text: 'Trang trại điện gió và năng lượng tái tạo',
      caption: 'Năng lượng tái tạo tạo đòn bẩy cho nền kinh tế carbon thấp',
      credit: 'Ảnh: Tuấn Anh',
      created_at: STATIC_NOW
    }
  },
  {
    id: 'art-004',
    title: 'Đột phá ứng dụng Trí tuệ nhân tạo trong chẩn đoán y khoa từ xa',
    slug: 'dot-pha-ung-dung-tri-tue-nhan-tao-trong-chan-doan-y-khoa-tu-xa',
    sapo: 'Hệ thống AI hỗ trợ đọc phim X-quang và cộng hưởng từ được thử nghiệm tại hơn 20 bệnh viện tuyến tỉnh, giúp phát hiện sớm các tổn thương khó với độ chính xác trên 96%.',
    content_html: `
      <p>Ứng dụng công nghệ số và AI vào y tế không chỉ giúp giảm tải cho bệnh viện tuyến trên mà còn mang lại cơ hội tiếp cận dịch vụ chăm sóc sức khỏe chất lượng cao cho người dân vùng sâu, vùng xa.</p>
    `,
    primary_category_id: 'c0000000-0000-0000-0000-000000000007',
    status: 'published',
    version: 1,
    published_at: STATIC_PAST_1D,
    reading_time_minutes: 4,
    is_featured: false,
    is_breaking: false,
    allow_comments: true,
    view_count: 6540,
    created_by: 'a0000000-0000-0000-0000-000000000002',
    created_at: STATIC_PAST_1D,
    updated_at: STATIC_PAST_1D,
    category: MOCK_CATEGORIES[6],
    author: MOCK_AUTHORS[1],
    tags: [MOCK_TAGS[0], MOCK_TAGS[4]],
    featured_image: {
      id: 'm4',
      filename: 'ai-healthcare.jpg',
      storage_path: 'articles/ai-healthcare.jpg',
      public_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80',
      mime_type: 'image/jpeg',
      file_size: 410000,
      width: 1200,
      height: 800,
      alt_text: 'Bác sĩ kiểm tra kết quả chẩn đoán trên màn hình',
      caption: 'Bác sĩ sử dụng công cụ AI phân tích hình ảnh hỗ trợ hội chẩn',
      credit: 'Ảnh: Getty / NEWSHUB',
      created_at: STATIC_NOW
    }
  },
  {
    id: 'art-005',
    title: 'Hạ tầng sạc xe điện bao phủ các tuyến cao tốc: Người dùng an tâm đi xa',
    slug: 'ha-tang-sac-xe-dien-bao-phu-cac-tuyen-cao-toc',
    sapo: 'Mạng lưới trạm sạc siêu nhanh công suất 150kW - 250kW được lắp đặt dọc các trạm dừng nghỉ trên cao tốc Bắc - Nam tạo sự thuận tiện vượt trội cho xu hướng di chuyển xanh.',
    content_html: `
      <p>Chỉ sau hơn 2 năm, số lượng trạm sạc xe điện tại Việt Nam đã tăng gấp 4 lần, định hình thói quen tiêu dùng văn minh và thân thiện với môi trường đô thị.</p>
    `,
    primary_category_id: 'c0000000-0000-0000-0000-000000000009',
    status: 'published',
    version: 1,
    published_at: STATIC_PAST_1D,
    reading_time_minutes: 3,
    is_featured: false,
    is_breaking: false,
    allow_comments: true,
    view_count: 5410,
    created_by: 'a0000000-0000-0000-0000-000000000003',
    created_at: STATIC_PAST_1D,
    updated_at: STATIC_PAST_1D,
    category: MOCK_CATEGORIES[8],
    author: MOCK_AUTHORS[2],
    tags: [MOCK_TAGS[2]],
    featured_image: {
      id: 'm5',
      filename: 'ev-charging.jpg',
      storage_path: 'articles/ev-charging.jpg',
      public_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1200&auto=format&fit=crop&q=80',
      mime_type: 'image/jpeg',
      file_size: 390000,
      width: 1200,
      height: 800,
      alt_text: 'Trạm sạc xe điện công cộng',
      caption: 'Hạ tầng sạc xe điện hiện đại trên trục cao tốc',
      credit: 'Ảnh: Hải Nam',
      created_at: STATIC_NOW
    }
  }
];

export const MOCK_SITE_SETTINGS: SiteSettings = {
  key: 'general',
  value: {
    site_name: 'TinVanta',
    site_slogan: 'Tin tức nhanh — Thông tin chuẩn',
    primary_color: '#D71920',
    navy_color: '#172033',
    hotline: '1900 6868',
    email_contact: 'toasoan@tinvanta.vn',
    address: 'Tòa nhà Báo chí Trung ương, Ba Đình, Hà Nội',
    logo_url: '/logo-tinvanta.png',
    breaking_news_enabled: true,
    breaking_news_text: 'Chính phủ ban hành chiến lược phát triển công nghệ bán dẫn quốc gia đến năm 2030',
    breaking_news_link: '/bai-viet/viet-nam-but-pha-trong-chuoi-cung-ung-vi-mach-ban-dan-toan-cau'
  },
  updated_at: STATIC_NOW
};

export const MOCK_AD_CREATIVES: AdCreative[] = [
  {
    id: 'ad-01',
    campaign_id: 'camp-1',
    placement_id: 'header_top',
    title: 'Giải pháp Chuyển đổi số Doanh nghiệp 2026',
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=970&h=90&fit=crop&q=80',
    destination_url: 'https://example.com/digital-transformation',
    impressions_count: 54200,
    clicks_count: 1240,
    is_active: true,
    created_at: STATIC_NOW
  },
  {
    id: 'ad-02',
    campaign_id: 'camp-2',
    placement_id: 'sidebar_top',
    title: 'Ngân hàng số thông minh - Ưu đãi lãi suất',
    image_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=300&h=250&fit=crop&q=80',
    destination_url: 'https://example.com/smart-banking',
    impressions_count: 32100,
    clicks_count: 890,
    is_active: true,
    created_at: STATIC_NOW
  }
];

export function addDynamicArticle(article: Article) {
  // Check if article already exists
  const existingIdx = MOCK_ARTICLES.findIndex(a => a.id === article.id || a.slug === article.slug);
  if (existingIdx >= 0) {
    MOCK_ARTICLES[existingIdx] = article;
  } else {
    MOCK_ARTICLES.unshift(article);
  }
}

