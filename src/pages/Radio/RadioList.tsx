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
  const [countrySearch, setCountrySearch] = useState<string>("");
  usePageTitle("Radio")
  // ✅ Use filtered radio selector
  const radio = useSelector(getFilteredRadio);

  // ✅ Get ALL radios (unfiltered) for country navigation
  const allRadios = useSelector((state: RootState) => state.data.radio);

  const selectedCountry = useSelector((state: RootState) => state.data.selectedCountry);

  const countries = useSelector<RootState, CountryItem[]>(
    (state) => state.data.Countries
  );

  // Analytics data from Redux with fallback to empty arrays
  const allMostListenedRadios = useSelector((state: RootState) => state.data.mostListenedRadios) || [];
  const topUSARadios = useSelector((state: RootState) => state.data.topUSARadios) || [];
  const savedRadios = useSelector((state: RootState) => state.data.savedRadios) || [];

  // Filter ONLY Most Listener Radio based on selected country
  const mostListenedRadios = selectedCountry
    ? allMostListenedRadios.filter((r: any) => r.type?.toLowerCase() === selectedCountry.toLowerCase())
    : allMostListenedRadios;



  const filteredCountries = countries.filter((c) =>
    c.title.toLowerCase().includes(countrySearch.toLowerCase())
  );

  /** 🔹 Common click handler */
  const handleRadioClick = (item: RadioItem) => {
    console.log("🎵 Radio clicked:", item);
    console.log("📻 Radio type/country:", item.type);

    const sameTypeList = radio.filter(
      (r: RadioItem) => r.type?.toLowerCase() === item.type?.toLowerCase()
    );

    console.log("📋 Filtered playlist:", sameTypeList.length, "radios");
    console.log("📋 Playlist items:", sameTypeList);

    navigate("/radio-player", {
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

      <div className="radio-container">

        {/* ================= MOST LISTENER ================= */}
        <Section
          title="Most Listener Radio"
          data={mostListenedRadios}
          onViewAll={() => navigate("/all-radio")}
          onCardClick={handleRadioClick}
        />

        {/* ================= TOP 10 USA ================= */}
        <Section
          title="Top 10 in USA"
          data={topUSARadios}
          onViewAll={() => navigate("/all-radio")}
          onCardClick={handleRadioClick}
        />

        {/* ================= RADIO TO LOVE ================= */}
        <Section
          title="Radio To Love"
          data={savedRadios}
          onViewAll={() => navigate("/favorite-radios")}
          onCardClick={handleRadioClick}
        />
        <div className="search-radio-section">

          <div className="search-radio-header">
            <h2 className="sub-title">Search For Radio</h2>

            <input
              type="text"
              className="search-input"
              placeholder="Search country..."
              value={countrySearch}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCountrySearch(e.target.value)
              }
            />
          </div>

          <div className="country-grid">
            {filteredCountries.map((item) => (
              <CircleImageCard
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
                  navigate("/radio-player", {
                    state: {
                      current: currentRadio,
                      list: sameTypeList,
                      type: item.title, // country title as type
                    },
                  });
                }}
              />
            ))}
          </div>


        </div>

      </div>
      <Footer />
    </div>
  );
}
