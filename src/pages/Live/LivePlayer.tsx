import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import LiveCard from "../../components/LiveSection/LiveCard";
import "./Live.css";

export default function LivePlayer() {
    const location = useLocation();
    const navigate = useNavigate();
    const [active, setActive] = useState<string>("Live");
    const [profileOpen, setProfileOpen] = useState<boolean>(false);

    // Get data from navigation state or Redux
    const stateData = location.state as { current?: any; list?: any[] };
    const liveChannels = useSelector<RootState, any[]>(
        (state) => state.data.liveVideos
    );

    const [currentVideo, setCurrentVideo] = useState<any>(
        stateData?.current || (liveChannels.length > 0 ? liveChannels[0] : null)
    );
    const [playlist] = useState<any[]>(
        stateData?.list || liveChannels
    );

    // Convert YouTube URL to embed format
    const getEmbedUrl = (url: string): string => {
        if (!url) return '';

        // If already an embed URL, return as is
        if (url.includes('/embed/')) {
            return url;
        }

        // Extract video ID from various YouTube URL formats
        let videoId = '';

        if (url.includes('youtube.com/watch?v=')) {
            videoId = url.split('v=')[1]?.split('&')[0] || '';
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
        } else if (url.includes('youtube.com/live/')) {
            videoId = url.split('/live/')[1]?.split('?')[0] || '';
        }

        return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
    };

    const handleVideoSelect = (video: any) => {
        setCurrentVideo(video);
        console.log("video", video)
    };

    if (!currentVideo) {
        return (
            <div className="live-page">
                <Header
                    active={active}
                    setActive={setActive}
                    profileOpen={profileOpen}
                    setProfileOpen={setProfileOpen}
                />
                <div className="live-container">
                    <p>No live channel selected</p>
                    <button onClick={() => navigate("/live-list")}>
                        Go to Live Channels
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="live-page">
            <Header
                active={active}
                setActive={setActive}
                profileOpen={profileOpen}
                setProfileOpen={setProfileOpen}
            />

            <div className="live-player-container">
                {/* Sidebar Playlist */}
                <div className="live-sidebar">

                    <div className="sidebar-playlist">
                        {playlist.map((video) => (
                            <LiveCard
                                key={video.id || video._id}
                                item={video}
                                onClick={() => handleVideoSelect(video)}
                                isActive={currentVideo.id === video.id || currentVideo._id === video._id}
                                variant="sidebar"
                            />
                        ))}
                    </div>
                </div>

                {/* Main Player Area */}
                <div className="live-player-main">
                    <div className="player-wrapper">
                        <iframe
                            className="youtube-player"
                            src={getEmbedUrl(currentVideo.url)}
                            title={currentVideo.liveTitle || currentVideo.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                    <div className="player-info">
                        <h2 className="player-title">{currentVideo.liveTitle || currentVideo.title}</h2>
                        <p className="player-channel">{currentVideo.name}</p>
                        {currentVideo.category && (
                            <p className="player-category">{currentVideo.category}</p>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
