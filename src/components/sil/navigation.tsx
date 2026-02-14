"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/consultation", label: "AI Consultation" },
  { href: "/products", label: "Products" },
  { href: "/diary", label: "Skin Diary" },
];

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

export function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <SILLogo />

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
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

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="default"
            size="sm"
            className="rounded-full bg-gradient-to-r from-sil-lavender to-sil-rose text-white border-0 hover:opacity-90 px-5"
            asChild
          >
            <Link href="/consultation">Start Analysis</Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
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
              {NAV_ITEMS.map((item) => (
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
                  <Link href="/consultation">Start Analysis</Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
