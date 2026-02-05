import { useState } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Card from "../../components/Cards/Card";
import "./Radio.css";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getFilteredRadio } from "../../redux/dataSlice";

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

  // ✅ Use filtered radio selector
  const radioList = useSelector(getFilteredRadio);
  // console.log("radio", radioList)

  const filtered = radioList.filter((r: RadioItem) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  ).sort((a: any, b: any) => {
    const titleA = (a?.title || "").toString().trim().toLowerCase();
    const titleB = (b?.title || "").toString().trim().toLowerCase();
    return titleA.localeCompare(titleB);
  });

  return (
    <div className="main-content">
      {/* HEADER */}
      <Header
        active={active}
        setActive={setActive}
        profileOpen={profileOpen}
        setProfileOpen={setProfileOpen}
      />

      {/* PAGE CONTENT */}
      <main className="content">
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
        <div className="card-grid">
          {filtered.map((item: RadioItem) => {
            const sameTypeList = radioList.filter(
              (r: RadioItem) =>
                r.type?.toLowerCase() === item.type?.toLowerCase()
            );

            return (
              <Card
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
      <Footer />
    </div>
  );
}
