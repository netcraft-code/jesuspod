import "./card.css";

/* 🔹 Types */
export interface Item {
  id: string;
  title: string;
  imageUrl?: string;
  type?: string;
}


interface Card {
  item: Item;
  onClick: (item: Item) => void;
}

export default function Card({
  item,
  onClick,
}: Card) {
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
