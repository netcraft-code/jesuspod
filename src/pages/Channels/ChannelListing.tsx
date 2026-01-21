import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../redux/store";
import { useSearchParams } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import HomeSection from "../../components/HomeSection/HomeSection";
import usePageTitle from "../../hooks/usePageTitle";
import CircleImageCard from "../../components/Cards/CircleImageCard";
import "../Radio/Radio.css"; // Reuse Radio CSS for grid
import { toggleChannelSave, fetchTelevisionChannels } from "../../services/dataService";
import { refreshSavedChannels, toggleChannelSaveState } from "../../redux/dataSlice";
import { trackChannelPlay } from "../../services/channelAnalytics";
import { images } from "../../assets/images";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../services/firebase";

export default function ChannelListing() {
    usePageTitle("Channels");
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);

    const [active, setActive] = useState("Channels");
    const [profileOpen, setProfileOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [tvChannels, setTvChannels] = useState<any[]>([]);

    const countries = useSelector((state: RootState) => state.data.Countries);
    const selectedCountry = useSelector((state: RootState) => state.data.selectedCountry);
    const loading = useSelector((state: RootState) => state.data.loading);

    // Analytics data
    const allMostWatchedChannels = useSelector((state: RootState) => state.data.mostWatchedChannels) || [];
    const topUSAChannels = useSelector((state: RootState) => state.data.topUSAChannels) || [];
    const savedChannels = useSelector((state: RootState) => state.data.savedChannels) || [];

    // Filter Most Watched based on selected country
    const mostWatchedChannels = selectedCountry
        ? allMostWatchedChannels.filter((c: any) => c.type?.toLowerCase() === selectedCountry.toLowerCase())
        : allMostWatchedChannels;

    // --- GLOBAL SEARCH FILTERING ---
    const filteredMostWatched = mostWatchedChannels.filter((item: any) =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredTopUSA = topUSAChannels.filter((item: any) =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredSaved = savedChannels.filter((item: any) =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredTvChannels = tvChannels.filter((item: any) =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Fetch TV Channels on mount and handle URL params
    useState(() => {
        const getTvData = async () => {
            const data = await fetchTelevisionChannels();
            setTvChannels(data);
        };
        getTvData();

        // Handle country query param
        const countryParam = searchParams.get("country");
        if (countryParam) {
            // Scroll to country section or just filter?
            // Since the logic currently is to filter on "See All" page, maybe we should redirect there or filter locally?
            // The requirement says "related country wise data show krega". 
            // In RadioList it navigates to radio-player. Here let's navigate to AllChannels with filter.
            navigate("/all-channels", { state: { country: countryParam } });
        }
    });

    // Handlers
    // Handlers
    const handleCardClick = (item: any) => {
        // Track play
        trackChannelPlay(item.id, item.title, item.type || "Unknown");

        if (item.channelLink) {
            window.open(`https://youtube.com/channel/${item.channelLink}`, "_blank");
        } else if (item.url) {
            window.open(item.url, "_blank");
        }
    };

    const handleCountrySelect = (countryName: string | null) => {
        // dispatch(setSelectedCountry(countryName)); // Removed global filter update
        navigate("/all-channels", { state: { country: countryName } });
    };

    const handleToggleSave = async (item: any, isSaved: boolean) => {
        if (!user?.uid) {
            alert("Please login to save channels");
            return;
        }

        // Optimistic Update
        dispatch(toggleChannelSaveState({ channelId: item.id, userId: user.uid }));

        const success = await toggleChannelSave(item.id, user.uid, isSaved);
        if (success) {
            // Refresh saved channels list (background sync)
            dispatch(refreshSavedChannels(user.uid) as any);
        } else {
            // Revert if failed (optional, but good practice)
            dispatch(toggleChannelSaveState({ channelId: item.id, userId: user.uid }));
            alert("Failed to save channel");
        }
    };

    const handleShare = async (item: any) => {
        const shareLink = item.url || item.channelLink || window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: item.title,
                    text: `Check out ${item.title} on JesusPOD`,
                    url: shareLink,
                });
            } catch (err) {
                console.error("Share failed:", err);
            }
        } else {
            // Fallback
            navigator.clipboard.writeText(shareLink);
            alert("Channel link copied to clipboard!");
        }
    };

    const handleCountryShare = async (countryTitle: string) => {
        // CHANGED: Point to /all-channels directly
        const shareUrl = `${window.location.origin}/all-channels?country=${encodeURIComponent(countryTitle)}`;
        const shareData = {
            title: `${countryTitle} Channels`,
            text: `Check out ${countryTitle} channels on JesusPOD`,
            url: shareUrl,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error("Share failed:", err);
            }
        } else {
            navigator.clipboard.writeText(shareUrl);
            alert("Link copied to clipboard!");
        }
    };

    const handleSharePage = async () => {
        const shareUrl = window.location.href;
        const shareData = {
            title: "JesusPOD Channels",
            text: "Watch live TV channels on JesusPOD!",
            url: shareUrl,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                logEvent(analytics, "Share_ChannelHome", {});
            } else {
                await navigator.clipboard.writeText(shareUrl);
                alert("Link copied to clipboard!");
            }
        } catch (err) {
            console.error("Error sharing:", err);
        }
    };

    return (
        <div className="home-wrapper">
            <Header
                active={active}
                setActive={setActive}
                profileOpen={profileOpen}
                setProfileOpen={setProfileOpen}
            />

            <main className="radio-container" style={{ minHeight: '80vh', paddingBottom: 40 }}>

                {/* GLOBAL SEARCH BAR */}
                <div style={{ padding: '0 20px', marginBottom: '20px', marginTop: '-15px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }}>
                    <button
                        className="share-btn"
                        onClick={handleSharePage}
                        title="Share Channels Page"
                    >
                        <img src={images.share} alt="share" />
                        <span>Share</span>
                    </button>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search for channels..."
                        value={searchTerm}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setSearchTerm(e.target.value)
                        }
                        style={{ width: '100%', maxWidth: '400px' }}
                    />
                </div>

                {/* 1. Most Watched Channels */}
                {filteredMostWatched.length > 0 && (
                    <div style={{ marginBottom: '40px' }}>
                        <HomeSection
                            title={`Most Watched Channels `}
                            data={filteredMostWatched}
                            loading={loading}
                            cardVariant="channel"
                            onViewAll={() => navigate("/all-channels")}
                            onCardClick={handleCardClick}
                            onToggleSave={handleToggleSave}
                            user={user}
                        />
                    </div>
                )}

                {/* 2. Top 10 in USA */}
                {filteredTopUSA.length > 0 && (
                    <div style={{ marginBottom: '40px' }}>
                        <HomeSection
                            title="Top 10 in USA"
                            data={filteredTopUSA}
                            loading={loading}
                            cardVariant="channel"
                            onViewAll={() => navigate("/all-channels")}
                            onCardClick={handleCardClick}
                            onToggleSave={handleToggleSave}
                            user={user}
                        />
                    </div>
                )}

                {/* 4. Television Channels */}
                {filteredTvChannels.length > 0 && (
                    <div style={{ marginBottom: '40px' }}>
                        <HomeSection
                            title="TV Channels"
                            data={filteredTvChannels}
                            loading={loading}
                            cardVariant="channel"
                            onViewAll={() => navigate("/all-channels", { state: { filter: 'tv' } })}
                            onCardClick={handleCardClick}
                            user={user}
                            showFav={false}
                            showShare={true}
                            onShare={handleShare}
                        />
                    </div>
                )}

                {/* 3. Channels to Love */}
                {filteredSaved.length > 0 && (
                    <HomeSection
                        title="Channels to Love"
                        data={filteredSaved}
                        loading={loading}
                        cardVariant="channel"
                        onViewAll={() => navigate("/all-channels", { state: { filter: 'saved' } })}
                        onCardClick={handleCardClick}
                        onToggleSave={handleToggleSave}
                        user={user}
                        emptyMessage="Start saving channels to see them here ❤️"
                    />
                )}


                {/* 4. Search for Channels (Country Grid) */}
                <div className="search-radio-section" style={{ marginTop: 40 }}>
                    <div className="search-radio-header">
                        <h2 className="sub-title">By Country</h2>
                        {/* Removed Local Country Search */}
                    </div>

                    {/* Country Grid */}
                    <div className="country-grid">
                        {/* Global Button */}
                        <CircleImageCard
                            title="Global"
                            imageUrl="https://flagcdn.com/w80/un.png" // Placeholder or from assets
                            onClick={() => handleCountrySelect(null)}
                        />

                        {countries.map((country: any) => (
                            <CircleImageCard
                                key={country.id}
                                title={country.title === "Espanol" ? "Español" : country.title}
                                imageUrl={country.imageUrl}
                                onClick={() => handleCountrySelect(country.title)}
                                onShare={() => handleCountryShare(country.title)}
                            />
                        ))}
                    </div>
                </div>

            </main>
            <Footer />
        </div>
    );
}
