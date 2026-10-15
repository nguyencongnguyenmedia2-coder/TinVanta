'use client';

import React, { useState, useEffect } from 'react';
import { ThumbsUp, Heart, Sparkles, Lightbulb, Frown } from 'lucide-react';

interface ArticleReactionsProps {
  articleId: string;
  initialLikes?: number;
}

type ReactionType = 'like' | 'love' | 'surprised' | 'insightful' | 'sad';

interface ReactionItem {
  id: ReactionType;
  label: string;
  icon: string;
  count: number;
}

export function ArticleReactions({ articleId, initialLikes = 42 }: ArticleReactionsProps) {
  const [selectedReaction, setSelectedReaction] = useState<ReactionType | null>(null);
  const [reactions, setReactions] = useState<ReactionItem[]>([
    { id: 'like', label: 'Thích', icon: '👍', count: initialLikes },
    { id: 'love', label: 'Yêu thích', icon: '❤️', count: Math.floor(initialLikes * 0.4) },
    { id: 'insightful', label: 'Hữu ích', icon: '💡', count: Math.floor(initialLikes * 0.3) },
    { id: 'surprised', label: 'Bất ngờ', icon: '😮', count: Math.floor(initialLikes * 0.15) },
    { id: 'sad', label: 'Chia buồn', icon: '😢', count: Math.floor(initialLikes * 0.05) },
  ]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`newshub_react_${articleId}`);
      if (saved) {
        setSelectedReaction(saved as ReactionType);
      }
    }
  }, [articleId]);

  const handleSelectReaction = (type: ReactionType) => {
    if (selectedReaction === type) {
      // Toggle off
      setSelectedReaction(null);
      setReactions(prev => prev.map(r => r.id === type ? { ...r, count: Math.max(0, r.count - 1) } : r));
      localStorage.removeItem(`newshub_react_${articleId}`);
    } else {
      // Switch or select new
      setReactions(prev => prev.map(r => {
        if (r.id === selectedReaction) return { ...r, count: Math.max(0, r.count - 1) };
        if (r.id === type) return { ...r, count: r.count + 1 };
        return r;
      }));
      setSelectedReaction(type);
      localStorage.setItem(`newshub_react_${articleId}`, type);

      // Async sync with server
      fetch('/api/articles/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, reactionType: type }),
      }).catch(() => {});
    }
  };

  const totalReactions = reactions.reduce((sum, r) => sum + r.count, 0);

  return (
    <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-5 my-8 text-center">
      <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
        Cảm xúc của bạn về bài viết này?
      </div>
      <p className="text-xs text-gray-400 mb-4">
        Đã có <span className="font-semibold text-gray-700">{totalReactions.toLocaleString('vi-VN')}</span> lượt tương tác từ độc giả
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {reactions.map((r) => {
          const isSelected = selectedReaction === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => handleSelectReaction(r.id)}
              className={`flex flex-col items-center gap-1 py-2 px-3 sm:px-4 rounded-xl border transition-all transform active:scale-95 ${
                isSelected
                  ? 'bg-red-50/90 border-[#D71920] text-[#D71920] shadow-sm scale-105 font-bold'
                  : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl sm:text-2xl transition-transform hover:scale-125">
                {r.icon}
              </span>
              <span className="text-[11px] leading-none">
                {r.label}
              </span>
              <span className={`text-[10px] ${isSelected ? 'text-[#D71920]' : 'text-gray-400'}`}>
                {r.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
