"use client";

import { cn } from "@/lib/utils";
import { GRID_PATTERN_STYLE, EDGE_GLOW_STYLE } from "@/lib/clinical-theme";

interface ClinicalShellProps {
  children: React.ReactNode;
  className?: string;
  /** Show the grid background pattern */
  showGrid?: boolean;
  /** Show edge glow effects */
  showGlow?: boolean;
  /** Full viewport height (default true) */
  fullHeight?: boolean;
}

export function ClinicalShell({
  children,
  className,
  showGrid = true,
  showGlow = true,
  fullHeight = true,
}: ClinicalShellProps) {
  return (
    <div
      className={cn(
        "relative bg-[#0f172a] text-white",
        fullHeight && "min-h-screen",
        className
      )}
    >
      {/* Grid pattern layer */}
      {showGrid && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={GRID_PATTERN_STYLE}
        />
      )}

      {/* Edge glow layer */}
      {showGlow && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={EDGE_GLOW_STYLE}
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
