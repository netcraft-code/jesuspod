import { useState, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import ShortItem from "../../components/ShortItem/ShortItem";
import { ShortsService } from "../../services/shortsService";
import type { Short } from "../../types/shorts";
import usePageTitle from "../../hooks/usePageTitle";
import "./Shorts.css";

export default function Shorts() {
    const [active, setActive] = useState("Acts2");
    const [profileOpen, setProfileOpen] = useState(false);
    const [shortsData, setShortsData] = useState<Short[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [lastVisible, setLastVisible] = useState<any>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    // Get current user from Redux
    const user = useSelector((state: RootState) => state.auth.user);

    usePageTitle("Shorts - Acts2");

    // Load initial shorts
    const loadShorts = useCallback(async (isLoadMore = false) => {
        if (!hasMore && isLoadMore) return;

        try {
            setLoading(true);

            const response = await ShortsService.fetchShorts({
                limitCount: 10,
                lastVisible: isLoadMore ? lastVisible : null,
            });

            if (isLoadMore) {
                setShortsData((prev) => [...prev, ...response.shorts]);
            } else {
                setShortsData(response.shorts);
            }

            setLastVisible(response.lastVisible);
            setHasMore(response.hasMore);
        } catch (error) {
            console.error("Error loading shorts:", error);
        } finally {
            setLoading(false);
        }
    }, [hasMore, lastVisible]);

    // Load initial data only once
    useEffect(() => {
        loadShorts(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handle like toggle
    const handleLikeToggle = useCallback(
        async (shortId: string, isLiked: boolean) => {
            if (!user?.uid) {
                alert("Please login to like videos");
                return;
            }

            try {
                await ShortsService.toggleLike(shortId, user.uid, isLiked);

                // Update local state
                setShortsData((prev) =>
                    prev.map((short) =>
                        short.id === shortId
                            ? {
                                ...short,
                                likeCount: (short.likeCount || 0) + (isLiked ? 1 : -1),
                            }
                            : short
                    )
                );
            } catch (error) {
                console.error("Error toggling like:", error);
                throw error;
            }
        },
        [user]
    );

    // Handle save toggle
    const handleSaveToggle = useCallback(
        async (shortId: string, isSaved: boolean) => {
            if (!user?.uid) {
                alert("Please login to save videos");
                return;
            }

            try {
                await ShortsService.toggleSave(shortId, user.uid, isSaved);
            } catch (error) {
                console.error("Error toggling save:", error);
                throw error;
            }
        },
        [user]
    );

    // Handle view increment
    const handleViewIncrement = useCallback(async (shortId: string) => {
        try {
            await ShortsService.incrementViewCount(shortId);

            // Update local state
            setShortsData((prev) =>
                prev.map((short) =>
                    short.id === shortId
                        ? { ...short, viewCount: (short.viewCount || 0) + 1 }
                        : short
                )
            );
        } catch (error) {
            console.error("Error incrementing view count:", error);
        }
    }, []);

    // Handle scroll to next video
    const handleVideoEnd = useCallback(() => {
        if (activeIndex < shortsData.length - 1) {
            const nextIndex = activeIndex + 1;
            setActiveIndex(nextIndex);

            // Scroll to next video
            const container = containerRef.current;
            if (container) {
                const nextElement = container.children[nextIndex] as HTMLElement;
                nextElement?.scrollIntoView({ behavior: "smooth" });
            }

            // Load more if near end and not already loading
            if (nextIndex >= shortsData.length - 3 && hasMore && !loading) {
                loadShorts(true);
            }
        }
    }, [activeIndex, shortsData.length, hasMore, loading, loadShorts]);

    // Setup intersection observer for scroll detection
    useEffect(() => {
        const container = containerRef.current;
        if (!container || shortsData.length === 0) return;

        // Disconnect previous observer
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = Array.from(container.children).indexOf(
                            entry.target as Element
                        );
                        if (index !== -1 && index !== activeIndex) {
                            setActiveIndex(index);

                            // Load more if near end and not already loading
                            if (index >= shortsData.length - 3 && hasMore && !loading) {
                                loadShorts(true);
                            }
                        }
                    }
                });
            },
            {
                root: container,
                threshold: 0.5,
            }
        );

        // Observe all short items
        Array.from(container.children).forEach((child) => {
            observerRef.current?.observe(child);
        });

        return () => {
            observerRef.current?.disconnect();
        };
    }, [shortsData.length, hasMore, loading, activeIndex, loadShorts]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const container = containerRef.current;
            if (!container) return;

            if (e.key === "ArrowDown" && activeIndex < shortsData.length - 1) {
                e.preventDefault();
                const nextIndex = activeIndex + 1;
                setActiveIndex(nextIndex);
                const nextElement = container.children[nextIndex] as HTMLElement;
                nextElement?.scrollIntoView({ behavior: "smooth" });
            } else if (e.key === "ArrowUp" && activeIndex > 0) {
                e.preventDefault();
                const prevIndex = activeIndex - 1;
                setActiveIndex(prevIndex);
                const prevElement = container.children[prevIndex] as HTMLElement;
                prevElement?.scrollIntoView({ behavior: "smooth" });
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [activeIndex, shortsData.length]);

    return (
        <div className="shorts-wrapper">
            <Header
                active={active}
                setActive={setActive}
                profileOpen={profileOpen}
                setProfileOpen={setProfileOpen}
            />

            <main className="shorts-main">
                {loading && shortsData.length === 0 ? (
                    <div className="shorts-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading shorts...</p>
                    </div>
                ) : shortsData.length === 0 ? (
                    <div className="shorts-empty">
                        <p>No shorts available</p>
                    </div>
                ) : (
                    <div className="shorts-container" ref={containerRef}>
                        {shortsData.map((short, index) => (
                            <ShortItem
                                key={short.id}
                                item={short}
                                isActive={index === activeIndex}
                                onEnd={handleVideoEnd}
                                onLikeToggle={handleLikeToggle}
                                onSaveToggle={handleSaveToggle}
                                onViewIncrement={handleViewIncrement}
                            />
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
