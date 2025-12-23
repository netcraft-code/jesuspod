import "./card.css";

interface Props {
  title: string;
  imageUrl?: string;          // dynamic (API)
  localImage?: string;        // static (assets)
  onClick?: () => void;
}

export default function CircleImageCard({
  title,
  imageUrl,
  localImage,
  onClick,
}: Props) {
  return (
    <div className="country-card" onClick={onClick}>
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
