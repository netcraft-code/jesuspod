import { useState } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./Radio.css";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { getFilteredRadio } from "../../redux/dataSlice";
import Section from "../../components/Section/Section";
import CircleImageCard from "../../components/Cards/CircleImageCard";
import usePageTitle from "../../hooks/usePageTitle";
import { images } from "../../assets/images";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../services/firebase";

/** 🔹 Radio item type */
interface RadioItem {
  id: string;
  title: string;
  type?: string;
  [key: string]: any;
}


interface CountryItem {
  id: string;
  title: string;
  imageUrl: string;
  order?: number;
}

export default function RadioList() {
  const navigate = useNavigate();

  const [active, setActive] = useState<string>("Radio");
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  usePageTitle("Radio")
  // ✅ Use filtered radio selector
  const radio = useSelector(getFilteredRadio);

  // ✅ Get ALL radios (unfiltered) for country navigation
  const allRadios = useSelector((state: RootState) => state.data.radio);

  const selectedCountry = useSelector((state: RootState) => state.data.selectedCountry);

  const countries = [...useSelector<RootState, CountryItem[]>(
    (state) => state.data.Countries
  )].sort((a, b) => a.title.localeCompare(b.title));

  // Analytics data from Redux with fallback to empty arrays
  const allMostListenedRadios = useSelector((state: RootState) => state.data.mostListenedRadios) || [];
  const topUSARadios = useSelector((state: RootState) => state.data.topUSARadios) || [];
  const savedRadios = useSelector((state: RootState) => state.data.savedRadios) || [];

  // Filter ONLY Most Listener Radio based on selected country
  const mostListenedRadios = selectedCountry
    ? allMostListenedRadios.filter((r: any) => r.type?.toLowerCase() === selectedCountry.toLowerCase())
    : allMostListenedRadios;



  // --- GLOBAL SEARCH FILTERING ---
  const filteredMostListened = mostListenedRadios.filter((item: RadioItem) =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTopUSA = topUSARadios.filter((item: RadioItem) =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSaved = savedRadios.filter((item: RadioItem) =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // const filteredCountries = countries.filter((c) =>
  //   c.title.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: "JesusPOD Radio",
      text: "Listen to live Christian radio stations on JesusPOD!",
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        logEvent(analytics, "Share_RadioHome", {});
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const handleShareCountry = async (country: CountryItem) => {
    const shareUrl = `${window.location.origin}/radio-player?type=${encodeURIComponent(country.title)}`;
    const shareData = {
      title: `${country.title} Radio Stations`,
      text: `Listen to ${country.title} radio stations on JesusPOD!`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        logEvent(analytics, "Share_RadioCountry", { country: country.title });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing country:", err);
    }
  };

  /** 🔹 Common click handler */
  const handleRadioClick = (item: RadioItem) => {
    console.log("🎵 Radio clicked:", item);
    console.log("📻 Radio type/country:", item.type);

    const sameTypeList = radio.filter(
      (r: RadioItem) => r.type?.toLowerCase() === item.type?.toLowerCase()
    );

    console.log("📋 Filtered playlist:", sameTypeList.length, "radios");
    console.log("📋 Playlist items:", sameTypeList);

    navigate(`/radio-player?type=${encodeURIComponent(item.type || 'Radio')}`, {
      state: {
        current: item,
        list: sameTypeList,
        type: item.type,
      },
    });
  };

  return (
    <div className="radio-page">
      {/* HEADER */}
      <Header
        active={active}
        setActive={setActive}
        profileOpen={profileOpen}
        setProfileOpen={setProfileOpen}
      />

      <main className="radio-container" style={{ minHeight: '80vh', paddingBottom: 40 }}>

        {/* GLOBAL SEARCH BAR */}
        <div style={{ padding: '0 20px', marginBottom: '20px', marginTop: '-15px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }}>
          <button
            className="share-btn"
            onClick={handleShare}
            title="Share Radio Page"
          >
            <img src={images.share} alt="share" />
            <span>Share</span>
          </button>
          <input
            type="text"
            className="search-input"
            placeholder="Search for radios..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            style={{ width: '100%', maxWidth: '400px' }}
          />
        </div>


        {/* ================= MOST LISTENER ================= */}
        {filteredMostListened.length > 0 && (
          <Section
            title="Most Listened Radio"
            data={filteredMostListened}
            onViewAll={() => navigate("/all-radio")}
            onCardClick={handleRadioClick}
          />
        )}

        {/* ================= TOP 10 USA ================= */}
        {filteredTopUSA.length > 0 && (
          <Section
            title="Top 10 in USA"
            data={filteredTopUSA}
            onViewAll={() => navigate("/all-radio")}
            onCardClick={handleRadioClick}
          />
        )}

        {/* ================= RADIO TO LOVE ================= */}
        {filteredSaved.length > 0 && (
          <Section
            title="Radio To Love"
            data={filteredSaved}
            onViewAll={() => navigate("/favorite-radios")}
            onCardClick={handleRadioClick}
          />
        )}

        <div className="search-radio-section">

          <div className="search-radio-header">
            <h2 className="sub-title"> By Country</h2>
            {/* Removed Local Search Input */}
          </div>

          <div className="country-grid">
            {countries.map((item) => (
              <CircleImageCard
                key={item.id}
                title={item.title}
                imageUrl={item.imageUrl}
                onClick={() => {
                  // Country title ko type ke basis pe filter - USE UNFILTERED DATA
                  const sameTypeList = allRadios.filter(
                    (r) => r.type?.toLowerCase() === item.title.toLowerCase()
                  );

                  // Pehla matching radio ko current banaye
                  const currentRadio = sameTypeList[0] ?? null;
                  if (!currentRadio) return; // agar koi match nahi

                  // Navigate to radio-player
                  navigate(`/radio-player?type=${encodeURIComponent(item.title)}`, {
                    state: {
                      current: currentRadio,
                      list: sameTypeList,
                      type: item.title, // country title as type
                    },
                  });
                }}
                onShare={() => handleShareCountry(item)}
              />
            ))}
          </div>


        </div>

      </main>
      <Footer />
    </div>
  );
}
