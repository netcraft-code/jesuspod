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
  toggleChannelSaveState, refreshSavedChannels, toggleMovieSaveState, refreshSavedMovies
} from "../../redux/dataSlice";
import HomeSection from "../../components/HomeSection/HomeSection";
import LiveSection from "../../components/LiveSection/LiveSection";
import MoviesSection from "../../components/MoviesSection/MoviesSection";
import Banner from "../../components/Banner/Banner";
import { toggleBookSave, toggleChannelSave, toggleMovieSave } from "../../services/dataService";
import SplashScreen from "../../components/Splash/SplashScreen"; // Import Splash
import PageInfo from "../../components/UI/PageInfo";
import { trackMoviePlay } from "../../services/movieAnalytics";
import { trackBookRead } from "../../services/booksAnalytics";

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

  /** SELECTORS */
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth?.user);
  const isLoading = useSelector<RootState, boolean>(
    (state) => state.data.loading
  );
  const podcasts = useSelector((state: RootState) => state.data.podcasts) || [];
  const mostListenedPodcasts = useSelector((state: RootState) => state.data.mostListenedPodcasts) || [];

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

  const handleBookClick = (book: BookItem) => {
    trackBookRead(book.id, book.title, book.type || "Unknown");
    navigate(`/book/${book.id}`);
  };

  const handleToggleSave = async (item: any, isSaved: boolean) => {
    if (!user?.uid) {
      alert("Please login to save items");
      return;
    }

    // console.log("item", item);

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
       <Banner bannerType="home" />

        <PageInfo
          title="All Your Favorite Christian Content in One Place"
          description="Are you looking for a way to grow your faith without searching the whole internet? JesusPod brings together the world’s best Christian resources into a single app designed for your spiritual growth. Instead of hopping between different sites, you can find everything you need to stay encouraged and connected to the Word in one secure place."
        />

        {/* ================= POPULAR & TRENDING ================= */}
        {mostListenedPodcasts.length > 0 && (
          <HomeSection
            title="Popular & Trending"
            data={mostListenedPodcasts.slice(0, 15)}
            loading={isLoading}
            onViewAll={() => navigate("/podcast?filter=popular")}
            onCardClick={(item) =>
              navigate(`/podcastplayer/${item.id}`, {
                state: { channel: item },
              })
            }
          />
        )}
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
          data={radioList}
          loading={isLoading}
          onViewAll={() => navigate("/radio")}
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
          onViewAll={() => navigate("/movies")}
          onCardClick={(item) => {
            trackMoviePlay(item.id, item.title, item.category || "Unknown");
            navigate(`/movie/${item.id}`);
          }}
          onToggleSave={handleToggleSave}
          user={user}
        />


        {/* ================= PODCAST ================= */}
        <HomeSection
          title="Podcast"
          data={podcasts.slice(20, 100).map((p: any) => ({ ...p, entityType: 'Podcast' }))}
          loading={isLoading}
          onViewAll={() => navigate("/podcast")}
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
          data={filteredChannels}
          loading={isLoading}
          cardVariant="channel"
          onViewAll={() => navigate("/channel-listing")}
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
          data={books.slice(20, 100)}
          loading={isLoading}
          onViewAll={() => navigate("/books")}
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

