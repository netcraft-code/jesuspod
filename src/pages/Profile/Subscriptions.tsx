import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { collection, query, where, getDocs } from "firebase/firestore";
import { firestore } from "../../services/firebase";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./Profile.css";

interface Channel {
    id: string;
    _id: string;
    title: string;
    imageUrl: string;
    category?: {
        name: string;
    };
    url: string;
}

export default function Subscriptions() {
    const navigate = useNavigate();
    const user = useSelector((state: any) => state.auth.user);
    const [active, setActive] = useState<string>("Podcast");
    const [profileOpen, setProfileOpen] = useState<boolean>(false);
    const [subscriptions, setSubscriptions] = useState<Channel[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.uid) {
            fetchSubscriptions();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchSubscriptions = async () => {
        setLoading(true);
        try {
            const channelsRef = collection(firestore, "Newchannels");
            const q = query(channelsRef, where("sub", "array-contains", user.uid));
            const snapshot = await getDocs(q);

            const channels = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Channel[];

            setSubscriptions(channels);
        } catch (error) {
            console.error("Error fetching subscriptions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChannelClick = (channel: Channel) => {
        navigate(`/podcastplayer/${channel._id}`, { state: { channel } });
    };

    return (
        <>
            <Header
                active={active}
                setActive={setActive}
                profileOpen={profileOpen}
                setProfileOpen={setProfileOpen}
            />

            <div className="container profile-page">
                <div className="profile-header-section">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        ← Back
                    </button>
                    <h1 className="profile-page-title">My Following</h1>
                    <p className="profile-page-subtitle">
                        {subscriptions.length} podcast{subscriptions.length !== 1 ? "s" : ""}
                    </p>
                </div>

                {loading ? (
                    <div className="profile-loading">
                        <div className="spinner"></div>
                        <p>Loading subscriptions...</p>
                    </div>
                ) : subscriptions.length === 0 ? (
                    <div className="profile-empty-state">
                        <div className="empty-icon">📻</div>
                        <h2>No Following Yet</h2>
                        <p>Start following your favorite podcasts!</p>
                        <button className="primary-btn" onClick={() => navigate("/podcast")}>
                            Browse Podcasts
                        </button>
                    </div>
                ) : (
                    <div className="profile-grid">
                        {subscriptions.map((channel) => (
                            <div
                                key={channel.id}
                                className="profile-card"
                                onClick={() => handleChannelClick(channel)}
                            >
                                <div className="profile-card-image">
                                    <img src={channel.imageUrl} alt={channel.title} />
                                </div>
                                <div className="profile-card-content">
                                    <h3 className="profile-card-title">{channel.title}</h3>
                                    {channel.category && (
                                        <p className="profile-card-category">
                                            {channel.category.name}
                                        </p>
                                    )}
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
