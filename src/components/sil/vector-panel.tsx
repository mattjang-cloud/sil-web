"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { FiveVectors } from "@/lib/types";

const VECTOR_META = [
  {
    key: "user" as const,
    icon: "U",
    label: "User",
    gradient: "from-sil-rose to-pink-400",
  },
  {
    key: "environment" as const,
    icon: "E",
    label: "Env",
    gradient: "from-sil-sky to-blue-400",
  },
  {
    key: "lifestyle" as const,
    icon: "L",
    label: "Life",
    gradient: "from-sil-mint to-emerald-400",
  },
  {
    key: "tpo" as const,
    icon: "T",
    label: "TPO",
    gradient: "from-sil-gold to-amber-400",
  },
  {
    key: "theme" as const,
    icon: "V",
    label: "Theme",
    gradient: "from-sil-lavender to-violet-400",
  },
];

interface VectorPanelProps {
  vectors: FiveVectors;
  onUpdate: (key: keyof FiveVectors, value: unknown) => void;
  completedVectors: string[];
}

export function VectorPanel({
  vectors,
  onUpdate,
  completedVectors,
}: VectorPanelProps) {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-semibold gradient-text">5-Vector Status</span>
        <Badge className="text-[10px] rounded-full bg-primary/10 text-primary border-0">
          {completedVectors.length}/5
        </Badge>
      </div>

      {VECTOR_META.map((meta) => {
        const isActive = completedVectors.includes(meta.key);
        const data = vectors[meta.key];

        return (
          <Card
            key={meta.key}
            className={`rounded-xl transition-all duration-200 ${
              isActive
                ? "glass-card border-primary/10"
                : "bg-muted/30 border-transparent opacity-60"
            }`}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className={`w-6 h-6 rounded-md bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-white text-[10px] font-bold`}
                >
                  {meta.icon}
                </div>
                <span className="text-xs font-medium">{meta.label} Vector</span>
                {isActive && (
                  <Badge className="ml-auto text-[9px] rounded-full bg-green-500/10 text-green-400 border-0 px-1.5">
                    ✓
                  </Badge>
                )}
              </div>

              {isActive && data && (
                <div className="mt-1.5">
                  <VectorSummary vectorKey={meta.key} data={data} />
                </div>
              )}

              {!isActive && (
                <p className="text-[10px] text-muted-foreground">Not configured</p>
              )}
            </CardContent>
          </Card>
        );
      })}

      <Separator className="my-3" />

      {/* Cross-vector insights */}
      {completedVectors.length >= 2 && (
        <Card className="glass-card rounded-xl border-sil-lavender/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold">🔗 Cross-Vector Insights</span>
            </div>
            <div className="space-y-1.5">
              {vectors.environment && vectors.lifestyle && (
                <p className="text-[10px] text-muted-foreground">
                  • UV {vectors.environment.uvi}+ with {vectors.lifestyle.stress_level}{" "}
                  stress → extra antioxidant protection recommended
                </p>
              )}
              {vectors.tpo && vectors.theme && (
                <p className="text-[10px] text-muted-foreground">
                  • {vectors.tpo.time} {vectors.tpo.occasion} + {vectors.theme.style}{" "}
                  → optimized routine selected
                </p>
              )}
              {vectors.user && (
                <p className="text-[10px] text-muted-foreground">
                  • Skin scan active → personalized ingredient matching enabled
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
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
  const d = data as Record<string, unknown>;

  switch (vectorKey) {
    case "user":
      return (
        <div className="flex flex-wrap gap-1">
          {((d.issues as string[]) || []).slice(0, 3).map((issue: string) => (
            <Badge
              key={issue}
              variant="outline"
              className="text-[9px] px-1.5 py-0 rounded-full"
            >
              {issue}
            </Badge>
          ))}
          {d.hydration != null && (
            <Badge className="text-[9px] px-1.5 py-0 rounded-full bg-blue-500/10 text-blue-400 border-0">
              💧 {String(d.hydration)}%
            </Badge>
          )}
        </div>
      );
    case "environment":
      return (
        <div className="flex gap-2 text-[10px] text-muted-foreground">
          <span>🌡 {String(d.temp)}°</span>
          <span>💧 {String(d.humidity)}%</span>
          <span>☀️ UV {String(d.uvi)}</span>
          {d.aqi != null && <span>🌫 AQI {String(d.aqi)}</span>}
        </div>
      );
    case "lifestyle":
      return (
        <div className="flex gap-2 text-[10px] text-muted-foreground">
          <span>😴 {String(d.sleep_hours)}h</span>
          <span>😰 {String(d.stress_level)}</span>
          <span>🏃 {String(d.exercise_freq)}</span>
        </div>
      );
    case "tpo":
      return (
        <div className="flex gap-2 text-[10px] text-muted-foreground">
          <span>⏰ {String(d.time)}</span>
          <span>📍 {String(d.place)}</span>
          <span>🎯 {String(d.occasion)}</span>
        </div>
      );
    case "theme":
      return (
        <div className="flex gap-2 text-[10px] text-muted-foreground">
          <span>🎨 {String(d.style)}</span>
          <span>✦ {String(d.intensity)}</span>
        </div>
      );
    default:
      return null;
  }
}
