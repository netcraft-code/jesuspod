import { useState } from "react";
import Header from "../../components/Header/Header";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import usePageTitle from "../../hooks/usePageTitle";
import RadioCard from "../../components/Cards/RadioCard";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";

/** 🔹 Radio item type */
interface RadioItem {
  id: string;
  type?: string;
   title: string;
  [key: string]: any;
}

export default function Home() {
  const [active, setActive] = useState<string>("All");
  const [profileOpen, setProfileOpen] = useState<boolean>(false);

  const navigate = useNavigate();

  usePageTitle("Home");

  // ✅ Typed redux selector
  const radioList = useSelector<RootState, RadioItem[]>(
    (state) => state.data.radio.slice(225, 235)
  );

  return (
    <div className="home-wrapper">
      <Header
        active={active}
        setActive={setActive}
        profileOpen={profileOpen}
        setProfileOpen={setProfileOpen}
      />

      {/* MAIN CONTENT SECTION */}
      <main className="radio-container">
        {/* RADIO SECTION */}
        <div className="section">
          <div className="section-header">
            <h1>Radio</h1>
            <span
              onClick={() => navigate("/all-radio")}
              className="view-all"
            >
              View All
            </span>
          </div>

          <div className="radio-row">
            {radioList.map((item) => {
              const sameTypeList = radioList.filter(
                (r) =>
                  r.type?.toLowerCase() === item.type?.toLowerCase()
              );

              return (
                <RadioCard
                  key={item.id}
                  item={item}
                  onClick={() =>
                    navigate("/radio-player", {
                      state: {
                        current: item,
                        list: sameTypeList,
                        type: item.type,
                      },
                    })
                  }
                />
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
