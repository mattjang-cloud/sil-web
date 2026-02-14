import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

const DEMO_ENTRIES = [
  {
    date: "2026-02-13",
    day: "Thu",
    hydration: 48,
    oil: 32,
    issues: ["Slight dryness", "Minor dark circles"],
    weather: "☀️ 22° UV 6",
    mood: "😊",
    notes: "Glass skin routine AM, retinol PM. Skin feels smoother.",
  },
  {
    date: "2026-02-12",
    day: "Wed",
    hydration: 42,
    oil: 38,
    issues: ["Oily T-zone", "Redness on cheeks"],
    weather: "🌧 18° UV 2",
    mood: "😐",
    notes: "Rain day. Used lighter moisturizer. Added centella serum.",
  },
  {
    date: "2026-02-11",
    day: "Tue",
    hydration: 55,
    oil: 30,
    issues: ["Even tone today"],
    weather: "⛅ 20° UV 4",
    mood: "😄",
    notes: "Great skin day! 8h sleep + green tea helped.",
  },
  {
    date: "2026-02-10",
    day: "Mon",
    hydration: 38,
    oil: 45,
    issues: ["Breakout on chin", "Dehydrated"],
    weather: "🌤 21° UV 5",
    mood: "😰",
    notes: "Weekend stress showing. Double cleanse + COSRX patches.",
  },
];

export default function DiaryPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <Badge
            variant="secondary"
            className="mb-4 px-4 py-1.5 rounded-full text-xs tracking-wider border border-border/50"
          >
            Skin Tracking
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Skin <span className="gradient-text">Diary</span>
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Track your skin journey over time. AI analyzes trends and suggests
            adjustments to your routine.
          </p>
        </div>

        {/* Trend Summary */}
        <Card className="glass-card rounded-2xl mb-8">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold mb-4">📊 Weekly Trend</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-400">46%</div>
                <div className="text-[10px] text-muted-foreground">
                  Avg Hydration
                </div>
                <div className="text-[9px] text-green-400">↑ 4% from last week</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-400">36%</div>
                <div className="text-[10px] text-muted-foreground">
                  Avg Oil Level
                </div>
                <div className="text-[9px] text-red-400">↓ 2% from last week</div>
              </div>
              <div>
                <div className="text-2xl font-bold gradient-text">3/4</div>
                <div className="text-[10px] text-muted-foreground">
                  Good Skin Days
                </div>
                <div className="text-[9px] text-green-400">
                  ↑ improved from 2/4
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Diary Entries */}
        <div className="space-y-4">
          {DEMO_ENTRIES.map((entry) => (
            <Card
              key={entry.date}
              className="glass-card rounded-2xl hover:border-primary/10 transition-all"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{entry.mood}</div>
                    <div>
                      <p className="text-sm font-medium">{entry.date}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {entry.day} · {entry.weather}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 text-xs">
                    <div className="text-center">
                      <div className="font-semibold text-blue-400">
                        {entry.hydration}%
                      </div>
                      <div className="text-[9px] text-muted-foreground">💧</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-amber-400">
                        {entry.oil}%
                      </div>
                      <div className="text-[9px] text-muted-foreground">🫧</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {entry.issues.map((issue) => (
                    <Badge
                      key={issue}
                      variant="outline"
                      className="text-[10px] rounded-full px-2 py-0"
                    >
                      {issue}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{entry.notes}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Full diary with Plotly trend charts and AI insights coming in the
            next update.
          </p>
          <Button
            className="rounded-full px-6 bg-gradient-to-r from-sil-lavender to-sil-rose text-white border-0"
            asChild
          >
            <Link href="/consultation">Start Today&apos;s Entry →</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
