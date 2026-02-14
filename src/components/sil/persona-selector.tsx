"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/language-context";
import { getPersonas, type PersonaInfo } from "@/lib/api";
import { cn } from "@/lib/utils";

interface PersonaSelectorProps {
  onSelect: (persona: PersonaInfo) => void;
  onSkip: () => void;
}

// Fallback personas (used when API is unreachable)
const FALLBACK_PERSONAS: PersonaInfo[] = [
  { id: "dr_beauty", name: "Dr. Beauty", subtitle: "Dermatologist-turned beauty creator", emoji: "👩‍⚕️", avatar_gradient: "from-blue-400 to-cyan-400", specialty_tags: ["Skin Trouble", "Ingredients", "Barrier Care"] },
  { id: "unni", name: "Cheongdam Unni", subtitle: "Luxury beauty influencer", emoji: "💎", avatar_gradient: "from-violet-400 to-fuchsia-400", specialty_tags: ["Anti-aging", "Luxury", "Treatments"] },
  { id: "hong", name: "Hongdae Fairy", subtitle: "Trendy K-Beauty YouTuber", emoji: "🧚", avatar_gradient: "from-pink-400 to-orange-400", specialty_tags: ["Olive Young", "Budget", "Trends"] },
  { id: "oppa", name: "Ingredient Oppa", subtitle: "Ingredient analysis beauty blogger", emoji: "🔬", avatar_gradient: "from-emerald-400 to-teal-400", specialty_tags: ["Ingredients", "Comparison", "Value"] },
  { id: "guru", name: "Glow Master", subtitle: "Global K-Beauty evangelist", emoji: "✨", avatar_gradient: "from-amber-400 to-rose-400", specialty_tags: ["Global", "Routines", "Glass Skin"] },
];

export function PersonaSelector({ onSelect, onSkip }: PersonaSelectorProps) {
  const { language, t } = useLanguage();
  const [personas, setPersonas] = useState<PersonaInfo[]>(FALLBACK_PERSONAS);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    getPersonas(language)
      .then(setPersonas)
      .catch(() => setPersonas(FALLBACK_PERSONAS));
  }, [language]);

  const handleConfirm = () => {
    const persona = personas.find((p) => p.id === selected);
    if (persona) onSelect(persona);
  };

  return (
    <div>
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">🎭</div>
        <h2 className="text-2xl font-bold mb-2">{t("persona_title")}</h2>
        <p className="text-muted-foreground text-sm">{t("persona_desc")}</p>
      </div>

      {/* Horizontal scroll on mobile, grid on desktop */}
      <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory -mx-2 px-2 md:grid md:grid-cols-3 md:overflow-visible">
        {personas.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected(p.id)}
            className={cn(
              "snap-center shrink-0 w-[160px] md:w-full flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-200",
              selected === p.id
                ? "border-primary bg-primary/5 scale-[1.02] shadow-lg"
                : "border-border/50 hover:border-border hover:bg-accent/30"
            )}
          >
            {/* Avatar */}
            <div
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-3 bg-gradient-to-br",
                p.avatar_gradient
              )}
            >
              {p.emoji}
            </div>

            {/* Name */}
            <p className="font-semibold text-sm mb-0.5">{p.name}</p>
            <p className="text-[10px] text-muted-foreground mb-3 text-center leading-tight min-h-[24px]">
              {p.subtitle}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap justify-center gap-1">
              {p.specialty_tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-[9px] px-1.5 py-0 rounded-full"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-between mt-6">
        <Button variant="ghost" size="sm" onClick={onSkip}>
          {t("skip")}
        </Button>
        <Button
          className="rounded-full px-6 bg-gradient-to-r from-sil-lavender to-sil-rose text-white border-0"
          onClick={handleConfirm}
          disabled={!selected}
        >
          {t("skin_continue")}
        </Button>
      </div>
    </div>
  );
}
