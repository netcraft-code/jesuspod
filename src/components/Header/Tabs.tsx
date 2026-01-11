import "./style.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

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

/* 🔹 Props typing */
interface TabsProps {
  active: string;
  setActive: (tab: string) => void;
}

export default function Tabs({ active, setActive }: TabsProps) {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
        {tabs.map((t) => (
          <button
            key={t}
            className={`tab-btn ${active === t ? "active" : ""}`}
            onClick={() => handleTabClick(t)}
            type="button"
          >
            {t}
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
              {tabs.map((t) => (
                <button
                  key={t}
                  className={`drawer-item ${active === t ? "active" : ""}`}
                  onClick={() => handleTabClick(t)}
                  type="button"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
