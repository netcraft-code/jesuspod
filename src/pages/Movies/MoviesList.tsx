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

export default function MoviesList() {
    usePageTitle("Movies");
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);

    const [active, setActive] = useState("Movies");
    const [profileOpen, setProfileOpen] = useState(false);
    const [categorySearch, setCategorySearch] = useState("");
    // const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // Removed: Navigating to AllMovies instead

    const loading = useSelector((state: RootState) => state.data.loading);

    // Data from Redux
    const allMovies = useSelector((state: RootState) => state.data.movies) || [];
    const mostWatchedMovies = useSelector((state: RootState) => state.data.mostWatchedMovies) || [];
    const savedMovies = useSelector((state: RootState) => state.data.savedMovies) || [];

    // Get Unique Categories
    const categories = Array.from(new Set(allMovies.map((m: any) => m.category).filter(Boolean)));

    // Filter Categories based on search
    const filteredCategories = categories.filter((c: any) =>
        c.toLowerCase().includes(categorySearch.toLowerCase())
    );

    // Handlers
    const handleCardClick = (item: any) => {
        // Track play
        trackMoviePlay(item.id, item.title, item.category || "Unknown");

        // Open in new tab
        if (item.movieUrl) {
            window.open(item.movieUrl, "_blank");
        }
    };

    const handleCategorySelect = (category: string | null) => {
        // Navigate to All Movies with category filter
        if (category) {
            navigate("/all-movies", { state: { category: category } });
        } else {
            navigate("/all-movies");
        }
    };

    const handleToggleSave = async (item: any, isSaved: boolean) => {
        if (!user?.uid) {
            alert("Please login to save movies");
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
            alert("Failed to save movie");
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

                {/* 1. Most Watched Movies */}
                <HomeSection
                    title="Most Watched Movies"
                    data={mostWatchedMovies}
                    loading={loading}
                    cardVariant="channel"
                    onViewAll={() => navigate("/all-movies")}
                    onCardClick={handleCardClick}
                    onToggleSave={handleToggleSave}
                    user={user}
                />

                {/* 2. Movies to Love (Favorites) */}
                <HomeSection
                    title="Movies to Love"
                    data={savedMovies}
                    loading={loading}
                    cardVariant="channel"
                    onViewAll={() => navigate("/all-movies", { state: { filter: 'saved' } })}
                    onCardClick={handleCardClick}
                    onToggleSave={handleToggleSave}
                    user={user}
                    emptyMessage="Start saving movies to see them here ❤️"
                />

                {/* 3. Search for Movies (Category Grid) */}
                <div className="search-radio-section" style={{ marginTop: 40 }}>
                    <div className="search-radio-header">
                        <h2 className="sub-title">Search by Category</h2>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search category..."
                            value={categorySearch}
                            onChange={(e) => setCategorySearch(e.target.value)}
                        />
                    </div>

                    {/* Category Grid */}
                    <div className="country-grid">


                        {filteredCategories.map((cat: any) => (
                            <CircleImageCard
                                key={cat}
                                title={cat}
                                imageUrl={`https://ui-avatars.com/api/?name=${cat}&background=random&color=fff&size=200`}
                                onClick={() => handleCategorySelect(cat)}
                            />
                        ))}
                    </div>
                </div>

            </main>
            <Footer />
        </div>
    );
}
