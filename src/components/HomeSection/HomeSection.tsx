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
    isBook = false
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

            <div className={`home-section-scroll-row ${isBook ? 'books-row' : ''}`}>
                {loading ? (
                    [...Array(6)].map((_, i) => (
                        <div key={i} className={`home-card-wrapper ${cardVariant === 'large' ? 'large-wrapper' : cardVariant === 'channel' ? 'channel-card-wrapper' : ''}`}>
                            <SkeletonCard variant={cardVariant === 'channel' ? 'video' : cardVariant} />
                        </div>
                    ))
                ) : data.length > 0 ? (
                    data.map((item) => (
                        isBook ? (
                            <BookCard
                                key={item.id}
                                item={item}
                                onClick={(itm) => onCardClick && onCardClick(itm)}
                                isSaved={item.star?.includes(user?.uid)}
                                onToggleSave={onToggleSave}
                            />
                        ) : (
                            <div key={item.id || item.url} className={`home-card-wrapper ${cardVariant === 'large' ? 'large-wrapper' : cardVariant === 'video' ? 'video-wrapper' : cardVariant === 'channel' ? 'channel-card-wrapper' : ''}`}>
                                {cardVariant === "channel" ? (
                                    <ChannelCard
                                        item={item}
                                        onClick={(itm) => onCardClick && onCardClick(itm)}
                                        isSaved={item.star?.includes(user?.uid)}
                                        onToggleSave={onToggleSave}
                                    />
                                ) : (
                                    <Card
                                        item={item}
                                        onClick={() => onCardClick && onCardClick(item)}
                                        showLiveBadge={showLiveBadge}
                                        variant={cardVariant}
                                        isSaved={item.star?.includes(user?.uid)}
                                        onToggleSave={onToggleSave}
                                    />
                                )}
                            </div>
                        )
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
