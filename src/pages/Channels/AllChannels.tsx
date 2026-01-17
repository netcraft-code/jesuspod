import { useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import ChannelCard from "./ChannelCard";
import "../Radio/Radio.css"; // Reuse Radio CSS
import "./AllChannels.css";
import { trackChannelPlay } from "../../services/channelAnalytics.ts";
import { useSelector, useDispatch } from "react-redux";
import { getFilteredChannels, refreshSavedChannels, toggleChannelSaveState } from "../../redux/dataSlice";
import { toggleChannelSave } from "../../services/dataService";

export default function AllChannels() {
    const [search, setSearch] = useState<string>("");
    const [active, setActive] = useState<string>("Channels");
    const [profileOpen, setProfileOpen] = useState<boolean>(false);

    const dispatch = useDispatch();
    const user = useSelector((state: any) => state.auth.user);

    const location = useLocation();

    // 1. Get ALL channels directly, to filter locally if needed
    const allChannels = useSelector((state: any) => state.data.channels);
    const savedChannels = useSelector((state: any) => state.data.savedChannels);

    // 2. Get Redux filtered channels (Global fallback)
    const reduxFilteredChannels = useSelector(getFilteredChannels);

    // 3. Determine which source to use
    // If location.state.country exists, filter raw channels by it.
    // If location.state.filter === 'saved', use savedChannels.
    // Otherwise, use the global Redux filtered list.
    const countryFromState = location.state?.country;
    const filterState = location.state?.filter;

    let sourceChannels = reduxFilteredChannels;

    if (filterState === 'saved') {
        sourceChannels = savedChannels;
    } else if (countryFromState) {
        if (countryFromState === "Global") {
            sourceChannels = allChannels;
        } else {
            sourceChannels = allChannels.filter((c: any) => c.type?.toLowerCase() === countryFromState.toLowerCase());
        }
    }

    // Local Search Filter
    const filtered = sourceChannels.filter((item: any) =>
        item.title?.toLowerCase().includes(search.toLowerCase())
    ).sort((a: any, b: any) => {
        const titleA = (a?.title || "").toString().trim().toLowerCase();
        const titleB = (b?.title || "").toString().trim().toLowerCase();
        return titleA.localeCompare(titleB);
    });

    const handleCardClick = (item: any) => {
        // Track play
        trackChannelPlay(item.id, item.title, item.type || "Unknown");

        if (item.channelLink) {
            window.open(`https://youtube.com/channel/${item.channelLink}`, "_blank");
        } else if (item.url) {
            window.open(item.url, "_blank");
        }
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
        <div className="main-content">
            {/* HEADER */}
            <Header
                active={active}
                setActive={setActive}
                profileOpen={profileOpen}
                setProfileOpen={setProfileOpen}
            />

            {/* PAGE CONTENT */}
            <main className="content">
                {/* TITLE + SEARCH */}
                <div className="top-bar">
                    <h2 className="sub-title">
                        {filterState === 'saved'
                            ? "Channels to Love"
                            : (countryFromState ? `All Channels (${countryFromState})` : "All Channels")
                        }
                    </h2>

                    <input
                        className="search-input"
                        type="text"
                        placeholder="Search channels..."
                        value={search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setSearch(e.target.value)
                        }
                    />
                </div>

                {/* CHANNELS GRID */}
                <div className="card-grid channels-grid">
                    {filtered.map((item: any) => (
                        <div key={item.id} className="home-card-wrapper channel-wrapper">
                            <ChannelCard
                                item={item}
                                onClick={handleCardClick}
                                isSaved={item.star?.includes(user?.uid)}
                                onToggleSave={handleToggleSave}
                            />
                        </div>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
}
