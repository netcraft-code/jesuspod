import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import LiveCard from "../../components/LiveSection/LiveCard";
import "./Live.css";
import PageInfo from "../../components/UI/PageInfo";

export default function LiveList() {
    const [active, setActive] = useState<string>("Live");
    const [profileOpen, setProfileOpen] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>("");

    // Get live channels from Redux
    const liveChannels = useSelector<RootState, any[]>(
        (state) => state.data.liveVideos
    );

    const loading = useSelector<RootState, boolean>(
        (state) => state.data.loading
    );

    // Filter channels based on search query
    const filteredChannels = liveChannels.filter((channel) =>
        channel.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        channel.liveTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        channel.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Auto-select first video
    const [currentVideo, setCurrentVideo] = useState<any>(
        filteredChannels.length > 0 ? filteredChannels[0] : null
    );

    // Update current video when filtered channels change
    if (currentVideo && !filteredChannels.find(ch => ch.id === currentVideo.id)) {
        setCurrentVideo(filteredChannels[0] || null);
    }

    const handleVideoClick = (channel: any) => {
        setCurrentVideo(channel);
    };

    // Get YouTube embed URL
    const getYouTubeEmbedUrl = (video: any): string | null => {
        if (video?.liveVideoId) {
            return `https://www.youtube.com/embed/${video.liveVideoId}?autoplay=1`;
        }
        if (video?.url) {
            const url = video.url;
            let videoId = '';

            if (url.includes('youtube.com/watch')) {
                const urlParams = new URLSearchParams(url.split('?')[1]);
                videoId = urlParams.get('v') || '';
            } else if (url.includes('youtube.com/live/')) {
                videoId = url.split('youtube.com/live/')[1]?.split('?')[0] || '';
            } else if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
            }

            return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
        }
        return null;
    };

    const embedUrl = currentVideo ? getYouTubeEmbedUrl(currentVideo) : null;

    return (
        <div className="live-page">
            <Header
                active={active}
                setActive={setActive}
                profileOpen={profileOpen}
                setProfileOpen={setProfileOpen}
            />

            <div style={{ padding: '0 20px', marginTop: '20px' }}>
                <PageInfo
                    title="24/7 Christian TV Stations"
                    description="Stay connected to the Word through live television broadcasts from around the world. This section gives you instant access to global Christian TV stations, featuring live ministry, prophetic sessions, and faith-based news any time of day. By bringing international stations into one place, we make it easy for you to watch anointed content from different continents directly within the app."
                />
            </div>

            <div className="live-player-container">
                {/* Left Sidebar */}
                <div className="live-sidebar">
                    <h3 className="sidebar-title">Live Channels</h3>

                    <div className="search-section-sidebar">
                        <input
                            type="text"
                            className="search-input-sidebar"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="sidebar-playlist">
                        {loading && filteredChannels.length === 0 ? (
                            <div className="loading-container">
                                <div className="spinner"></div>
                            </div>
                        ) : filteredChannels.length === 0 ? (
                            <div className="no-data-container">
                                <p>No live channels found</p>
                            </div>
                        ) : (
                            filteredChannels.map((item) => (
                                <LiveCard
                                    key={item.id || item._id}
                                    item={item}
                                    onClick={() => handleVideoClick(item)}
                                    isActive={currentVideo?.id === item.id || currentVideo?._id === item._id}
                                    variant="sidebar"
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Right Player Area */}
                <div className="live-player-main">
                    {currentVideo && embedUrl ? (
                        <>
                            <div className="player-wrapper">
                                <iframe
                                    className="youtube-player"
                                    src={embedUrl}
                                    title={currentVideo.liveTitle || currentVideo.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                            <div className="player-info">
                                <h2 className="player-title">{currentVideo.liveTitle || currentVideo.title}</h2>
                                <p className="player-channel">{currentVideo.name}</p>
                            </div>
                        </>
                    ) : (
                        <div className="no-video">
                            <p>No live channel selected</p>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}
