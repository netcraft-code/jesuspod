import React from "react";
import "./MoviesSection.css";

interface MovieCardProps {
    item: any;
    onClick: () => void;
    isActive?: boolean;
    variant?: 'default' | 'sidebar' | 'channel'; // Added 'channel' to match standard usages or keep simple
    isSaved?: boolean;
    onToggleSave?: (item: any, status: boolean) => void;
}

export default function MovieCard({
    item,
    onClick,
    isActive = false,
    variant = 'default',
    isSaved = false,
    onToggleSave
}: MovieCardProps) {
    const thumbnail = item.image || item.imageUrl; // Support both
    const title = item.name || item.title;
    const category = item.category || '';

    const handleHeartClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        if (onToggleSave) {
            onToggleSave(item, isSaved);
        }
    };

    return (
        <div
            className={`movies-card ${variant === 'sidebar' || variant === 'channel' ? 'movies-card-sidebar' : ''} ${isActive ? 'active' : ''}`}
            onClick={onClick}
            role="button"
            tabIndex={0}
        >
            <img
                src={thumbnail}
                alt={title}
                className="movies-card-image"
            />

            {/* Gradient Overlay */}
            <div className="movies-card-gradient" />

            {/* SAVE ICON -- Only show if onToggleSave is provided */}
            {onToggleSave && (
                <div
                    className="movie-save-badge"
                    onClick={handleHeartClick}
                >
                    <svg
                        width="20"
                        height="20"
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

            {/* Content at Bottom */}
            <div className="movies-card-content">
                <h4 className="movies-card-title">{title}</h4>
                {category && (
                    <p className="movies-card-subtitle">{category}</p>
                )}
            </div>
        </div>
    );
}
