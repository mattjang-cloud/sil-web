"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  GLASS_CARD,
  GLASS_CARD_STRONG,
  HUD_LABEL,
  HUD_LABEL_BRIGHT,
  ACCENT_GRADIENT,
  GRADIENT_TEXT,
  GLOW_PURPLE,
} from "@/lib/clinical-theme";
import { HudScanner } from "@/components/clinical/hud-scanner";
import { ClinicalPersonaSelector } from "@/components/clinical/clinical-persona-selector";
import { ClinicalVectorPanel } from "@/components/clinical/clinical-vector-panel";
import { ClinicalChatPanel } from "@/components/clinical/clinical-chat-panel";
import { consult, consultStream, getWeather } from "@/lib/api";
import { useLanguage } from "@/lib/language-context";
import type { PersonaInfo } from "@/lib/api";
import type {
  FiveVectors,
  ChatMessage,
  ConsultationStep,
  ExpertInfo,
  LifestyleVector,
  TPOVector,
  ThemeVector,
  ThemeStyle,
  SkinAnalysis,
} from "@/lib/types";

const INITIAL_EXPERT: ExpertInfo = {
  name: "SIL",
  role: "Clinical AI",
  emoji: "🔬",
  category: "general",
};

export default function ClinicalConsultationPage() {
  const [step, setStep] = useState<ConsultationStep>("welcome");
  const [vectors, setVectors] = useState<FiveVectors>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentExpert, setCurrentExpert] = useState<ExpertInfo>(INITIAL_EXPERT);
  const [selectedPersona, setSelectedPersona] = useState<PersonaInfo | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { language, t } = useLanguage();

  const completedVectors = Object.keys(vectors).filter(
    (k) => vectors[k as keyof FiveVectors] !== undefined
  );

  const handleSendMessage = useCallback(
    async (content: string) => {
      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "user",
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      const history = messages.map((m) => ({ role: m.role, content: m.content }));

      try {
        let fullText = "";
        const assistantMsgId = `msg-${Date.now() + 1}`;

        setMessages((prev) => [
          ...prev,
          {
            id: assistantMsgId,
            role: "assistant",
            content: "",
            timestamp: new Date(),
            expert: currentExpert,
          },
        ]);

        try {
          for await (const chunk of consultStream({
            message: content,
            vectors: vectors as unknown as Record<string, unknown>,
            language,
            history,
            persona_id: selectedPersona?.id || "dr_beauty",
          })) {
            fullText += chunk;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId ? { ...m, content: fullText } : m
              )
            );
          }
          setIsLoading(false);
        } catch {
          setMessages((prev) => prev.filter((m) => m.id !== assistantMsgId));

          const response = await consult({
            message: content,
            vectors: vectors as unknown as Record<string, unknown>,
            language,
            history,
            persona_id: selectedPersona?.id || "dr_beauty",
          });

          if (response.expert) setCurrentExpert(response.expert);

          setMessages((prev) => [
            ...prev,
            {
              id: assistantMsgId,
              role: "assistant",
              content: response.reply,
              timestamp: new Date(),
              expert: response.expert || currentExpert,
            },
          ]);
          setIsLoading(false);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now() + 1}`,
            role: "assistant",
            content: demoResponse(currentExpert, language),
            timestamp: new Date(),
            expert: currentExpert,
          },
        ]);
        setIsLoading(false);
      }
    },
    [vectors, currentExpert, messages, language, selectedPersona]
  );

  const handleVectorUpdate = (key: keyof FiveVectors, value: unknown) => {
    setVectors((prev) => ({ ...prev, [key]: value }));
  };

  const handleSkipToChat = () => setStep("chat");

  // ─── Welcome ───
  if (step === "welcome") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] px-4">
        <div className="max-w-lg text-center">
          <div
            className={cn(
              "w-20 h-20 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-8",
              ACCENT_GRADIENT,
              GLOW_PURPLE,
              "animate-breathe"
            )}
          >
            🔬
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            <span className={GRADIENT_TEXT}>Clinical</span>
            <span className="text-white/90 ml-2">Consultation</span>
          </h1>
          <p className={cn(HUD_LABEL, "mb-4")}>5-VECTOR SKIN INTELLIGENCE</p>
          <p className="text-white/40 text-sm mb-8 leading-relaxed max-w-sm mx-auto">
            {t("welcome_desc")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              className={cn("rounded-full px-8 text-white", ACCENT_GRADIENT)}
              onClick={() => setStep("persona")}
            >
              {t("welcome_start")}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full px-8 border-white/10 text-white/60 hover:text-white hover:bg-white/5"
              onClick={handleSkipToChat}
            >
              {t("welcome_skip")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Chat ───
  if (step === "chat") {
    return (
      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-72 border-r border-white/8 hidden lg:block overflow-hidden bg-[#0f172a]/50">
            <ScrollArea className="h-full">
              <ClinicalVectorPanel vectors={vectors} />
            </ScrollArea>
          </aside>
        )}

        <main className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="h-14 border-b border-white/8 flex items-center justify-between px-4 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-white/60 hover:text-white"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                ☰
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-xl">{currentExpert.emoji}</span>
                <div>
                  <p className="text-sm font-medium text-white/90">{currentExpert.name}</p>
                  <p className={cn(HUD_LABEL, "text-[9px]")}>{currentExpert.role}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {completedVectors.map((v) => (
                <Badge
                  key={v}
                  variant="outline"
                  className="text-[10px] px-2 py-0.5 rounded-full border-white/10 text-white/40"
                >
                  {v.charAt(0).toUpperCase()}
                </Badge>
              ))}
              <Badge className={cn("text-[10px] px-2 py-0.5 rounded-full border-0 text-white", ACCENT_GRADIENT)}>
                {completedVectors.length}/5
              </Badge>
            </div>
          </div>

          <ClinicalChatPanel
            messages={messages}
            isLoading={isLoading}
            onSend={handleSendMessage}
            expert={currentExpert}
            vectors={vectors}
          />
        </main>
      </div>
    );
  }

  // ─── Setup Wizard ───
  return (
    <ClinicalSetupWizard
      step={step}
      vectors={vectors}
      onVectorUpdate={handleVectorUpdate}
      onNext={setStep}
      onSkip={handleSkipToChat}
      selectedPersona={selectedPersona}
      onPersonaSelect={(persona) => {
        setSelectedPersona(persona);
        setCurrentExpert({
          name: persona.name,
          role: persona.subtitle,
          emoji: persona.emoji,
          category: "general",
        });
      }}
    />
  );
}

// ─── Clinical Setup Wizard ───

function ClinicalSetupWizard({
  step,
  vectors,
  onVectorUpdate,
  onNext,
  onSkip,
  selectedPersona,
  onPersonaSelect,
}: {
  step: ConsultationStep;
  vectors: FiveVectors;
  onVectorUpdate: (key: keyof FiveVectors, value: unknown) => void;
  onNext: (step: ConsultationStep) => void;
  onSkip: () => void;
  selectedPersona: PersonaInfo | null;
  onPersonaSelect: (persona: PersonaInfo) => void;
}) {
  const { t, language } = useLanguage();

  const steps: { id: ConsultationStep; label: string; icon: string }[] = [
    { id: "persona", label: "P", icon: "P" },
    { id: "skin_scan", label: "U", icon: "U" },
    { id: "environment", label: "E", icon: "E" },
    { id: "lifestyle", label: "L", icon: "L" },
    { id: "tpo", label: "T", icon: "T" },
    { id: "theme", label: "V", icon: "V" },
  ];

  const currentIndex = steps.findIndex((s) => s.id === step);
  const getNextStep = (): ConsultationStep => {
    if (currentIndex < steps.length - 1) return steps[currentIndex + 1].id;
    return "chat";
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      {/* Progress */}
      <div className="flex items-center justify-center gap-1.5 mb-12">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1.5">
            <div
              className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold transition-all",
                i <= currentIndex
                  ? cn(ACCENT_GRADIENT, "text-white shadow-md")
                  : "bg-white/10 text-white/30"
              )}
            >
              {s.icon}
            </div>
            {i < steps.length - 1 && (
              <div className={cn("w-4 h-0.5", i < currentIndex ? "bg-[#8c2bee]/50" : "bg-white/10")} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className={cn(GLASS_CARD_STRONG, "p-8")}>
        {step === "persona" && (
          <ClinicalPersonaSelector
            onSelect={(persona) => {
              onPersonaSelect(persona);
              onNext(getNextStep());
            }}
            onSkip={() => onNext(getNextStep())}
          />
        )}

        {step === "skin_scan" && (
          <ClinicalSkinScanStep
            onComplete={(data) => onVectorUpdate("user", data)}
            onContinue={() => onNext(getNextStep())}
            onSkip={() => onNext(getNextStep())}
            skinData={vectors.user}
          />
        )}

        {step === "environment" && (
          <ClinicalEnvironmentStep
            onComplete={(data) => {
              onVectorUpdate("environment", data);
              onNext(getNextStep());
            }}
            onSkip={() => onNext(getNextStep())}
          />
        )}

        {step === "lifestyle" && (
          <ClinicalLifestyleStep
            onComplete={(data) => {
              onVectorUpdate("lifestyle", data);
              onNext(getNextStep());
            }}
            onSkip={() => onNext(getNextStep())}
          />
        )}

        {step === "tpo" && (
          <ClinicalTPOStep
            onComplete={(data) => {
              onVectorUpdate("tpo", data);
              onNext(getNextStep());
            }}
            onSkip={() => onNext(getNextStep())}
          />
        )}

        {step === "theme" && (
          <ClinicalThemeStep
            onComplete={(data) => {
              onVectorUpdate("theme", data);
              onNext("chat");
            }}
            onSkip={onSkip}
          />
        )}
      </div>

      <div className="text-center mt-6">
        <button
          onClick={onSkip}
          className="text-[11px] font-mono uppercase tracking-wider text-white/30 hover:text-white/50 transition-colors"
        >
          {t("skip_all")}
        </button>
      </div>
    </div>
  );
}

// ─── Skin Scan Step ───

function ClinicalSkinScanStep({
  onComplete,
  onContinue,
  onSkip,
  skinData,
}: {
  onComplete: (data: unknown) => void;
  onContinue: () => void;
  onSkip: () => void;
  skinData?: SkinAnalysis;
}) {
  const { t } = useLanguage();

  if (skinData) {
    return (
      <div className="text-center">
        <p className={cn(HUD_LABEL, "mb-2")}>SCAN COMPLETE</p>
        <p className="text-xl font-bold text-white/90 mb-4">{t("skin_complete")}</p>
        <Button
          className={cn("rounded-full px-8 text-white", ACCENT_GRADIENT)}
          onClick={onContinue}
        >
          {t("skin_continue")}
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className={cn(HUD_LABEL, "mb-2")}>CLINICAL SKIN SCAN</p>
      <h2 className="text-xl font-bold text-white/90 mb-2">{t("skin_title")}</h2>
      <p className="text-xs text-white/40 mb-6">{t("skin_desc")}</p>
      <HudScanner onAnalysisComplete={onComplete} />
      <div className="mt-6">
        <button
          onClick={onSkip}
          className="text-[11px] font-mono uppercase tracking-wider text-white/30 hover:text-white/50"
        >
          SKIP →
        </button>
      </div>
    </div>
  );
}

// ─── Environment Step ───

function ClinicalEnvironmentStep({
  onComplete,
  onSkip,
}: {
  onComplete: (data: unknown) => void;
  onSkip: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const { language, t } = useLanguage();

  const currentSeason = (() => {
    const m = new Date().getMonth() + 1;
    if (m >= 3 && m <= 5) return "spring";
    if (m >= 6 && m <= 8) return "summer";
    if (m >= 9 && m <= 11) return "fall";
    return "winter";
  })();

  const cities = [
    { id: "la", name: { ko: "LA", en: "LA", ja: "LA" }, group: "US" },
    { id: "nyc", name: { ko: "뉴욕", en: "NYC", ja: "NY" }, group: "US" },
    { id: "sf", name: { ko: "SF", en: "SF", ja: "SF" }, group: "US" },
    { id: "seattle", name: { ko: "시애틀", en: "Seattle", ja: "シアトル" }, group: "US" },
    { id: "chicago", name: { ko: "시카고", en: "Chicago", ja: "シカゴ" }, group: "US" },
    { id: "miami", name: { ko: "마이애미", en: "Miami", ja: "マイアミ" }, group: "US" },
    { id: "houston", name: { ko: "휴스턴", en: "Houston", ja: "ヒューストン" }, group: "US" },
    { id: "dallas", name: { ko: "달라스", en: "Dallas", ja: "ダラス" }, group: "US" },
    { id: "toronto", name: { ko: "토론토", en: "Toronto", ja: "トロント" }, group: "CA" },
    { id: "vancouver", name: { ko: "밴쿠버", en: "Vancouver", ja: "バンクーバー" }, group: "CA" },
    { id: "montreal", name: { ko: "몬트리올", en: "Montreal", ja: "モントリオール" }, group: "CA" },
    { id: "calgary", name: { ko: "캘거리", en: "Calgary", ja: "カルガリー" }, group: "CA" },
    { id: "tokyo", name: { ko: "도쿄", en: "Tokyo", ja: "東京" }, group: "JP" },
    { id: "osaka", name: { ko: "오사카", en: "Osaka", ja: "大阪" }, group: "JP" },
    { id: "kyoto", name: { ko: "교토", en: "Kyoto", ja: "京都" }, group: "JP" },
    { id: "fukuoka", name: { ko: "후쿠오카", en: "Fukuoka", ja: "福岡" }, group: "JP" },
  ];

  const seasons = [
    { id: "spring", label: "🌸 SPR" },
    { id: "summer", label: "☀️ SUM" },
    { id: "fall", label: "🍂 FAL" },
    { id: "winter", label: "❄️ WIN" },
  ];

  const detectLocation = async () => {
    setLoading(true);
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
      );
      const data = await getWeather(pos.coords.latitude, pos.coords.longitude);
      onComplete(data);
    } catch {
      try {
        const data = await getWeather();
        onComplete(data);
      } catch {
        onComplete({ temp: 22, humidity: 45, uvi: 6, description: "Partly cloudy", city: "LA", aqi: 75 });
      }
    }
    setLoading(false);
  };

  const selectCity = async (cityId: string) => {
    setLoading(true);
    try {
      const data = await getWeather(undefined, undefined, cityId, selectedSeason || currentSeason);
      onComplete(data);
    } catch {
      onComplete({ temp: 22, humidity: 45, uvi: 6, description: "Partly cloudy", city: cityId, aqi: 75 });
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="text-center mb-6">
        <p className={cn(HUD_LABEL, "mb-2")}>ENVIRONMENT VECTOR</p>
        <h2 className="text-xl font-bold text-white/90 mb-1">{t("env_title")}</h2>
        <p className="text-xs text-white/40">{t("env_desc")}</p>
      </div>

      <Button
        className={cn("w-full rounded-full px-6 mb-6 text-white", ACCENT_GRADIENT)}
        onClick={detectLocation}
        disabled={loading}
      >
        {loading ? "DETECTING..." : `📍 ${t("env_detect")}`}
      </Button>

      <p className={cn(HUD_LABEL, "text-center mb-3")}>{t("env_or_select")}</p>

      {(["US", "CA", "JP"] as const).map((group) => (
        <div key={group} className="mb-3">
          <p className={cn(HUD_LABEL, "mb-1.5 px-1 text-white/25")}>
            {group === "US" ? "USA" : group === "CA" ? "CANADA" : "JAPAN"}
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {cities.filter((c) => c.group === group).map((city) => (
              <Button
                key={city.id}
                variant="outline"
                size="sm"
                className="rounded-full text-[10px] font-mono px-2 h-7 border-white/10 text-white/50 hover:text-white hover:bg-white/8"
                onClick={() => selectCity(city.id)}
                disabled={loading}
              >
                {city.name[language]}
              </Button>
            ))}
          </div>
        </div>
      ))}

      <p className={cn(HUD_LABEL, "text-center mb-3 mt-4")}>SEASON</p>
      <div className="grid grid-cols-4 gap-2">
        {seasons.map((s) => (
          <Button
            key={s.id}
            variant={(selectedSeason || currentSeason) === s.id ? "default" : "outline"}
            size="sm"
            className={cn(
              "rounded-full text-[10px] font-mono",
              (selectedSeason || currentSeason) === s.id
                ? cn(ACCENT_GRADIENT, "text-white border-0")
                : "border-white/10 text-white/40 hover:text-white hover:bg-white/8"
            )}
            onClick={() => setSelectedSeason(s.id)}
          >
            {s.label}
          </Button>
        ))}
      </div>

      <div className="text-center mt-6">
        <button
          onClick={onSkip}
          className="text-[11px] font-mono uppercase tracking-wider text-white/30 hover:text-white/50"
        >
          SKIP →
        </button>
      </div>
    </div>
  );
}

// ─── Lifestyle Step ───

function ClinicalLifestyleStep({
  onComplete,
  onSkip,
}: {
  onComplete: (data: LifestyleVector) => void;
  onSkip: () => void;
}) {
  const { t } = useLanguage();
  const [lifestyle, setLifestyle] = useState<LifestyleVector>({
    sleep_hours: 7,
    stress_level: "medium",
    water_intake: 6,
    exercise_freq: "light",
    diet_quality: "average",
  });

  return (
    <div>
      <div className="text-center mb-6">
        <p className={cn(HUD_LABEL, "mb-2")}>LIFESTYLE VECTOR</p>
        <h2 className="text-xl font-bold text-white/90 mb-1">{t("life_title")}</h2>
        <p className="text-xs text-white/40">{t("life_desc")}</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className={cn(HUD_LABEL_BRIGHT, "mb-2 block")}>
            SLEEP: {lifestyle.sleep_hours}H
          </label>
          <input
            type="range"
            min={3}
            max={12}
            value={lifestyle.sleep_hours}
            onChange={(e) => setLifestyle((p) => ({ ...p, sleep_hours: Number(e.target.value) }))}
            className="w-full accent-[#8c2bee]"
          />
        </div>

        <div>
          <label className={cn(HUD_LABEL_BRIGHT, "mb-2 block")}>STRESS</label>
          <div className="flex gap-2">
            {(["low", "medium", "high"] as const).map((level) => (
              <Button
                key={level}
                variant="outline"
                size="sm"
                className={cn(
                  "flex-1 rounded-full font-mono text-[10px] uppercase",
                  lifestyle.stress_level === level
                    ? cn(ACCENT_GRADIENT, "text-white border-0")
                    : "border-white/10 text-white/40 hover:text-white hover:bg-white/8"
                )}
                onClick={() => setLifestyle((p) => ({ ...p, stress_level: level }))}
              >
                {t(level)}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <label className={cn(HUD_LABEL_BRIGHT, "mb-2 block")}>EXERCISE</label>
          <div className="flex gap-2">
            {(["none", "light", "moderate", "active"] as const).map((freq) => (
              <Button
                key={freq}
                variant="outline"
                size="sm"
                className={cn(
                  "flex-1 rounded-full font-mono text-[10px] uppercase",
                  lifestyle.exercise_freq === freq
                    ? cn(ACCENT_GRADIENT, "text-white border-0")
                    : "border-white/10 text-white/40 hover:text-white hover:bg-white/8"
                )}
                onClick={() => setLifestyle((p) => ({ ...p, exercise_freq: freq }))}
              >
                {t(freq)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button onClick={onSkip} className="text-[11px] font-mono uppercase text-white/30 hover:text-white/50">
          SKIP
        </button>
        <Button
          className={cn("rounded-full px-6 text-white", ACCENT_GRADIENT)}
          onClick={() => onComplete(lifestyle)}
        >
          CONTINUE →
        </Button>
      </div>
    </div>
  );
}

// ─── TPO Step ───

function ClinicalTPOStep({
  onComplete,
  onSkip,
}: {
  onComplete: (data: TPOVector) => void;
  onSkip: () => void;
}) {
  const { t } = useLanguage();
  const [tpo, setTPO] = useState<TPOVector>({
    time: "morning",
    place: "office",
    occasion: "daily",
  });

  const timeOpts = [
    { v: "morning", l: "🌅 AM" },
    { v: "afternoon", l: "☀️ PM" },
    { v: "evening", l: "🌆 EVE" },
    { v: "night", l: "🌙 NGT" },
  ] as const;

  const placeOpts = [
    { v: "office", l: "🏢" },
    { v: "outdoor", l: "🌳" },
    { v: "home", l: "🏠" },
    { v: "gym", l: "💪" },
    { v: "travel", l: "✈️" },
  ] as const;

  const occasionOpts = [
    { v: "daily", l: "📅" },
    { v: "date", l: "💕" },
    { v: "meeting", l: "💼" },
    { v: "workout", l: "🏃" },
    { v: "special", l: "🎉" },
  ] as const;

  const OptionBtn = ({
    active,
    label,
    onClick,
  }: {
    active: boolean;
    label: string;
    onClick: () => void;
  }) => (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "rounded-full text-xs font-mono",
        active
          ? cn(ACCENT_GRADIENT, "text-white border-0")
          : "border-white/10 text-white/40 hover:text-white hover:bg-white/8"
      )}
      onClick={onClick}
    >
      {label}
    </Button>
  );

  return (
    <div>
      <div className="text-center mb-6">
        <p className={cn(HUD_LABEL, "mb-2")}>TPO VECTOR</p>
        <h2 className="text-xl font-bold text-white/90 mb-1">{t("tpo_title")}</h2>
        <p className="text-xs text-white/40">{t("tpo_desc")}</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className={cn(HUD_LABEL_BRIGHT, "mb-2 block")}>TIME</label>
          <div className="grid grid-cols-4 gap-2">
            {timeOpts.map((o) => (
              <OptionBtn key={o.v} active={tpo.time === o.v} label={o.l} onClick={() => setTPO((p) => ({ ...p, time: o.v }))} />
            ))}
          </div>
        </div>
        <div>
          <label className={cn(HUD_LABEL_BRIGHT, "mb-2 block")}>PLACE</label>
          <div className="grid grid-cols-5 gap-2">
            {placeOpts.map((o) => (
              <OptionBtn key={o.v} active={tpo.place === o.v} label={o.l} onClick={() => setTPO((p) => ({ ...p, place: o.v }))} />
            ))}
          </div>
        </div>
        <div>
          <label className={cn(HUD_LABEL_BRIGHT, "mb-2 block")}>OCCASION</label>
          <div className="grid grid-cols-5 gap-2">
            {occasionOpts.map((o) => (
              <OptionBtn key={o.v} active={tpo.occasion === o.v} label={o.l} onClick={() => setTPO((p) => ({ ...p, occasion: o.v }))} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button onClick={onSkip} className="text-[11px] font-mono uppercase text-white/30 hover:text-white/50">
          SKIP
        </button>
        <Button
          className={cn("rounded-full px-6 text-white", ACCENT_GRADIENT)}
          onClick={() => onComplete(tpo)}
        >
          CONTINUE →
        </Button>
      </div>
    </div>
  );
}

// ─── Theme Step ───

function ClinicalThemeStep({
  onComplete,
  onSkip,
}: {
  onComplete: (data: ThemeVector) => void;
  onSkip: () => void;
}) {
  const { t } = useLanguage();
  const [theme, setTheme] = useState<ThemeVector>({
    style: "glass_skin",
    finish: "dewy",
    intensity: "moderate",
  });

  const styles: { value: ThemeStyle; label: string; desc: string }[] = [
    { value: "glass_skin", label: "💎 Glass Skin", desc: "Luminous glow" },
    { value: "clean_girl", label: "🧼 Clean Girl", desc: "Effortless" },
    { value: "k_idol", label: "⭐ K-Idol", desc: "Camera-ready" },
    { value: "natural", label: "🌸 Natural", desc: "No-makeup look" },
    { value: "dewy", label: "💧 Dewy", desc: "Fresh & hydrated" },
    { value: "matte", label: "🪨 Matte", desc: "Shine-free" },
    { value: "minimalist", label: "⚡ Minimalist", desc: "Essentials only" },
  ];

  return (
    <div>
      <div className="text-center mb-6">
        <p className={cn(HUD_LABEL, "mb-2")}>THEME VECTOR</p>
        <h2 className="text-xl font-bold text-white/90 mb-1">{t("theme_title")}</h2>
        <p className="text-xs text-white/40">{t("theme_desc")}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {styles.map((s) => (
          <button
            key={s.value}
            onClick={() => setTheme((p) => ({ ...p, style: s.value }))}
            className={cn(
              GLASS_CARD,
              "p-3 text-left transition-all",
              theme.style === s.value
                ? "ring-2 ring-[#8c2bee] bg-white/8"
                : "hover:bg-white/6"
            )}
          >
            <div className="text-sm font-medium text-white/80">{s.label}</div>
            <div className="text-[10px] text-white/30 mt-0.5">{s.desc}</div>
          </button>
        ))}
      </div>

      <div className="mt-5">
        <label className={cn(HUD_LABEL_BRIGHT, "mb-2 block")}>INTENSITY</label>
        <div className="flex gap-2">
          {(["subtle", "moderate", "bold"] as const).map((level) => (
            <Button
              key={level}
              variant="outline"
              size="sm"
              className={cn(
                "flex-1 rounded-full font-mono text-[10px] uppercase",
                theme.intensity === level
                  ? cn(ACCENT_GRADIENT, "text-white border-0")
                  : "border-white/10 text-white/40 hover:text-white hover:bg-white/8"
              )}
              onClick={() => setTheme((p) => ({ ...p, intensity: level }))}
            >
              {t(level)}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button onClick={onSkip} className="text-[11px] font-mono uppercase text-white/30 hover:text-white/50">
          SKIP
        </button>
        <Button
          className={cn("rounded-full px-6 text-white", ACCENT_GRADIENT)}
          onClick={() => onComplete(theme)}
        >
          {t("theme_start")}
        </Button>
      </div>
    </div>
  );
}

// ─── Demo Response ───

function demoResponse(expert: ExpertInfo, lang: string): string {
  if (lang === "ko") {
    return `안녕하세요! **${expert.name}**이에요. 현재 SIL 백엔드에 연결할 수 없어서 데모 응답을 보여드리고 있어요.\n\n실제 버전에서는 5-Vector 분석 결과를 기반으로 맞춤형 K-뷰티 상담을 제공합니다. 🌸`;
  }
  if (lang === "ja") {
    return `こんにちは！**${expert.name}**です。現在SILバックエンドに接続できないため、デモ応答を表示しています。\n\n実際のバージョンでは、5-Vector分析に基づくパーソナライズされたK-ビューティー相談を提供します。🌸`;
  }
  return `Hi! I'm **${expert.name}**. Currently unable to connect to the SIL backend, so showing a demo response.\n\nIn the full version, this provides personalized K-Beauty consultation based on your 5-Vector analysis. 🌸`;
}
