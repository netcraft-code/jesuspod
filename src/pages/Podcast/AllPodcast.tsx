import { useState } from "react";
import { useSelector } from "react-redux";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Card from "../../components/Cards/Card";
import { useNavigate } from "react-router-dom";

export default function AllPodcast() {
    const [search, setSearch] = useState("");

    const [active, setActive] = useState<string>("Podcast");
    const [profileOpen, setProfileOpen] = useState<boolean>(false);
    const podcasts = useSelector((state: any) => state.data.podcasts);
    const navigate = useNavigate();
    const filtered = podcasts.filter((p: any) =>
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
                    <h2 className="sub-title">All Podcasts</h2>
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
