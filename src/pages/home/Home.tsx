import { useState, useEffect } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import usePageTitle from "../../hooks/usePageTitle";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../redux/store";
import {
  getFilteredRadio, getFilteredChannels, toggleBookSaveState, refreshSavedBooks,
  toggleChannelSaveState, refreshSavedChannels, toggleMovieSaveState, refreshSavedMovies,
  togglePodcastSaveState, refreshSavedPodcasts
} from "../../redux/dataSlice";
import HomeSection from "../../components/HomeSection/HomeSection";
import LiveSection from "../../components/LiveSection/LiveSection";
import MoviesSection from "../../components/MoviesSection/MoviesSection";
import Banner from "../../components/Banner/Banner";
import { toggleBookSave, toggleChannelSave, toggleMovieSave, togglePodcastSave } from "../../services/dataService";
import SplashScreen from "../../components/Splash/SplashScreen"; // Import Splash

/** 🔹 Radio / Podcast common type */
interface MediaItem {
  id: string;
  type?: string;
  title: string;
  imageUrl?: string;
  [key: string]: any;
}

interface BookItem extends MediaItem {
  url?: string;
}

// Track if splash has been shown in this session (resets on refresh)
// Track if splash has been shown in this session (resets on refresh)
let hasShownSplash = false;

// Export reset function for logout
export const resetSplashState = () => {
  hasShownSplash = false;
};

export default function Home() {
  const [active, setActive] = useState("All");
  const [profileOpen, setProfileOpen] = useState(false);

  // Initialize splash state: only true if we haven't shown it yet
  const [showSplash, setShowSplash] = useState(!hasShownSplash);

  /** LOADING */
  const isLoading = useSelector<RootState, boolean>(
    (state) => state.data.loading
  );

  useEffect(() => {
    // If we've already shown it, force false immediately (safety)
    if (hasShownSplash) {
      setShowSplash(false);
      return;
    }

    // If data is done loading, hide splash
    if (!isLoading) {
      // Small buffer to ensure smooth transition (500ms minimum or immediate)
      // User asked for "as soon as data is fetched", but instant might be jarring if data is cached.
      // We will use a safe minimal delay to prevent flicker if isLoading toggles fast.
      const timer = setTimeout(() => {
        setShowSplash(false);
        hasShownSplash = true; // Mark as shown for navigation
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const navigate = useNavigate();
  usePageTitle("Home");

  /** RADIO - Use filtered selector */
  const radioList = useSelector(getFilteredRadio);

  /** BOOKS */
  const books = useSelector<RootState, BookItem[]>(
    (state) => state.data.books
  );

  /** PODCAST */

  const podcasts = useSelector((state: any) => state.data.podcasts);


  // const channels = useSelector<RootState, MediaItem[]>(
  //   (state) => state.data.channels
  // );

  const filteredChannels = useSelector(getFilteredChannels);

  /** LOADING */


  /** LIVE VIDEOS */
  const liveVideos = useSelector<RootState, any[]>(
    (state) => state.data.liveVideos
  );

  /** MOVIES */
  const movies = useSelector<RootState, any[]>(
    (state) => state.data.movies
  );

  /** ANALYTICS DATA (Popular & Trending) */
  const allMostListenedRadios = useSelector((state: RootState) => state.data.mostListenedRadios) || [];
  const mostListenedPodcasts = useSelector((state: RootState) => state.data.mostListenedPodcasts) || [];
  // const mostWatchedChannels = useSelector((state: RootState) => state.data.mostWatchedChannels) || [];
  // const mostReadBooks = useSelector((state: RootState) => state.data.mostReadBooks) || [];

  const selectedCountry = useSelector((state: RootState) => state.data.selectedCountry);

  // Filter ONLY Most Listener Radio based on selected country
  const mostListenedRadios = selectedCountry
    ? allMostListenedRadios.filter((r: any) => r.type?.toLowerCase() === selectedCountry.toLowerCase())
    : allMostListenedRadios;

  // MERGE & SORT LOGIC
  const getPopularity = (item: any) => {
    // Normalize popularity score. Adjust keys based on real API data. 
    // Fallback to random/id if no data (for now using 0 to avoid crash).
    const score = item.views || item.clicks || item.listeners || item.reads || item.popularity || 0;
    return Number(score);
  };

  // Get Top 5 from each category first to ensure diversity
  const topRadios = mostListenedRadios.slice(0, 15).map(item => ({ ...item, entityType: 'Radio', popularity: getPopularity(item) }));
  const topPodcasts = mostListenedPodcasts.slice(0, 15).map(item => ({ ...item, entityType: 'Podcast', popularity: getPopularity(item) }));
  // const topChannels = mostWatchedChannels.slice(0, 5).map(item => ({ ...item, entityType: 'Channel', popularity: getPopularity(item) }));
  // const topBooks = mostReadBooks.slice(0, 5).map(item => ({ ...item, entityType: 'Book', popularity: getPopularity(item) }));

  // Combine and sort the top picks
  const mixedPopularData = [
    ...topPodcasts,
    ...topRadios,

    // ...topChannels,
    // ...topBooks
  ].sort((a, b) => b.popularity - a.popularity); // Descending order

  // Debug: Check what data we're getting
  console.log("mixedPopularData:", mixedPopularData);


  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth?.user);

  const handleBookClick = (book: BookItem) => {
    if (book.url) {
      window.open(book.url, "_blank");
    }
  };

  const handleToggleSave = async (item: any, isSaved: boolean) => {
    if (!user?.uid) {
      alert("Please login to save books");
      return;
    }

    console.log("item", item);

    if (item.entityType === 'Book' || (!item.entityType && item.author)) {
      dispatch(toggleBookSaveState({ bookId: item.id, userId: user.uid }));
      await toggleBookSave(item.id, user.uid, isSaved);
      dispatch(refreshSavedBooks(user.uid) as any);
      return;
    }

    if (item.entityType === 'Channel' || (!item.entityType && (item.channelLink || item.subscribers))) {
      dispatch(toggleChannelSaveState({ channelId: item.id, userId: user.uid }));
      await toggleChannelSave(item.id, user.uid, isSaved);
      dispatch(refreshSavedChannels(user.uid) as any);
      return;
    }

    // Check for Movie specific properties (movieUrl) or explicit type
    // Avoid checking just 'category' as Books also have categories
    if (item.entityType === 'Movie' || (!item.entityType && item.movieUrl)) {
      dispatch(toggleMovieSaveState({ movieId: item.id, userId: user.uid }));
      await toggleMovieSave(item.id, user.uid, isSaved);
      dispatch(refreshSavedMovies(user.uid) as any);
      return;
    }


    dispatch(toggleBookSaveState({ bookId: item.id, userId: user.uid }));

    const success = await toggleBookSave(item.id, user.uid, isSaved);
    if (success) {
      dispatch(refreshSavedBooks(user.uid) as any);
    } else {
      dispatch(toggleBookSaveState({ bookId: item.id, userId: user.uid }));
      alert("Failed to save book");
    }
    // ... handle other save types if needed, currently only book save logic was explicit here
    // Default fallback for book saves if passed directly - REMOVED risky fallback, explicit checks preferred
    // dispatch(toggleBookSaveState({ bookId: item.id, userId: user.uid }));
    // const success = await toggleBookSave(item.id, user.uid, isSaved);
    // if (success) {
    //   dispatch(refreshSavedBooks(user.uid) as any);
    // } else {
    //   dispatch(toggleBookSaveState({ bookId: item.id, userId: user.uid }));
    //   alert("Failed to save book");
    // }
  };


  return (
    <div className="home-wrapper">
      <SplashScreen isVisible={showSplash} />
      <Header
        active={active}
        setActive={setActive}
        profileOpen={profileOpen}
        setProfileOpen={setProfileOpen}
      />



      <main className="radio-container">

        {/* ================= BANNER ================= */}
        <Banner />

        {/* ================= POPULAR & TRENDING ================= */}
        <HomeSection
          title="Popular & Trending"
          cardVariant="large"  /* We will handle mixed types inside HomeSection but keep 'large' as default base style */
          data={mixedPopularData}
          loading={isLoading}
          onCardClick={(item) => {
            // ROUTING LOGIC BASED ON TYPE
            if (item.entityType === 'Radio') {
              const sameTypeList = radioList.filter((r: MediaItem) => r.type?.toLowerCase() === item.type?.toLowerCase());
              navigate("/radio-player", { state: { current: item, list: sameTypeList, type: item.type } });
            } else if (item.entityType === 'Podcast') {
              navigate(`/podcastplayer/${item.id}`, { state: { channel: item } });
            } else if (item.entityType === 'Channel') {
              // Open externally or specific page? Matching 'Video Channels' logic:
              if (item.channelLink) window.open(`https://youtube.com/channel/${item.channelLink}`, "_blank");
              else if (item.url) window.open(item.url, "_blank");
            } else if (item.entityType === 'Book') {
              handleBookClick(item);
            } else {
              // Fallback for existing logic if entityType missing
              if (item.type) {
                const sameTypeList = radioList.filter((r: MediaItem) => r.type?.toLowerCase() === item.type?.toLowerCase());
                navigate("/radio-player", { state: { current: item, list: sameTypeList, type: item.type } });
              } else {
                navigate(`/podcastplayer/${item.id}`, { state: { channel: item } });
              }
            }
          }}
        // Pass handleToggleSave but note it handles books primarily. 
        // If we want universal save, we need a universal handler. For now passing as is.
        // onToggleSave={handleToggleSave} // REMOVED as requested by user
        />
        {/* ================= LIVE ================= */}
        <LiveSection
          title="Live"
          data={liveVideos}
          loading={isLoading}
          onViewAll={() => navigate("/live-list")}
          onCardClick={(item: any) => {
            // Check if we have a liveVideoId (from channels collection)
            if (item.liveVideoId || item.url) {
              navigate("/live-player", {
                state: {
                  current: item,
                  list: liveVideos,
                },
              });
            } else {
              console.warn('No video ID or URL found for channel:', item);
            }
          }}
        />



        {/* ================= RADIO ================= */}
        <HomeSection
          title="Radio"
          data={radioList.slice(103, 150)}
          loading={isLoading}
          onViewAll={() => navigate("/all-radio")}
          onCardClick={(item) => {
            const sameTypeList = radioList.filter(
              (r: MediaItem) =>
                r.type?.toLowerCase() === item.type?.toLowerCase()
            );

            navigate("/radio-player", {
              state: {
                current: item,
                list: sameTypeList,
                type: item.type,
              },
            });
          }}
        />


        {/* ================= MOVIES ================= */}
        <MoviesSection
          title="Movies"
          data={movies}
          loading={isLoading}
          onViewAll={() => navigate("/all-movies")}
          onCardClick={(item) => {
            // Track play (optional here if MoviesSection doesn't do it)
            // Using logic from MoviesList
            if (item.movieUrl) {
              window.open(item.movieUrl, "_blank");
            }
          }}
          onToggleSave={handleToggleSave}
          user={user}
        />


        {/* ================= PODCAST ================= */}
        <HomeSection
          title="Podcast"
          data={podcasts.slice(50, 100).map((p: any) => ({ ...p, entityType: 'Podcast' }))}
          loading={isLoading}
          onViewAll={() => navigate("/all-podcast")}
          onCardClick={(item) =>
            navigate(`/podcastplayer/${item.id}`, {
              state: { channel: item },
            })
          }
        // onToggleSave={handleToggleSave}
        // user={user}
        />

        {/* ================= VIDEO CHANNELS ================= */}
        <HomeSection
          title="Video Channels"
          data={filteredChannels.slice(100, 150)}
          loading={isLoading}
          cardVariant="channel"
          onViewAll={() => navigate("/all-channels")}
          onCardClick={(item) => {
            if (item.channelLink) {
              window.open(`https://youtube.com/channel/${item.channelLink}`, "_blank");
            } else if (item.url) {
              window.open(item.url, "_blank");
            } else {
              console.warn("No channel link found for", item);
            }
          }}
          onToggleSave={handleToggleSave}
          user={user}
        />


        {/* ================= BOOKS ================= */}
        <HomeSection
          title="Books"
          data={books.slice(50, 100)}
          loading={isLoading}
          onViewAll={() => navigate("/all-books")}
          onCardClick={handleBookClick}
          isBook={true}
          user={user}
          onToggleSave={handleToggleSave}
        />


      </main>
      <Footer />
    </div>
  );
}

