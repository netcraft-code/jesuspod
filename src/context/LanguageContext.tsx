import React, { createContext, useContext, useState } from "react";
import en from "../locales/en.json";
import es from "../locales/es.json";
import pt from "../locales/pt.json";
import sw from "../locales/sw.json";

// Type definitions
export type LanguageCode = "en" | "es" | "pt" | "sw";

const translations: Record<LanguageCode, any> = {
  en,
  es,
  pt,
  sw,
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (keyPath: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper to get system language
const getSystemLanguage = (): LanguageCode => {
  const systemLang = navigator.language || (navigator as any).userLanguage || "es";
  const langCode = systemLang.split("-")[0].toLowerCase();
  
  const supported: LanguageCode[] = ["en", "es", "pt", "sw"];
  if (supported.includes(langCode as LanguageCode)) {
    return langCode as LanguageCode;
  }
  return "es"; // Fallback is Spanish as requested
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem("language");
    if (saved) {
      const supported: LanguageCode[] = ["en", "es", "pt", "sw"];
      if (supported.includes(saved as LanguageCode)) {
        return saved as LanguageCode;
      }
    }
    return getSystemLanguage();
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  // Translation function that resolves dot notation (e.g. "header.all")
  const t = (keyPath: string): string => {
    const keys = keyPath.split(".");
    let current: any = translations[language];

    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = current[key];
      } else {
        // Fallback to Spanish translations first
        let spanishCurrent: any = translations["es"];
        for (const spKey of keys) {
          if (spanishCurrent && typeof spanishCurrent === "object" && spKey in spanishCurrent) {
            spanishCurrent = spanishCurrent[spKey];
          } else {
            spanishCurrent = null;
            break;
          }
        }
        return spanishCurrent || keyPath;
      }
    }

    return typeof current === "string" ? current : keyPath;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
};
