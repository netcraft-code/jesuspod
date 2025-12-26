import { useState } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import usePageTitle from "../../hooks/usePageTitle";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { getFilteredRadio } from "../../redux/dataSlice";
import HomeSection from "../../components/HomeSection/HomeSection";
// import type { LiveVideo } from "../../services/liveService";

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

  /** LOADING */
  const isLoading = useSelector<RootState, boolean>(
    (state) => state.data.loading
  );

  /** LIVE VIDEOS */
  const liveVideos = useSelector<RootState, any[]>(
    (state) => state.data.liveVideos
  );

  // Debug: Check what data we're getting
  console.log("Live Videos Data:", liveVideos);
  console.log("Live Videos Count:", liveVideos.length);

  const handleBookClick = (book: BookItem) => {
    if (book.url) {
      window.open(book.url, "_blank");
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

        {/* ================= BOOKS ================= */}
        <HomeSection
          title="Books"
          data={books}
          loading={isLoading}
          onViewAll={() => navigate("/all-books")}
          onCardClick={handleBookClick}
        />

        {/* ================= LIVE ================= */}
        <HomeSection
          title="Live"
          data={liveVideos}
          loading={isLoading}
          onViewAll={() => navigate("/live-player")}
          onCardClick={(item: any) => {
            const isYouTube = item.url?.includes('youtube.com') || item.url?.includes('youtu.be');

            if (isYouTube) {
              navigate("/live-player", {
                state: {
                  current: item,
                  list: liveVideos,
                },
              });
            } else {
              window.open(item.url, '_blank');
            }
          }}
          showLiveBadge={true}
        />

      </main>
      <Footer />
    </div>
  );
}

