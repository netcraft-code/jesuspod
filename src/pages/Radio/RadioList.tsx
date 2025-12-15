import { useState } from "react";
import RadioCard from "../../components/Cards/RadioCard";
import Header from "../../components/Header/Header";
import "./RadioList.css";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import CountryCard from "../../components/Cards/CountryCard";

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

  // ✅ Typed selector
  const radio = useSelector<RootState, RadioItem[]>(
    (state) => state.data.radio
  );

  const countries = useSelector<RootState, CountryItem[]>(
    (state) => state.data.Countries
  );



  const filteredCountries = countries.filter((c) =>
    c.title.toLowerCase().includes(countrySearch.toLowerCase())
  );

  /** 🔹 Common click handler */
  const handleRadioClick = (item: RadioItem) => {
    const sameTypeList = radio.filter(
      (r) => r.type?.toLowerCase() === item.type?.toLowerCase()
    );

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


        {/* MOST LISTENER */}
        <div className="section">
          <div className="section-header">
            <h1 className="sub-title">Most Listener Radio</h1>
            <span
              onClick={() => navigate("/all-radio")}
              className="view-all"
            >
              View All
            </span>
          </div>

          <div className="radio-row">
            {radio.slice(20, 40).map((item) => (
              <RadioCard
                key={item.id}
                item={item}
                onClick={() => handleRadioClick(item)}
              />
            ))}
          </div>
        </div>

        {/* TOP 10 USA */}
        <div className="section">
          <div className="section-header">
            <h1 className="sub-title">Top 10 in USA</h1>
            <span
              onClick={() => navigate("/all-radio")}
              className="view-all"
            >
              View All
            </span>
          </div>

          <div className="radio-row">
            {radio.slice(50, 60).map((item) => (
              <RadioCard
                key={item.id}
                item={item}
                onClick={() => handleRadioClick(item)}
              />
            ))}
          </div>
        </div>

        {/* RADIO TO LOVE */}
        <div className="section">
          <div className="section-header">
            <h1 className="sub-title">Radio To Love</h1>
            <span
              onClick={() => navigate("/all-radio")}
              className="view-all"
            >
              View All
            </span>
          </div>

          <div className="radio-row">
            {radio.slice(110, 120).map((item) => (
              <RadioCard
                key={item.id}
                item={item}
                onClick={() => handleRadioClick(item)}
              />
            ))}
          </div>
        </div>


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
              <CountryCard
                key={item.id}
                item={item}
                onClick={() => {
                  // Country title ko type ke basis pe filter
                  const sameTypeList = radio.filter(
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
    </div>
  );
}
