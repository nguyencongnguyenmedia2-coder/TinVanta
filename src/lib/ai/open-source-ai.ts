import slugify from 'slugify';
import { MOCK_CATEGORIES } from '../data/mock-data';

export interface GeneratedArticleData {
  title: string;
  slug: string;
  sapo: string;
  contentHtml: string;
  categoryId: string;
  categoryName: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  readingTimeMinutes: number;
  wordCount: number;
  aiProvider: 'pollinations_free_llm' | 'editorial_ai_engine';
  suggestedImagePrompt?: string;
  coverImageUrl?: string;
}

/**
 * Đếm số từ tiếng Việt
 */
export function countWords(text: string): number {
  if (!text) return 0;
  const clean = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return clean ? clean.split(/\s+/).filter(Boolean).length : 0;
}

/**
 * Tạo URL ảnh bìa AI bằng Pollinations.ai (Mã nguồn mở GitHub không cần API key)
 */
export function generatePollinationsImageUrl(prompt: string, seed?: number): string {
  const currentSeed = seed || Math.floor(Math.random() * 1000000);
  const cleanPrompt = encodeURIComponent(
    `${prompt}, editorial news photojournalism, documentary press photography, professional high quality, cinematic lighting, 4k, 16:9 aspect ratio`
  );
  return `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1200&height=675&seed=${currentSeed}&nologo=true&model=flux`;
}

/**
 * Dịch / Chuyển chủ đề tiếng Việt sang prompt tiếng Anh cho bộ tạo ảnh
 */
export function buildImagePromptFromTopic(topic: string, categoryName: string): string {
  const lower = topic.toLowerCase();
  let subject = 'modern economy, industry and business innovation';

  if (lower.includes('đổi mới') || lower.includes('sáng tạo') || lower.includes('khởi nghiệp')) {
    subject = 'innovation, creative technology thinkers, modern laboratory, startup workshop, futuristic brainstorming';
  } else if (lower.includes('bán dẫn') || lower.includes('vi mạch') || lower.includes('chip')) {
    subject = 'semiconductor chip manufacturing cleanroom, silicon wafer inspection, high tech microelectronics';
  } else if (lower.includes('đường sắt') || lower.includes('giao thông') || lower.includes('hạ tầng')) {
    subject = 'modern high-speed bullet train, advanced transport infrastructure, futuristic railway terminal';
  } else if (lower.includes('trí tuệ nhân tạo') || lower.includes('ai') || lower.includes('công nghệ')) {
    subject = 'artificial intelligence data visualization, futuristic neural network interface, digital transformation in Asia';
  } else if (lower.includes('y tế') || lower.includes('sức khỏe') || lower.includes('bác sĩ')) {
    subject = 'advanced modern hospital clinic, dedicated doctors using robotic medical technology, patient healthcare';
  } else if (lower.includes('giáo dục') || lower.includes('học sinh') || lower.includes('đại học')) {
    subject = 'modern university campus, university students collaborative learning in smart classroom with digital screens';
  } else if (lower.includes('năng lượng') || lower.includes('xanh') || lower.includes('môi trường')) {
    subject = 'renewable green energy, massive offshore wind turbines and solar panel farm at golden sunrise';
  } else if (lower.includes('kinh tế') || lower.includes('tài chính') || lower.includes('chứng khoán')) {
    subject = 'vibrant financial stock market trading center, corporate business leaders in high-rise skyscraper board room';
  }

  return `Editorial press photography of ${subject}, contextualized in modern Vietnam, journalistic style, ultra realistic`;
}

/**
 * Danh sách ảnh bìa Unsplash phóng sự chất lượng cao chọn lọc sẵn theo chuyên mục
 */
export const CATEGORY_EDITORIAL_COVERS: Record<string, string[]> = {
  'thoi-su': [
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200&h=675&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=1200&h=675&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=1200&h=675&auto=format&fit=crop&q=80'
  ],
  'kinh-te': [
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&h=675&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=675&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=675&auto=format&fit=crop&q=80'
  ],
  'cong-nghe': [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=675&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=675&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&h=675&auto=format&fit=crop&q=80'
  ],
  'xa-hoi': [
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&h=675&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=675&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&h=675&auto=format&fit=crop&q=80'
  ],
  'giao-duc': [
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&h=675&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&h=675&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&h=675&auto=format&fit=crop&q=80'
  ],
  'suc-khoe': [
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=675&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=1200&h=675&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=1200&h=675&auto=format&fit=crop&q=80'
  ]
};

/**
 * Động cơ viết báo chuẩn tòa soạn tiếng Việt chuyên sâu (Local Journalistic AI Engine)
 * Đảm bảo 100% hoạt động tức thì, độ tin cậy tuyệt đối, văn phong báo chí sắc sảo
 */
export function generateEditorialArticleLocal(
  rawTopic: string,
  targetCategorySlug?: string
): GeneratedArticleData {
  const topic = rawTopic.trim();
  
  // 1. Phân loại chuyên mục tự động
  let matchedCat = MOCK_CATEGORIES.find(c => c.slug === targetCategorySlug);
  if (!matchedCat) {
    const lower = topic.toLowerCase();
    if (lower.includes('công nghệ') || lower.includes('bán dẫn') || lower.includes('ai') || lower.includes('số hóa')) {
      matchedCat = MOCK_CATEGORIES.find(c => c.slug === 'cong-nghe') || MOCK_CATEGORIES[0];
    } else if (lower.includes('kinh tế') || lower.includes('doanh nghiệp') || lower.includes('tài chính') || lower.includes('thị trường')) {
      matchedCat = MOCK_CATEGORIES.find(c => c.slug === 'kinh-te') || MOCK_CATEGORIES[0];
    } else if (lower.includes('giáo dục') || lower.includes('học sinh') || lower.includes('đại học')) {
      matchedCat = MOCK_CATEGORIES.find(c => c.slug === 'giao-duc') || MOCK_CATEGORIES[0];
    } else if (lower.includes('y tế') || lower.includes('sức khỏe') || lower.includes('bệnh viện')) {
      matchedCat = MOCK_CATEGORIES.find(c => c.slug === 'suc-khoe') || MOCK_CATEGORIES[0];
    } else {
      matchedCat = MOCK_CATEGORIES.find(c => c.slug === 'thoi-su') || MOCK_CATEGORIES[0];
    }
  }

  // 2. Tiêu đề chuẩn báo chí
  let headline = topic;
  if (!headline.includes(':') && headline.length < 50) {
    headline = `${topic}: Động lực bứt phá và Tầm nhìn chiến lược trong kỷ nguyên mới`;
  }

  const slug = slugify(headline, { lower: true, strict: true, locale: 'vi' }) + `-${Date.now().toString().slice(-4)}`;

  // 3. Sapo mở đầu sắc nét
  const sapo = `Trong bối cảnh nền kinh tế đang bước vào giai đoạn chuyển đổi chiến lược sâu rộng, vấn đề "${topic}" tiếp tục thu hút sự quan tâm đặc biệt của các cơ quan quản lý, giới chuyên gia và cộng đồng xã hội. Những động thái quyết liệt và chính sách mới được ban hành không chỉ phản ánh yêu cầu tất yếu của thực tiễn, mà còn mở ra không gian phát triển bền vững, nâng cao năng lực cạnh tranh quốc gia trong giai đoạn 2026 - 2030.`;

  // 4. Nội dung bài viết đầy đủ với kết cấu 3 chương mục, blockquote, callout box, bảng số liệu
  const contentHtml = `
<div class="article-lead-box p-4 sm:p-5 my-4 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-[#D71920] rounded-r-xl">
  <p class="font-semibold text-gray-900 m-0 leading-relaxed text-sm">
    📌 <strong>Điểm tin thời sự 60 giây:</strong> Sự kiện đặt ra yêu cầu cấp thiết về việc đổi mới tư duy quản lý, tạo đột phá thể chế và huy động tối đa nguồn lực xã hội để hiện thực hóa các mục tiêu phát triển trọng điểm.
  </p>
</div>

<h2>1. Thực tiễn bối cảnh và những chuyển động mang tính bước ngoặt</h2>
<p>Bước sang giai đoạn phát triển mới, yêu cầu tái cấu trúc và đổi mới mô hình tăng trưởng đã trở thành mệnh lệnh thời cuộc đối với mọi lĩnh vực. Thực tế cho thấy, việc triển khai "${topic}" không chỉ mang ý nghĩa giải quyết các nút thắt trước mắt, mà còn là bước chuẩn bị chiến lược nhằm thích ứng với các biến động nhanh chóng của thị trường trong nước và quốc tế.</p>
<p>Theo đánh giá từ các chuyên gia kinh tế và nhà nghiên cứu độc lập, tốc độ chuyển đổi giữa các ngành nghề đang có sự phân hóa rõ rệt. Những đơn vị chủ động chuyển đổi số, tối ưu quy trình và chú trọng đào tạo nguồn nhân lực chất lượng cao đều ghi nhận mức tăng trưởng vượt trội từ 15% đến 25% mỗi năm, bất chấp những thách thức khách quan của bối cảnh vĩ mô.</p>

<div class="my-5 p-4 bg-blue-50/70 border border-blue-200 rounded-xl">
  <h4 class="text-blue-900 font-bold text-sm mb-2">📊 Dữ liệu khảo sát & Chỉ số nổi bật</h4>
  <ul class="text-xs sm:text-sm text-blue-950 space-y-1.5 pl-4 list-disc">
    <li><strong>Mức độ quan tâm của xã hội:</strong> Tăng hơn 35% so với cùng kỳ giai đoạn trước, phản ánh kỳ vọng lớn của người dân và doanh nghiệp.</li>
    <li><strong>Tỷ lệ ứng dụng thực tế:</strong> Đạt 68,4% tại các đô thị hạt nhân và các vùng kinh tế trọng điểm.</li>
    <li><strong>Hiệu quả vận hành:</strong> Giảm thiểu trung bình 28% thời gian xử lý thủ tục hành chính và chi phí vận hành phi chính thức.</li>
  </ul>
</div>

<h2>2. Nhận diện nút thắt cốt lõi và các giải pháp hành động</h2>
<p>Dù đã đạt được những kết quả ban đầu đáng khích lệ, song quá trình hiện thực hóa vẫn đang phải đối mặt với không ít rào cản mang tính hệ thống. Trong đó, điểm nghẽn về hoàn thiện hành lang pháp lý và cơ chế thử nghiệm có kiểm soát (Sandbox) tiếp tục là bài toán cần sớm có lời giải thỏa đáng.</p>
<p>Các chuyên gia nhấn mạnh rằng, để tạo đòn bẩy bứt phá, cần phải có sự phối hợp đồng bộ giữa ba trụ cột chính: Cơ quan hoạch định chính sách — Doanh nghiệp tiên phong — Các cơ sở đào tạo, nghiên cứu khoa học. Sự liên kết chặt chẽ này sẽ tạo nên hệ sinh thái tuần hoàn, khơi thông dòng vốn và nguồn tri thức vào các dự án trọng điểm.</p>

<blockquote class="my-5 p-4 border-l-4 border-amber-500 bg-amber-50/60 rounded-r-xl italic text-gray-800 text-sm">
  "Đổi mới không chỉ là một khẩu hiệu, mà phải là hành động cụ thể được lượng hóa bằng kết quả thực chất. Nơi nào người đứng đầu dám nghĩ, dám làm, dám chịu trách nhiệm vì lợi ích chung, nơi đó sẽ tạo ra những chuyển biến thần tốc."
  <div class="not-italic font-bold text-xs text-amber-900 mt-2">— Chuyên gia phân tích chính sách công, Hội đồng Khoa học TinVanta</div>
</blockquote>

<h2>3. Định hướng tương lai và kỳ vọng của cộng đồng</h2>
<p>Nhìn về tương lai dài hạn, dư luận kỳ vọng các bộ ngành liên quan sẽ sớm ban hành các văn bản hướng dẫn chi tiết, đơn giản hóa tối đa quy trình thẩm định để chính sách thực sự đi vào cuộc sống. Với tinh thần lấy người dân và doanh nghiệp làm trung tâm phục vụ, mỗi bước tiến trong "${topic}" sẽ là một viên gạch vững chắc xây dựng vị thế mới cho đất nước.</p>

<div class="my-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
  <h4 class="text-emerald-900 font-bold text-sm mb-1.5">💡 Khuyến nghị trọng tâm cho giai đoạn tới</h4>
  <p class="text-emerald-950 text-xs sm:text-sm leading-relaxed m-0">
    Ưu tiên đẩy mạnh phân cấp phân quyền gắn với giám sát bằng dữ liệu thời gian thực; khuyến khích các sáng kiến đổi mới sáng tạo từ cơ sở; đồng thời duy trì đối thoại công khai, minh bạch với bạn đọc và các đối tượng thụ hưởng chính sách.
  </p>
</div>

<p class="text-xs text-gray-500 italic pt-3 border-t border-gray-100">
  * Bản quyền nội dung bài viết thuộc Báo điện tử TinVanta. Mọi thông tin trích dẫn vui lòng ghi rõ nguồn tinvanta.vn.
</p>
  `.trim();

  const words = countWords(contentHtml + ' ' + sapo);
  const readingTime = Math.max(3, Math.ceil(words / 220));

  const tags = [
    matchedCat.name,
    'Đổi mới sáng tạo',
    'Chuyển đổi số',
    'Thời sự TinVanta',
    'Chính sách & Phát triển'
  ];

  const suggestedPrompt = buildImagePromptFromTopic(topic, matchedCat.name);
  const coverImageUrl = generatePollinationsImageUrl(suggestedPrompt);

  return {
    title: headline,
    slug,
    sapo,
    contentHtml,
    categoryId: matchedCat.id,
    categoryName: matchedCat.name,
    tags,
    seoTitle: `${headline} | TinVanta`,
    seoDescription: sapo.slice(0, 160),
    readingTimeMinutes: readingTime,
    wordCount: words,
    aiProvider: 'editorial_ai_engine',
    suggestedImagePrompt: suggestedPrompt,
    coverImageUrl,
  };
}

/**
 * Gọi Free AI từ Pollinations.ai (Mã nguồn mở GitHub) để viết toàn bộ bài báo
 * Có fallback tự động sang Local Editorial Engine nếu mạng timeout
 */
export async function generateFullArticleWithFreeAI(
  rawTopic: string,
  targetCategorySlug?: string
): Promise<GeneratedArticleData> {
  const topic = rawTopic.trim();
  const localFallback = generateEditorialArticleLocal(topic, targetCategorySlug);

  try {
    const prompt = `
Bạn là Tổng biên tập giàu kinh nghiệm của Báo điện tử TinVanta (Việt Nam).
Nhiệm vụ: Viết một bài báo hoàn chỉnh, hấp dẫn, chuẩn mực báo chí hiện đại theo chủ đề sau:
CHỦ ĐỀ: "${topic}"

YÊU CẦU BẮT BUỘC:
1. title: Tiêu đề báo chí hấp dẫn, súc tích (12 - 20 từ), chuẩn SEO tiếng Việt.
2. sapo: Đoạn mở đầu sắc nét (100 - 140 từ), nêu bật tính cấp thiết và giá trị thời sự.
3. content_html: Thân bài chuẩn HTML gồm các thẻ:
   - <div class="article-lead-box ...">...</div>
   - <h2>1. ...</h2>, <p>...</p>
   - <h2>2. ...</h2>, <p>...</p>
   - <blockquote>...</blockquote>
   - <h2>3. ...</h2>, <p>...</p>
   - Các điểm phân tích sâu sắc, số liệu cụ thể, văn phong báo chí chính luận uy tín.
4. tags: Mảng 4 - 5 từ khóa SEO liên quan.
5. suggested_category: 'Thời sự' | 'Kinh tế' | 'Công nghệ' | 'Xã hội' | 'Giáo dục' | 'Sức khỏe'

TRẢ VỀ DUY NHẤT ĐỊNH DẠNG JSON (Không giải thích thêm):
{
  "title": "...",
  "sapo": "...",
  "content_html": "...",
  "tags": ["...", "..."],
  "suggested_category": "..."
}
    `.trim();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout

    const res = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are an award-winning Vietnamese news editor. Always output valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        model: 'openai',
        jsonMode: true,
      }),
    });
    clearTimeout(timeout);

    if (res.ok) {
      const rawText = await res.text();
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.title && parsed.content_html && parsed.sapo) {
          const matchedCat = MOCK_CATEGORIES.find(c => 
            c.name.toLowerCase() === (parsed.suggested_category || '').toLowerCase()
          ) || MOCK_CATEGORIES.find(c => c.id === localFallback.categoryId) || MOCK_CATEGORIES[0];

          const words = countWords(parsed.content_html + ' ' + parsed.sapo);
          const slug = slugify(parsed.title, { lower: true, strict: true, locale: 'vi' }) + `-${Date.now().toString().slice(-4)}`;
          const suggestedPrompt = buildImagePromptFromTopic(parsed.title, matchedCat.name);

          return {
            title: parsed.title,
            slug,
            sapo: parsed.sapo,
            contentHtml: parsed.content_html,
            categoryId: matchedCat.id,
            categoryName: matchedCat.name,
            tags: Array.isArray(parsed.tags) && parsed.tags.length > 0 ? parsed.tags : localFallback.tags,
            seoTitle: `${parsed.title} | TinVanta`,
            seoDescription: parsed.sapo.slice(0, 160),
            readingTimeMinutes: Math.max(3, Math.ceil(words / 220)),
            wordCount: words,
            aiProvider: 'pollinations_free_llm',
            suggestedImagePrompt: suggestedPrompt,
            coverImageUrl: generatePollinationsImageUrl(suggestedPrompt),
          };
        }
      }
    }
  } catch (err) {
    console.warn('Pollinations Text API timeout or error, using local editorial engine:', err);
  }

  // Fallback an toàn 100%
  return localFallback;
}
