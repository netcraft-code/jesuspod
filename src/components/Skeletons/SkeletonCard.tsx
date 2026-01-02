import "./SkeletonCard.css";
import "../Cards/card.css"; // Reuse existing card styles

interface SkeletonProps {
    variant?: "standard" | "large" | "video";
}

export default function SkeletonCard({ variant = "standard" }: SkeletonProps) {
    return (
        <div className={`radio-card skeleton-card ${variant}`}>
            <div className="radio-img-wrapper skeleton-img-wrapper shimmer">
                <div className="skeleton-title-bar shimmer"></div>
            </div>
        </div>
    );
}
