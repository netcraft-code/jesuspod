import { useEffect, useState, useRef } from "react";
import { fetchBanners } from "../../services/dataService";
import "./Banner.css";
// import { useNavigate } from "react-router-dom";
interface BannerProps {
  bannerType?: string;
}

export default function Banner({
  bannerType = "home",
}: BannerProps) {
    const [banners, setBanners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    // const navigate = useNavigate();

useEffect(() => {
  const loadBanners = async () => {
    try {
      const data = await fetchBanners();

      const filteredBanners = data.filter(
        (item: any) =>
          bannerType === "home"
            ? (item.bannerType || "home") === "home"
            : item.bannerType === bannerType
      );

      setBanners(filteredBanners);
    } catch (error) {
      console.error("Failed to load banners", error);
    } finally {
      setLoading(false);
    }
  };

  loadBanners();
}, [bannerType]);

    const scrollLeft = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: -window.innerWidth / 1.5, behavior: "smooth" });
        }
    };

    const scrollRight = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: window.innerWidth / 1.5, behavior: "smooth" });
        }
    };

    if (loading) return null; // Or a skeleton if preferred
    if (banners.length === 0) return null;

    const handleBannerClick = (item: any) => {
        // Navigation logic based on data type/fields
        // Matching archive logic somewhat or new logic
        if (item.videoUrl) {
            // Logic for video
            // Maybe open modal or navigate
        } else if (item.PromoteUrl) {
            // Linking logic
            window.open(item.PromoteUrl, "_blank");
        } else if (item.link || item.url) {
            window.open(item.link || item.url, "_blank");
        }
    };

    return (
        <div className="banner-wrapper">
            <button className="banner-arrow left-arrow" onClick={scrollLeft}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            </button>

            <div className="banner-container" ref={scrollRef}>
                {banners.map((item: any, index: number) => (
                    <div key={item._id || index} className="banner-item" onClick={() => handleBannerClick(item)}>
                        <img
                            src={item.imageUrl}
                            alt="Banner"
                            className="banner-image"
                            fetchPriority={index === 0 ? "high" : "auto"}
                            onError={(e: any) => e.target.style.display = 'none'}
                        />
                        <div className="banner-gradient"></div>
                        {/* Optional text overlay if data has title */}
                        {/* <div className="banner-content">
                <h3>{item.title}</h3>
            </div> */}
                    </div>
                ))}
            </div>

            <button className="banner-arrow right-arrow" onClick={scrollRight}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </button>
        </div>
    );
}
