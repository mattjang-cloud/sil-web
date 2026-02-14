"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  GLASS_CARD,
  HUD_LABEL,
  ACCENT_GRADIENT,
  GRADIENT_TEXT,
  GLOW_PURPLE,
} from "@/lib/clinical-theme";
import { useLanguage } from "@/lib/language-context";

export default function ClinicalHomePage() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-4 py-12">
      {/* Hero Icon */}
      <div
        className={cn(
          "w-24 h-24 rounded-3xl flex items-center justify-center mb-8",
          ACCENT_GRADIENT,
          GLOW_PURPLE,
          "animate-breathe"
        )}
      >
        <span className="text-4xl">🔬</span>
      </div>

      {/* Title */}
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3 text-center">
        <span className={GRADIENT_TEXT}>SIL</span>
        <span className="text-white/90 ml-2">Clinical</span>
      </h1>

      {/* Subtitle */}
      <p className={cn(HUD_LABEL, "mb-6")}>SKIN INTELLIGENCE LOGIC</p>

      <p className="text-white/50 text-sm max-w-md text-center mb-10 leading-relaxed">
        {t("welcome_desc")}
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
        <Link
          href="/clinical/consultation"
          className={cn(
            "inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-medium text-white",
            ACCENT_GRADIENT,
            GLOW_PURPLE,
            "hover:opacity-90 transition-opacity"
          )}
        >
          INITIALIZE CONSULTATION
        </Link>
        <Link
          href="/clinical/mirror"
          className={cn(
            GLASS_CARD,
            "inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-medium text-white/80",
            "hover:bg-white/8 transition-colors"
          )}
        >
          CLINICAL MIRROR
        </Link>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full">
        <FeatureCard
          icon="📸"
          title="HUD Scanner"
          desc="AI-powered clinical skin scan with real-time HUD overlay"
          delay={0}
        />
        <FeatureCard
          icon="🧬"
          title="5-Vector Engine"
          desc="Personalized analysis across skin, environment, lifestyle, TPO, theme"
          delay={100}
        />
        <FeatureCard
          icon="💬"
          title="Expert AI"
          desc="Consult with 5 K-Beauty expert personas powered by Claude"
          delay={200}
        />
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
  delay,
}: {
  icon: string;
  title: string;
  desc: string;
  delay: number;
}) {
  return (
    <div
      className={cn(
        GLASS_CARD,
        "p-5 text-center animate-fade-in-up"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-sm font-semibold text-white/90 mb-1.5">{title}</h3>
      <p className="text-[11px] text-white/40 leading-relaxed">{desc}</p>
    </div>
  );
}
