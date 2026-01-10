import "./MoviesSection.css";

interface MovieCardProps {
    item: any;
    onClick: () => void;
    isActive?: boolean;
    variant?: 'default' | 'sidebar';
}

export default function MovieCard({ item, onClick, isActive = false, variant = 'default' }: MovieCardProps) {
    // Movies don't have duration currently, but we can add logic if needed.
    // For now omitting the duration badge found in LiveCard.

    const thumbnail = item.image; // Field from user object
    const title = item.name; // Field from user object
    const category = item.category || ''; // Field from user object

    return (
        <div
            className={`movies-card ${variant === 'sidebar' ? 'movies-card-sidebar' : ''} ${isActive ? 'active' : ''}`}
            onClick={onClick}
            role="button"
            tabIndex={0}
        >
            <img
                src={thumbnail}
                alt={title}
                className="movies-card-image"
            />

            {/* Gradient Overlay */}
            <div className="movies-card-gradient" />

            {/* Content at Bottom */}
            <div className="movies-card-content">
                <h4 className="movies-card-title">{title}</h4>
                {category && (
                    <p className="movies-card-subtitle">{category}</p>
                )}
            </div>
        </div>
    );
}
