import LiveCard from "./LiveCard";
import SkeletonCard from "../Skeletons/SkeletonCard";
import "./LiveSection.css";

interface LiveSectionProps {
    title: string;
    data: any[];
    loading?: boolean;
    onViewAll?: () => void;
    onCardClick?: (item: any) => void;
}

export default function LiveSection({
    title,
    data,
    loading,
    onViewAll,
    onCardClick,
}: LiveSectionProps) {
    return (
        <div className="live-section-container">
            <div className="live-section-header">
                <h1 className="live-section-title">{title}</h1>
                {onViewAll && (
                    <span onClick={onViewAll} className="live-view-all">
                        View All
                    </span>
                )}
            </div>

            <div className="live-section-scroll-row">
                {loading
                    ? [...Array(6)].map((_, i) => (
                        <div key={i} className="live-card-wrapper">
                            <SkeletonCard />
                        </div>
                    ))
                    : data.map((item) => (
                        <div key={item.id || item._id} className="live-card-wrapper">
                            <LiveCard
                                item={item}
                                onClick={() => onCardClick && onCardClick(item)}
                            />
                        </div>
                    ))}
            </div>
        </div>
    );
}
