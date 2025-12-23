import { useState } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import usePageTitle from "../../hooks/usePageTitle";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import HomeSection from "../../components/HomeSection/HomeSection";

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

  /** RADIO */
  const radioList = useSelector<RootState, MediaItem[]>(
    (state) => state.data.radio
  );

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
              (r) =>
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
      </main>
      <Footer />
    </div>
  );
}

