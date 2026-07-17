import "./style.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { useTranslation } from "../../context/LanguageContext";

/* 🔹 Tabs array */
const tabs: string[] = [
  "All",
  "Live",
  "Podcast",
  "Radio",
  "Channels",
  "Movies",
  "Books",
  "Acts2",
];

const tabKeyMap: Record<string, string> = {
  "All": "header.all",
  "Live": "header.live",
  "Podcast": "header.podcast",
  "Radio": "header.radio",
  "Channels": "header.channels",
  "Movies": "header.movies",
  "Books": "header.books",
  "Acts2": "header.acts2",
};

/* 🔹 Props typing */
interface TabsProps {
  active: string;
  setActive: (tab: string) => void;
}

export default function Tabs({ active, setActive }: TabsProps) {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { t } = useTranslation();

  const handleTabClick = (t: string) => {
    setActive(t);
    setIsDrawerOpen(false); // Close drawer on selection

    if (t === "Radio") navigate("/radio");
    if (t === "All") navigate("/home");
    if (t === "Podcast") navigate("/podcast");
    if (t === "Channels") navigate("/channel-listing");
    if (t === "Books") navigate("/books");
    if (t === "Acts2") navigate("/shorts");
    if (t === "Live") navigate("/live-player");
    if (t === "Movies") navigate("/movies");
  };

  return (
    <>
      {/* 🔹 Desktop / Horizontal Tabs (Hidden on Mobile via CSS) */}
      <div className="tab-container desktop-tabs">
        {tabs.map((tabName) => (
          <button
            key={tabName}
            className={`tab-btn ${active === tabName ? "active" : ""}`}
            onClick={() => handleTabClick(tabName)}
            type="button"
          >
            {t(tabKeyMap[tabName] || tabName)}
          </button>
        ))}
      </div>

      {/* 🔹 Mobile Menu Icon (Visible only on Mobile via CSS) */}
      <div className="mobile-menu-icon" onClick={() => setIsDrawerOpen(true)}>
        <FaBars size={24} color="#fff" />
      </div>

      {/* 🔹 Mobile Drawer Overlay */}
      {isDrawerOpen && (
        <div className="drawer-overlay" onClick={() => setIsDrawerOpen(false)}>
          <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <span className="drawer-title">Menu</span>
              <FaTimes size={24} color="#fff" onClick={() => setIsDrawerOpen(false)} style={{ cursor: "pointer" }} />
            </div>
            <div className="drawer-list">
              {tabs.map((tabName) => (
                <button
                  key={tabName}
                  className={`drawer-item ${active === tabName ? "active" : ""}`}
                  onClick={() => handleTabClick(tabName)}
                  type="button"
                >
                  {t(tabKeyMap[tabName] || tabName)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

