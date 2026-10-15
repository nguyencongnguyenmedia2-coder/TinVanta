import { ExtractedArticle, isCleanVietnameseParagraph } from '../crawler/news-crawler';

export interface RewrittenArticleResult {
  title: string;
  sapo: string;
  contentHtml: string;
  summaryPoints: string[];
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  aiProvider: 'gemini_free' | 'pollinations_free' | 'smart_synthesizer';
  wordCount: number;
}

/**
 * Đếm số từ tiếng Việt
 */
export function countWords(text: string): number {
  if (!text) return 0;
  const clean = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return clean ? clean.split(' ').length : 0;
}

/**
 * Động cơ viết lại thông minh (Smart Journalistic Synthesizer)
 * Hoạt động độc lập 100% offline/không cần mạng ngoại vi, đảm bảo luôn thành công
 */
export function synthesizeJournalisticArticle(
  article: ExtractedArticle, 
  categoryName: string
): RewrittenArticleResult {
  const originalTitle = article.originalTitle.trim();
  const sourceName = article.sourceName || 'nguồn tin báo chí trong nước';
  
  // 1. Tạo tiêu đề độc quyền mới
  const titlePrefixes = [
    'Toàn cảnh:',
    'Phân tích sâu:',
    'Tiêu điểm thời sự:',
    'Góc nhìn đa chiều:',
    'Hồ sơ sự kiện:',
    'Nhận định mới nhất về:'
  ];
  const chosenPrefix = titlePrefixes[Math.floor(Math.random() * titlePrefixes.length)];
  
  // Tinh chỉnh tiêu đề gốc để tạo tiêu đề độc quyền mới
  let rewrittenTitle = originalTitle;
  if (!rewrittenTitle.toLowerCase().startsWith('toàn cảnh') && !rewrittenTitle.toLowerCase().startsWith('tiêu điểm')) {
    rewrittenTitle = `${chosenPrefix} ${originalTitle}`;
  }

  // 2. Viết lại Sapo chuyên sâu
  const sapo = `Theo ghi nhận và tổng hợp chuyên sâu từ TinVanta (dựa trên diễn biến mới nhất từ ${sourceName}), vụ việc "${originalTitle}" đang nhận được sự quan tâm đặc biệt của dư luận và giới chuyên môn. Những dữ liệu và động thái vừa được công bố không chỉ phản ánh trực diện bản chất sự kiện mà còn đặt ra nhiều vấn đề quan trọng cần nhìn nhận thấu đáo trong bức tranh tổng thể của ngành ${categoryName.toLowerCase()}.`;

  // 3. Lọc sạch toàn bộ đoạn văn, loại bỏ hoàn toàn các đoạn dính mã code
  const cleanParagraphs = article.bodyParagraphs.filter(p => isCleanVietnameseParagraph(p));
  const validParagraphs = cleanParagraphs.length >= 2 
    ? cleanParagraphs 
    : [
        article.sapo && isCleanVietnameseParagraph(article.sapo) 
          ? article.sapo 
          : 'Sự việc đang nhận được sự theo dõi sát sao từ cơ quan quản lý và các đơn vị chuyên môn liên quan.',
        'Các đơn vị chức năng đã khẩn trương vào cuộc nhằm rà soát hiện trường, xác định trách nhiệm và triển khai các biện pháp ứng phó đồng bộ.',
        'Trước những diễn biến mới, dư luận kỳ vọng các bên sẽ nhanh chóng đưa ra giải pháp căn cơ, vừa bảo đảm quyền lợi chung vừa giữ vững tính nghiêm minh của pháp luật.'
      ];

  const part1 = validParagraphs.slice(0, Math.ceil(validParagraphs.length / 3));
  const part2 = validParagraphs.slice(Math.ceil(validParagraphs.length / 3), Math.ceil((validParagraphs.length * 2) / 3));
  const part3 = validParagraphs.slice(Math.ceil((validParagraphs.length * 2) / 3));

  const formatParagraphs = (arr: string[], fallback: string) => {
    if (arr.length === 0) return `<p>${fallback}</p>`;
    return arr.map(p => `<p>${p}</p>`).join('\n');
  };

  const contentHtml = `
<div class="article-lead-highlight mb-6 p-5 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-600 rounded-r-xl">
  <p class="text-gray-800 font-medium leading-relaxed italic m-0">
    <strong>Tóm lược nhanh:</strong> Sự kiện diễn ra với nhiều diễn biến đáng chú ý, đòi hỏi sự vào cuộc quyết liệt và góc nhìn khách quan từ nhiều phía nhằm đưa ra đánh giá chuẩn xác nhất cho bạn đọc.
  </p>
</div>

<h2>1. Bối cảnh và diễn biến cốt lõi của sự việc</h2>
${formatParagraphs(part1, 'Vấn đề đang tiếp tục được các cơ quan chức năng và các bên liên quan theo dõi sát sao nhằm có phương án ứng phó toàn diện.')}

<div class="my-6 p-5 bg-blue-50/60 border border-blue-200 rounded-xl">
  <h4 class="text-blue-900 font-bold mb-2 flex items-center gap-2">
    <span>📌 Dữ liệu then chốt ghi nhận</span>
  </h4>
  <ul class="list-disc pl-5 space-y-1.5 text-blue-950 text-sm">
    <li><strong>Nguồn tin cập nhật:</strong> Ghi nhận thực tế từ báo chí chính thống và thực địa.</li>
    <li><strong>Phạm vi ảnh hưởng:</strong> Tác động trực tiếp đến lĩnh vực ${categoryName.toLowerCase()} và đời sống xã hội.</li>
    <li><strong>Trạng thái tiếp diễn:</strong> Tiếp tục được các chuyên gia đầu ngành phân tích và làm rõ.</li>
  </ul>
</div>

<h2>2. Phân tích tác động và các góc nhìn đa chiều</h2>
${formatParagraphs(part2, 'Xét trên bình diện rộng, các chuyên gia phân tích chỉ ra rằng đây không đơn thuần là một biến cố cục bộ mà là kết quả của một chuỗi mắt xích liên đới. Việc mổ xẻ nguyên nhân gốc rễ sẽ giúp định hình các giải pháp căn cơ, phòng ngừa các rủi ro tương tự trong tương lai.')}

<blockquote class="my-6 pl-5 border-l-4 border-gray-400 italic text-gray-700 bg-gray-50 py-3 rounded-r-lg">
  "Một sự kiện thời sự chuẩn mực không chỉ dừng lại ở việc phản ánh điều gì đã xảy ra, mà quan trọng hơn là trả lời câu hỏi: Sự kiện này sẽ tác động như thế nào đến tương lai và mỗi người chúng ta cần hành động ra sao?"
  <div class="text-xs font-semibold not-italic text-gray-500 mt-2">— Ban Bình luận & Phân tích Chuyên sâu TinVanta</div>
</blockquote>

<h2>3. Đánh giá xu hướng và kiến nghị định hướng</h2>
${formatParagraphs(part3, 'Trước tình hình hiện nay, dư luận và các bên liên quan kỳ vọng vào những động thái quyết đoán, minh bạch và kịp thời hơn nữa để đảm bảo quyền lợi chung và giữ vững sự ổn định lâu dài.')}

<div class="my-6 p-5 bg-emerald-50 border border-emerald-200 rounded-xl">
  <h4 class="text-emerald-900 font-bold mb-2">💡 Khuyến nghị & Bài học kinh nghiệm</h4>
  <p class="text-emerald-950 text-sm leading-relaxed mb-0">
    Việc chủ động tiếp cận thông tin chuẩn xác, đa chiều và có tư duy phản biện là yếu tố then chốt giúp bạn đọc nắm bắt thời cơ cũng như chủ động thích ứng trước mọi biến đổi của thời cuộc.
  </p>
</div>

<p class="text-xs text-gray-500 italic mt-8 pt-4 border-t border-gray-200">
  * Bài viết được tổng hợp, phân tích và biên tập độc quyền bởi Ban biên tập TinVanta dựa trên tư liệu nguồn từ ${sourceName} và các cơ quan thông tấn.
</p>
  `.trim();

  // 4. Điểm tin cốt lõi
  const summaryPoints = [
    `Bản tin tổng hợp góc nhìn chuyên sâu về "${originalTitle}"`,
    `Phân tích các khía cạnh ảnh hưởng trực tiếp tới lĩnh vực ${categoryName}`,
    'Làm rõ các luận điểm then chốt và xu hướng tiếp diễn trong thời gian tới',
    'Khuyến nghị giải pháp ứng phó thiết thực từ ban chuyên gia TinVanta'
  ];

  // 5. Thẻ tags
  const tags = [
    categoryName,
    'Thời sự nóng',
    'TinVanta phân tích',
    'Báo chí đa chiều',
    sourceName
  ];

  const wordCount = countWords(contentHtml + ' ' + sapo);

  return {
    title: rewrittenTitle,
    sapo,
    contentHtml,
    summaryPoints,
    tags,
    seoTitle: `${rewrittenTitle} | TinVanta`,
    seoDescription: sapo.slice(0, 160),
    aiProvider: 'smart_synthesizer',
    wordCount,
  };
}

/**
 * Gọi AI Miễn phí Pollinations.ai (Không cần API key) để viết lại bài báo
 */
export async function rewriteWithPollinationsFree(
  article: ExtractedArticle,
  categoryName: string
): Promise<RewrittenArticleResult | null> {
  try {
    const cleanParagraphs = article.bodyParagraphs
      .filter(p => isCleanVietnameseParagraph(p))
      .slice(0, 4);

    const contextText = cleanParagraphs.length > 0 
      ? cleanParagraphs.join('\n\n')
      : (article.sapo || 'Thông tin thời sự đang được cập nhật.');

    const prompt = `
Bạn là Tổng biên tập kiêm Trưởng ban phóng viên của Báo điện tử TinVanta.
Nhiệm vụ: Tiếp nhận bài báo gốc từ "${article.sourceName}" sau đây và VIẾT LẠI HOÀN TOÀN thành bài báo mới độc quyền, chuẩn SEO cho TinVanta:

Tiêu đề gốc: "${article.originalTitle}"
Chuyên mục: "${categoryName}"
Tóm tắt gốc: "${article.sapo}"
Tư liệu sự kiện:
${contextText}

YÊU CẦU:
1. title: Tiêu đề mới độc quyền, hấp dẫn, chuẩn SEO.
2. sapo: Mở đầu 100-140 từ sắc nét.
3. content_html: Nội dung thân bài gồm các thẻ <h2>, <p>, <blockquote>, <ul><li>.
4. summary_points: 4 gạch đầu dòng then chốt.
5. tags: 4 thẻ từ khóa.

TRẢ VỀ DUY NHẤT JSON:
{
  "title": "...",
  "sapo": "...",
  "content_html": "<h2>1. Bối cảnh diễn biến</h2><p>...</p><h2>2. Tác động và giải pháp</h2><p>...</p>",
  "summary_points": ["điểm 1", "điểm 2", "điểm 3", "điểm 4"],
  "tags": ["thời sự", "tin tức", "${categoryName}"]
}
    `.trim();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 40000); // 40s timeout

    const res = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are a professional Vietnamese journalist and news editor. Return JSON only.' },
          { role: 'user', content: prompt }
        ],
        model: 'openai',
        jsonMode: true,
      }),
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`Pollinations AI returned HTTP ${res.status}`);
      return null;
    }

    const raw = await res.text();
    // Bóc tách JSON từ phản hồi
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.title || !parsed.content_html) return null;

    const wordCount = countWords(parsed.content_html + ' ' + (parsed.sapo || ''));

    return {
      title: parsed.title,
      sapo: parsed.sapo || article.sapo,
      contentHtml: parsed.content_html,
      summaryPoints: Array.isArray(parsed.summary_points) ? parsed.summary_points : ['Thông tin độc quyền TinVanta'],
      tags: Array.isArray(parsed.tags) ? parsed.tags : [categoryName, 'Tin tức mới'],
      seoTitle: `${parsed.title} | Báo điện tử TinVanta`,
      seoDescription: (parsed.sapo || '').slice(0, 160),
      aiProvider: 'pollinations_free',
      wordCount,
    };
  } catch (error) {
    console.error('Lỗi khi gọi Pollinations Free AI:', error);
    return null;
  }
}

/**
 * Gọi Google Gemini API Free Tier nếu người dùng cung cấp API Key
 */
export async function rewriteWithGeminiFree(
  article: ExtractedArticle,
  categoryName: string
): Promise<RewrittenArticleResult | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('mock') || apiKey.length < 20) {
    return null;
  }

  try {
    const prompt = `
Bạn là Tổng biên tập của Báo điện tử TinVanta. Viết lại bài báo thu thập từ "${article.sourceName}" thành bài báo mới 100% độc quyền.
Tiêu đề gốc: "${article.originalTitle}"
Chuyên mục: "${categoryName}"
Nội dung nguồn:
${article.bodyParagraphs.slice(0, 8).join('\n')}

Trả về JSON duy nhất:
{
  "title": "Tiêu đề mới ấn tượng...",
  "sapo": "Đoạn mở đầu chuyên nghiệp (120-160 từ)...",
  "content_html": "<h2>1. Diễn biến cốt lõi</h2><p>...</p><h2>2. Phân tích chuyên sâu</h2><p>...</p>",
  "summary_points": ["điểm 1", "điểm 2", "điểm 3", "điểm 4"],
  "tags": ["tag1", "tag2", "tag3"]
}
    `.trim();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        }),
      }
    );
    clearTimeout(timeout);

    if (!res.ok) return null;

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    const parsed = JSON.parse(text);
    if (!parsed.title || !parsed.content_html) return null;

    const wordCount = countWords(parsed.content_html + ' ' + (parsed.sapo || ''));

    return {
      title: parsed.title,
      sapo: parsed.sapo || article.sapo,
      contentHtml: parsed.content_html,
      summaryPoints: Array.isArray(parsed.summary_points) ? parsed.summary_points : ['Phân tích TinVanta'],
      tags: Array.isArray(parsed.tags) ? parsed.tags : [categoryName, 'Tin mới'],
      seoTitle: `${parsed.title} | TinVanta`,
      seoDescription: (parsed.sapo || '').slice(0, 160),
      aiProvider: 'gemini_free',
      wordCount,
    };
  } catch (error) {
    console.error('Lỗi khi gọi Gemini Free Tier:', error);
    return null;
  }
}

/**
 * Hàm điều phối AI viết lại bài viết tự động thông minh:
 * Tự động chọn tầng AI tối ưu nhất (Gemini -> Pollinations Free -> Smart Synthesizer)
 */
export async function rewriteCrawledArticle(
  article: ExtractedArticle,
  categoryName: string,
  preferredProvider: 'auto' | 'pollinations_free' | 'gemini_free' | 'smart_synthesizer' = 'auto'
): Promise<RewrittenArticleResult> {
  // 1. Nếu chỉ định cụ thể Pollinations.ai Miễn Phí
  if (preferredProvider === 'pollinations_free') {
    const res = await rewriteWithPollinationsFree(article, categoryName);
    if (res) return res;
  }

  // 2. Nếu chỉ định cụ thể Gemini Free
  if (preferredProvider === 'gemini_free') {
    const res = await rewriteWithGeminiFree(article, categoryName);
    if (res) return res;
  }

  // 3. Nếu là chế độ 'auto': Ưu tiên Gemini nếu có key, kế tiếp đến Pollinations Free
  if (preferredProvider === 'auto') {
    const geminiRes = await rewriteWithGeminiFree(article, categoryName);
    if (geminiRes) return geminiRes;

    const pollRes = await rewriteWithPollinationsFree(article, categoryName);
    if (pollRes) return pollRes;
  }

  // 4. Tầng bảo đảm 100% thành công: Động cơ tổng hợp báo chí thông minh
  return synthesizeJournalisticArticle(article, categoryName);
}
