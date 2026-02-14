"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";
import type { Lang } from "@/lib/ui-strings";

function SILLogo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-sil-lavender to-sil-rose opacity-80 group-hover:opacity-100 transition-opacity" />
        <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
          S
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold tracking-wider gradient-text">
          SIL
        </span>
        <span className="text-[9px] text-muted-foreground tracking-widest uppercase">
          Skin Intelligence
        </span>
      </div>
    </Link>
  );
}

function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const langs: { code: Lang; label: string }[] = [
    { code: "ko", label: "한" },
    { code: "en", label: "EN" },
    { code: "ja", label: "日" },
  ];

  return (
    <div className="flex items-center bg-muted/50 rounded-full p-0.5">
      {langs.map((l) => (
        <button
          key={l.code}
          onClick={() => setLanguage(l.code)}
          className={cn(
            "px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200",
            language === l.code
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

export function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  const navItems = [
    { href: "/", label: t("nav_home") },
    { href: "/consultation", label: t("nav_consultation") },
    { href: "/products", label: t("nav_products") },
    { href: "/diary", label: t("nav_diary") },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <SILLogo />

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA + Language */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageToggle />
          <Button
            variant="default"
            size="sm"
            className="rounded-full bg-gradient-to-r from-sil-lavender to-sil-rose text-white border-0 hover:opacity-90 px-5"
            asChild
          >
            <Link href="/consultation">{t("nav_start")}</Link>
          </Button>
        </div>

        {/* Mobile: Language Toggle + Menu */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <div className="flex flex-col gap-1.5">
                  <span
                    className={cn(
                      "block h-0.5 w-5 bg-foreground transition-all duration-200",
                      open && "rotate-45 translate-y-2"
                    )}
                  />
                  <span
                    className={cn(
                      "block h-0.5 w-5 bg-foreground transition-all duration-200",
                      open && "opacity-0"
                    )}
                  />
                  <span
                    className={cn(
                      "block h-0.5 w-5 bg-foreground transition-all duration-200",
                      open && "-rotate-45 -translate-y-2"
                    )}
                  />
                </div>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-background/95 backdrop-blur-xl">
              <div className="flex flex-col gap-2 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "px-4 py-3 rounded-xl text-base font-medium transition-all",
                      pathname === item.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="mt-4 px-4">
                  <Button
                    className="w-full rounded-full bg-gradient-to-r from-sil-lavender to-sil-rose text-white border-0"
                    onClick={() => setOpen(false)}
                    asChild
                  >
                    <Link href="/consultation">{t("nav_start")}</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
