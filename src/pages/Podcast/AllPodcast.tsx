import { useState } from "react";
import { useSelector } from "react-redux";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Card from "../../components/Cards/Card";
import { useNavigate, useLocation } from "react-router-dom";

export default function AllPodcast() {
    const [search, setSearch] = useState("");

    const [active, setActive] = useState<string>("Podcast");
    const [profileOpen, setProfileOpen] = useState<boolean>(false);
    const podcasts = useSelector((state: any) => state.data.podcasts);
    const savedPodcasts = useSelector((state: any) => state.data.savedPodcasts) || [];
    const location = useLocation();
    const navigate = useNavigate();

    const isSavedFilter = location.state?.filter === 'saved';
    const dataToDisplay = isSavedFilter ? savedPodcasts : podcasts;

    const filtered = dataToDisplay.filter((p: any) =>
        p.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="main-content">
            <Header
                active={active}
                setActive={setActive}
                profileOpen={profileOpen}
                setProfileOpen={setProfileOpen}
            />

            <div className="content">
                <div className="top-bar">
                    <h2 className="sub-title">{isSavedFilter ? "My Saved Podcasts" : "All Podcasts"}</h2>
                    <input
                        className="search-input"
                        placeholder="Search podcast..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="card-grid">
                    {filtered.map((item: any) => (
                        <Card key={item.id} item={item} onClick={(item) =>
                            navigate(`/podcastplayer/${item.id}`, {
                                state: { channel: item },
                            })
                        } />
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
}
