"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { t as translate, type Lang, type StringKey } from "./ui-strings";

interface LanguageContextValue {
  language: Lang;
  setLanguage: (lang: Lang) => void;
  t: (key: StringKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Lang>("ko");

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("sil-lang") as Lang | null;
    if (saved && ["ko", "en", "ja"].includes(saved)) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = useCallback((lang: Lang) => {
    setLanguageState(lang);
    localStorage.setItem("sil-lang", lang);
    // Update html lang attribute
    document.documentElement.lang = lang === "ja" ? "ja" : lang === "en" ? "en" : "ko";
  }, []);

  const t = useCallback(
    (key: StringKey) => translate(key, language),
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
