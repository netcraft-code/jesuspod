import { useState } from "react";
import Header from "../../components/Header/Header";
import RadioCard from "../../components/Cards/RadioCard";
import "./AllRadio.css";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";

/** 🔹 Radio item type */
interface RadioItem {
  id: string;
  title: string;
  type?: string;
  [key: string]: any;
}

export default function AllRadio() {
  const navigate = useNavigate();

  const [search, setSearch] = useState<string>("");
  const [active, setActive] = useState<string>("Radio");
  const [profileOpen, setProfileOpen] = useState<boolean>(false);

  // ✅ Typed selector
  const radioList = useSelector<RootState, RadioItem[]>(
    (state) => state.data.radio
  );
  console.log("radio",radioList)

  const filtered = radioList.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="all-radio-wrapper">
      {/* HEADER */}
      <Header
        active={active}
        setActive={setActive}
        profileOpen={profileOpen}
        setProfileOpen={setProfileOpen}
      />

      {/* PAGE CONTENT */}
      <main className="all-radio-content">
        {/* TITLE + SEARCH */}
        <div className="top-bar">
          <h2 className="sub-title">All Radio</h2>

          <input
             className="search-input"
            type="text"
            placeholder="Search radio..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
          />
        </div>

        {/* RADIO GRID */}
        <div className="radio-grid">
          {filtered.map((item) => {
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
      </main>
    </div>
  );
}
