"use client";

import { cn } from "@/lib/utils";
import { GLASS_CARD, HUD_LABEL, getMetricLevel } from "@/lib/clinical-theme";
import { HudProgressRing } from "./hud-progress-ring";

interface HudMetricCardProps {
  label: string;
  value: number;
  unit?: string;
  className?: string;
  delay?: number;
  showRing?: boolean;
}

export function HudMetricCard({
  label,
  value,
  unit = "%",
  className,
  delay = 0,
  showRing = true,
}: HudMetricCardProps) {
  const level = getMetricLevel(value);

  return (
    <div
      className={cn(
        GLASS_CARD,
        "p-4 flex flex-col items-center gap-3 animate-fade-in-up",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* HUD Label */}
      <span className={HUD_LABEL}>{label}</span>

      {/* Ring + Value */}
      {showRing ? (
        <div className="relative w-16 h-16">
          <HudProgressRing value={value} size={64} strokeWidth={4} color={level.color} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-white/90">
              {value}
              <span className="text-[10px] text-white/40">{unit}</span>
            </span>
          </div>
        </div>
      ) : (
        <span className="text-2xl font-bold text-white/90">
          {value}
          <span className="text-sm text-white/40">{unit}</span>
        </span>
      )}

      {/* Level badge */}
      <span
        className={cn(
          "text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full",
          "border",
          level.textColor,
          `border-current/20`
        )}
        style={{ borderColor: `${level.color}33` }}
      >
        {level.label}
      </span>
    </div>
  );
}

/** Simple text metric (no ring) */
export function HudMetricText({
  label,
  value,
  className,
  delay = 0,
}: {
  label: string;
  value: string;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={cn(
        GLASS_CARD,
        "p-4 flex flex-col items-center gap-2 animate-fade-in-up",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className={HUD_LABEL}>{label}</span>
      <span className="text-sm font-medium text-white/80 capitalize">{value}</span>
    </div>
  );
}
