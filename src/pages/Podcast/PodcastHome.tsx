import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import "./Podcast.css"

import { useState } from "react";
import Section from "../../components/Section/Section";
import CircleImageCard from "../../components/Cards/CircleImageCard";
import { categoryImages } from "../../assets/images/CatImages";
import usePageTitle from "../../hooks/usePageTitle";
import { togglePodcastSave } from "../../services/dataService";
import { refreshSavedPodcasts, togglePodcastSaveState } from "../../redux/dataSlice";
// import { images } from "../../assets/images";
// import { logEvent } from "firebase/analytics";
// import { analytics } from "../../services/firebase";


export default function PodcastHome() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const podcasts = useSelector((state: any) => state.data.podcasts);
    const user = useSelector((state: any) => state.auth.user);
    const [active, setActive] = useState<string>("Podcast");
    const [profileOpen, setProfileOpen] = useState<boolean>(false);
    usePageTitle("Podcast");
    // Get analytics-based podcast data from Redux
    const mostListenedPodcasts = useSelector((state: any) => state.data.mostListenedPodcasts) || [];
    const savedPodcasts = useSelector((state: any) => state.data.savedPodcasts) || [];
    // const newNoteworthyPodcasts = useSelector((state: any) => state.data.newNoteworthyPodcasts) || [];

    const [podcastCategory, setPodcastCategory] = useState<string>("");

    // unique categories
    const categories = Array.from(
        new Map(
            podcasts
                .filter((p: any) => p.category?.name)
                .map((p: any) => [
                    p.category.name.trim().toLowerCase(), // ✅ normalized key
                    {
                        ...p.category,
                        name: p.category.name.trim(), // ✅ display clean name
                    },
                ])
        ).values()
    );



    const filteredCategories = categories.filter((cat: any) =>
        cat.name.toLowerCase().includes(podcastCategory.toLowerCase())
    );

    const handleToggleSave = async (item: any, isSaved: boolean) => {
        if (!user?.uid) {
            alert("Please login to save podcasts");
            return;
        }

        // Optimistic Update
        dispatch(togglePodcastSaveState({ podcastId: item.id, userId: user.uid }));

        const success = await togglePodcastSave(item.id, user.uid, isSaved);
        if (success) {
            // Refresh saved list
            dispatch(refreshSavedPodcasts(user.uid) as any);
        } else {
            // Revert
            dispatch(togglePodcastSaveState({ podcastId: item.id, userId: user.uid }));
            alert("Failed to save podcast");
        }
    };

    // const handleShare = async () => {
    //     const shareUrl = window.location.href;
    //     const shareData = {
    //         title: "JesusPOD Podcast",
    //         text: "Listen to the best Christian podcasts on JesusPOD!",
    //         url: shareUrl,
    //     };

    //     try {
    //         if (navigator.share) {
    //             await navigator.share(shareData);
    //             logEvent(analytics, "Share_PodcastHome", {});
    //         } else {
    //             await navigator.clipboard.writeText(shareUrl);
    //             alert("Link copied to clipboard!");
    //         }
    //     } catch (err) {
    //         console.error("Error sharing:", err);
    //     }
    // };

    return (
        <div className="main-content">
            <Header
                active={active}
                setActive={setActive}
                profileOpen={profileOpen}
                setProfileOpen={setProfileOpen}
            />

            <div className="content">

                {/* TOP PODCAST */}
                <Section
                    title="Top Podcasts"
                    onViewAll={() => navigate("/all-podcast")}
                    data={mostListenedPodcasts}
                    onCardClick={(item) =>
                        navigate(`/podcastplayer/${item.id}`, {
                            state: { channel: item },
                        })
                    }
                    onToggleSave={handleToggleSave}
                    user={user}
                />

                {/* My Podcast (Favorites) */}
                <Section
                    title="My Podcast"
                    onViewAll={() => navigate("/all-podcast", { state: { filter: 'saved' } })}
                    data={savedPodcasts}
                    onCardClick={(item) =>
                        navigate(`/podcastplayer/${item.id}`, {
                            state: { channel: item },
                        })
                    }
                    onToggleSave={handleToggleSave}
                    user={user}
                    emptyMessage="Start saving podcasts to see them here ❤️"
                />


                <div className="search-radio-section">

                    <div className="search-radio-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <h2 className="sub-title">Search For Podcast</h2>
                            {/* <button
                                onClick={handleShare}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                                title="Share Podcast Page"
                            >
                                <img src={images.share} alt="share" style={{ width: 20, height: 20, filter: 'brightness(0) invert(1)' }} />
                            </button> */}
                        </div>

                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search podcast..."
                            value={podcastCategory}
                            onChange={(e) => setPodcastCategory(e.target.value)}
                        />
                    </div>
                    <div className="podcast-category-grid">
                        {filteredCategories.map((cat: any, index: number) => (
                            <CircleImageCard
                                key={cat.name}
                                title={cat.name}
                                localImage={categoryImages[index % categoryImages.length]}
                                onClick={() => {

                                    navigate("/podcast-category", {
                                        state: { category: cat.name },
                                    });
                                }}
                            />
                        ))}
                    </div>
                </div>

            </div>
            <Footer />
        </div>
    );
}


