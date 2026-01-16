import "./card.css";
import { images } from "../../assets/images";

interface Props {
  title: string;
  imageUrl?: string;          // dynamic (API)
  localImage?: string;        // static (assets)
  onClick?: () => void;
  onShare?: () => void;
}

export default function CircleImageCard({
  title,
  imageUrl,
  localImage,
  onClick,
  onShare,
}: Props) {
  return (
    <div className="country-card" onClick={onClick}>
      {onShare && (
        <button
          className="country-share-btn"
          onClick={(e) => {
            e.stopPropagation();
            onShare();
          }}
          title="Share"
        >
          <img src={images.share} alt="share" />
        </button>
      )}
      <div className="flag-circle">
        <img
          src={imageUrl || localImage}
          alt={title}
        />
      </div>
      <p className="country-title">{title}</p>
    </div>
  );
}
