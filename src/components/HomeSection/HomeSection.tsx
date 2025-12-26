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
}

export default function HomeSection({
    title,
    data,
    loading,
    onViewAll,
    onCardClick,
    showLiveBadge = false,
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
                {loading
                    ? [...Array(6)].map((_, i) => (
                        <div key={i} className="home-card-wrapper">
                            <SkeletonCard />
                        </div>
                    ))
                    : data.map((item) => (
                        <div key={item.id || item.url} className="home-card-wrapper">
                            <Card
                                item={item}
                                onClick={() => onCardClick && onCardClick(item)}
                                showLiveBadge={showLiveBadge}
                            />
                        </div>
                    ))}
            </div>
        </div>
    );
}
