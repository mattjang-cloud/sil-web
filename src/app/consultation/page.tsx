"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VectorPanel } from "@/components/sil/vector-panel";
import { ChatPanel } from "@/components/sil/chat-panel";
import { SkinScanner } from "@/components/sil/skin-scanner";
import { PersonaSelector } from "@/components/sil/persona-selector";
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
  role: "AI Consultation Guide",
  emoji: "✨",
  category: "general",
};

export default function ConsultationPage() {
  const [step, setStep] = useState<ConsultationStep>("welcome");
  const [vectors, setVectors] = useState<FiveVectors>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentExpert, setCurrentExpert] = useState<ExpertInfo>(INITIAL_EXPERT);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedPersona, setSelectedPersona] = useState<PersonaInfo | null>(null);
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

      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

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

          if (response.expert) {
            setCurrentExpert(response.expert);
          }

          const expertResponse: ChatMessage = {
            id: assistantMsgId,
            role: "assistant",
            content: response.reply,
            timestamp: new Date(),
            expert: response.expert || currentExpert,
          };
          setMessages((prev) => [...prev, expertResponse]);
          setIsLoading(false);
        }
      } catch {
        const expertResponse: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: "assistant",
          content: generateDemoResponse(content, vectors, currentExpert, language),
          timestamp: new Date(),
          expert: currentExpert,
        };
        setMessages((prev) => [...prev, expertResponse]);
        setIsLoading(false);
      }
    },
    [vectors, currentExpert, messages, language, selectedPersona]
  );

  const handleSkipToChat = () => {
    setStep("chat");
  };

  const handleVectorUpdate = (key: keyof FiveVectors, value: unknown) => {
    setVectors((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen pt-16">
      {step === "welcome" ? (
        <WelcomeScreen
          onStart={() => setStep("persona")}
          onSkip={handleSkipToChat}
        />
      ) : step === "chat" ? (
        <div className="flex h-[calc(100vh-4rem)]">
          {sidebarOpen && (
            <aside className="w-80 border-r border-border/50 bg-card/50 hidden lg:block overflow-hidden">
              <ScrollArea className="h-full">
                <VectorPanel
                  vectors={vectors}
                  onUpdate={handleVectorUpdate}
                  completedVectors={completedVectors}
                />
              </ScrollArea>
            </aside>
          )}

          <main className="flex-1 flex flex-col">
            <div className="h-14 border-b border-border/50 flex items-center justify-between px-4 bg-card/30">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <span className="text-lg">☰</span>
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{currentExpert.emoji}</span>
                  <div>
                    <p className="text-sm font-medium">{currentExpert.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {currentExpert.role}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {completedVectors.map((v) => (
                  <Badge
                    key={v}
                    variant="outline"
                    className="text-[10px] px-2 py-0.5 rounded-full"
                  >
                    {v.charAt(0).toUpperCase()}
                  </Badge>
                ))}
                <Badge className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border-0">
                  {t("chat_vectors_badge").replace("{n}", String(completedVectors.length))}
                </Badge>
              </div>
            </div>

            <ChatPanel
              messages={messages}
              isLoading={isLoading}
              onSend={handleSendMessage}
              expert={currentExpert}
              vectors={vectors}
            />
          </main>
        </div>
      ) : (
        <SetupWizard
          step={step}
          vectors={vectors}
          onVectorUpdate={handleVectorUpdate}
          onNext={(nextStep) => setStep(nextStep)}
          onSkip={handleSkipToChat}
          selectedPersona={selectedPersona}
          onPersonaSelect={(persona) => {
            setSelectedPersona(persona);
            setCurrentExpert({
              name: persona.name,
              role: persona.subtitle,
              emoji: persona.emoji,
              category: "general",
              persona_id: persona.id,
            } as ExpertInfo);
          }}
        />
      )}
    </div>
  );
}

// ─── Welcome Screen ───

function WelcomeScreen({
  onStart,
  onSkip,
}: {
  onStart: () => void;
  onSkip: () => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <div className="max-w-lg text-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-sil-lavender via-sil-rose to-sil-gold flex items-center justify-center text-white text-3xl mx-auto mb-8 glow-purple animate-float">
          ✨
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-4">
          {t("welcome_title")}
        </h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          {t("welcome_desc")}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            size="lg"
            className="rounded-full px-8 bg-gradient-to-r from-sil-lavender to-sil-rose text-white border-0 hover:opacity-90 w-full sm:w-auto"
            onClick={onStart}
          >
            {t("welcome_start")}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="rounded-full px-8 border-border/50 w-full sm:w-auto"
            onClick={onSkip}
          >
            {t("welcome_skip")}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Setup Wizard ───

function SetupWizard({
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
  const { t } = useLanguage();

  const steps: {
    id: ConsultationStep;
    label: string;
    icon: string;
    gradient: string;
  }[] = [
    { id: "persona", label: t("step_persona"), icon: "P", gradient: "from-sil-lavender to-violet-400" },
    { id: "skin_scan", label: t("step_skin_scan"), icon: "U", gradient: "from-sil-rose to-pink-400" },
    { id: "environment", label: t("step_environment"), icon: "E", gradient: "from-sil-sky to-blue-400" },
    { id: "lifestyle", label: t("step_lifestyle"), icon: "L", gradient: "from-sil-mint to-emerald-400" },
    { id: "tpo", label: t("step_tpo"), icon: "T", gradient: "from-sil-gold to-amber-400" },
    { id: "theme", label: t("step_theme"), icon: "V", gradient: "from-sil-lavender to-violet-400" },
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
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                i <= currentIndex
                  ? `bg-gradient-to-br ${s.gradient} text-white shadow-md`
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {s.icon}
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-4 h-0.5 ${
                  i < currentIndex ? "bg-primary/40" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="glass-card rounded-2xl overflow-hidden">
        <CardContent className="p-8">
          {step === "persona" && (
            <PersonaSelector
              onSelect={(persona) => {
                onPersonaSelect(persona);
                onNext(getNextStep());
              }}
              onSkip={() => onNext(getNextStep())}
            />
          )}
          {step === "skin_scan" && (
            <SkinScanStep
              onComplete={(data) => {
                onVectorUpdate("user", data);
                // Don't auto-advance — show results card
              }}
              onContinue={() => onNext(getNextStep())}
              onSkip={() => onNext(getNextStep())}
              skinData={vectors.user}
            />
          )}
          {step === "environment" && (
            <EnvironmentStep
              onComplete={(data) => {
                onVectorUpdate("environment", data);
                onNext(getNextStep());
              }}
              onSkip={() => onNext(getNextStep())}
            />
          )}
          {step === "lifestyle" && (
            <LifestyleStep
              onComplete={(data) => {
                onVectorUpdate("lifestyle", data);
                onNext(getNextStep());
              }}
              onSkip={() => onNext(getNextStep())}
            />
          )}
          {step === "tpo" && (
            <TPOStep
              onComplete={(data) => {
                onVectorUpdate("tpo", data);
                onNext(getNextStep());
              }}
              onSkip={() => onNext(getNextStep())}
            />
          )}
          {step === "theme" && (
            <ThemeStep
              onComplete={(data) => {
                onVectorUpdate("theme", data);
                onNext("chat");
              }}
              onSkip={onSkip}
            />
          )}
        </CardContent>
      </Card>

      <div className="text-center mt-6">
        <Button
          variant="link"
          className="text-xs text-muted-foreground"
          onClick={onSkip}
        >
          {t("skip_all")}
        </Button>
      </div>
    </div>
  );
}

// ─── Skin Scan Step with Results Card ───

function SkinScanStep({
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

  // If analysis done, show results card
  if (skinData) {
    return (
      <div>
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">✅</div>
          <h2 className="text-2xl font-bold mb-1">{t("skin_complete")}</h2>
        </div>

        {/* Skin Type */}
        {skinData.skin_type && (
          <div className="text-center mb-4">
            <Badge className="text-sm px-4 py-1.5 rounded-full bg-gradient-to-r from-sil-lavender to-sil-rose text-white border-0">
              {t("skin_type")}: {skinData.skin_type}
            </Badge>
          </div>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <MetricCard
            label={t("skin_hydration")}
            value={skinData.hydration != null ? `${skinData.hydration}%` : "N/A"}
            color="text-blue-400"
          />
          <MetricCard
            label={t("skin_oil")}
            value={skinData.oil_level != null ? `${skinData.oil_level}%` : "N/A"}
            color="text-amber-400"
          />
          <MetricCard
            label={t("skin_texture")}
            value={skinData.texture || "N/A"}
            color="text-emerald-400"
          />
        </div>

        {/* Issues */}
        {skinData.issues && skinData.issues.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">{t("skin_issues")}</p>
            <div className="flex flex-wrap gap-2">
              {skinData.issues.map((issue) => {
                const severity = skinData.severity?.[issue] || 0;
                const color =
                  severity >= 0.7
                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                    : severity >= 0.4
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "bg-blue-500/10 text-blue-400 border-blue-500/20";
                return (
                  <Badge key={issue} variant="outline" className={`rounded-full text-xs ${color}`}>
                    {issue.replace(/_/g, " ")}
                    {severity > 0 && ` ${Math.round(severity * 100)}%`}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Brief Note */}
        {skinData.brief_note && (
          <div className="bg-muted/30 rounded-xl p-3 mb-5 text-sm text-muted-foreground italic">
            &quot;{skinData.brief_note}&quot;
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="ghost" size="sm" onClick={onSkip}>
            {t("skin_retry")}
          </Button>
          <Button
            className="rounded-full px-6 bg-gradient-to-r from-sil-rose to-pink-400 text-white border-0"
            onClick={onContinue}
          >
            {t("skin_continue")}
          </Button>
        </div>
      </div>
    );
  }

  // No data yet — show scanner
  return (
    <div className="text-center">
      <div className="text-4xl mb-4">📸</div>
      <h2 className="text-2xl font-bold mb-2">{t("skin_title")}</h2>
      <p className="text-muted-foreground mb-6 text-sm">{t("skin_desc")}</p>
      <SkinScanner onAnalysisComplete={onComplete} />
      <Separator className="my-6" />
      <Button variant="ghost" size="sm" onClick={onSkip}>
        {t("skin_skip")}
      </Button>
    </div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-muted/30 rounded-xl p-3 text-center">
      <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}

// ─── Environment Step with City + Season ───

function EnvironmentStep({
  onComplete,
  onSkip,
}: {
  onComplete: (data: unknown) => void;
  onSkip: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const { language, t } = useLanguage();

  // Determine current season
  const currentSeason = (() => {
    const m = new Date().getMonth() + 1;
    if (m >= 3 && m <= 5) return "spring";
    if (m >= 6 && m <= 8) return "summer";
    if (m >= 9 && m <= 11) return "fall";
    return "winter";
  })();

  const cities = [
    // 미국
    { id: "la", emoji: "🇺🇸", name: { ko: "LA", en: "Los Angeles", ja: "ロサンゼルス" }, group: "US" },
    { id: "nyc", emoji: "🇺🇸", name: { ko: "뉴욕", en: "New York", ja: "ニューヨーク" }, group: "US" },
    { id: "sf", emoji: "🇺🇸", name: { ko: "샌프란", en: "SF", ja: "SF" }, group: "US" },
    { id: "seattle", emoji: "🇺🇸", name: { ko: "시애틀", en: "Seattle", ja: "シアトル" }, group: "US" },
    { id: "chicago", emoji: "🇺🇸", name: { ko: "시카고", en: "Chicago", ja: "シカゴ" }, group: "US" },
    { id: "miami", emoji: "🇺🇸", name: { ko: "마이애미", en: "Miami", ja: "マイアミ" }, group: "US" },
    { id: "houston", emoji: "🇺🇸", name: { ko: "휴스턴", en: "Houston", ja: "ヒューストン" }, group: "US" },
    { id: "dallas", emoji: "🇺🇸", name: { ko: "달라스", en: "Dallas", ja: "ダラス" }, group: "US" },
    // 캐나다
    { id: "toronto", emoji: "🇨🇦", name: { ko: "토론토", en: "Toronto", ja: "トロント" }, group: "CA" },
    { id: "vancouver", emoji: "🇨🇦", name: { ko: "밴쿠버", en: "Vancouver", ja: "バンクーバー" }, group: "CA" },
    { id: "montreal", emoji: "🇨🇦", name: { ko: "몬트리올", en: "Montreal", ja: "モントリオール" }, group: "CA" },
    { id: "calgary", emoji: "🇨🇦", name: { ko: "캘거리", en: "Calgary", ja: "カルガリー" }, group: "CA" },
    // 일본
    { id: "tokyo", emoji: "🇯🇵", name: { ko: "도쿄", en: "Tokyo", ja: "東京" }, group: "JP" },
    { id: "osaka", emoji: "🇯🇵", name: { ko: "오사카", en: "Osaka", ja: "大阪" }, group: "JP" },
    { id: "kyoto", emoji: "🇯🇵", name: { ko: "교토", en: "Kyoto", ja: "京都" }, group: "JP" },
    { id: "fukuoka", emoji: "🇯🇵", name: { ko: "후쿠오카", en: "Fukuoka", ja: "福岡" }, group: "JP" },
  ];

  const seasons = [
    { id: "spring", label: t("env_spring") },
    { id: "summer", label: t("env_summer") },
    { id: "fall", label: t("env_fall") },
    { id: "winter", label: t("env_winter") },
  ];

  const detectLocation = async () => {
    setLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
      );
      const data = await getWeather(
        position.coords.latitude,
        position.coords.longitude
      );
      onComplete(data);
    } catch {
      try {
        const data = await getWeather();
        onComplete(data);
      } catch {
        onComplete({
          temp: 22, humidity: 45, uvi: 6,
          description: "Partly cloudy", city: "LA", aqi: 75,
        });
      }
    }
    setLoading(false);
  };

  const selectCity = async (cityId: string) => {
    setLoading(true);
    try {
      const season = selectedSeason || currentSeason;
      const data = await getWeather(undefined, undefined, cityId, season);
      onComplete(data);
    } catch {
      onComplete({
        temp: 22, humidity: 45, uvi: 6,
        description: "Partly cloudy", city: cityId, aqi: 75,
      });
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">🌤</div>
        <h2 className="text-2xl font-bold mb-2">{t("env_title")}</h2>
        <p className="text-muted-foreground text-sm">{t("env_desc")}</p>
      </div>

      {/* GPS Detection */}
      <Button
        className="w-full rounded-full px-6 mb-6 bg-gradient-to-r from-sil-sky to-blue-400 text-white border-0"
        onClick={detectLocation}
        disabled={loading}
      >
        {loading ? t("detecting") : `📍 ${t("env_detect")}`}
      </Button>

      {/* City Selection */}
      <p className="text-xs text-muted-foreground text-center mb-3">{t("env_or_select")}</p>
      {(["US", "CA", "JP"] as const).map((group) => (
        <div key={group} className="mb-3">
          <p className="text-[10px] text-muted-foreground/60 mb-1.5 px-1">
            {group === "US" ? "🇺🇸 USA" : group === "CA" ? "🇨🇦 Canada" : "🇯🇵 Japan"}
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {cities.filter((c) => c.group === group).map((city) => (
              <Button
                key={city.id}
                variant="outline"
                size="sm"
                className="rounded-full text-[11px] px-2 h-8"
                onClick={() => selectCity(city.id)}
                disabled={loading}
              >
                {city.name[language]}
              </Button>
            ))}
          </div>
        </div>
      ))}

      {/* Season Selection */}
      <p className="text-xs text-muted-foreground text-center mb-3">{t("env_season")}</p>
      <div className="grid grid-cols-4 gap-2">
        {seasons.map((s) => (
          <Button
            key={s.id}
            variant={(selectedSeason || currentSeason) === s.id ? "default" : "outline"}
            size="sm"
            className="rounded-full text-xs"
            onClick={() => setSelectedSeason(s.id)}
          >
            {s.label}
          </Button>
        ))}
      </div>

      <Separator className="my-6" />
      <div className="text-center">
        <Button variant="ghost" size="sm" onClick={onSkip}>
          {t("skip")}
        </Button>
      </div>
    </div>
  );
}

// ─── Lifestyle Step ───

function LifestyleStep({
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
        <div className="text-4xl mb-4">🌿</div>
        <h2 className="text-2xl font-bold mb-2">{t("life_title")}</h2>
        <p className="text-muted-foreground text-sm">{t("life_desc")}</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="text-sm font-medium mb-2 block">
            {t("life_sleep")}: {lifestyle.sleep_hours}h
          </label>
          <input
            type="range"
            min={3}
            max={12}
            value={lifestyle.sleep_hours}
            onChange={(e) =>
              setLifestyle((p) => ({ ...p, sleep_hours: Number(e.target.value) }))
            }
            className="w-full accent-sil-mint"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">{t("life_stress")}</label>
          <div className="flex gap-2">
            {(["low", "medium", "high"] as const).map((level) => (
              <Button
                key={level}
                variant={lifestyle.stress_level === level ? "default" : "outline"}
                size="sm"
                className="flex-1 rounded-full capitalize"
                onClick={() => setLifestyle((p) => ({ ...p, stress_level: level }))}
              >
                {t(level as "low" | "medium" | "high")}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">{t("life_exercise")}</label>
          <div className="flex gap-2">
            {(["none", "light", "moderate", "active"] as const).map((freq) => (
              <Button
                key={freq}
                variant={lifestyle.exercise_freq === freq ? "default" : "outline"}
                size="sm"
                className="flex-1 rounded-full capitalize text-xs"
                onClick={() => setLifestyle((p) => ({ ...p, exercise_freq: freq }))}
              >
                {t(freq as "none" | "light" | "moderate" | "active")}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="ghost" size="sm" onClick={onSkip}>
          {t("skip")}
        </Button>
        <Button
          className="rounded-full px-6 bg-gradient-to-r from-sil-mint to-emerald-400 text-white border-0"
          onClick={() => onComplete(lifestyle)}
        >
          {t("life_continue")}
        </Button>
      </div>
    </div>
  );
}

// ─── TPO Step ───

function TPOStep({
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

  const timeOptions = [
    { value: "morning", label: "🌅" },
    { value: "afternoon", label: "☀️" },
    { value: "evening", label: "🌆" },
    { value: "night", label: "🌙" },
  ] as const;

  const placeOptions = [
    { value: "office", label: "🏢" },
    { value: "outdoor", label: "🌳" },
    { value: "home", label: "🏠" },
    { value: "gym", label: "💪" },
    { value: "travel", label: "✈️" },
  ] as const;

  const occasionOptions = [
    { value: "daily", label: "📅" },
    { value: "date", label: "💕" },
    { value: "meeting", label: "💼" },
    { value: "workout", label: "🏃" },
    { value: "special", label: "🎉" },
  ] as const;

  return (
    <div>
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">🎯</div>
        <h2 className="text-2xl font-bold mb-2">{t("tpo_title")}</h2>
        <p className="text-muted-foreground text-sm">{t("tpo_desc")}</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="text-sm font-medium mb-2 block">{t("tpo_time")}</label>
          <div className="grid grid-cols-4 gap-2">
            {timeOptions.map((opt) => (
              <Button
                key={opt.value}
                variant={tpo.time === opt.value ? "default" : "outline"}
                size="sm"
                className="rounded-full text-xs"
                onClick={() => setTPO((p) => ({ ...p, time: opt.value }))}
              >
                {opt.label} {opt.value}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">{t("tpo_place")}</label>
          <div className="grid grid-cols-3 gap-2">
            {placeOptions.map((opt) => (
              <Button
                key={opt.value}
                variant={tpo.place === opt.value ? "default" : "outline"}
                size="sm"
                className="rounded-full text-xs"
                onClick={() => setTPO((p) => ({ ...p, place: opt.value }))}
              >
                {opt.label} {opt.value}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">{t("tpo_occasion")}</label>
          <div className="grid grid-cols-3 gap-2">
            {occasionOptions.map((opt) => (
              <Button
                key={opt.value}
                variant={tpo.occasion === opt.value ? "default" : "outline"}
                size="sm"
                className="rounded-full text-xs"
                onClick={() => setTPO((p) => ({ ...p, occasion: opt.value }))}
              >
                {opt.label} {opt.value}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="ghost" size="sm" onClick={onSkip}>
          {t("skip")}
        </Button>
        <Button
          className="rounded-full px-6 bg-gradient-to-r from-sil-gold to-amber-400 text-white border-0"
          onClick={() => onComplete(tpo)}
        >
          {t("life_continue")}
        </Button>
      </div>
    </div>
  );
}

// ─── Theme Step ───

function ThemeStep({
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
        <div className="text-4xl mb-4">🎨</div>
        <h2 className="text-2xl font-bold mb-2">{t("theme_title")}</h2>
        <p className="text-muted-foreground text-sm">{t("theme_desc")}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {styles.map((s) => (
          <Button
            key={s.value}
            variant={theme.style === s.value ? "default" : "outline"}
            className={`h-auto py-3 px-4 rounded-xl text-left justify-start ${
              theme.style === s.value ? "ring-2 ring-sil-lavender" : ""
            }`}
            onClick={() => setTheme((p) => ({ ...p, style: s.value }))}
          >
            <div>
              <div className="text-sm font-medium">{s.label}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{s.desc}</div>
            </div>
          </Button>
        ))}
      </div>

      <div className="mt-5">
        <label className="text-sm font-medium mb-2 block">{t("theme_intensity")}</label>
        <div className="flex gap-2">
          {(["subtle", "moderate", "bold"] as const).map((level) => (
            <Button
              key={level}
              variant={theme.intensity === level ? "default" : "outline"}
              size="sm"
              className="flex-1 rounded-full capitalize"
              onClick={() => setTheme((p) => ({ ...p, intensity: level }))}
            >
              {t(level as "subtle" | "moderate" | "bold")}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="ghost" size="sm" onClick={onSkip}>
          {t("skip")}
        </Button>
        <Button
          className="rounded-full px-6 bg-gradient-to-r from-sil-lavender to-violet-400 text-white border-0"
          onClick={() => onComplete(theme)}
        >
          {t("theme_start")}
        </Button>
      </div>
    </div>
  );
}

// ─── Demo Response Generator ───

function generateDemoResponse(
  question: string,
  vectors: FiveVectors,
  expert: ExpertInfo,
  lang: string,
): string {
  if (lang === "ko") {
    return `안녕하세요! **${expert.name}**이에요. 현재 SIL 백엔드에 연결할 수 없어서 데모 응답을 보여드리고 있어요.\n\n실제 버전에서는 5-Vector 분석 결과를 기반으로 맞춤형 K-뷰티 상담을 제공합니다. 🌸`;
  }
  if (lang === "ja") {
    return `こんにちは！**${expert.name}**です。現在SILバックエンドに接続できないため、デモ応答を表示しています。\n\n実際のバージョンでは、5-Vector分析に基づくパーソナライズされたK-ビューティー相談を提供します。🌸`;
  }
  return `Hi! I'm **${expert.name}**. Currently unable to connect to the SIL backend, so showing a demo response.\n\nIn the full version, this provides personalized K-Beauty consultation based on your 5-Vector analysis. 🌸`;
}
