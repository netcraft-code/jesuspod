import { useRef } from "react";
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
    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollLeft = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
    };

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

            <div className="scroll-container-wrapper">
                <button className="arrow-btn left-arrow" onClick={scrollLeft}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>

                <div className="live-section-scroll-row" ref={scrollRef}>
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

                <button className="arrow-btn right-arrow" onClick={scrollRight}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
            </div>
        </div>
    );
}
