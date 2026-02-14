"use client";

import { cn } from "@/lib/utils";
import {
  GLASS_CARD,
  HUD_LABEL,
  HUD_LABEL_BRIGHT,
  ACCENT_GRADIENT,
} from "@/lib/clinical-theme";
import { HudProgressRing } from "./hud-progress-ring";
import type { FiveVectors } from "@/lib/types";

interface ClinicalVectorPanelProps {
  vectors: FiveVectors;
  className?: string;
}

const VECTOR_META = [
  { key: "user", label: "USER", icon: "📸", color: "#f906f9" },
  { key: "environment", label: "ENV", icon: "🌤", color: "#8c2bee" },
  { key: "lifestyle", label: "LIFE", icon: "🌿", color: "#10b981" },
  { key: "tpo", label: "TPO", icon: "🎯", color: "#f59e0b" },
  { key: "theme", label: "THEME", icon: "🎨", color: "#3b82f6" },
] as const;

export function ClinicalVectorPanel({ vectors, className }: ClinicalVectorPanelProps) {
  const completed = Object.keys(vectors).filter(
    (k) => vectors[k as keyof FiveVectors] !== undefined
  );
  const progress = Math.round((completed.length / 5) * 100);

  return (
    <div className={cn("p-4 space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className={HUD_LABEL_BRIGHT}>5-VECTOR STATUS</span>
        <span className={cn(HUD_LABEL, "text-[#8c2bee]")}>{completed.length}/5</span>
      </div>

      {/* Overall Progress */}
      <div className="flex items-center justify-center">
        <div className="relative w-20 h-20">
          <HudProgressRing value={progress} size={80} strokeWidth={5} color="#8c2bee" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-white/90">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Vector Items */}
      <div className="space-y-2">
        {VECTOR_META.map((v) => {
          const isSet = completed.includes(v.key);
          return (
            <div
              key={v.key}
              className={cn(
                GLASS_CARD,
                "px-3 py-2.5 flex items-center gap-3 transition-all",
                isSet ? "border-white/15" : "opacity-40"
              )}
            >
              <span className="text-lg">{v.icon}</span>
              <div className="flex-1 min-w-0">
                <span className={cn(HUD_LABEL, isSet ? "text-white/60" : "text-white/30")}>
                  {v.label}
                </span>
                {isSet && (
                  <VectorSummary vectorKey={v.key} data={vectors[v.key as keyof FiveVectors]} />
                )}
              </div>
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  isSet ? "bg-emerald-400" : "bg-white/20"
                )}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VectorSummary({
  vectorKey,
  data,
}: {
  vectorKey: string;
  data: unknown;
}) {
  if (!data) return null;
  const d = data as Record<string, unknown>;

  let text = "";
  switch (vectorKey) {
    case "user":
      text = [
        d.skin_type && `${d.skin_type}`,
        d.hydration != null && `H:${d.hydration}%`,
        d.oil_level != null && `O:${d.oil_level}%`,
      ]
        .filter(Boolean)
        .join(" · ");
      break;
    case "environment":
      text = [d.city, d.temp != null && `${d.temp}°C`, d.humidity != null && `${d.humidity}%`]
        .filter(Boolean)
        .join(" · ");
      break;
    case "lifestyle":
      text = [
        d.sleep_hours && `${d.sleep_hours}h sleep`,
        d.stress_level && `stress:${d.stress_level}`,
      ]
        .filter(Boolean)
        .join(" · ");
      break;
    case "tpo":
      text = [d.time, d.place, d.occasion].filter(Boolean).join(" · ");
      break;
    case "theme":
      text = [d.style, d.intensity].filter(Boolean).join(" · ");
      break;
  }

  return (
    <p className="text-[10px] text-white/40 truncate">{text}</p>
  );
}
