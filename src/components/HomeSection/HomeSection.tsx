import { useRef } from "react";
import Card from "../Cards/Card";
import ChannelCard from "../../pages/Channels/ChannelCard";
import BookCard from "../Cards/BookCard";
import SkeletonCard from "../Skeletons/SkeletonCard";
import "./HomeSection.css";

interface HomeSectionProps {
    title: string;
    data: any[];
    loading?: boolean;
    onViewAll?: () => void;
    onCardClick?: (item: any) => void;
    showLiveBadge?: boolean;
    cardVariant?: "standard" | "large" | "video" | "channel";
    onToggleSave?: (item: any, isSaved: boolean) => void;
    user?: any;
    emptyMessage?: string;
    isBook?: boolean;
    showFav?: boolean;
    showShare?: boolean;
    onShare?: (item: any) => void;
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
    emptyMessage,
    isBook = false,
    showFav = true,
    showShare = false,
    onShare
}: HomeSectionProps) {
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
        <div className="home-section-container">
            <div className="home-section-header">
                <h1 className="home-section-title">{title}</h1>
                {onViewAll && (
                    <span onClick={onViewAll} className="home-view-all">
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

                <div
                    className={`home-section-scroll-row ${isBook ? 'books-row' : ''}`}
                    ref={scrollRef}
                >
                    {loading ? (
                        [...Array(6)].map((_, i) => (
                            <div key={i} className={`home-card-wrapper ${cardVariant === 'large' ? 'large-wrapper' : cardVariant === 'channel' ? 'channel-card-wrapper' : ''}`}>
                                <SkeletonCard variant={cardVariant === 'channel' ? 'video' : cardVariant} />
                            </div>
                        ))
                    ) : data.length > 0 ? (
                        data.map((item) => {
                            // Check for entityType (Mixed Content) or fall back to props
                            const type = item.entityType; // 'Book', 'Channel', 'Radio', 'Podcast'

                            if (type === 'Book' || isBook) {
                                return (
                                    <BookCard
                                        key={item.id}
                                        item={item}
                                        onClick={(itm) => onCardClick && onCardClick(itm)}
                                        isSaved={item.star?.includes(user?.uid)}
                                        onToggleSave={onToggleSave}
                                        subtitle={type}
                                    />
                                );
                            }

                            // Determine render content for non-books
                            const renderContent = () => {
                                if (type === 'Channel' || cardVariant === "channel") {
                                    return (
                                        <ChannelCard
                                            item={item}
                                            onClick={(itm) => onCardClick && onCardClick(itm)}
                                            isSaved={item.star?.includes(user?.uid)}
                                            onToggleSave={onToggleSave}
                                            subtitle={type}
                                            showFav={showFav}
                                            showShare={showShare}
                                            onShare={onShare}
                                        />
                                    );
                                }
                                // Default Card (Radio/Podcast/Video/Standard)
                                return (
                                    <Card
                                        item={item}
                                        onClick={() => onCardClick && onCardClick(item)}
                                        showLiveBadge={showLiveBadge}
                                        variant={type === 'Channel' ? 'video' : cardVariant} // If Type is Channel but caught here, treat as video variant?? No, handled above. Just use cardVariant.
                                        isSaved={item.star?.includes(user?.uid)}
                                        onToggleSave={onToggleSave}
                                        subtitle={type}
                                    />
                                );
                            };

                            return (
                                <div key={item.id || item.url} className={`home-card-wrapper ${cardVariant === 'large' ? 'large-wrapper' : cardVariant === 'video' ? 'video-wrapper' : cardVariant === 'channel' ? 'channel-card-wrapper' : ''}`}>
                                    {renderContent()}
                                </div>
                            );
                        })
                    ) : (
                        <div style={{ padding: '20px 0', color: '#999', fontSize: '14px' }}>
                            {emptyMessage || "No items to display"}
                        </div>
                    )}
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
