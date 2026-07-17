import { useTranslation } from "../../context/LanguageContext";
import type { LanguageCode } from "../../context/LanguageContext";
import "./style.css";

interface LanguageItem {
  code: LanguageCode;
  label: string;
  flag: string;
}

const languages: LanguageItem[] = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "sw", label: "Swahili", flag: "🇹🇿" }
];

interface LanguageMenuProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function LanguageMenu({ isOpen, setIsOpen }: LanguageMenuProps) {
  const { language, setLanguage } = useTranslation();

  const currentSelection = languages.find(l => l.code === language) || languages[1];

  const handleLanguageSelect = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="language-wrapper">
      <div className="language-pill" onClick={() => setIsOpen(!isOpen)}>
        <span className="pill-flag-emoji" style={{ fontSize: "18px", lineHeight: "1" }}>
          {currentSelection.flag}
        </span>
        <span className="pill-name">{currentSelection.label}</span>
        <span className={`pill-arrow ${isOpen ? "open" : ""}`}>▼</span>
      </div>

      {isOpen && (
        <div className="language-dropdown">
          <div className="dropdown-scroll">
            {languages.map((lang) => (
              <div
                key={lang.code}
                className={`dropdown-item ${language === lang.code ? "active" : ""}`}
                onClick={() => handleLanguageSelect(lang.code)}
              >
                <div className="item-left" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span className="dropdown-flag-emoji" style={{ fontSize: "20px", lineHeight: "1" }}>
                    {lang.flag}
                  </span>
                  <span className="dropdown-name">{lang.label}</span>
                </div>
                <div className={`radio-indicator ${language === lang.code ? "checked" : ""}`}>
                  {language === lang.code && <span className="checkmark">✓</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
