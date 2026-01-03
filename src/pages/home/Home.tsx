import { useState } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import usePageTitle from "../../hooks/usePageTitle";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../redux/store";
import { getFilteredRadio, getFilteredChannels, toggleBookSaveState, refreshSavedBooks } from "../../redux/dataSlice";
import HomeSection from "../../components/HomeSection/HomeSection";
import LiveSection from "../../components/LiveSection/LiveSection";
import { toggleBookSave } from "../../services/dataService";

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

export default function Home() {
  const [active, setActive] = useState("All");
  const [profileOpen, setProfileOpen] = useState(false);

  const navigate = useNavigate();
  usePageTitle("Home");

  /** RADIO - Use filtered selector */
  const radioList = useSelector(getFilteredRadio);

  /** BOOKS */
  const books = useSelector<RootState, BookItem[]>(
    (state) => state.data.books
  );

  /** PODCAST */
  const channels = useSelector<RootState, MediaItem[]>(
    (state) => state.data.channels
  );

  const filteredChannels = useSelector(getFilteredChannels);

  /** LOADING */
  const isLoading = useSelector<RootState, boolean>(
    (state) => state.data.loading
  );

  /** LIVE VIDEOS */
  const liveVideos = useSelector<RootState, any[]>(
    (state) => state.data.liveVideos
  );

  /** ANALYTICS DATA (Popular & Trending) */
  const allMostListenedRadios = useSelector((state: RootState) => state.data.mostListenedRadios) || [];
  const mostListenedPodcasts = useSelector((state: RootState) => state.data.mostListenedPodcasts) || [];
  const selectedCountry = useSelector((state: RootState) => state.data.selectedCountry);

  // Filter ONLY Most Listener Radio based on selected country
  const mostListenedRadios = selectedCountry
    ? allMostListenedRadios.filter((r: any) => r.type?.toLowerCase() === selectedCountry.toLowerCase())
    : allMostListenedRadios;

  // Debug: Check what data we're getting
  console.log("Live Videos Data:", liveVideos);
  console.log("Live Videos Count:", liveVideos.length);

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

    dispatch(toggleBookSaveState({ bookId: item.id, userId: user.uid }));

    const success = await toggleBookSave(item.id, user.uid, isSaved);
    if (success) {
      dispatch(refreshSavedBooks(user.uid) as any);
    } else {
      dispatch(toggleBookSaveState({ bookId: item.id, userId: user.uid }));
      alert("Failed to save book");
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



      <main className="radio-container">

        {/* ================= POPULAR & TRENDING ================= */}
        <HomeSection
          title="Popular & Trending"
          cardVariant="large"
          data={[...mostListenedPodcasts.slice(0, 10), ...mostListenedRadios.slice(0, 10)]}
          loading={isLoading}
          onCardClick={(item) => {
            // CHECK IF RADIO (has 'type') OR PODCAST
            if (item.type) {
              // RADIO LOGIC
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
            } else {
              // PODCAST LOGIC
              navigate(`/podcastplayer/${item.id}`, {
                state: { channel: item },
              });
            }
          }}
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
          data={radioList}
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

        {/* ================= PODCAST ================= */}
        <HomeSection
          title="Podcast"
          data={channels}
          loading={isLoading}
          onViewAll={() => navigate("/all-podcast")}
          onCardClick={(item) =>
            navigate(`/podcastplayer/${item.id}`, {
              state: { channel: item },
            })
          }
        />

        {/* ================= VIDEO CHANNELS ================= */}
        <HomeSection
          title="Video Channels"
          data={filteredChannels.slice(0, 30)}
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
        />


        {/* ================= BOOKS ================= */}
        <HomeSection
          title="Books"
          data={books}
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

