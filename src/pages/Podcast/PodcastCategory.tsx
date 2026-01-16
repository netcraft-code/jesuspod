import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Card from "../../components/Cards/Card";
import { useState } from "react";
import { images } from "../../assets/images";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../services/firebase";

export default function PodcastCategory() {
    const { state } = useLocation();
    const [searchParams] = useSearchParams();

    // Get category from state OR url params
    const category = state?.category || searchParams.get("category");

    const [active, setActive] = useState<string>("Podcast");
    const navigate = useNavigate();
    const [profileOpen, setProfileOpen] = useState<boolean>(false);

    const podcasts = useSelector((s: any) =>
        s.data.podcasts.filter(
            (p: any) =>
                p.category?.name?.toLowerCase() === category?.toLowerCase()
        )
    );

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/podcast-category?category=${encodeURIComponent(category)}`;
        const shareData = {
            title: `${category} Podcasts`,
            text: `Check out these ${category} podcasts on JesusPOD!`,
            url: shareUrl,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                logEvent(analytics, "Share_Category", {
                    category: category,
                });
            } else {
                await navigator.clipboard.writeText(shareUrl);
                alert("Link copied to clipboard!");
            }
        } catch (err) {
            console.error("Error sharing:", err);
        }
    };

    return (
        <>
            <Header
                active={active}
                setActive={setActive}
                profileOpen={profileOpen}
                setProfileOpen={setProfileOpen}
            />

            <div className="content">
                <div className="podcast-category-header">
                    <h2>{category}</h2>
                    <button
                        className="share-btn"
                        onClick={handleShare}
                        title="Share Category"
                    >
                        <img src={images.share} alt="share" />
                        <span>Share</span>
                    </button>
                </div>

                <div className="card-grid">
                    {podcasts.map((item: any) => (
                        <Card key={item.id} item={item} onClick={(item) =>
                            navigate(`/podcastplayer/${item.id}`, {
                                state: { channel: item },
                            })
                        } />
                    ))}
                </div>
            </div>
            <Footer />
        </>
    );
}
