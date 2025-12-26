import "./LiveCard.css";

interface LiveCardProps {
    title: string;
    imageUrl: string;
    onClick: () => void;
}

export default function LiveCard({ title, imageUrl, onClick }: LiveCardProps) {
    return (
        <div className="live-card-home" onClick={onClick}>
            <div className="live-card-home-image-container">
                <img
                    src={imageUrl}
                    alt={title}
                    className="live-card-home-image"
                />
                <div className="live-badge-home">
                    <span className="live-dot-home"></span>
                    LIVE
                </div>
            </div>
            <div className="live-card-home-info">
                <h3 className="live-card-home-title">{title}</h3>
            </div>
        </div>
    );
}
