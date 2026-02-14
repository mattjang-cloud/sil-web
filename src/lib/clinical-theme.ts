/**
 * SIL Clinical HUD — Design Tokens & Helper Constants
 *
 * Cyber-Clinical aesthetic: #8c2bee Purple, #f906f9 Magenta, #0f172a Deep Navy
 * Glassmorphism + HUD overlay style
 */

// ─── Color Tokens ───

export const CLINICAL_COLORS = {
  primary: "#8c2bee",
  accent: "#f906f9",
  background: "#0f172a",
  surface: "rgba(15,23,42,0.7)",
  surfaceLight: "rgba(15,23,42,0.4)",
  border: "rgba(255,255,255,0.12)",
  borderHover: "rgba(255,255,255,0.2)",
  text: "rgba(255,255,255,0.9)",
  textMuted: "rgba(255,255,255,0.5)",
  textDim: "rgba(255,255,255,0.3)",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
} as const;

// ─── Tailwind Helper Classes ───

/** Glass card with backdrop blur */
export const GLASS_CARD =
  "bg-white/5 backdrop-blur-[16px] border border-white/10 rounded-2xl";

/** Stronger glass card */
export const GLASS_CARD_STRONG =
  "bg-white/8 backdrop-blur-[20px] border border-white/12 rounded-2xl";

/** HUD monospace label */
export const HUD_LABEL =
  "font-mono text-[10px] uppercase tracking-[0.15em] text-white/50";

/** HUD monospace label — brighter */
export const HUD_LABEL_BRIGHT =
  "font-mono text-[10px] uppercase tracking-[0.15em] text-white/70";

/** Primary → Accent gradient */
export const ACCENT_GRADIENT =
  "bg-gradient-to-r from-[#8c2bee] to-[#f906f9]";

/** Gradient text */
export const GRADIENT_TEXT =
  "bg-gradient-to-r from-[#8c2bee] to-[#f906f9] bg-clip-text text-transparent";

/** Gradient border glow */
export const GLOW_PURPLE =
  "shadow-[0_0_30px_rgba(140,43,238,0.2),0_0_60px_rgba(140,43,238,0.1)]";

/** Accent glow */
export const GLOW_ACCENT =
  "shadow-[0_0_30px_rgba(249,6,249,0.2),0_0_60px_rgba(249,6,249,0.1)]";

/** Clinical background grid pattern (inline style helper) */
export const GRID_PATTERN_STYLE: React.CSSProperties = {
  backgroundImage: `
    linear-gradient(rgba(140,43,238,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(140,43,238,0.03) 1px, transparent 1px)
  `,
  backgroundSize: "42px 42px",
};

/** Edge glow gradient */
export const EDGE_GLOW_STYLE: React.CSSProperties = {
  background: `
    radial-gradient(ellipse at top, rgba(140,43,238,0.08) 0%, transparent 60%),
    radial-gradient(ellipse at bottom right, rgba(249,6,249,0.05) 0%, transparent 60%)
  `,
};

// ─── Metric Levels ───

export function getMetricLevel(value: number): {
  label: string;
  color: string;
  textColor: string;
} {
  if (value >= 80) return { label: "Excellent", color: "#10b981", textColor: "text-emerald-400" };
  if (value >= 60) return { label: "Good", color: "#8c2bee", textColor: "text-purple-400" };
  if (value >= 40) return { label: "Fair", color: "#f59e0b", textColor: "text-amber-400" };
  return { label: "Low", color: "#ef4444", textColor: "text-red-400" };
}

export function getSeverityColor(severity: number): string {
  if (severity >= 0.7) return "text-red-400 border-red-500/30 bg-red-500/10";
  if (severity >= 0.4) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
  return "text-purple-300 border-purple-500/30 bg-purple-500/10";
}
