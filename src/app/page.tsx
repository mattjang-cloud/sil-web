import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const VECTORS = [
  {
    id: "user",
    icon: "U",
    title: "User Vector",
    subtitle: "AI Skin Scan",
    description:
      "Claude Vision analyzes your skin: hydration, oil balance, texture, pores, wrinkles, and tone in one shot.",
    gradient: "from-sil-rose to-pink-400",
    metrics: ["Hydration", "Oil Level", "Texture", "Skin Tone"],
  },
  {
    id: "env",
    icon: "E",
    title: "Environment Vector",
    subtitle: "Real-time Weather",
    description:
      "UV index, humidity, temperature, and AQI from your location. Dynamic skincare adjustments.",
    gradient: "from-sil-sky to-blue-400",
    metrics: ["UV Index", "Humidity", "Temperature", "AQI"],
  },
  {
    id: "lifestyle",
    icon: "L",
    title: "Lifestyle Vector",
    subtitle: "Daily Habits",
    description:
      "Sleep quality, stress level, water intake, exercise frequency. Personalized lifestyle-based Rx.",
    gradient: "from-sil-mint to-emerald-400",
    metrics: ["Sleep", "Stress", "Hydration", "Exercise"],
  },
  {
    id: "tpo",
    icon: "T",
    title: "TPO Vector",
    subtitle: "Time / Place / Occasion",
    description:
      "Morning routine vs. night repair. Office look vs. outdoor protection. Date night vs. gym day.",
    gradient: "from-sil-gold to-amber-400",
    metrics: ["Time", "Place", "Occasion", "Season"],
  },
  {
    id: "theme",
    icon: "V",
    title: "Theme Vector",
    subtitle: "Style & Vibe",
    description:
      "Clean girl, glass skin, K-idol glow, natural minimalist. Your aesthetic, your routine.",
    gradient: "from-sil-lavender to-violet-400",
    metrics: ["Aesthetic", "Finish", "Coverage", "Intensity"],
  },
];

const EXPERTS = [
  {
    name: "Dr. Yuna",
    role: "Dermatology & Skin Science",
    emoji: "🔬",
    specialties: ["Acne", "Sensitivity", "Barrier Repair"],
  },
  {
    name: "Hana",
    role: "K-Beauty Trends & Products",
    emoji: "✨",
    specialties: ["Glass Skin", "Layering", "New Releases"],
  },
  {
    name: "Minji",
    role: "Ingredient Analysis",
    emoji: "🧪",
    specialties: ["Niacinamide", "Retinol", "Peptides"],
  },
  {
    name: "Sora",
    role: "Lifestyle & Holistic Care",
    emoji: "🌿",
    specialties: ["Diet", "Sleep", "Stress Management"],
  },
];

const STATS = [
  { value: "5", label: "Analysis Vectors" },
  { value: "12+", label: "Expert Panels" },
  { value: "300+", label: "K-Beauty Products" },
  { value: "3", label: "Languages" },
];

export default function Home() {
  return (
    <div className="relative">
      {/* ───── Background Orbs ───── */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-sil-lavender/10 blur-3xl animate-pulse-glow" />
        <div className="absolute top-2/3 -right-32 w-80 h-80 rounded-full bg-sil-rose/10 blur-3xl animate-pulse-glow [animation-delay:1.5s]" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-sil-mint/5 blur-3xl animate-pulse-glow [animation-delay:3s]" />
      </div>

      {/* ───── Hero Section ───── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge
            variant="secondary"
            className="mb-6 px-4 py-1.5 rounded-full text-xs tracking-wider border border-border/50"
          >
            Powered by Claude AI + K-Beauty Science
          </Badge>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            <span className="block text-foreground">Your Skin,</span>
            <span className="block gradient-text">Decoded by AI</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            SIL analyzes 5 dimensions of your skincare universe
            &mdash; skin condition, environment, lifestyle, occasion, and style
            &mdash; to deliver hyper-personalized K-Beauty recommendations.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="rounded-full px-8 h-12 text-base bg-gradient-to-r from-sil-lavender to-sil-rose text-white border-0 hover:opacity-90 glow-purple transition-all"
              asChild
            >
              <Link href="/consultation">
                Start Free Analysis
                <svg
                  className="ml-2 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full px-8 h-12 text-base border-border/50 hover:bg-accent/50"
              asChild
            >
              <Link href="#how-it-works">See How It Works</Link>
            </Button>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-xl mx-auto">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold gradient-text">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── 5-Vector Section ───── */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge
              variant="secondary"
              className="mb-4 px-4 py-1.5 rounded-full text-xs tracking-wider border border-border/50"
            >
              5-Vector Analysis Engine
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Five Dimensions.{" "}
              <span className="gradient-text">One Perfect Routine.</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Unlike single-axis skin analysis tools, SIL combines five
              contextual vectors to understand your full skincare universe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {VECTORS.map((vector, i) => (
              <Card
                key={vector.id}
                className="group glass-card rounded-2xl hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${vector.gradient} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg`}
                    >
                      {vector.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {vector.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {vector.subtitle}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {vector.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {vector.metrics.map((m) => (
                      <Badge
                        key={m}
                        variant="outline"
                        className="text-[10px] px-2 py-0.5 rounded-full border-border/50 text-muted-foreground"
                      >
                        {m}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Combined result card */}
            <Card className="group glass-card rounded-2xl border-primary/20 hover:-translate-y-1 transition-all duration-300 overflow-hidden md:col-span-2 lg:col-span-1">
              <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sil-lavender via-sil-rose to-sil-gold flex items-center justify-center text-white text-2xl mb-4 glow-purple animate-float">
                  ⟐
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-2">
                  Combined Intelligence
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  All 5 vectors merge into a single context prompt, enabling our
                  AI experts to give you the most relevant, personalized
                  recommendations.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 rounded-full text-xs border-primary/30 hover:bg-primary/10"
                  asChild
                >
                  <Link href="/consultation">Try It Now</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ───── Expert Panel Section ───── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge
              variant="secondary"
              className="mb-4 px-4 py-1.5 rounded-full text-xs tracking-wider border border-border/50"
            >
              2-Stage Expert Selection
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Meet Your{" "}
              <span className="gradient-text">AI Expert Panel</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              SIL automatically selects the right specialist based on your
              question context. Each expert has deep domain knowledge in K-Beauty
              science.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {EXPERTS.map((expert, i) => (
              <Card
                key={expert.name}
                className="glass-card rounded-2xl hover:border-primary/20 transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">{expert.emoji}</div>
                  <h3 className="font-semibold text-foreground mb-1">
                    {expert.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    {expert.role}
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {expert.specialties.map((s) => (
                      <Badge
                        key={s}
                        variant="outline"
                        className="text-[10px] px-2 py-0.5 rounded-full border-border/50 text-muted-foreground"
                      >
                        {s}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ───── How It Works ───── */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Three Steps to{" "}
              <span className="gradient-text">Perfect Skin</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Scan & Setup",
                desc: "Take a selfie or upload a photo. Set your location, lifestyle, and style preferences.",
              },
              {
                step: "02",
                title: "AI Analysis",
                desc: "SIL processes all 5 vectors, selects the right expert, and builds your personalized context.",
              },
              {
                step: "03",
                title: "Get Your Routine",
                desc: "Chat with your AI expert. Get product recommendations, ingredient guides, and daily routines.",
              },
            ].map((item, i) => (
              <div key={item.step} className="text-center group">
                <div className="relative inline-block mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sil-lavender/20 to-sil-rose/20 flex items-center justify-center group-hover:from-sil-lavender/30 group-hover:to-sil-rose/30 transition-colors">
                    <span className="text-xl font-bold gradient-text">
                      {item.step}
                    </span>
                  </div>
                  {i < 2 && (
                    <div className="hidden md:block absolute top-1/2 left-full w-full h-px bg-gradient-to-r from-border to-transparent -translate-y-1/2 ml-4" />
                  )}
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CTA Section ───── */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-card rounded-3xl p-12 glow-purple">
            <div className="text-5xl mb-6">✨</div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Ready to Decode{" "}
              <span className="gradient-text">Your Skin?</span>
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Join the next generation of personalized K-Beauty powered by AI
              intelligence and dermatological science.
            </p>
            <Button
              size="lg"
              className="rounded-full px-10 h-13 text-base bg-gradient-to-r from-sil-lavender to-sil-rose text-white border-0 hover:opacity-90"
              asChild
            >
              <Link href="/consultation">
                Start Free Consultation
                <svg
                  className="ml-2 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ───── Footer ───── */}
      <footer className="border-t border-border/50 py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-semibold gradient-text">SIL</span>
            <span>&middot;</span>
            <span>Skin Intelligence Logic</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Built with Claude AI</span>
            <span>&middot;</span>
            <span>K-Beauty Science</span>
            <span>&middot;</span>
            <span>&copy; 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
