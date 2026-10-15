'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  RefreshCw, 
  Check, 
  Download, 
  Image as ImageIcon, 
  Palette, 
  Layers, 
  ExternalLink,
  Loader2,
  Wand2
} from 'lucide-react';
import { CATEGORY_EDITORIAL_COVERS, buildImagePromptFromTopic, generatePollinationsImageUrl } from '@/lib/ai/open-source-ai';

interface AutoCoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string, caption?: string) => void;
  articleTitle: string;
  categoryName?: string;
  categorySlug?: string;
}

const POSTER_THEMES = [
  { id: 'ruby', name: 'Ruby Tòa Soạn', bgStart: '#800a0f', bgEnd: '#1a0406', textBadge: '#D71920', badgeBg: '#ffffff' },
  { id: 'navy', name: 'Midnight Navy', bgStart: '#0f172a', bgEnd: '#020617', textBadge: '#38bdf8', badgeBg: 'rgba(56, 189, 248, 0.15)' },
  { id: 'purple', name: 'Tech Innovation', bgStart: '#4c1d95', bgEnd: '#1e1b4b', textBadge: '#c084fc', badgeBg: 'rgba(192, 132, 252, 0.15)' },
  { id: 'emerald', name: 'Kinh Tế Xanh', bgStart: '#064e3b', bgEnd: '#022c22', textBadge: '#34d399', badgeBg: 'rgba(52, 211, 153, 0.15)' },
  { id: 'gold', name: 'Tiêu Điểm Vàng', bgStart: '#78350f', bgEnd: '#1c1917', textBadge: '#fbbf24', badgeBg: 'rgba(251, 191, 36, 0.2)' },
];

export function AutoCoverModal({
  isOpen,
  onClose,
  onSelectImage,
  articleTitle,
  categoryName = 'Thời sự',
  categorySlug = 'thoi-su',
}: AutoCoverModalProps) {
  const [activeTab, setActiveTab] = useState<'ai_flux' | 'canvas_poster' | 'curated_stock'>('ai_flux');

  // AI Flux State
  const [aiPrompt, setAiPrompt] = useState('');
  const [currentSeed, setCurrentSeed] = useState(123456);
  const [aiImageUrl, setAiImageUrl] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Canvas State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedTheme, setSelectedTheme] = useState(POSTER_THEMES[0]);
  const [canvasImageUrl, setCanvasImageUrl] = useState('');

  // Curated Stock
  const stockImages = CATEGORY_EDITORIAL_COVERS[categorySlug] || CATEGORY_EDITORIAL_COVERS['thoi-su'];

  // Initialize Prompt & Image on Open
  useEffect(() => {
    if (isOpen) {
      const topic = articleTitle || 'Tin tức thời sự đổi mới sáng tạo';
      const prompt = buildImagePromptFromTopic(topic, categoryName);
      setAiPrompt(prompt);
      const seed = Math.floor(Math.random() * 900000) + 100000;
      setCurrentSeed(seed);
      setAiImageUrl(generatePollinationsImageUrl(prompt, seed));
    }
  }, [isOpen, articleTitle, categoryName]);

  // Draw Canvas Editorial Poster
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1200;
    const height = 675;
    canvas.width = width;
    canvas.height = height;

    // 1. Draw Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, selectedTheme.bgStart);
    gradient.addColorStop(1, selectedTheme.bgEnd);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Decorative Geometric Graphic Overlay
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 60) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 200, height);
      ctx.stroke();
    }
    ctx.restore();

    // Subtle Radial Glow
    const glow = ctx.createRadialGradient(200, 200, 50, 200, 200, 600);
    glow.addColorStop(0, 'rgba(215, 25, 32, 0.25)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    // 3. Brand Header
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('TINVANTA', 80, 85);

    ctx.fillStyle = '#D71920';
    ctx.fillText('•', 215, 85);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.font = '500 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('BÁO ĐIỆN TỬ & PHÂN TÍCH CHUYÊN SÂU', 235, 84);

    // 4. Category Badge
    ctx.fillStyle = selectedTheme.badgeBg;
    const badgeText = (categoryName || 'TIÊU ĐIỂM').toUpperCase();
    ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const badgeWidth = ctx.measureText(badgeText).width + 32;
    
    // Draw rounded rect badge
    ctx.beginPath();
    ctx.roundRect(80, 140, badgeWidth, 34, 8);
    ctx.fill();
    ctx.fillStyle = selectedTheme.textBadge;
    ctx.fillText(badgeText, 96, 163);

    // 5. Title Wrapping (Typography lớn & sang trọng)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 50px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    
    const titleText = articleTitle || 'Tiêu Điểm Thời Sự & Chiến Lược Phát Triển Mới';
    const words = titleText.split(' ');
    let line = '';
    let y = 250;
    const maxWidth = 1040;
    const lineHeight = 65;
    let lineCount = 0;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line.trim(), 80, y);
        line = words[n] + ' ';
        y += lineHeight;
        lineCount++;
        if (lineCount >= 3) {
          line += '...';
          break;
        }
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), 80, y);

    // 6. Subline Divider & Timestamp
    y += 40;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, y);
    ctx.lineTo(200, y);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '400 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const dateStr = new Date().toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
    ctx.fillText(`Phát hành: ${dateStr}  •  Tòa soạn TinVanta Multimedia`, 80, y + 40);

    // 7. Right Decorative Watermark
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.font = '900 240px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('TV', width - 40, height - 40);
    ctx.textAlign = 'left';

    // Export to base64 Data URL
    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setCanvasImageUrl(dataUrl);
    } catch {}
  };

  useEffect(() => {
    if (activeTab === 'canvas_poster') {
      setTimeout(drawCanvas, 50);
    }
  }, [activeTab, selectedTheme, articleTitle, categoryName]);

  const handleRegenerateAi = () => {
    setIsAiLoading(true);
    const newSeed = Math.floor(Math.random() * 900000) + 100000;
    setCurrentSeed(newSeed);
    setAiImageUrl(generatePollinationsImageUrl(aiPrompt, newSeed));
    setTimeout(() => setIsAiLoading(false), 600);
  };

  const handleDownloadCanvas = () => {
    if (!canvasImageUrl) return;
    const a = document.createElement('a');
    a.href = canvasImageUrl;
    a.download = `tinvanta-cover-${Date.now()}.jpg`;
    a.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#172033] text-white flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-red-600/30 text-red-400">
              <Wand2 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-black text-base">Tạo Ảnh Bìa Báo Chí Tự Động (Auto Cover Image)</h3>
              <p className="text-xs text-gray-400">Mã nguồn mở miễn phí Pollinations Flux AI & Bìa Poster Tòa Soạn 16:9</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center border-b border-gray-200 bg-gray-50 px-6 gap-2 pt-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('ai_flux')}
            className={`pb-3 px-3 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'ai_flux'
                ? 'border-[#D71920] text-[#D71920]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Chụp Phóng Sự (Pollinations Flux Free)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('canvas_poster')}
            className={`pb-3 px-3 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'canvas_poster'
                ? 'border-[#D71920] text-[#D71920]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Bìa Đồ Họa Báo Chí (Editorial Poster 16:9)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('curated_stock')}
            className={`pb-3 px-3 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'curated_stock'
                ? 'border-[#D71920] text-[#D71920]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Kho Ảnh Phóng Sự Chuẩn Unsplash</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: AI FLUX PHOTOJOURNALISM */}
          {activeTab === 'ai_flux' && (
            <div className="space-y-4">
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-gray-950 border border-gray-200 shadow-inner flex items-center justify-center">
                {aiImageUrl ? (
                  <img
                    src={aiImageUrl}
                    alt="AI Generated Cover"
                    className="w-full h-full object-cover"
                    onLoad={() => setIsAiLoading(false)}
                  />
                ) : (
                  <div className="text-gray-500 text-xs flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-[#D71920]" />
                    <span>Đang khởi tạo ảnh AI...</span>
                  </div>
                )}

                {isAiLoading && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white text-xs gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-red-400" />
                    <span>Đang kết xuất ảnh AI mới...</span>
                  </div>
                )}

                <div className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded-md font-semibold">
                  Tỉ lệ: 16:9 (1200 x 675 px) • Seed: #{currentSeed}
                </div>
              </div>

              {/* Prompt Controls */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700">
                  Câu lệnh AI (Prompt):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                  />
                  <button
                    type="button"
                    onClick={handleRegenerateAi}
                    className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Đổi góc máy</span>
                  </button>
                </div>
                <p className="text-[11px] text-gray-500 italic">
                  * Sử dụng mô hình mã nguồn mở Flux qua Pollinations AI, miễn phí không giới hạn số lần tạo.
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    onSelectImage(aiImageUrl, `Ảnh AI tạo tự động: ${articleTitle}`);
                    onClose();
                  }}
                  className="px-5 py-2.5 bg-[#D71920] hover:bg-[#b8141a] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Áp dụng làm ảnh bìa bài viết</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: EDITORIAL GRAPHIC POSTER (CANVAS) */}
          {activeTab === 'canvas_poster' && (
            <div className="space-y-4">
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-gray-900 border border-gray-200 shadow-md">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Theme Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700">
                  Chọn tông màu Báo chí:
                </label>
                <div className="flex flex-wrap gap-2">
                  {POSTER_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setSelectedTheme(theme)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                        selectedTheme.id === theme.id
                          ? 'border-[#D71920] bg-red-50 text-[#D71920] shadow-2xs'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: theme.bgStart }} />
                      <span>{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleDownloadCanvas}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải ảnh PNG về máy</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (canvasImageUrl) {
                      onSelectImage(canvasImageUrl, `Ảnh bìa đồ họa: ${articleTitle}`);
                      onClose();
                    }
                  }}
                  className="px-5 py-2.5 bg-[#D71920] hover:bg-[#b8141a] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Áp dụng bìa đồ họa này</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: CURATED STOCK PHOTOS */}
          {activeTab === 'curated_stock' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-600">
                Các ảnh phóng sự báo chí phân giải cao được tối ưu riêng cho chuyên mục <strong className="text-[#D71920]">{categoryName}</strong>:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {stockImages.map((url, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      onSelectImage(url, `Ảnh tư liệu báo chí: ${articleTitle}`);
                      onClose();
                    }}
                    className="group relative aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200 hover:border-[#D71920] transition-all cursor-pointer shadow-2xs hover:shadow-md"
                  >
                    <img
                      src={url}
                      alt={`Stock ${idx}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-[#D71920] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Chọn ảnh này</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
