"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/language-context";
import type { ChatMessage, ExpertInfo, FiveVectors } from "@/lib/types";
import type { Lang } from "@/lib/ui-strings";

interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSend: (message: string) => void;
  expert: ExpertInfo;
  vectors?: FiveVectors;
}

/** Context-aware quick prompts based on skin issues & language */
function getQuickPrompts(vectors?: FiveVectors, lang: Lang = "ko"): string[] {
  const issues = vectors?.user?.issues || [];
  const skinType = vectors?.user?.skin_type || "";

  const prompts: Record<Lang, Record<string, string>> = {
    ko: {
      default1: "내 피부에 맞는 루틴 추천해주세요",
      default2: "수분 보충에 좋은 제품 추천",
      default3: "K-뷰티 필수 성분 알려주세요",
      acne: "트러블 관리 방법 알려주세요",
      dark_circle: "다크서클 줄이는 방법 알려주세요",
      dryness: "건조한 피부 보습 루틴 추천해주세요",
      wrinkle: "주름 개선에 좋은 성분은?",
      pore: "모공 관리 팁 알려주세요",
      oiliness: "유분 조절에 좋은 제품 추천해주세요",
      sensitivity: "민감한 피부에 맞는 저자극 제품은?",
      oily: "지성 피부 관리법 알려주세요",
      dry: "건성 피부 루틴 추천해주세요",
    },
    en: {
      default1: "Recommend a routine for my skin",
      default2: "Best products for hydration",
      default3: "Must-know K-Beauty ingredients",
      acne: "How to manage acne breakouts?",
      dark_circle: "Tips to reduce dark circles",
      dryness: "Hydration routine for dry skin",
      wrinkle: "Best anti-wrinkle ingredients?",
      pore: "Pore minimizing tips",
      oiliness: "Oil control product recommendations",
      sensitivity: "Gentle products for sensitive skin?",
      oily: "Oily skin care tips",
      dry: "Dry skin routine recommendations",
    },
    ja: {
      default1: "私の肌に合うルーティンを教えて",
      default2: "保湿に良い製品のおすすめ",
      default3: "K-ビューティー必須成分を教えて",
      acne: "ニキビケアの方法を教えて",
      dark_circle: "クマを減らす方法は？",
      dryness: "乾燥肌の保湿ルーティン",
      wrinkle: "シワ改善に良い成分は？",
      pore: "毛穴ケアのコツを教えて",
      oiliness: "皮脂コントロール製品のおすすめ",
      sensitivity: "敏感肌向けの低刺激製品は？",
      oily: "脂性肌のケア方法",
      dry: "乾燥肌のルーティンおすすめ",
    },
  };

  const p = prompts[lang] || prompts.ko;
  const result: string[] = [];

  // Add issue-specific prompts first
  for (const issue of issues) {
    if (p[issue] && result.length < 2) {
      result.push(p[issue]);
    }
  }

  // Add skin-type specific prompt
  if (skinType && p[skinType] && result.length < 2) {
    result.push(p[skinType]);
  }

  // Fill remaining with defaults
  const defaults = [p.default1, p.default2, p.default3];
  for (const d of defaults) {
    if (result.length >= 3) break;
    if (!result.includes(d)) result.push(d);
  }

  return result.slice(0, 3);
}

/** Simple markdown rendering: **bold**, - list items */
function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    // Bold: **text**
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const rendered = parts.map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={j} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });

    // List item: - text
    const trimmed = line.trimStart();
    if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      elements.push(
        <li key={i} className="ml-4 list-disc">
          {rendered.map((r, idx) =>
            typeof r === "string" ? r.replace(/^[-•]\s/, "") : r
          )}
        </li>
      );
    } else if (line.trim() === "") {
      elements.push(<br key={i} />);
    } else {
      elements.push(
        <p key={i} className="mb-1.5">
          {rendered}
        </p>
      );
    }
  });

  return <div className="space-y-0">{elements}</div>;
}

export function ChatPanel({ messages, isLoading, onSend, expert, vectors }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { language, t } = useLanguage();

  const quickPrompts = useMemo(
    () => getQuickPrompts(vectors, language),
    [vectors, language]
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {messages.length === 0 && (
            <EmptyState
              onPromptClick={onSend}
              expert={expert}
              prompts={quickPrompts}
              language={language}
            />
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isLoading && <ThinkingIndicator expert={expert} />}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border/50 bg-card/30 p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="glass rounded-2xl flex items-end gap-2 p-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder={t("chat_placeholder")}
              rows={1}
              className="flex-1 bg-transparent border-0 outline-none resize-none text-base px-3 py-2 placeholder:text-muted-foreground/50 max-h-[120px]"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="rounded-xl bg-gradient-to-r from-sil-lavender to-sil-rose text-white border-0 shrink-0 h-9 w-9"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground/50 text-center mt-2">
            {t("chat_disclaimer")}
          </p>
        </form>
      </div>
    </div>
  );
}

function EmptyState({
  onPromptClick,
  expert,
  prompts,
  language,
}: {
  onPromptClick: (msg: string) => void;
  expert: ExpertInfo;
  prompts: string[];
  language: Lang;
}) {
  const { t } = useLanguage();
  const greeting = t("chat_greeting").replace("{name}", expert.name);

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sil-lavender via-sil-rose to-sil-gold flex items-center justify-center text-3xl mb-6 glow-purple animate-float">
        {expert.emoji}
      </div>
      <h3 className="text-lg font-semibold mb-2">{greeting}</h3>
      <p className="text-sm text-muted-foreground mb-8 max-w-md">
        {t("chat_intro")}
      </p>
      <div className="flex flex-wrap justify-center gap-2 max-w-lg">
        {prompts.map((prompt) => (
          <Button
            key={prompt}
            variant="outline"
            size="sm"
            className="rounded-full text-xs border-border/50 hover:bg-accent/50 hover:border-primary/20"
            onClick={() => onPromptClick(prompt)}
          >
            {prompt}
          </Button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <Avatar className="w-8 h-8 shrink-0">
        <AvatarFallback
          className={
            isUser
              ? "bg-muted text-xs"
              : "bg-gradient-to-br from-sil-lavender to-sil-rose text-white text-xs"
          }
        >
          {isUser ? "You" : message.expert?.emoji || "🤖"}
        </AvatarFallback>
      </Avatar>
      <div
        className={`max-w-[85%] ${
          isUser ? "items-end" : "items-start"
        } flex flex-col`}
      >
        {!isUser && message.expert && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium">{message.expert.name}</span>
            <Badge
              variant="outline"
              className="text-[9px] px-1.5 py-0 rounded-full"
            >
              {message.expert.category}
            </Badge>
          </div>
        )}
        <div
          className={`rounded-2xl px-4 py-3 text-base leading-relaxed ${
            isUser
              ? "bg-gradient-to-r from-sil-lavender to-sil-rose text-white rounded-tr-md"
              : "glass-card rounded-tl-md"
          }`}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            renderMarkdown(message.content)
          )}
        </div>
        <span className="text-[9px] text-muted-foreground/50 mt-1 px-1">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}

function ThinkingIndicator({ expert }: { expert: ExpertInfo }) {
  return (
    <div className="flex gap-3">
      <Avatar className="w-8 h-8 shrink-0">
        <AvatarFallback className="bg-gradient-to-br from-sil-lavender to-sil-rose text-white text-xs">
          {expert.emoji}
        </AvatarFallback>
      </Avatar>
      <div className="glass-card rounded-2xl rounded-tl-md px-4 py-3">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sil-lavender/60 animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 rounded-full bg-sil-rose/60 animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 rounded-full bg-sil-gold/60 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
