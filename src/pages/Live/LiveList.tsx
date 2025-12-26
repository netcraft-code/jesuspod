import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./Live.css";

export default function LiveList() {
    const navigate = useNavigate();
    const [active, setActive] = useState<string>("Live");
    const [profileOpen, setProfileOpen] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>("");

    // Get live channels from Redux (Telivision collection)
    const liveChannels = useSelector<RootState, any[]>(
        (state) => state.data.liveVideos
    );

    const loading = useSelector<RootState, boolean>(
        (state) => state.data.loading
    );

    // Filter channels based on search query
    const filteredChannels = liveChannels.filter((channel) =>
        channel.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleVideoClick = (channel: any) => {
        // Check if URL is YouTube or external website
        const isYouTube = channel.url?.includes('youtube.com') || channel.url?.includes('youtu.be');

        if (isYouTube) {
            // Navigate to player for YouTube videos
            navigate("/live-player", {
                state: {
                    current: channel,
                    list: liveChannels,
                },
            });
        } else {
            // Open external URLs in new tab
            window.open(channel.url, '_blank');
        }
    };

    return (
        <div className="live-page">
            <Header
                active={active}
                setActive={setActive}
                profileOpen={profileOpen}
                setProfileOpen={setProfileOpen}
            />

            <div className="live-container">
                <div className="live-header">
                    <h1 className="page-title">Live Channels</h1>
                    <p className="page-subtitle">Watch live streaming channels</p>
                </div>

                <div className="search-section">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search for live channels..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {loading && filteredChannels.length === 0 ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                ) : filteredChannels.length === 0 ? (
                    <div className="no-data-container">
                        <p>No live channels found</p>
                    </div>
                ) : (
                    <div className="live-grid">
                        {filteredChannels.map((item) => (
                            <div
                                key={item.id || item._id}
                                className="live-card"
                                onClick={() => handleVideoClick(item)}
                            >
                                <div className="live-card-image-container">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.title}
                                        className="live-card-image"
                                    />
                                    <div className="live-badge">
                                        <span className="live-dot"></span>
                                        LIVE
                                    </div>
                                </div>
                                <div className="live-card-info">
                                    <h3 className="live-card-title">{item.title}</h3>
                                    {item.category && (
                                        <p className="live-card-category">{item.category}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}
