"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { ChatMessage, ExpertInfo } from "@/lib/types";

interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSend: (message: string) => void;
  expert: ExpertInfo;
}

const QUICK_PROMPTS = [
  "What's the best routine for my skin?",
  "Recommend products for hydration",
  "How to reduce dark circles?",
  "Morning vs. night routine tips",
  "Best K-Beauty ingredients for glow",
];

export function ChatPanel({ messages, isLoading, onSend, expert }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
    // Auto-resize
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {messages.length === 0 && (
            <EmptyState onPromptClick={onSend} expert={expert} />
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isLoading && <ThinkingIndicator expert={expert} />}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border/50 bg-card/30 p-4">
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto"
        >
          <div className="glass rounded-2xl flex items-end gap-2 p-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask your K-Beauty expert..."
              rows={1}
              className="flex-1 bg-transparent border-0 outline-none resize-none text-sm px-3 py-2 placeholder:text-muted-foreground/50 max-h-[120px]"
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
            SIL AI can make mistakes. Consult a dermatologist for medical advice.
          </p>
        </form>
      </div>
    </div>
  );
}

function EmptyState({
  onPromptClick,
  expert,
}: {
  onPromptClick: (msg: string) => void;
  expert: ExpertInfo;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sil-lavender via-sil-rose to-sil-gold flex items-center justify-center text-3xl mb-6 glow-purple animate-float">
        {expert.emoji}
      </div>
      <h3 className="text-lg font-semibold mb-2">
        Hi! I&apos;m {expert.name}
      </h3>
      <p className="text-sm text-muted-foreground mb-8 max-w-md">
        Ask me anything about skincare, K-Beauty products, ingredients, or
        routines. I&apos;ll use your 5-Vector profile for personalized advice.
      </p>
      <div className="flex flex-wrap justify-center gap-2 max-w-lg">
        {QUICK_PROMPTS.map((prompt) => (
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
        className={`max-w-[80%] ${
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
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-gradient-to-r from-sil-lavender to-sil-rose text-white rounded-tr-md"
              : "glass-card rounded-tl-md"
          }`}
        >
          <div className="whitespace-pre-wrap">{message.content}</div>
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
