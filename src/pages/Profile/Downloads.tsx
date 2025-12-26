import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { collection, query, getDocs, doc, deleteDoc, orderBy } from "firebase/firestore";
import { firestore } from "../../services/firebase";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { images } from "../../assets/images";
import { formatDate } from "../../helper/formatDate";
import { formatDuration } from "../../helper/formatDuration";
import "./Profile.css";

interface Download {
    id: string;
    episodeTitle: string;
    channelTitle: string;
    channelId: string;
    audioUrl: string;
    imageUrl: string;
    downloadedAt: any;
    duration?: string;
    description?: string;
}

export default function Downloads() {
    const navigate = useNavigate();
    const user = useSelector((state: any) => state.auth.user);
    const [active, setActive] = useState<string>("Podcast");
    const [profileOpen, setProfileOpen] = useState<boolean>(false);
    const [downloads, setDownloads] = useState<Download[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
    const [playingId, setPlayingId] = useState<string | null>(null);

    useEffect(() => {
        if (user?.uid) {
            fetchDownloads();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchDownloads = async () => {
        setLoading(true);
        try {
            const downloadsRef = collection(firestore, `users/${user.uid}/downloads`);
            const q = query(downloadsRef, orderBy("downloadedAt", "desc"));
            const snapshot = await getDocs(q);

            const downloadsList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Download[];

            setDownloads(downloadsList);
        } catch (error) {
            console.error("Error fetching downloads:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (downloadId: string) => {
        if (!window.confirm("Are you sure you want to delete this download?")) {
            return;
        }

        setDeletingId(downloadId);
        try {
            const downloadRef = doc(firestore, `users/${user.uid}/downloads`, downloadId);
            await deleteDoc(downloadRef);
            setDownloads(downloads.filter((d) => d.id !== downloadId));
        } catch (error) {
            console.error("Error deleting download:", error);
            alert("Failed to delete download");
        } finally {
            setDeletingId(null);
        }
    };

    const handlePlay = (download: Download) => {
        // If same episode is playing, pause it
        if (playingId === download.id && currentAudio) {
            currentAudio.pause();
            setPlayingId(null);
            return;
        }

        // Stop currently playing audio if any
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }

        // Create and play new audio
        const audio = new Audio(download.audioUrl);
        audio.play();
        setCurrentAudio(audio);
        setPlayingId(download.id);

        // Handle audio end
        audio.onended = () => {
            setPlayingId(null);
            setCurrentAudio(null);
        };
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
                    <h1 className="profile-page-title">My Downloads</h1>
                    <p className="profile-page-subtitle">
                        {downloads.length} episode{downloads.length !== 1 ? "s" : ""}
                    </p>
                </div>

                {loading ? (
                    <div className="profile-loading">
                        <div className="spinner"></div>
                        <p>Loading downloads...</p>
                    </div>
                ) : downloads.length === 0 ? (
                    <div className="profile-empty-state">
                        <div className="empty-icon">⬇️</div>
                        <h2>No Downloads Yet</h2>
                        <p>Download episodes to listen offline!</p>
                        <button className="primary-btn" onClick={() => navigate("/podcast")}>
                            Browse Podcasts
                        </button>
                    </div>
                ) : (
                    <div className="profile-list">
                        {downloads.map((download) => (
                            <div key={download.id} className="download-item">
                                <div className="download-image">
                                    <img src={download.imageUrl} alt={download.episodeTitle} />
                                </div>

                                <div className="download-info">
                                    <h3 className="download-title">{download.episodeTitle}</h3>
                                    <p className="download-channel">{download.channelTitle}</p>
                                    <div className="download-meta">
                                        {download.duration && (
                                            <span className="download-duration">
                                                {formatDuration(download.duration)}
                                            </span>
                                        )}
                                        <span className="download-date">
                                            Downloaded: {formatDate(download.downloadedAt?.toDate?.() || new Date())}
                                        </span>
                                    </div>
                                </div>

                                <div className="download-actions">
                                    <button
                                        className="icon-btn-small"
                                        onClick={() => handlePlay(download)}
                                        title={playingId === download.id ? "Pause" : "Play"}
                                    >
                                        {playingId === download.id ? (
                                            <span style={{ fontSize: '20px' }}>⏸️</span>
                                        ) : (
                                            <img src={images.play} alt="play" width={20} />
                                        )}
                                    </button>
                                    <button
                                        className="icon-btn-small delete-btn"
                                        onClick={() => handleDelete(download.id)}
                                        disabled={deletingId === download.id}
                                        title="Delete"
                                    >
                                        {deletingId === download.id ? "..." : "🗑️"}
                                    </button>
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
