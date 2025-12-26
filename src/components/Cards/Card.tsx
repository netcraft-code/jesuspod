import "./card.css";
// import { getTimeAgo } from "../../services/liveService";

/* 🔹 Types */
export interface Item {
  id?: string;
  url?: string;
  title: string;
  imageUrl?: string;
  thumbnail?: string;
  type?: string;
  publishedAt?: {
    _seconds: number;
  };
}


interface Card {
  item: Item;
  onClick: (item: Item) => void;
  showLiveBadge?: boolean;
}

export default function Card({
  item,
  onClick,
  showLiveBadge = false,
}: Card) {
  return (
    <div
      className="radio-card"
      onClick={() => onClick(item)}
      role="button"
      tabIndex={0}
    >
      <div className="radio-img-wrapper">
        <img
          src={item.imageUrl || item.thumbnail}
          alt={item.title}
          className="radio-img"
        />

        {/* DARK + RED OVERLAY */}
        <div className="radio-overlay" />

        {/* LIVE BADGE */}
        {showLiveBadge && (
          <div className="card-live-badge">
            <span className="card-live-dot"></span>
            LIVE
          </div>
        )}

        {/* TITLE */}
        <h4 className="radio-title">{item.title}</h4>
      </div>
    </div>
  );
}
