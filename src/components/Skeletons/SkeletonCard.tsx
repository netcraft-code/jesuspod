import "./SkeletonCard.css";
import "../Cards/card.css"; // Reuse existing card styles

export default function SkeletonCard() {
    return (
        <div className="radio-card skeleton-card">
            <div className="radio-img-wrapper skeleton-img-wrapper shimmer">
                <div className="skeleton-title-bar shimmer"></div>
            </div>
        </div>
    );
}
