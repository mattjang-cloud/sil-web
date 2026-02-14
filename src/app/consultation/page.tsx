"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { VectorPanel } from "@/components/sil/vector-panel";
import { ChatPanel } from "@/components/sil/chat-panel";
import { SkinScanner } from "@/components/sil/skin-scanner";
import { consult, consultStream, getWeather, analyzeSkin } from "@/lib/api";
import type {
  FiveVectors,
  ChatMessage,
  ConsultationStep,
  ExpertInfo,
  LifestyleVector,
  TPOVector,
  ThemeVector,
  ThemeStyle,
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
  const [currentExpert, setCurrentExpert] =
    useState<ExpertInfo>(INITIAL_EXPERT);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

      // Build history from existing messages
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      try {
        // Try streaming first
        let fullText = "";
        const assistantMsgId = `msg-${Date.now() + 1}`;

        // Add placeholder message for streaming
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
            language: "ko",
            history,
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
          // Fallback to non-streaming
          setMessages((prev) => prev.filter((m) => m.id !== assistantMsgId));

          const response = await consult({
            message: content,
            vectors: vectors as unknown as Record<string, unknown>,
            language: "ko",
            history,
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
        // Complete fallback: demo response if API is unavailable
        const expertResponse: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: "assistant",
          content: generateDemoResponse(content, vectors, currentExpert),
          timestamp: new Date(),
          expert: currentExpert,
        };
        setMessages((prev) => [...prev, expertResponse]);
        setIsLoading(false);
      }
    },
    [vectors, currentExpert, messages]
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
          onStart={() => setStep("skin_scan")}
          onSkip={handleSkipToChat}
        />
      ) : step === "chat" ? (
        <div className="flex h-[calc(100vh-4rem)]">
          {/* Vector Sidebar */}
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

          {/* Chat Area */}
          <main className="flex-1 flex flex-col">
            {/* Chat Header */}
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
                  {completedVectors.length}/5 Vectors
                </Badge>
              </div>
            </div>

            {/* Chat Messages */}
            <ChatPanel
              messages={messages}
              isLoading={isLoading}
              onSend={handleSendMessage}
              expert={currentExpert}
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
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <div className="max-w-lg text-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-sil-lavender via-sil-rose to-sil-gold flex items-center justify-center text-white text-3xl mx-auto mb-8 glow-purple animate-float">
          ✨
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-4">
          AI Skin Consultation
        </h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Set up your 5 vectors for the most personalized experience, or jump
          straight into chatting with our AI experts.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            size="lg"
            className="rounded-full px-8 bg-gradient-to-r from-sil-lavender to-sil-rose text-white border-0 hover:opacity-90 w-full sm:w-auto"
            onClick={onStart}
          >
            Start 5-Vector Setup
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="rounded-full px-8 border-border/50 w-full sm:w-auto"
            onClick={onSkip}
          >
            Skip to Chat
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
}: {
  step: ConsultationStep;
  vectors: FiveVectors;
  onVectorUpdate: (key: keyof FiveVectors, value: unknown) => void;
  onNext: (step: ConsultationStep) => void;
  onSkip: () => void;
}) {
  const steps: {
    id: ConsultationStep;
    label: string;
    icon: string;
    gradient: string;
  }[] = [
    {
      id: "skin_scan",
      label: "Skin Scan",
      icon: "U",
      gradient: "from-sil-rose to-pink-400",
    },
    {
      id: "environment",
      label: "Environment",
      icon: "E",
      gradient: "from-sil-sky to-blue-400",
    },
    {
      id: "lifestyle",
      label: "Lifestyle",
      icon: "L",
      gradient: "from-sil-mint to-emerald-400",
    },
    {
      id: "tpo",
      label: "TPO",
      icon: "T",
      gradient: "from-sil-gold to-amber-400",
    },
    {
      id: "theme",
      label: "Theme",
      icon: "V",
      gradient: "from-sil-lavender to-violet-400",
    },
  ];

  const currentIndex = steps.findIndex((s) => s.id === step);

  const getNextStep = (): ConsultationStep => {
    if (currentIndex < steps.length - 1) return steps[currentIndex + 1].id;
    return "chat";
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      {/* Progress */}
      <div className="flex items-center justify-center gap-2 mb-12">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                i <= currentIndex
                  ? `bg-gradient-to-br ${s.gradient} text-white shadow-md`
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {s.icon}
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 ${
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
          {step === "skin_scan" && (
            <SkinScanStep
              onComplete={(data) => {
                onVectorUpdate("user", data);
                onNext(getNextStep());
              }}
              onSkip={() => onNext(getNextStep())}
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
          Skip all and go to chat →
        </Button>
      </div>
    </div>
  );
}

// ─── Individual Step Components ───

function SkinScanStep({
  onComplete,
  onSkip,
}: {
  onComplete: (data: unknown) => void;
  onSkip: () => void;
}) {
  return (
    <div className="text-center">
      <div className="text-4xl mb-4">📸</div>
      <h2 className="text-2xl font-bold mb-2">Skin Analysis</h2>
      <p className="text-muted-foreground mb-6 text-sm">
        Take a selfie or upload a photo for AI-powered skin analysis using
        Claude Vision.
      </p>
      <SkinScanner onAnalysisComplete={onComplete} />
      <Separator className="my-6" />
      <Button variant="ghost" size="sm" onClick={onSkip}>
        Skip this step
      </Button>
    </div>
  );
}

function EnvironmentStep({
  onComplete,
  onSkip,
}: {
  onComplete: (data: unknown) => void;
  onSkip: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const detectLocation = async () => {
    setLoading(true);
    try {
      // Try browser geolocation
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
          })
      );
      const data = await getWeather(
        position.coords.latitude,
        position.coords.longitude
      );
      onComplete(data);
    } catch {
      // Fallback: Seoul default or demo data
      try {
        const data = await getWeather();
        onComplete(data);
      } catch {
        onComplete({
          temp: 22,
          humidity: 45,
          uvi: 6,
          description: "Partly cloudy",
          city: "Seoul",
          aqi: 75,
        });
      }
    }
    setLoading(false);
  };

  return (
    <div className="text-center">
      <div className="text-4xl mb-4">🌤</div>
      <h2 className="text-2xl font-bold mb-2">Environment</h2>
      <p className="text-muted-foreground mb-6 text-sm">
        We&apos;ll check current weather, UV index, and air quality in your area.
      </p>
      <Button
        className="rounded-full px-6 bg-gradient-to-r from-sil-sky to-blue-400 text-white border-0"
        onClick={detectLocation}
        disabled={loading}
      >
        {loading ? "Detecting..." : "📍 Detect My Location"}
      </Button>
      <Separator className="my-6" />
      <Button variant="ghost" size="sm" onClick={onSkip}>
        Skip this step
      </Button>
    </div>
  );
}

function LifestyleStep({
  onComplete,
  onSkip,
}: {
  onComplete: (data: LifestyleVector) => void;
  onSkip: () => void;
}) {
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
        <h2 className="text-2xl font-bold mb-2">Lifestyle</h2>
        <p className="text-muted-foreground text-sm">
          Tell us about your daily habits for personalized recommendations.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Sleep: {lifestyle.sleep_hours}h
          </label>
          <input
            type="range"
            min={3}
            max={12}
            value={lifestyle.sleep_hours}
            onChange={(e) =>
              setLifestyle((p) => ({
                ...p,
                sleep_hours: Number(e.target.value),
              }))
            }
            className="w-full accent-sil-mint"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Stress Level</label>
          <div className="flex gap-2">
            {(["low", "medium", "high"] as const).map((level) => (
              <Button
                key={level}
                variant={lifestyle.stress_level === level ? "default" : "outline"}
                size="sm"
                className="flex-1 rounded-full capitalize"
                onClick={() =>
                  setLifestyle((p) => ({ ...p, stress_level: level }))
                }
              >
                {level}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Exercise</label>
          <div className="flex gap-2">
            {(["none", "light", "moderate", "active"] as const).map((freq) => (
              <Button
                key={freq}
                variant={lifestyle.exercise_freq === freq ? "default" : "outline"}
                size="sm"
                className="flex-1 rounded-full capitalize text-xs"
                onClick={() =>
                  setLifestyle((p) => ({ ...p, exercise_freq: freq }))
                }
              >
                {freq}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="ghost" size="sm" onClick={onSkip}>
          Skip
        </Button>
        <Button
          className="rounded-full px-6 bg-gradient-to-r from-sil-mint to-emerald-400 text-white border-0"
          onClick={() => onComplete(lifestyle)}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

function TPOStep({
  onComplete,
  onSkip,
}: {
  onComplete: (data: TPOVector) => void;
  onSkip: () => void;
}) {
  const [tpo, setTPO] = useState<TPOVector>({
    time: "morning",
    place: "office",
    occasion: "daily",
  });

  const timeOptions = [
    { value: "morning", label: "🌅 Morning" },
    { value: "afternoon", label: "☀️ Afternoon" },
    { value: "evening", label: "🌆 Evening" },
    { value: "night", label: "🌙 Night" },
  ] as const;

  const placeOptions = [
    { value: "office", label: "🏢 Office" },
    { value: "outdoor", label: "🌳 Outdoor" },
    { value: "home", label: "🏠 Home" },
    { value: "gym", label: "💪 Gym" },
    { value: "travel", label: "✈️ Travel" },
  ] as const;

  const occasionOptions = [
    { value: "daily", label: "📅 Daily" },
    { value: "date", label: "💕 Date" },
    { value: "meeting", label: "💼 Meeting" },
    { value: "workout", label: "🏃 Workout" },
    { value: "special", label: "🎉 Special" },
  ] as const;

  return (
    <div>
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">🎯</div>
        <h2 className="text-2xl font-bold mb-2">Time / Place / Occasion</h2>
        <p className="text-muted-foreground text-sm">
          Context matters. What&apos;s your situation right now?
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="text-sm font-medium mb-2 block">Time</label>
          <div className="grid grid-cols-4 gap-2">
            {timeOptions.map((opt) => (
              <Button
                key={opt.value}
                variant={tpo.time === opt.value ? "default" : "outline"}
                size="sm"
                className="rounded-full text-xs"
                onClick={() => setTPO((p) => ({ ...p, time: opt.value }))}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Place</label>
          <div className="grid grid-cols-3 gap-2">
            {placeOptions.map((opt) => (
              <Button
                key={opt.value}
                variant={tpo.place === opt.value ? "default" : "outline"}
                size="sm"
                className="rounded-full text-xs"
                onClick={() => setTPO((p) => ({ ...p, place: opt.value }))}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Occasion</label>
          <div className="grid grid-cols-3 gap-2">
            {occasionOptions.map((opt) => (
              <Button
                key={opt.value}
                variant={tpo.occasion === opt.value ? "default" : "outline"}
                size="sm"
                className="rounded-full text-xs"
                onClick={() => setTPO((p) => ({ ...p, occasion: opt.value }))}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="ghost" size="sm" onClick={onSkip}>
          Skip
        </Button>
        <Button
          className="rounded-full px-6 bg-gradient-to-r from-sil-gold to-amber-400 text-white border-0"
          onClick={() => onComplete(tpo)}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

function ThemeStep({
  onComplete,
  onSkip,
}: {
  onComplete: (data: ThemeVector) => void;
  onSkip: () => void;
}) {
  const [theme, setTheme] = useState<ThemeVector>({
    style: "glass_skin",
    finish: "dewy",
    intensity: "moderate",
  });

  const styles: { value: ThemeStyle; label: string; desc: string }[] = [
    { value: "glass_skin", label: "💎 Glass Skin", desc: "Luminous, translucent glow" },
    { value: "clean_girl", label: "🧼 Clean Girl", desc: "Effortless, minimal" },
    { value: "k_idol", label: "⭐ K-Idol", desc: "Flawless, camera-ready" },
    { value: "natural", label: "🌸 Natural", desc: "Skin-like, no-makeup look" },
    { value: "dewy", label: "💧 Dewy", desc: "Fresh, hydrated finish" },
    { value: "matte", label: "🪨 Matte", desc: "Smooth, shine-free" },
    { value: "minimalist", label: "⚡ Minimalist", desc: "Essentials only" },
  ];

  return (
    <div>
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">🎨</div>
        <h2 className="text-2xl font-bold mb-2">Theme & Style</h2>
        <p className="text-muted-foreground text-sm">
          What&apos;s your vibe? Choose your aesthetic direction.
        </p>
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
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {s.desc}
              </div>
            </div>
          </Button>
        ))}
      </div>

      <div className="mt-5">
        <label className="text-sm font-medium mb-2 block">Intensity</label>
        <div className="flex gap-2">
          {(["subtle", "moderate", "bold"] as const).map((level) => (
            <Button
              key={level}
              variant={theme.intensity === level ? "default" : "outline"}
              size="sm"
              className="flex-1 rounded-full capitalize"
              onClick={() => setTheme((p) => ({ ...p, intensity: level }))}
            >
              {level}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="ghost" size="sm" onClick={onSkip}>
          Skip
        </Button>
        <Button
          className="rounded-full px-6 bg-gradient-to-r from-sil-lavender to-violet-400 text-white border-0"
          onClick={() => onComplete(theme)}
        >
          Start Consultation →
        </Button>
      </div>
    </div>
  );
}

// ─── Demo Response Generator ───

function generateDemoResponse(
  question: string,
  vectors: FiveVectors,
  expert: ExpertInfo
): string {
  const vectorContext = [];
  if (vectors.user) vectorContext.push("skin analysis data");
  if (vectors.environment) vectorContext.push(`weather in ${vectors.environment.city}`);
  if (vectors.lifestyle) vectorContext.push("lifestyle profile");
  if (vectors.tpo) vectorContext.push(`${vectors.tpo.time} ${vectors.tpo.occasion} context`);
  if (vectors.theme) vectorContext.push(`${vectors.theme.style} aesthetic`);

  const context =
    vectorContext.length > 0
      ? `Based on your ${vectorContext.join(", ")}, `
      : "";

  return `${context}I'd be happy to help with that!

This is a **demo response** from ${expert.name} (${expert.role}). In the full version, this connects to the SIL FastAPI backend which processes your question through:

1. **2-Stage Expert Selection** — automatically choosing the right specialist
2. **5-Vector Context Building** — merging all your data into one prompt
3. **RAG Knowledge Base** — referencing K-Beauty expert knowledge
4. **Product Scoring** — finding the best product matches

To connect this frontend to the real SIL engine, set up the FastAPI backend at \`SIL/api.py\` and update the API endpoint in \`sil-web/src/lib/api.ts\`.

*What else would you like to know?* 🌸`;
}
