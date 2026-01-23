import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../redux/store";
import { useState, useEffect, useCallback } from "react";
import YouTubePlayer from "./YouTubePlayer";
import { FaHeart, FaRegHeart, FaBookmark, FaRegBookmark, FaShare } from "react-icons/fa";
import type { ShortItemProps } from "../../types/shorts";
import { formatCount } from "../../services/shortsService";
import "./ShortItem.css";

export default function ShortItem({
    item,
    isActive,
    isSaved = false,
    onEnd,
    onLikeToggle,
    onSaveToggle,
    onViewIncrement,
}: ShortItemProps) {
    const user = useSelector((state: RootState) => state.auth.user);
    const navigate = useNavigate();

    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(isSaved);
    const [localLikeCount, setLocalLikeCount] = useState(item.likeCount || 0);
    const [hasViewCounted, setHasViewCounted] = useState(false);

    // Reset state when item changes
    useEffect(() => {
        setLocalLikeCount(item.likeCount || 0);
        setHasViewCounted(false);
    }, [item]);

    // Sync saved state with prop
    useEffect(() => {
        setSaved(isSaved);
    }, [isSaved]);

    // Handle like button click
    const handleLike = useCallback(async () => {
        if (!user) {
            alert("Please login to like shorts");
            return;
        }
        try {
            const newLikedState = !liked;
            setLiked(newLikedState);
            setLocalLikeCount((prev) => (newLikedState ? prev + 1 : prev - 1));
            await onLikeToggle(item.id, newLikedState);
        } catch (error) {
            console.error("Error toggling like:", error);
            // Revert on error
            setLiked(!liked);
            setLocalLikeCount((prev) => (liked ? prev + 1 : prev - 1));
        }
    }, [liked, item.id, onLikeToggle, user, navigate]);

    // Handle save button click
    const handleSave = useCallback(async () => {
        if (!user) {
            alert("Please login to save shorts");
            return;
        }
        try {
            const newSavedState = !saved;
            setSaved(newSavedState);
            await onSaveToggle(item.id, newSavedState);
        } catch (error) {
            console.error("Error toggling save:", error);
            // Revert on error
            setSaved(!saved);
        }
    }, [saved, item.id, onSaveToggle, user, navigate]);

    // Handle share button click
    const handleShare = useCallback(async () => {
        try {
            // Use youtubeUrl if available, otherwise construct from videoId
            const shareUrl = item.youtubeUrl || `https://www.youtube.com/watch?v=${item.youtubeVideoId}`;

            if (navigator.share) {
                await navigator.share({
                    title: item.title,
                    text: item.description,
                    url: shareUrl,
                });
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(shareUrl);
                alert("Link copied to clipboard!");
            }
        } catch (error) {
            console.error("Error sharing:", error);
        }
    }, [item]);

    // Handle video progress - count view when 3 seconds played
    const handleProgress = useCallback(
        (playedSeconds: number) => {
            if (!hasViewCounted && playedSeconds > 3 && isActive) {
                setHasViewCounted(true);
                onViewIncrement(item.id);
            }
        },
        [hasViewCounted, isActive, item.id, onViewIncrement]
    );

    // Handle video end
    const handleEnded = useCallback(() => {
        if (isActive && onEnd) {
            onEnd();
        }
    }, [isActive, onEnd]);

    // Get primary tag for display
    const getPrimaryTag = (tags?: string[]) => {
        if (!tags || tags.length === 0) return null;
        return tags[0];
    };

    const primaryTag = getPrimaryTag(item.tags);

    // Extract video ID from YouTube URL or use direct videoId
    const getVideoId = (): string => {
        // Priority 1: Use youtubeVideoId if available
        if (item.youtubeVideoId) {
            return item.youtubeVideoId;
        }

        // Priority 2: Extract from youtubeUrl
        if (item.youtubeUrl) {
            const url = item.youtubeUrl;

            // Handle /shorts/ URLs
            const shortsMatch = url.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
            if (shortsMatch) return shortsMatch[1];

            // Handle /watch?v= URLs
            const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
            if (watchMatch) return watchMatch[1];

            // Handle youtu.be URLs
            const youtubeMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
            if (youtubeMatch) return youtubeMatch[1];

            // Handle embed URLs
            const embedMatch = url.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
            if (embedMatch) return embedMatch[1];
        }

        return "";
    };

    const videoId = getVideoId();

    return (
        <div className="short-item">
            <div className="short-player-container">
                <YouTubePlayer
                    videoId={videoId}
                    isActive={isActive}
                    onProgress={handleProgress}
                    onEnded={handleEnded}
                />

                {/* Video Info Overlay */}
                <div className="short-overlay">
                    <div className="short-info">
                        <h3 className="short-title">
                            {item.title} {primaryTag && `#${primaryTag}`}
                        </h3>
                        <p className="short-description">{item.description}</p>
                        <p className="short-stats">
                            {item.viewCount ? `${formatCount(item.viewCount)} views` : ""}
                        </p>
                    </div>
                </div>
            </div>

            {/* Action Buttons - Outside the card */}
            <div className="short-actions">
                <button
                    className="short-action-btn"
                    onClick={handleLike}
                    aria-label={liked ? "Unlike" : "Like"}
                >
                    {liked ? (
                        <FaHeart className="icon-filled" />
                    ) : (
                        <FaRegHeart className="icon-outline" />
                    )}
                    <span className="action-text">{formatCount(localLikeCount)}</span>
                </button>

                <button
                    className="short-action-btn"
                    onClick={handleShare}
                    aria-label="Share"
                >
                    <FaShare className="icon-outline" />
                    <span className="action-text">Share</span>
                </button>

                <button
                    className="short-action-btn"
                    onClick={handleSave}
                    aria-label={saved ? "Unsave" : "Save"}
                >
                    {saved ? (
                        <FaBookmark className="icon-filled" />
                    ) : (
                        <FaRegBookmark className="icon-outline" />
                    )}
                    <span className="action-text">Save</span>
                </button>
            </div>
        </div>
    );
}
