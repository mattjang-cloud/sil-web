"use client";

import { cn } from "@/lib/utils";
import { HUD_LABEL_BRIGHT } from "@/lib/clinical-theme";

interface ScanBadgeProps {
  label?: string;
  active?: boolean;
  className?: string;
}

export function ScanBadge({
  label = "CLINICAL SCAN ACTIVE",
  active = true,
  className,
}: ScanBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
        "bg-white/5 backdrop-blur-[12px] border border-white/10",
        className
      )}
    >
      {/* Pulse dot */}
      <div className="relative">
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            active ? "bg-emerald-400" : "bg-white/30"
          )}
        />
        {active && (
          <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        )}
      </div>
      <span className={HUD_LABEL_BRIGHT}>{label}</span>
    </div>
  );
}
