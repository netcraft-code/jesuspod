import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Card from "../../components/Cards/Card";
import { useState } from "react";

export default function PodcastCategory() {
    const { state } = useLocation();
    const category = state?.category;
    const [active, setActive] = useState<string>("Podcast");
    const navigate = useNavigate();
    const [profileOpen, setProfileOpen] = useState<boolean>(false);
    const podcasts = useSelector((s: any) =>
        s.data.channels.filter(
            (p: any) =>
                p.category?.name?.toLowerCase() === category?.toLowerCase()
        )
    );

    return (
        <>
            <Header
                active={active}
                setActive={setActive}
                profileOpen={profileOpen}
                setProfileOpen={setProfileOpen}
            />

            <div className="content">
                <h2>{category}</h2>

                <div className="card-grid">
                    {podcasts.map((item: any) => (
                        <Card key={item.id} item={item} onClick={(item) =>
                            navigate(`/podcastplayer/${item.id}`, {
                                state: { channel: item },
                            })
                        } />
                    ))}
                </div>
            </div>
            <Footer />
        </>
    );
}
