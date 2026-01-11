import { useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import MovieCard from "../../components/MoviesSection/MovieCard";
import "../Radio/Radio.css"; // Reuse Radio CSS
import { trackMoviePlay } from "../../services/movieAnalytics";
import { useSelector, useDispatch } from "react-redux";
import { refreshSavedMovies, toggleMovieSaveState } from "../../redux/dataSlice";
import { toggleMovieSave } from "../../services/dataService";
import type { RootState } from "../../redux/store";

import usePageTitle from "../../hooks/usePageTitle";

export default function AllMovies() {
    usePageTitle("All Movies");
    const [search, setSearch] = useState<string>("");
    const [active, setActive] = useState<string>("Movies");
    const [profileOpen, setProfileOpen] = useState<boolean>(false);

    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);

    const location = useLocation();

    // 1. Get ALL movies
    const allMovies = useSelector((state: RootState) => state.data.movies);
    const savedMovies = useSelector((state: RootState) => state.data.savedMovies);

    // 3. Determine which source to use
    // If location.state.category exists, filter raw movies by it.
    // If location.state.filter === 'saved', use savedMovies.
    // Otherwise, use allMovies.
    const categoryFromState = location.state?.category;
    const filterState = location.state?.filter;

    let sourceMovies = allMovies;

    if (filterState === 'saved') {
        sourceMovies = savedMovies;
    } else if (categoryFromState) {
        if (categoryFromState === "All") {
            sourceMovies = allMovies;
        } else {
            sourceMovies = allMovies.filter((m: any) => m.category === categoryFromState);
        }
    }

    // Local Search Filter
    const filtered = sourceMovies.filter((item: any) =>
        item.name?.toLowerCase().includes(search.toLowerCase())
    );

    const handleCardClick = (item: any) => {
        // Track play
        trackMoviePlay(item.id, item.name, item.category || "Unknown");

        // Open in new tab
        if (item.movieUrl) {
            window.open(item.movieUrl, "_blank");
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
            // Refresh saved movies list (background sync)
            dispatch(refreshSavedMovies(user.uid) as any);
        } else {
            // Revert if failed
            dispatch(toggleMovieSaveState({ movieId: item.id, userId: user.uid }));
            alert("Failed to save movie");
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
                            ? "Movies to Love"
                            : (categoryFromState ? `${categoryFromState} Movies` : "All Movies")
                        }
                    </h2>

                    <input
                        className="search-input"
                        type="text"
                        placeholder="Search movies..."
                        value={search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setSearch(e.target.value)
                        }
                    />
                </div>

                {/* MOVIES GRID */}
                <div className="card-grid">
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
                        <div style={{ color: '#aaa', marginTop: 20 }}>No movies found.</div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
