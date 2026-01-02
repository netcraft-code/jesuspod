import React from "react";
import "./ChannelCard.css";

/* 🔹 Types (Reusing similar types for consistency) */
export interface Item {
    id?: string;
    url?: string;
    title: string;
    imageUrl?: string;
    thumbnail?: string;
    type?: string;
}

interface ChannelCardProps {
    item: Item;
    onClick: (item: Item) => void;
    isSaved?: boolean;
    onToggleSave?: (item: Item, status: boolean) => void;
    variant?: string; // Kept for compatibility if passed, though this card dictates its own style
}

export default function ChannelCard({
    item,
    onClick,
    isSaved = false,
    onToggleSave
}: ChannelCardProps) {

    const handleHeartClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        if (onToggleSave) {
            onToggleSave(item, isSaved);
        }
    };

    return (
        <div
            className="channel-card-wrapper"
            onClick={() => onClick(item)}
            role="button"
            tabIndex={0}
        >
            <div className="channel-img-wrapper">
                {/* Blurred Background */}
                <div
                    className="card-bg-blur"
                    style={{
                        backgroundImage: `url(${item.imageUrl || item.thumbnail})`,
                    }}
                />

                {/* Gradient Overlay - Moved before image for natural z-indexing */}
                <div className="channel-card-overlay" />

                <img
                    src={item.imageUrl || item.thumbnail}
                    alt={item.title}
                    className="channel-img"
                />

                {/* DURATION BADGE (Mocked or Real if avail) */}
                {/* <div className="channel-duration-badge">
                    <span className="play-icon-small">▶</span> 51 min
                </div> */}

                {/* SAVE ICON */}
                <div
                    className="channel-save-badge"
                    onClick={handleHeartClick}
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

                {/* TITLE */}
                <h4 className="channel-title">
                    {item.title}
                </h4>
            </div>
        </div>
    );
}
