import "./style.css";
import { useNavigate } from "react-router-dom";

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

  return (
    <div className="tab-container">
      {tabs.map((t) => (
        <button
          key={t}
          className={`tab-btn ${active === t ? "active" : ""}`}
          onClick={() => {
            setActive(t);

            if (t === "Radio") navigate("/radio");
            if (t === "All") navigate("/home");
            if (t === "Podcast") navigate("/podcast");
            if (t === "Channels") navigate("/channel-listing");
            if (t === "Books") navigate("/books");
            if (t === "Acts2") navigate("/shorts");
            if (t === "Live") navigate("/live-player");
            if (t === "Movies") navigate("/all-movies");
          }}
          type="button"
        >
          {t}
        </button>
      ))}
    </div>
  );
}
