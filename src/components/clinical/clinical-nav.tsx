"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { HUD_LABEL_BRIGHT, ACCENT_GRADIENT } from "@/lib/clinical-theme";
import { useLanguage } from "@/lib/language-context";

const NAV_ITEMS = [
  { href: "/clinical", label: "HOME" },
  { href: "/clinical/consultation", label: "CONSULT" },
  { href: "/clinical/mirror", label: "MIRROR" },
] as const;

export function ClinicalNav() {
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14">
      {/* Glass background */}
      <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-[16px] border-b border-white/8" />

      <div className="relative h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/clinical" className="flex items-center gap-2.5 group">
          <div
            className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold text-white",
              ACCENT_GRADIENT
            )}
          >
            S
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-sm text-white tracking-wide">SIL</span>
            <span className={cn(HUD_LABEL_BRIGHT, "text-[8px] hidden sm:inline")}>
              CLINICAL
            </span>
          </div>
        </Link>

        {/* Nav Items */}
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/clinical"
                ? pathname === "/clinical"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[11px] font-mono uppercase tracking-[0.12em] transition-all",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Language Toggle */}
        <div className="flex items-center gap-0.5 bg-white/5 rounded-lg p-0.5">
          {(["ko", "en", "ja"] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={cn(
                "px-2 py-1 rounded-md text-[10px] font-mono transition-all",
                language === lang
                  ? "bg-[#8c2bee] text-white"
                  : "text-white/40 hover:text-white/60"
              )}
            >
              {lang === "ko" ? "한" : lang === "en" ? "EN" : "日"}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
