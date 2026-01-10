import MovieCard from "./MovieCard";
import SkeletonCard from "../Skeletons/SkeletonCard";
import "./MoviesSection.css";

interface MoviesSectionProps {
    title: string;
    data: any[];
    loading?: boolean;
    onViewAll?: () => void;
    onCardClick?: (item: any) => void;
}

export default function MoviesSection({
    title,
    data,
    loading,
    onViewAll,
    onCardClick,
}: MoviesSectionProps) {
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

            <div className="movies-section-scroll-row">
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
                            />
                        </div>
                    ))}
            </div>
        </div>
    );
}
