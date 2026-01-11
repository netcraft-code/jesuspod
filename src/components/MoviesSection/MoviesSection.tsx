import { useRef } from "react";
import MovieCard from "./MovieCard";
import SkeletonCard from "../Skeletons/SkeletonCard";
import "./MoviesSection.css";

interface MoviesSectionProps {
    title: string;
    data: any[];
    loading?: boolean;
    onViewAll?: () => void;
    onCardClick?: (item: any) => void;
    onToggleSave?: (item: any, isSaved: boolean) => void;
    user?: any;
}

export default function MoviesSection({
    title,
    data,
    loading,
    onViewAll,
    onCardClick,
    onToggleSave,
    user
}: MoviesSectionProps) {
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
        <div className="movies-section-container">
            <div className="movies-section-header">
                <h1 className="movies-section-title">{title}</h1>
                {onViewAll && (
                    <span onClick={onViewAll} className="movies-view-all">
                        View All
                    </span>
                )}
            </div>

            <div className="movies-scroll-container-wrapper" style={{ position: 'relative' }}>
                <button className="arrow-btn left-arrow" onClick={scrollLeft}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>

                <div className="movies-section-scroll-row" ref={scrollRef}>
                    {loading
                        ? [...Array(6)].map((_, i) => (
                            <div key={i} className="movies-card-wrapper">
                                <SkeletonCard />
                            </div>
                        ))
                        : data.map((item) => (
                            <div key={item.id || item._id || Math.random()} className="movies-card-wrapper">
                                <MovieCard
                                    item={item}
                                    onClick={() => onCardClick && onCardClick(item)}
                                    isSaved={item.star?.includes(user?.uid)}
                                    onToggleSave={onToggleSave}
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
