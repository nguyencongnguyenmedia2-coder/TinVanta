'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, FastForward } from 'lucide-react';

interface ArticleAudioPlayerProps {
  title: string;
  sapo: string;
  content: string;
}

export function ArticleAudioPlayer({ title, sapo, content }: ArticleAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState<number>(1.0);
  const [isSupported, setIsSupported] = useState(false);
  const [voiceName, setVoiceName] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);

      const findVietnameseVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        const viVoice = voices.find(v => v.lang.startsWith('vi') || v.lang.includes('VN'));
        if (viVoice) {
          setVoiceName(viVoice.name);
        } else {
          setVoiceName('Giọng đọc hệ thống');
        }
      };

      findVietnameseVoice();
      window.speechSynthesis.onvoiceschanged = findVietnameseVoice;
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const prepareText = () => {
    // Tách văn bản sạch từ sapo và content HTML
    const cleanContent = content.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
    return `${title}. ${sapo}. ${cleanContent}`;
  };

  const handlePlay = () => {
    if (!isSupported) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();

    const fullText = prepareText();
    const utterance = new SpeechSynthesisUtterance(fullText);
    utteranceRef.current = utterance;

    // Tìm giọng đọc tiếng Việt
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find(v => v.lang.startsWith('vi') || v.lang.includes('VN'));
    if (viVoice) {
      utterance.voice = viVoice;
    }
    utterance.lang = 'vi-VN';
    utterance.rate = rate;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const handlePause = () => {
    if (!isSupported) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
  };

  const toggleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 0.85];
    const nextIdx = (speeds.indexOf(rate) + 1) % speeds.length;
    const newRate = speeds[nextIdx];
    setRate(newRate);
    if (isPlaying && utteranceRef.current) {
      handleStop();
      setTimeout(handlePlay, 100);
    }
  };

  if (!isSupported) return null;

  return (
    <div id="article-audio-player" className="bg-gradient-to-r from-red-50/70 via-gray-50 to-white border border-red-100 rounded-xl p-3 sm:p-4 my-5 shadow-sm scroll-mt-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Indicator & Status */}
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
            isPlaying ? 'bg-[#D71920] text-white shadow-md' : 'bg-red-100 text-[#D71920]'
          }`}>
            <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <span>BẢN TIN NÓI AUDIO (AI VOICE)</span>
              {isPlaying && (
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-100 text-[#D71920]">
                  Đang đọc
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500">
              {voiceName ? `Giọng đọc: ${voiceName}` : 'Giọng đọc chuẩn tiếng Việt tự động'}
            </p>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          {/* Rate Button */}
          <button
            type="button"
            onClick={toggleSpeed}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 transition-colors shadow-2xs"
            title="Tốc độ đọc"
          >
            <FastForward className="w-3 h-3 text-[#D71920]" />
            <span>{rate}x</span>
          </button>

          {/* Play/Pause Button */}
          {!isPlaying ? (
            <button
              type="button"
              onClick={handlePlay}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#D71920] hover:bg-[#b01319] text-white text-xs font-semibold shadow transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isPaused ? 'Tiếp tục' : 'Nghe đọc'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePause}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-900 text-white text-xs font-semibold shadow transition-all"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Tạm dừng</span>
            </button>
          )}

          {/* Reset / Stop */}
          {(isPlaying || isPaused) && (
            <button
              type="button"
              onClick={handleStop}
              className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-gray-600 transition-colors"
              title="Dừng phát"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Visual audio equalizer waves when playing */}
      {isPlaying && (
        <div className="mt-3 pt-2.5 border-t border-red-100/60 flex items-center gap-1 justify-center">
          {[40, 70, 30, 90, 50, 80, 25, 60, 100, 45, 85, 30, 65].map((height, idx) => (
            <span
              key={idx}
              className="w-1 bg-[#D71920] rounded-full animate-bounce"
              style={{
                height: `${Math.max(6, height * 0.18)}px`,
                animationDelay: `${(idx % 5) * 120}ms`,
                animationDuration: '600ms'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
