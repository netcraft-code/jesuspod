
import Card from "../Cards/Card";
import BookCard from "../Cards/BookCard";

interface SectionProps {
  title: string;
  data: any[];
  onViewAll?: () => void;
  onCardClick?: (item: any) => void;
  isBook?: boolean;
  onToggleSave?: (item: any, isSaved: boolean) => void;
  user?: any;
  emptyMessage?: string;
}

export default function Section({
  title,
  data,
  onViewAll,
  onCardClick,
  isBook = false,
  onToggleSave,
  user
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
            isBook ? (
              <BookCard
                key={item.id}
                item={item}
                onClick={() => onCardClick && onCardClick(item)}
                isSaved={item.star?.includes(user?.uid)}
                onToggleSave={onToggleSave}
              />
            ) : (
              <Card
                key={item.id}
                item={item}
                onClick={() =>
                  onCardClick
                    ? onCardClick(item)
                    : alert("onclick not calling")
                }
                isSaved={item.star?.includes(user?.uid)} // Check if saved
                onToggleSave={onToggleSave} // Pass handler
              />
            )
          ))
        ) : (
          <p style={{ color: '#888', padding: '20px' }}>No data available</p>
        )}
      </div>
    </div>
  );
}
