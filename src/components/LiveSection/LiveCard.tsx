import "./LiveSection.css";

interface LiveCardProps {
    item: any;
    onClick: () => void;
    isActive?: boolean;
    variant?: 'default' | 'sidebar';
}

export default function LiveCard({ item, onClick, isActive = false, variant = 'default' }: LiveCardProps) {
    // Calculate duration from liveStartTime
    const calculateDuration = (startTime: any): string => {
        if (!startTime) return '51 min'; // Fallback

        try {
            const now = new Date();
            const start = new Date(startTime);
            const diffMinutes = Math.floor((now.getTime() - start.getTime()) / 1000 / 60);

            if (diffMinutes < 1) return 'Just started';
            if (diffMinutes < 60) return `${diffMinutes} min`;

            const hours = Math.floor(diffMinutes / 60);
            const minutes = diffMinutes % 60;
            return `${hours}h ${minutes}m`;
        } catch (error) {
            return '51 min';
        }
    };

    const duration = calculateDuration(item.liveStartTime);
    const thumbnail = item.liveThumbnail || item.imageUrl || item.image;
    const title = item.liveTitle || item.title;
    const channelName = item.name || '';

    return (
        <div
            className={`live-card ${variant === 'sidebar' ? 'live-card-sidebar' : ''} ${isActive ? 'active' : ''}`}
            onClick={onClick}
            role="button"
            tabIndex={0}
        >
            <img
                src={thumbnail}
                alt={title}
                className="live-card-image"
            />

            {/* Gradient Overlay */}
            <div className="live-card-gradient" />

            {/* Duration Badge */}
            <div className="live-duration-badge">
                <span className="duration-dot"></span>
                {duration}
            </div>

            {/* Content at Bottom */}
            <div className="live-card-content">
                <h4 className="live-card-title">{title}</h4>
                {channelName && (
                    <p className="live-card-subtitle">{channelName}</p>
                )}
            </div>
        </div>
    );
}
