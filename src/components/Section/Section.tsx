
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
        {data && data.length > 0 ? (
          data.map((item) => (
            <Card
              key={item.id}
              item={item}
              onClick={() =>
                onCardClick
                  ? onCardClick(item)
                  : alert("onclick not calling")
              }
            />
          ))
        ) : (
          <p style={{ color: '#888', padding: '20px' }}>No data available</p>
        )}
      </div>
    </div>
  );
}
