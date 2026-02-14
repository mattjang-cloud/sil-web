"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { GLASS_CARD, HUD_LABEL, ACCENT_GRADIENT, GLOW_PURPLE } from "@/lib/clinical-theme";
import { useLanguage } from "@/lib/language-context";
import { getPersonas, type PersonaInfo } from "@/lib/api";

const FALLBACK_PERSONAS: PersonaInfo[] = [
  { id: "dr_beauty", name: "닥터뷰티", subtitle: "피부과학 전문가", emoji: "👩‍⚕️", avatar_gradient: "from-blue-500 to-cyan-400", specialty_tags: ["트러블", "성분분석", "피부장벽"] },
  { id: "unni", name: "청담언니", subtitle: "럭셔리 뷰티 에디터", emoji: "💎", avatar_gradient: "from-pink-500 to-rose-400", specialty_tags: ["안티에이징", "프리미엄", "시술"] },
  { id: "hong", name: "홍대요정", subtitle: "트렌드 큐레이터", emoji: "🧚", avatar_gradient: "from-violet-500 to-purple-400", specialty_tags: ["올리브영", "가성비", "트렌드"] },
  { id: "oppa", name: "성분오빠", subtitle: "코스메틱 케미스트", emoji: "🔬", avatar_gradient: "from-emerald-500 to-teal-400", specialty_tags: ["성분분석", "비교", "가성비"] },
  { id: "guru", name: "글로우마스터", subtitle: "K-Beauty 철학가", emoji: "✨", avatar_gradient: "from-amber-500 to-orange-400", specialty_tags: ["루틴설계", "글래스스킨", "K-뷰티철학"] },
];

interface ClinicalPersonaSelectorProps {
  onSelect: (persona: PersonaInfo) => void;
  onSkip?: () => void;
}

export function ClinicalPersonaSelector({ onSelect, onSkip }: ClinicalPersonaSelectorProps) {
  const [personas, setPersonas] = useState<PersonaInfo[]>(FALLBACK_PERSONAS);
  const [selected, setSelected] = useState<string | null>(null);
  const { language, t } = useLanguage();

  useEffect(() => {
    getPersonas(language).then(setPersonas).catch(() => {});
  }, [language]);

  return (
    <div>
      <div className="text-center mb-6">
        <p className={cn(HUD_LABEL, "mb-2")}>SELECT ADVISOR</p>
        <h2 className="text-xl font-bold text-white/90 mb-1">{t("persona_title")}</h2>
        <p className="text-xs text-white/40">{t("persona_desc")}</p>
      </div>

      {/* Persona Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {personas.map((persona, i) => (
          <button
            key={persona.id}
            onClick={() => {
              setSelected(persona.id);
              onSelect(persona);
            }}
            className={cn(
              GLASS_CARD,
              "p-4 text-left transition-all duration-300 animate-fade-in-up",
              selected === persona.id
                ? "ring-2 ring-[#8c2bee] bg-white/8 scale-[1.02]"
                : "hover:bg-white/6 hover:scale-[1.01]"
            )}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0",
                  `bg-gradient-to-br ${persona.avatar_gradient}`,
                  selected === persona.id && GLOW_PURPLE
                )}
              >
                {persona.emoji}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-white/90">{persona.name}</p>
                <p className="text-[11px] text-white/40 mb-2">{persona.subtitle}</p>
                <div className="flex flex-wrap gap-1">
                  {persona.specialty_tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/8"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {onSkip && (
        <div className="text-center">
          <button
            onClick={onSkip}
            className="text-[11px] font-mono uppercase tracking-wider text-white/30 hover:text-white/50 transition-colors"
          >
            SKIP →
          </button>
        </div>
      )}
    </div>
  );
}
