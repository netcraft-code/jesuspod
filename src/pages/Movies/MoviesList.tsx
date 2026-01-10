import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import MovieCard from "../../components/MoviesSection/MovieCard";
import "./Movies.css";

export default function MoviesList() {
    const [active, setActive] = useState<string>("Movies");
    const [profileOpen, setProfileOpen] = useState<boolean>(false);
    // const [searchQuery, setSearchQuery] = useState<string>("");
    const searchQuery = "";
    // Get movies from Redux
    const movies = useSelector<RootState, any[]>(
        (state) => state.data.movies
    );

    const loading = useSelector<RootState, boolean>(
        (state) => state.data.loading
    );

    // Filter movies based on search query
    const filteredMovies = movies.filter((movie) =>
        movie.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Get data from navigation state
    const location = useLocation();
    const stateData = location.state as { current?: any };

    // Auto-select first movie
    const [currentMovie, setCurrentMovie] = useState<any>(
        stateData?.current || null
    );

    useEffect(() => {
        if (!currentMovie && filteredMovies.length > 0) {
            setCurrentMovie(filteredMovies[0]);
        }
    }, [filteredMovies, currentMovie]);


    const handleMovieClick = (movie: any) => {
        setCurrentMovie(movie);
    };

    // Get Embed URL
    const getEmbedUrl = (movie: any): string | null => {
        if (!movie?.movieUrl) return null;

        const url = movie.movieUrl;

        // Check for YouTube
        if (url.includes('youtube.com/watch')) {
            const urlParams = new URLSearchParams(url.split('?')[1]);
            const videoId = urlParams.get('v') || '';
            return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
        } else if (url.includes('youtube.com/live/')) {
            const videoId = url.split('youtube.com/live/')[1]?.split('?')[0] || '';
            return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
        } else if (url.includes('youtu.be/')) {
            const videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
            return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
        }

        // Return original URL for other sources (FaithChannel etc.)
        // Note: Some sites might block iframe embedding (X-Frame-Options)
        return url;
    };


    const embedUrl = currentMovie ? getEmbedUrl(currentMovie) : null;

    return (
        <div className="movies-page">
            <Header
                active={active}
                setActive={setActive}
                profileOpen={profileOpen}
                setProfileOpen={setProfileOpen}
            />

            <div className="movies-player-container">
                {/* Left Sidebar */}
                <div className="movies-sidebar">
                    {/* <h3 className="sidebar-title">Movies</h3> */}
                    {/* 
                    <div className="search-section-sidebar">
                        <input
                            type="text"
                            className="search-input-sidebar"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div> */}

                    <div className="sidebar-playlist">
                        {loading && filteredMovies.length === 0 ? (
                            <div className="loading-container">
                                <div className="spinner"></div>
                            </div>
                        ) : filteredMovies.length === 0 ? (
                            <div className="no-data-container">
                                <p>No movies found</p>
                            </div>
                        ) : (
                            filteredMovies.map((item) => (
                                <MovieCard
                                    key={item.id || item._id || Math.random()}
                                    item={item}
                                    onClick={() => handleMovieClick(item)}
                                    isActive={currentMovie?.id === item.id || currentMovie?._id === item._id}
                                    variant="sidebar"
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Right Player Area */}
                <div className="movies-player-main">
                    {currentMovie && embedUrl ? (
                        <>
                            <div className="player-wrapper">
                                <iframe
                                    className="youtube-player"
                                    src={embedUrl}
                                    title={currentMovie.name}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                            <div className="player-info">
                                <h2 className="player-title">{currentMovie.name}</h2>
                                {currentMovie.category && (
                                    <p className="player-channel">{currentMovie.category}</p>
                                )}
                                <p className="player-description" style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.5' }}>
                                    {currentMovie.description}
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="no-video">
                            <p>No movie selected</p>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}
