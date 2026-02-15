"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  GLASS_CARD,
  HUD_LABEL,
  ACCENT_GRADIENT,
} from "@/lib/clinical-theme";
import { useLanguage } from "@/lib/language-context";
import type { ChatMessage, ExpertInfo, FiveVectors, SkinAnalysis } from "@/lib/types";

interface ClinicalChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSend: (content: string) => void;
  expert: ExpertInfo;
  vectors?: FiveVectors;
}

export function ClinicalChatPanel({
  messages,
  isLoading,
  onSend,
  expert,
  vectors,
}: ClinicalChatPanelProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { language, t } = useLanguage();

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput("");
  };

  const quickPrompts = getQuickPrompts(vectors, language);

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <EmptyState
            expert={expert}
            prompts={quickPrompts}
            onPromptClick={onSend}
          />
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <ThinkingIndicator expert={expert} />
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/8">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("chat_placeholder")}
            className={cn(
              "flex-1 h-11 rounded-full px-5 text-sm",
              "bg-white/5 border border-white/10 text-white/90 placeholder:text-white/30",
              "focus:outline-none focus:ring-2 focus:ring-[#8c2bee]/50 focus:border-[#8c2bee]/50",
              "transition-all"
            )}
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={cn(
              "rounded-full w-11 h-11 p-0 text-white",
              ACCENT_GRADIENT,
              "disabled:opacity-30"
            )}
          >
            ↑
          </Button>
        </div>
        <p className={cn(HUD_LABEL, "text-center mt-2 text-[9px]")}>
          {t("chat_disclaimer")}
        </p>
      </form>
    </div>
  );
}

// ─── Empty State ───

function EmptyState({
  expert,
  prompts,
  onPromptClick,
}: {
  expert: ExpertInfo;
  prompts: string[];
  onPromptClick: (text: string) => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <div
        className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4",
          ACCENT_GRADIENT,
          "animate-breathe"
        )}
      >
        {expert.emoji}
      </div>
      <h3 className="text-lg font-semibold text-white/90 mb-1">
        {t("chat_greeting").replace("{name}", expert.name)}
      </h3>
      <p className="text-xs text-white/40 max-w-sm mb-6">
        {t("chat_intro").replace("{name}", expert.name)}
      </p>

      <div className="flex flex-col gap-2 w-full max-w-sm">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onPromptClick(prompt)}
            className={cn(
              GLASS_CARD,
              "px-4 py-3 text-left text-sm text-white/60 hover:text-white/80 hover:bg-white/8 transition-all"
            )}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Message Bubble ───

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3",
          isUser
            ? cn("text-white", ACCENT_GRADIENT)
            : cn(GLASS_CARD, "text-white/80")
        )}
      >
        {/* Expert label for assistant */}
        {!isUser && message.expert && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-sm">{message.expert.emoji}</span>
            <span className={cn(HUD_LABEL, "text-white/50")}>{message.expert.name}</span>
          </div>
        )}

        {/* Content with simple markdown */}
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {renderMarkdown(message.content)}
        </div>
      </div>
    </div>
  );
}

// ─── Thinking Indicator ───

function ThinkingIndicator({ expert }: { expert: ExpertInfo }) {
  return (
    <div className="flex justify-start">
      <div className={cn(GLASS_CARD, "px-4 py-3 flex items-center gap-2")}>
        <span className="text-sm">{expert.emoji}</span>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#8c2bee] animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Quick Prompts ───

function getQuickPrompts(vectors?: FiveVectors, lang: string = "ko"): string[] {
  const skinIssues = (vectors?.user as SkinAnalysis)?.issues;

  if (lang === "ko") {
    if (skinIssues?.includes("dryness")) {
      return [
        "건조한 피부에 좋은 수분 크림 추천해주세요",
        "피부 장벽 강화하는 방법이 궁금해요",
        "겨울철 보습 루틴을 알려주세요",
      ];
    }
    return [
      "제 피부에 맞는 스킨케어 루틴을 추천해주세요",
      "K-뷰티 입문자를 위한 기초 제품은?",
      "피부 고민에 맞는 성분을 알려주세요",
    ];
  }

  if (lang === "ja") {
    return [
      "私の肌に合うスキンケアルーティンを教えてください",
      "K-ビューティー初心者におすすめの基礎製品は？",
      "肌の悩みに合う成分を教えてください",
    ];
  }

  // English
  if (skinIssues?.includes("dryness")) {
    return [
      "Recommend a hydrating cream for dry skin",
      "How to strengthen my skin barrier?",
      "Winter moisturizing routine tips",
    ];
  }
  return [
    "Recommend a skincare routine for my skin",
    "Best K-Beauty starter products?",
    "Which ingredients suit my skin concerns?",
  ];
}

// ─── Simple Markdown ───

function renderMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  // Split by lines and process
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, i) => {
    // Bold
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
