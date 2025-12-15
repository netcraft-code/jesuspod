import "./card.css";

/* 🔹 Types */
export interface RadioItem {
  id: string;
  title: string;
  imageUrl?: string;
  type?: string;
}


interface RadioCardProps {
  item: RadioItem;
  onClick: (item: RadioItem) => void;
}

export default function RadioCard({
  item,
  onClick,
}: RadioCardProps) {
  return (
    <div
      className="radio-card"
      onClick={() => onClick(item)}
      role="button"
      tabIndex={0}
    >
      <div className="radio-img-wrapper">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="radio-img"
        />

        {/* DARK + RED OVERLAY */}
        <div className="radio-overlay" />

        {/* TITLE */}
        <h4 className="radio-title">{item.title}</h4>
      </div>
    </div>
  );
}
