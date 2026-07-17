
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import MovieCard from "../../components/MoviesSection/MovieCard";
import "./MovieDetail.css";
import type { RootState } from "../../redux/store";
import { trackMoviePlay } from "../../services/movieAnalytics";
import { toggleMovieSave } from "../../services/dataService";
import { refreshSavedMovies, toggleMovieSaveState } from "../../redux/dataSlice";
import { images } from "../../assets/images";
import usePageTitle from "../../hooks/usePageTitle";
import { useTranslation } from "../../context/LanguageContext";

export default function MovieDetail() {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [active, setActive] = useState("Movies");
    const [profileOpen, setProfileOpen] = useState(false);

    const { movies } = useSelector((state: RootState) => state.data);
    const user = useSelector((state: RootState) => state.auth.user);
    const movie = movies.find((m: any) => m.id === id);

    usePageTitle(movie ? movie.name : t("movies.notFound"));

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    if (!movie) {
        return (
            <div className="main-content">
                <Header active={active} setActive={setActive} profileOpen={profileOpen} setProfileOpen={setProfileOpen} />
                <div className="movie-detail-container">
                    <h2>{t("movies.notFound")}</h2>
                    <button className="btn-secondary" onClick={() => navigate("/movies")}>{t("movies.backToMovies")}</button>
                </div>
                <Footer />
            </div>
        );
    }

    const recommendedMovies = movies
        .filter((m: any) => m.category === movie.category && m.id !== movie.id);

    const isSaved = movie.star?.includes(user?.uid);

    const handleWatchNow = () => {
        trackMoviePlay(movie.id, movie.name, movie.category || "Unknown");
        if (movie.movieUrl) {
            window.open(movie.movieUrl, "_blank");
        }
    };

    const handleToggleSave = async () => {
        if (!user?.uid) {
            alert(t("movies.pleaseLogin"));
            return;
        }

        dispatch(toggleMovieSaveState({ movieId: movie.id, userId: user.uid }));
        const success = await toggleMovieSave(movie.id, user.uid, isSaved);
        if (success) {
            dispatch(refreshSavedMovies(user.uid) as any);
        } else {
            dispatch(toggleMovieSaveState({ movieId: movie.id, userId: user.uid }));
            alert(t("movies.failedSave"));
        }
    };

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/api/share?type=movie&id=${encodeURIComponent(movie.id)}`;
        const shareData = {
            title: movie.name,
            text: `Check out "${movie.name}" on JesusPOD`,
            url: shareUrl,
        };

        if (navigator.share) {
            navigator.share(shareData).catch((err) => console.log("Share cancelled", err));
        } else {
            navigator.clipboard.writeText(shareUrl);
            alert(t("movies.linkCopied"));
        }
    };

    return (
        <div className="main-content">
            <Header active={active} setActive={setActive} profileOpen={profileOpen} setProfileOpen={setProfileOpen} />

            <div className="movie-detail-container">
                <div className="movie-detail-main">
                    <div className="movie-detail-left">
                        <div className="movie-detail-image-wrapper">
                            <img src={movie.image || movie.imageUrl} alt={movie.name} className="movie-detail-image" />
                        </div>
                    </div>

                    <div className="movie-detail-right">
                        <h1 className="movie-detail-title">{movie.name}</h1>
                        <p className="movie-detail-category">{movie.category || "Category"}</p>
                        <p className="movie-detail-description">
                            {movie.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."}
                        </p>

                        <div className="movie-detail-actions">
                            <button className="btn-primary" onClick={handleWatchNow}>
                                {t("movies.watchNow")}
                            </button>
                            <button className={`btn-secondary ${isSaved ? 'active' : ''}`} onClick={handleToggleSave}>
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill={isSaved ? "#fb4a4a" : "none"}
                                    stroke={isSaved ? "#fb4a4a" : "#fff"}
                                    strokeWidth="2"
                                >
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                                {isSaved ? t("movies.liked") : t("movies.like")}
                            </button>
                            <button className="btn-secondary" onClick={handleShare}>
                                <img src={images.share} alt="share" style={{ width: 20, height: 20, filter: 'brightness(0) invert(1)' }} />
                                {t("movies.share")}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="recommended-section">
                    <div className="recommended-header">
                        <h2 className="recommended-title">{t("movies.recommended")}</h2>
                        <button className="view-all-link" onClick={() => navigate("/all-movies", { state: { category: movie.category } })}>
                            {t("common.viewAll")}
                        </button>
                    </div>
                    <div className="recommended-scroll-wrapper">
                        <div className="recommended-horizontal-grid">
                            {recommendedMovies.map((item: any) => (
                                <MovieCard
                                    key={item.id}
                                    item={item}
                                    onClick={() => navigate(`/movie/${item.id}`)}
                                    isSaved={item.star?.includes(user?.uid)}
                                    onToggleSave={(i, s) => {
                                        if (!user?.uid) {
                                            alert(t("movies.pleaseLogin"));
                                            return;
                                        }
                                        dispatch(toggleMovieSaveState({ movieId: i.id, userId: user.uid }));
                                        toggleMovieSave(i.id, user.uid, s).then(res => {
                                            if (res) dispatch(refreshSavedMovies(user.uid) as any);
                                            else dispatch(toggleMovieSaveState({ movieId: i.id, userId: user.uid }));
                                        });
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
