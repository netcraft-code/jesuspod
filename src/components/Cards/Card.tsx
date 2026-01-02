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
  variant?: "standard" | "large" | "video";
  isSaved?: boolean;
  onToggleSave?: (item: Item, status: boolean) => void;
}

export default function Card({
  item,
  onClick,
  showLiveBadge = false,
  variant = "standard",
  isSaved = false,
  onToggleSave
}: Card) {
  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (onToggleSave) {
      onToggleSave(item, isSaved);
    }
  };

  return (
    <div
      className={`radio-card ${variant}`}
      onClick={() => onClick(item)}
      role="button"
      tabIndex={0}
    >
      <div className="radio-img-wrapper">
        {variant === "large" && (
          <div
            className="card-bg-blur"
            style={{
              backgroundImage: `url(${item.imageUrl || item.thumbnail})`,
            }}
          />
        )}
        <img
          src={item.imageUrl || item.thumbnail}
          alt={item.title}
          className="radio-img"
        />

        {/* OVERLAYS */}
        {variant === "video" ? (
          <div className="video-card-overlay" />
        ) : (
          <div className="radio-overlay" />
        )}

        {/* LIVE BADGE */}
        {showLiveBadge && (
          <div className="card-live-badge">
            <span className="card-live-dot"></span>
            LIVE
          </div>
        )}

        {/* VIDEO DURATION BADGE (Right Bottom) */}
        {variant === "video" && (
          <div className="video-duration-badge">
            <span className="play-icon">▶</span> 51 min
          </div>
        )}

        {/* SAVE ICON (Left Top) */}
        {variant === "video" && (
          <div
            className="video-save-badge"
            onClick={handleHeartClick}
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              zIndex: 10,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 0, 0, 0.6)',
              padding: 6,
              borderRadius: '50%',
              backdropFilter: 'blur(4px)'
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={isSaved ? "red" : "none"}
              stroke={isSaved ? "red" : "white"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </div>
        )}

        {/* TITLE */}
        <h4 className={`radio-title ${variant === "video" ? "video-title" : ""}`}>
          {item.title}
          {variant === "video" && <span className="video-subtitle">What's it like when everyone...</span>}
        </h4>
      </div>
    </div>
  );
}
