
import Card from "../Cards/Card";

interface SectionProps {
  title: string;
  data: any[];
  onViewAll?: () => void;
  onCardClick?: (item: any) => void;
}

export default function Section({
  title,
  data,
  onViewAll,
  onCardClick,
}: SectionProps) {


  return (
    <div className="section">
      <div className="section-header">
        <h1>{title}</h1>

        {onViewAll && (
          <span onClick={onViewAll} className="view-all">
            View All
          </span>
        )}
      </div>

      <div className="section-row">
        {data.map((item) => (
          <Card
            key={item.id}
            item={item}
            onClick={() =>
              onCardClick
                ? onCardClick(item)
                : alert("onclick not calling")
            }
          />
        ))}
      </div>
    </div>
  );
}
