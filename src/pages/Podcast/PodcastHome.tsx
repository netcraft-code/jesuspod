import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import "./Podcast.css"

import { useState } from "react";
import HomeSection from "../../components/HomeSection/HomeSection";
import CircleImageCard from "../../components/Cards/CircleImageCard";
import { categoryImages } from "../../assets/images/CatImages";
import usePageTitle from "../../hooks/usePageTitle";
import { togglePodcastSave } from "../../services/dataService";

import { refreshSavedPodcasts, togglePodcastSaveState } from "../../redux/dataSlice";
import { images } from "../../assets/images";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../services/firebase";
import PageInfo from "../../components/UI/PageInfo";


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

    const [searchTerm, setSearchTerm] = useState<string>("");

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
    ).sort((a: any, b: any) => a.name.localeCompare(b.name));



    // --- GLOBAL SEARCH FILTERING ---
    // Deduplicate most listened podcasts to avoid key collisions

    const filteredMostListened = mostListenedPodcasts.filter((item: any) =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredSaved = savedPodcasts.filter((item: any) =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // const filteredCategories = categories.filter((cat: any) =>
    //     cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    // );

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

    const handleCategoryShare = async (categoryName: string) => {
        const shareUrl = `${window.location.origin}/podcast-category?category=${encodeURIComponent(categoryName)}`;
        const shareData = {
            title: `${categoryName} Podcasts`,
            text: `Check out these ${categoryName} podcasts on JesusPOD!`,
            url: shareUrl,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                logEvent(analytics, "Share_Category", { category: categoryName });
            } else {
                await navigator.clipboard.writeText(shareUrl);
                alert("Link copied to clipboard!");
            }
        } catch (err) {
            console.error("Error sharing:", err);
        }
    };

    const handleSharePage = async () => {
        const shareUrl = window.location.href;
        const shareData = {
            title: "JesusPOD Podcast",
            text: "Listen to the best Christian podcasts on JesusPOD!",
            url: shareUrl,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                logEvent(analytics, "Share_PodcastHome", {});
            } else {
                await navigator.clipboard.writeText(shareUrl);
                alert("Link copied to clipboard!");
            }
        } catch (err) {
            console.error("Error sharing:", err);
        }
    };
    console.log("filteredMostListened  check", filteredMostListened)
    return (
        <div className="main-content">
            <Header
                active={active}
                setActive={setActive}
                profileOpen={profileOpen}
                setProfileOpen={setProfileOpen}
            />

            <div className="content">

                {/* Header Row: Page Info + Search/Share */}
                <div className="page-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1', minWidth: '300px' }}>
                        <PageInfo
                            title="Subscribe to Christian Podcasts"
                            description="Follow your favorite podcasters and get daily updates across ten specific categories. Whether you are looking for Bible study, family advice, or leadership training, you can subscribe to specific shows to stay consistent with your growth. Our library includes both well-known ministries and new voices to ensure your feed is always filled with the Word."
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
                        <button
                            className="share-btn"
                            onClick={handleSharePage}
                            title="Share Podcast Page"
                        >
                            <img src={images.share} alt="share" />
                            <span>Share</span>
                        </button>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search podcasts..."
                            value={searchTerm}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setSearchTerm(e.target.value)
                            }
                            style={{ width: '100%', maxWidth: '300px' }}
                        />
                    </div>
                </div>

                {/* TOP PODCAST */}
                {filteredMostListened.length > 0 && (
                    <HomeSection
                        title="Top Podcasts"
                        onViewAll={() => navigate("/all-podcast")}
                        data={filteredMostListened}
                        onCardClick={(item) =>
                            navigate(`/podcastplayer/${item.id}`, {
                                state: { channel: item },
                            })
                        }
                        onToggleSave={handleToggleSave}
                        user={user}
                    />
                )}

                {/* Categorized Podcast Sections */}
                {categories.map((catEntry: any) => {
                    // catEntry is [key, valueObj] because we did Array.from(map.values())? 
                    // Wait, previous code was Array.from(map.values()), so catEntry IS the value object {id, name, ...}
                    // Let's verify the line: values() returns iterator of values. Array.from makes it an array of values.
                    // So catEntry is the object.

                    const catName = catEntry.name;
                    const categoryPodcasts = podcasts.filter((p: any) =>
                        p.category?.name?.trim().toLowerCase() === catName.toLowerCase() &&
                        (!searchTerm || p.title?.toLowerCase().includes(searchTerm.toLowerCase()))
                    ).sort((a: any, b: any) => {
                        const titleA = (a?.title || a?.name || "").toString().trim().toLowerCase();
                        const titleB = (b?.title || b?.name || "").toString().trim().toLowerCase();
                        return titleA.localeCompare(titleB);
                    });

                    if (categoryPodcasts.length === 0) return null;
                    console.log("podcast category check", categoryPodcasts)
                    return (
                        <div key={catName} style={{ marginBottom: '40px' }}>
                            <HomeSection
                                title={catName}
                                onViewAll={() => navigate(`/podcast-category?category=${encodeURIComponent(catName)}`, { state: { category: catName } })}
                                data={categoryPodcasts}
                                onCardClick={(item) =>
                                    navigate(`/podcastplayer/${item.id}`, {
                                        state: { channel: item },
                                    })
                                }
                                // onToggleSave={handleToggleSave}
                                user={user}
                            />
                        </div>
                    );
                })}

                {/* My Podcast (Favorites) */}
                {filteredSaved.length > 0 && (
                    <HomeSection
                        title="My Podcast"
                        onViewAll={() => navigate("/all-podcast", { state: { filter: 'saved' } })}
                        data={filteredSaved}
                        onCardClick={(item) =>
                            navigate(`/podcastplayer/${item.id}`, {
                                state: { channel: item },
                            })
                        }
                        onToggleSave={handleToggleSave}
                        user={user}
                        emptyMessage="Start saving podcasts to see them here ❤️"
                    />
                )}


                <div className="search-radio-section">

                    <div className="search-radio-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <h2 className="sub-title">Podcast Categories</h2>
                        </div>
                        {/* Removed local search input */}
                    </div>
                    <div className="podcast-category-grid">
                        {categories.map((cat: any, index: number) => (
                            <CircleImageCard
                                key={cat.name}
                                title={cat.name}
                                localImage={categoryImages[index % categoryImages.length]}
                                onClick={() => {
                                    navigate(`/podcast-category?category=${encodeURIComponent(cat.name)}`, {
                                        state: { category: cat.name },
                                    });
                                }}
                                onShare={() => handleCategoryShare(cat.name)}
                            />
                        ))}
                    </div>
                </div>

            </div>
            <Footer />
        </div>
    );
}


