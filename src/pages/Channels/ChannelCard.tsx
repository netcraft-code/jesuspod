import React from "react";
import "./ChannelCard.css";
import { images } from "../../assets/images";

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
    variant?: string;
    subtitle?: string;
    showFav?: boolean;
    showShare?: boolean;
    onShare?: (item: Item) => void;
}

export default function ChannelCard({
    item,
    onClick,
    isSaved = false,
    onToggleSave,
    subtitle,
    showFav = true,
    showShare = false,
    onShare
}: ChannelCardProps) {

    const handleHeartClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        if (onToggleSave) {
            onToggleSave(item, isSaved);
        }
    };

    const handleShareClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onShare) {
            onShare(item);
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

                {/* SAVE ICON */}
                {showFav && (
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
                )}

                {/* SHARE ICON */}
                {showShare && (
                    <div
                        className="channel-save-badge"
                        style={{ right: '12px', left: 'auto' }} // Position right
                        onClick={handleShareClick}
                    >
                        <img src={images.share} alt="share" />

                    </div>
                )}

                {/* TITLE */}
                <div style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px', zIndex: 2 }}>
                    <h4 className="channel-title" style={{ margin: 0 }}>
                        {item.title}
                    </h4>
                    {subtitle && (
                        <div
                            style={{
                                fontSize: '11px',
                                fontWeight: '400',
                                color: 'rgba(255,255,255,0.8)',
                                marginTop: '2px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}
                        >
                            {subtitle}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
