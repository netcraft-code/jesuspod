import "./card.css";

interface Props {
  item: {
    title: string;
    imageUrl: string;
  };
  onClick?: () => void;
}

export default function CountryCard({ item, onClick }: Props) {
  return (
    <div className="country-card" onClick={onClick}>
      <div className="flag-circle">
        <img src={item.imageUrl} alt={item.title} />
      </div>
      <p className="country-title">{item.title}</p>
    </div>
  );
}
