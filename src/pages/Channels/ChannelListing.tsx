import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../redux/store";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import HomeSection from "../../components/HomeSection/HomeSection";
import usePageTitle from "../../hooks/usePageTitle";
import CircleImageCard from "../../components/Cards/CircleImageCard";
import "../Radio/Radio.css"; // Reuse Radio CSS for grid
import { toggleChannelSave } from "../../services/dataService";
import { refreshSavedChannels, toggleChannelSaveState } from "../../redux/dataSlice";
import { trackChannelPlay } from "../../services/channelAnalytics";

export default function ChannelListing() {
    usePageTitle("Channels");
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);

    const [active, setActive] = useState("Channels");
    const [profileOpen, setProfileOpen] = useState(false);
    const [countrySearch, setCountrySearch] = useState("");

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

    // Filter Countries
    const filteredCountries = countries.filter((c: any) =>
        c.title.toLowerCase().includes(countrySearch.toLowerCase())
    );

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

    return (
        <div className="home-wrapper">
            <Header
                active={active}
                setActive={setActive}
                profileOpen={profileOpen}
                setProfileOpen={setProfileOpen}
            />

            <main className="radio-container" style={{ minHeight: '80vh', paddingBottom: 40 }}>

                {/* 1. Most Watched Channels */}
                {/* 1. Most Watched Channels */}
                <HomeSection
                    title={`Most Watched Channels `}
                    data={mostWatchedChannels}
                    loading={loading}
                    cardVariant="video"
                    onViewAll={() => navigate("/all-channels")}
                    onCardClick={handleCardClick}
                    onToggleSave={handleToggleSave}
                    user={user}
                />

                {/* 2. Top 10 in USA */}
                <HomeSection
                    title="Top 10 in USA"
                    data={topUSAChannels}
                    loading={loading}
                    cardVariant="video"
                    onViewAll={() => navigate("/all-channels")}
                    onCardClick={handleCardClick}
                    onToggleSave={handleToggleSave}
                    user={user}
                />

                {/* 3. Channels to Love */}
                <HomeSection
                    title="Channels to Love"
                    data={savedChannels}
                    loading={loading}
                    cardVariant="video"
                    onViewAll={() => navigate("/all-channels", { state: { filter: 'saved' } })}
                    onCardClick={handleCardClick}
                    onToggleSave={handleToggleSave}
                    user={user}
                    emptyMessage="Start saving channels to see them here ❤️"
                />

                {/* 4. Search for Channels (Country Grid) */}
                <div className="search-radio-section" style={{ marginTop: 40 }}>
                    <div className="search-radio-header">
                        <h2 className="sub-title">Search for Channels</h2>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search country..."
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                        />
                    </div>

                    {/* Country Grid */}
                    <div className="country-grid">
                        {/* Global Button */}
                        <CircleImageCard
                            title="Global"
                            imageUrl="https://flagcdn.com/w80/un.png" // Placeholder or from assets
                            onClick={() => handleCountrySelect(null)}
                        />

                        {filteredCountries.map((country: any) => (
                            <CircleImageCard
                                key={country.id}
                                title={country.title === "Espanol" ? "Español" : country.title}
                                imageUrl={country.imageUrl}
                                onClick={() => handleCountrySelect(country.title)}
                            />
                        ))}
                    </div>
                </div>

            </main>
            <Footer />
        </div>
    );
}
