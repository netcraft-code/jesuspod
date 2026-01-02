import Card from "../Cards/Card";
import SkeletonCard from "../Skeletons/SkeletonCard";
import "./HomeSection.css";

interface HomeSectionProps {
    title: string;
    data: any[];
    loading?: boolean;
    onViewAll?: () => void;
    onCardClick?: (item: any) => void;
    showLiveBadge?: boolean;
    cardVariant?: "standard" | "large" | "video";
    onToggleSave?: (item: any, isSaved: boolean) => void;
    user?: any;
    emptyMessage?: string;
}

export default function HomeSection({
    title,
    data,
    loading,
    onViewAll,
    onCardClick,
    showLiveBadge = false,
    cardVariant = "standard",
    onToggleSave,
    user,
    emptyMessage
}: HomeSectionProps) {
    return (
        <div className="home-section-container">
            <div className="home-section-header">
                <h1 className="home-section-title">{title}</h1>
                {onViewAll && (
                    <span onClick={onViewAll} className="home-view-all">
                        View All
                    </span>
                )}
            </div>

            <div className="home-section-scroll-row">
                {loading ? (
                    [...Array(6)].map((_, i) => (
                        <div key={i} className={`home-card-wrapper ${cardVariant === 'large' ? 'large-wrapper' : ''}`}>
                            <SkeletonCard variant={cardVariant} />
                        </div>
                    ))
                ) : data.length > 0 ? (
                    data.map((item) => (
                        <div key={item.id || item.url} className={`home-card-wrapper ${cardVariant === 'large' ? 'large-wrapper' : cardVariant === 'video' ? 'video-wrapper' : ''}`}>
                            <Card
                                item={item}
                                onClick={() => onCardClick && onCardClick(item)}
                                showLiveBadge={showLiveBadge}
                                variant={cardVariant}
                                isSaved={item.star?.includes(user?.uid)}
                                onToggleSave={onToggleSave}
                            />
                        </div>
                    ))
                ) : (
                    <div style={{ padding: '20px 0', color: '#999', fontSize: '14px' }}>
                        {emptyMessage || "No items to display"}
                    </div>
                )}
            </div>
        </div>
    );
}
