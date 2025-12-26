import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../redux/store";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Card from "../../components/Cards/Card";
import "./Radio.css";

export default function FavoriteRadios() {
    const navigate = useNavigate();

    const [search, setSearch] = useState<string>("");
    const [active, setActive] = useState<string>("Radio");
    const [profileOpen, setProfileOpen] = useState<boolean>(false);

    const savedRadios = useSelector((state: RootState) => state.data.savedRadios) || [];

    // Filter radios based on search
    const filtered = savedRadios.filter((r: any) =>
        r.title.toLowerCase().includes(search.toLowerCase())
    );

    const handleRadioClick = (radio: any) => {
        navigate("/radio-player", {
            state: {
                current: radio,
                list: savedRadios,
                type: "Favorites",
            },
        });
    };

    return (
        <>
            {/* HEADER */}
            <Header
                active={active}
                setActive={setActive}
                profileOpen={profileOpen}
                setProfileOpen={setProfileOpen}
            />

            {/* PAGE CONTENT */}
            <div className="container profile-page">
                {/* TITLE + SEARCH */}
                <div className="profile-header-section">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        ← Back
                    </button>
                    <h1 className="profile-page-title">Favorite Radios</h1>
                    <input
                        className="search-input"
                        type="text"
                        placeholder="Search favorite radios..."
                        value={search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setSearch(e.target.value)
                        }
                    />
                </div>

                {/* RADIO GRID */}
                {filtered.length === 0 ? (
                    <div className="profile-empty-state">
                        <div className="empty-icon">❤️</div>
                        <h2>No Favorite Radios {search ? "Found" : "Yet"}</h2>
                        <p>
                            {search
                                ? "Try a different search term"
                                : "Start adding radios to your favorites!"}
                        </p>
                        {!search && (
                            <button
                                className="primary-btn"
                                onClick={() => navigate("/radio")}
                            >
                                Explore Radios
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="profile-grid">
                        {filtered.map((item: any) => (
                            <div
                                key={item.id || item._id}
                                className="profile-card"
                                onClick={() => handleRadioClick(item)}
                            >
                                <div className="profile-card-image">
                                    <img src={item.imageUrl} alt={item.title} />
                                </div>
                                <div className="profile-card-content">
                                    <h3 className="profile-card-title">{item.title}</h3>
                                    <p className="profile-card-category">{item.type || "Radio"}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </>
    );
}
