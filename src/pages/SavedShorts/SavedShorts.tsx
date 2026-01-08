import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { ShortsService } from "../../services/shortsService";
import type { Short } from "../../types/shorts";
import usePageTitle from "../../hooks/usePageTitle";
import { FaBookmark, FaArrowLeft, FaPlay } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ShortItem from "../../components/ShortItem/ShortItem";
import "./SavedShorts.css";
import "../../pages/Shorts/Shorts.css"; // Reuse some styles

export default function SavedShorts() {
    const [active, setActive] = useState("Acts2");
    const [profileOpen, setProfileOpen] = useState(false);
    const [shortsData, setShortsData] = useState<Short[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(null);

    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.auth.user);

    usePageTitle("Saved Shorts - JesusPOD");

    // Load saved shorts
    const loadSavedShorts = useCallback(async () => {
        if (!user?.uid) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const savedShorts = await ShortsService.getUserSavedShorts(user.uid);
            setShortsData(savedShorts);
        } catch (error) {
            console.error("Error loading saved shorts:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Load initial data
    useEffect(() => {
        loadSavedShorts();
    }, [loadSavedShorts]);



    // Handle video selection
    const handleVideoSelect = (index: number) => {
        setSelectedVideoIndex(index);
    };

    // Dummy handlers for ShortItem since we are just viewing
    const handleLikeToggle = async (shortId: string, isLiked: boolean) => {
        await ShortsService.toggleLike(shortId, user!.uid, isLiked);
    };

    const handleSaveToggle = async (shortId: string, isSaved: boolean) => {
        await ShortsService.toggleSave(shortId, user!.uid, isSaved);
        if (!isSaved) {
            // Remove from list if unsaved
            setShortsData(prev => prev.filter(s => s.id !== shortId));
            if (shortsData.length <= 1) {
                setSelectedVideoIndex(null);
            } else if (selectedVideoIndex !== null && selectedVideoIndex >= shortsData.length - 1) {
                setSelectedVideoIndex(shortsData.length - 2);
            }
        }
    };

    const handleViewIncrement = async (shortId: string) => {
        await ShortsService.incrementViewCount(shortId);
    };

    const handleVideoEnd = () => {
        // Auto play next?
        if (selectedVideoIndex !== null && selectedVideoIndex < shortsData.length - 1) {
            setSelectedVideoIndex(selectedVideoIndex + 1);
        }
    };

    if (!user) {
        return (
            <div className="saved-shorts-page">
                <Header active={active} setActive={setActive} profileOpen={profileOpen} setProfileOpen={setProfileOpen} />
                <div className="empty-state">
                    <p>Please login to view saved shorts.</p>
                    <button onClick={() => navigate("/login")}>Login</button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="saved-shorts-page">
            <Header active={active} setActive={setActive} profileOpen={profileOpen} setProfileOpen={setProfileOpen} />

            <div className="shorts-main-content">
                {selectedVideoIndex === null ? (
                    // Grid View
                    <div className="saved-grid-container">
                        <div className="page-header">
                            {/* <button className="back-btn" onClick={handleBack}>
                                <FaArrowLeft />
                            </button> */}
                            <h1>Favorite Shorts</h1>
                        </div>

                        {loading ? (
                            <div className="loading-spinner"></div>
                        ) : shortsData.length === 0 ? (
                            <div className="empty-state">
                                <FaBookmark size={48} color="#666" />
                                <p>No favorite shorts yet.</p>
                                <button onClick={() => navigate("/shorts")}>Browse Shorts</button>
                            </div>
                        ) : (
                            <div className="shorts-grid">
                                {shortsData.map((short, index) => (
                                    <div key={short.id} className="grid-item" onClick={() => handleVideoSelect(index)}>
                                        <div className="thumbnail-wrapper">
                                            <img
                                                src={short.thumbnailUrl || `https://img.youtube.com/vi/${short.youtubeVideoId}/hqdefault.jpg`}
                                                alt={short.title}
                                            />
                                            <div className="play-overlay">
                                                <FaPlay />
                                            </div>
                                        </div>
                                        <div className="item-info">
                                            <h3>{short.title}</h3>
                                            <span>{short.viewCount} views</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    // Player View (Reusing Shorts Player Style)
                    <div className="shorts-wrapper">
                        {/* Override some styles to fit in this page if needed, or just reuse structure */}
                        <button className="close-player-btn" onClick={() => setSelectedVideoIndex(null)}>
                            <FaArrowLeft /> Back to list
                        </button>
                        <div className="shorts-container single-view">
                            <ShortItem
                                item={shortsData[selectedVideoIndex]}
                                isActive={true}
                                isSaved={true} // It's in saved list, so it is saved
                                onEnd={handleVideoEnd}
                                onLikeToggle={handleLikeToggle}
                                onSaveToggle={handleSaveToggle}
                                onViewIncrement={handleViewIncrement}
                            />
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}
