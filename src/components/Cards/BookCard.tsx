
import "./card.css";
import React from "react";

export interface BookItem {
    id?: string;
    url?: string;
    title: string;
    imageUrl?: string;
    thumbnail?: string;
    author?: string; // Although not in the interface initially, good to have for future
    category?: string;
}

interface BookCardProps {
    item: BookItem;
    onClick: (item: BookItem) => void;
    isSaved?: boolean;
    onToggleSave?: (item: BookItem, status: boolean) => void;
    subtitle?: string;
}

import { useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
import type { RootState } from "../../redux/store";

export default function BookCard({
    item,
    onClick,
    isSaved = false,
    onToggleSave,
    subtitle
}: BookCardProps) {
    const user = useSelector((state: RootState) => state.auth.user);
    // const navigate = useNavigate();

    const handleHeartClick = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!user) {
            alert("Please login to like this book");
            return;
        }

        if (onToggleSave) {
            onToggleSave(item, isSaved);
        }
    };

    return (
        <div className="book-card-container">
            <div
                className="book-card"
                onClick={() => onClick(item)}
            >
                <div className="book-img-wrapper">
                    <img
                        src={item.imageUrl || item.thumbnail}
                        alt={item.title}
                        className="book-img"
                        loading="lazy"
                    />
                </div>
            </div>

            {/* Title Below Card */}
            <h4 className="book-title" onClick={() => onClick(item)}>{item.title}</h4>

            {/* Subtitle (Type) */}
            {subtitle && (
                <div style={{ fontSize: '11px', color: '#999', marginTop: '2px', textTransform: 'uppercase' }}>
                    {subtitle}
                </div>
            )}

            {/* Save Icon Below Card */}
            {onToggleSave && (
                <div className="book-action-row">
                    <div
                        className="book-save-btn"
                        onClick={handleHeartClick}
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill={isSaved ? "#e63946" : "none"} // Amazon-ish red/pink for heart or standard red
                            stroke={isSaved ? "#e63946" : "#555"}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        <span className="save-text">{isSaved ? "Liked" : "Like"}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
