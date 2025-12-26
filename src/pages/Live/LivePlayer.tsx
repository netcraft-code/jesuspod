import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
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

    // Convert YouTube watch URL to embed URL
    const getYouTubeEmbedUrl = (url: string): string | null => {
        if (!url) return null;

        // Check if it's a YouTube URL
        const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
        if (!isYouTube) return null;

        // Extract video ID
        let videoId = '';

        // Handle youtube.com/watch?v=VIDEO_ID
        if (url.includes('youtube.com/watch')) {
            const urlParams = new URLSearchParams(url.split('?')[1]);
            videoId = urlParams.get('v') || '';
        }
        // Handle youtube.com/live/VIDEO_ID (live streams)
        else if (url.includes('youtube.com/live/')) {
            videoId = url.split('youtube.com/live/')[1]?.split('?')[0] || '';
        }
        // Handle youtu.be/VIDEO_ID
        else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
        }
        // Handle youtube.com/embed/VIDEO_ID (already embed)
        else if (url.includes('youtube.com/embed/')) {
            return url;
        }

        return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
    };

    const handleVideoSelect = (video: any) => {
        setCurrentVideo(video);
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

    const embedUrl = getYouTubeEmbedUrl(currentVideo.url);
    const isExternalUrl = !embedUrl && currentVideo.url;

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
                    <h3 className="sidebar-title">Live Channels</h3>
                    <div className="sidebar-playlist">
                        {playlist.map((video) => (
                            <div
                                key={video.id || video._id}
                                className={`sidebar-item ${currentVideo.id === video.id || currentVideo._id === video._id ? "active" : ""
                                    }`}
                                onClick={() => handleVideoSelect(video)}
                            >
                                <div className="sidebar-item-image-container">
                                    <img
                                        src={video.imageUrl}
                                        alt={video.title}
                                        className="sidebar-item-image"
                                    />
                                    <div className="sidebar-live-badge">
                                        <span className="live-dot"></span>
                                    </div>
                                </div>
                                <div className="sidebar-item-info">
                                    <h4 className="sidebar-item-title">{video.title}</h4>
                                    {video.category && (
                                        <p className="sidebar-item-category">{video.category}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Player Area */}
                <div className="live-player-main">
                    <div className="player-wrapper">
                        {embedUrl ? (
                            <iframe
                                className="youtube-player"
                                src={embedUrl}
                                title={currentVideo.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        ) : isExternalUrl ? (
                            <div className="external-link-container">
                                <p className="external-link-message">
                                    This channel cannot be embedded. Click below to open in a new tab.
                                </p>
                                <button
                                    className="external-link-button"
                                    onClick={() => window.open(currentVideo.url, '_blank')}
                                >
                                    Open {currentVideo.title}
                                </button>
                            </div>
                        ) : (
                            <div className="no-video">
                                <p>Invalid video URL</p>
                            </div>
                        )}
                    </div>
                    <div className="player-info">
                        <h2 className="player-title">{currentVideo.title}</h2>
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
