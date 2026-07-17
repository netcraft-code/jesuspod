import { useState } from "react";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import MovieCard from "../../components/MoviesSection/MovieCard";
import "../Radio/Radio.css"; // Reuse Radio CSS
import "./AllMovies.css";
import { trackMoviePlay } from "../../services/movieAnalytics";
import { useSelector, useDispatch } from "react-redux";
import { refreshSavedMovies, toggleMovieSaveState } from "../../redux/dataSlice";
import { toggleMovieSave } from "../../services/dataService";
import { useTranslation } from "../../context/LanguageContext";
import type { RootState } from "../../redux/store";
import usePageTitle from "../../hooks/usePageTitle";
import { images } from "../../assets/images";

export default function AllMovies() {
    const { t } = useTranslation();
    usePageTitle(t("movies.allMovies"));
    const [search, setSearch] = useState<string>("");
    const [active, setActive] = useState<string>("Movies");
    const [profileOpen, setProfileOpen] = useState<boolean>(false);

    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);

    const navigate = useNavigate();
    const location = useLocation();

    // 1. Get ALL movies
    const allMovies = useSelector((state: RootState) => state.data.movies);
    const savedMovies = useSelector((state: RootState) => state.data.savedMovies);

    // 3. Determine which source to use
    // Priority: 1. URL Param, 2. State
    const [searchParams] = useSearchParams();
    const categoryParam = searchParams.get("category");
    const categoryFromState = location.state?.category;

    const activeCategory = categoryParam || categoryFromState;
    const filterState = location.state?.filter;

    let sourceMovies = allMovies;

    if (filterState === 'saved') {
        sourceMovies = savedMovies;
    } else if (activeCategory) {
        if (activeCategory === "All") {
            sourceMovies = allMovies;
        } else {
            sourceMovies = allMovies.filter((m: any) => m.category === activeCategory);
        }
    }

    // Local Search Filter
    const filtered = sourceMovies.filter((item: any) =>
        item.name?.toLowerCase().includes(search.toLowerCase())
    ).sort((a: any, b: any) => {
        const titleA = (a?.name || "").toString().trim().toLowerCase();
        const titleB = (b?.name || "").toString().trim().toLowerCase();
        return titleA.localeCompare(titleB);
    });

    const handleCardClick = (item: any) => {
        // Track play
        trackMoviePlay(item.id, item.name, item.category || "Unknown");
        navigate(`/movie/${item.id}`);
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
            // Refresh saved movies list (background sync)
            dispatch(refreshSavedMovies(user.uid) as any);
        } else {
            // Revert if failed
            dispatch(toggleMovieSaveState({ movieId: item.id, userId: user.uid }));
            alert(t("movies.failedSave"));
        }
    };

    const handleShare = async () => {
        let shareUrl = window.location.origin + "/all-movies";
        let title = t("movies.allMovies");

        if (activeCategory && filterState !== 'saved') {
            shareUrl += `?category=${encodeURIComponent(activeCategory)}`;
            title = `${activeCategory} ${t("movies.allMovies")}`;
        }

        const shareData = {
            title: title,
            text: `${t("movies.shareTextPre")}${title}${t("movies.shareTextPost")}`,
            url: shareUrl,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareUrl);
                alert(t("movies.linkCopied"));
            }
        } catch (err) {
            console.error("Error sharing:", err);
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
                            ? t("movies.moviesToLove")
                            : (activeCategory ? `${activeCategory} ${t("movies.allMovies")}` : t("movies.allMovies"))
                        }
                    </h2>

                    {/* Filter container for share and search */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {filterState !== 'saved' && (
                            <button
                                className="share-btn"
                                onClick={handleShare}
                                title={t("movies.share")}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                            >
                                <img src={images.share} alt="share" style={{ width: 24, height: 24 }} />
                            </button>
                        )}
                        <input
                            className="search-input"
                            type="text"
                            placeholder={t("movies.searchPlaceholder")}
                            value={search}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setSearch(e.target.value)
                            }
                        />
                    </div>
                </div>

                {/* MOVIES GRID */}
                <div className="card-grid movies-grid">
                    {filtered.length > 0 ? (
                        filtered.map((item: any) => (
                            <div key={item.id} className="home-card-wrapper channel-wrapper">
                                <MovieCard
                                    item={item}
                                    onClick={() => handleCardClick(item)}
                                    // isSaved check: allMovies items use 'star' array. savedMovies items usage is simpler but standard is 'star'.
                                    isSaved={item.star?.includes(user?.uid)}
                                    onToggleSave={handleToggleSave}
                                    variant="sidebar"
                                />
                            </div>
                        ))
                    ) : (
                        <div style={{ color: '#aaa', marginTop: 20 }}>{t("movies.noMoviesFound")}</div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
