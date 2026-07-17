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
import { toggleMovieSave } from "../../services/dataService";
import { refreshSavedMovies, toggleMovieSaveState } from "../../redux/dataSlice";
import { trackMoviePlay } from "../../services/movieAnalytics";
import { images } from "../../assets/images";
import PageInfo from "../../components/UI/PageInfo";
import { useTranslation } from "../../context/LanguageContext";

export default function MoviesList() {
    const { t } = useTranslation();
    usePageTitle(t("header.movies"));
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);

    const [active, setActive] = useState("Movies");
    const [profileOpen, setProfileOpen] = useState(false);
    // const [categorySearch, setCategorySearch] = useState("");
    const [searchQuery, setSearchQuery] = useState(""); // Global movie search

    const loading = useSelector((state: RootState) => state.data.loading);

    // Data from Redux
    const allMovies = useSelector((state: RootState) => state.data.movies) || [];
    const mostWatchedMovies = useSelector((state: RootState) => state.data.mostWatchedMovies) || [];
    const savedMovies = useSelector((state: RootState) => state.data.savedMovies) || [];

    // Filter Logic
    const filterMovies = (movies: any[]) => {
        if (!searchQuery) return movies;
        return movies.filter((m: any) =>
            m.title?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const filteredMostWatched = filterMovies(mostWatchedMovies);
    const filteredSaved = filterMovies(savedMovies);

    // Get Unique Categories
    const categories = Array.from(new Set(allMovies.map((m: any) => m.category).filter(Boolean))).sort();

    // Filter Categories based on search (existing logic remains for bottom grid)
    // const filteredCategories = categories.filter((c: any) =>
    //     c.toLowerCase().includes(categorySearch.toLowerCase())
    // );

    // Handlers
    const handleCardClick = (item: any) => {
        // Track play
        trackMoviePlay(item.id, item.title, item.category || "Unknown");
        navigate(`/movie/${item.id}`);
    };

    const handleCategorySelect = (category: string | null) => {
        // Navigate to All Movies with category filter
        if (category) {
            navigate(`/all-movies?category=${category}`, { state: { category: category } });
        } else {
            navigate("/all-movies");
        }
    };

    const handleToggleSave = async (item: any, isSaved: boolean) => {
        if (!user?.uid) {
            alert(t("movies.pleaseLogin"));
            return;
        }

        // Optimistic Update
        dispatch(toggleMovieSaveState({ movieId: item.id, userId: user.uid }));

        const success = await toggleMovieSave(item.id, user.uid, isSaved);
        if (success) {
            // Refresh saved movies list
            dispatch(refreshSavedMovies(user.uid) as any);
        } else {
            // Revert if failed
            dispatch(toggleMovieSaveState({ movieId: item.id, userId: user.uid }));
            alert(t("movies.failedSave"));
        }
    };

    const handleSharePage = () => {
        const shareData = {
            title: `Jesus Pod - ${t("header.movies")}`,
            text: `Check out the latest ${t("header.movies")} on Jesus Pod!`,
            url: window.location.href,
        };

        if (navigator.share) {
            navigator.share(shareData).catch((err) => console.log("Share cancelled", err));
        } else {
            navigator.clipboard.writeText(shareData.url);
            alert(t("movies.linkCopied"));
        }
    };

    const handleCategoryShare = (categoryName: string) => {
        const shareUrl = `${window.location.origin}/all-movies?category=${encodeURIComponent(categoryName)}`;
        const shareData = {
            title: `${categoryName} ${t("header.movies")}`,
            text: `Check out these ${categoryName} ${t("header.movies")} on Jesus Pod!`,
            url: shareUrl,
        };

        if (navigator.share) {
            navigator.share(shareData).catch((err) => console.log("Share cancelled", err));
        } else {
            navigator.clipboard.writeText(shareData.url);
            alert(t("movies.linkCopied"));
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

                {/* Header Row: Page Info + Search/Share */}
                <div className="page-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1', minWidth: '300px' }}>
                        <PageInfo
                            title={t("movies.title")}
                            description={t("movies.description")}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
                        <button
                            className="share-btn"
                            onClick={handleSharePage}
                            title="Share Podcast Page"
                        >
                            <img src={images.share} alt="share" />
                            <span>{t("movies.share")}</span>
                        </button>
                        <input
                            type="text"
                            className="search-input"
                            placeholder={t("movies.searchPlaceholder")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '100%', maxWidth: '300px' }}
                        />
                    </div>
                </div>

                {/* 1. Most Watched Movies */}
                {filteredMostWatched.length > 0 && (
                    <div style={{ marginBottom: '40px' }}>
                        <HomeSection
                            title={t("movies.mostWatched")}
                            data={filteredMostWatched}
                            loading={loading}
                            cardVariant="channel"
                            onViewAll={() => navigate("/all-movies")}
                            onCardClick={handleCardClick}
                            onToggleSave={handleToggleSave}
                            user={user}
                        />
                    </div>
                )}

                {/* 2. Movies to Love (Favorites) */}
                {(filteredSaved.length > 0 || !searchQuery) && (
                    <div style={{ marginBottom: '40px' }}>
                        <HomeSection
                            title={t("movies.myMovies")}
                            data={filteredSaved}
                            loading={loading}
                            cardVariant="channel"
                            onViewAll={() => navigate("/all-movies", { state: { filter: 'saved' } })}
                            onCardClick={handleCardClick}
                            onToggleSave={handleToggleSave}
                            user={user}
                            emptyMessage={searchQuery ? t("movies.emptySearchMessage") : t("movies.emptyMessage")}
                        />
                    </div>
                )}


                {/* 3. Categorized Movie Sections */}
                {categories.map((category: any) => {
                    // Filter movies in this category by the global search query
                    const categoryMovies = allMovies.filter((m: any) =>
                        m.category === category &&
                        (!searchQuery || m.title?.toLowerCase().includes(searchQuery.toLowerCase()))
                    ).sort((a: any, b: any) => {
                        const titleA = (a.title || a.name || "").toString().trim().toLowerCase();
                        const titleB = (b.title || b.name || "").toString().trim().toLowerCase();
                        return titleA.localeCompare(titleB);
                    });

                    if (categoryMovies.length === 0) return null;

                    return (
                        <div key={category} style={{ marginBottom: '40px' }}>
                            <HomeSection
                                title={category.toUpperCase()}
                                data={categoryMovies}
                                loading={loading}
                                cardVariant="channel"
                                onViewAll={() => handleCategorySelect(category)}
                                onCardClick={handleCardClick}
                                onToggleSave={handleToggleSave}
                                user={user}
                            />
                        </div>
                    );
                })}



                {/* 4. Search for Category (Category Grid) - Kept at bottom as requested/existing */}
                <div className="search-radio-section" style={{ marginTop: 60 }}>
                    <div className="search-radio-header">
                        <h2 className="sub-title">{t("movies.byCategories")}</h2>

                    </div>

                    {/* Category Grid */}
                    <div className="country-grid">
                        {categories.map((cat: any) => (
                            <CircleImageCard
                                key={cat}
                                title={cat}
                                imageUrl={`https://ui-avatars.com/api/?name=${cat}&background=random&color=fff&size=200`}
                                onClick={() => handleCategorySelect(cat)}
                                onShare={() => handleCategoryShare(cat)}
                            />
                        ))}
                    </div>
                </div>

            </main>
            <Footer />
        </div>
    );
}
