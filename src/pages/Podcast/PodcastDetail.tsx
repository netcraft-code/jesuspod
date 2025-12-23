import { useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../services/firebase";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./Podcast.css";
import { stripHtml } from "../../helper/stripHtml ";
import { formatDate } from "../../helper/formatDate";
import { formatDuration } from "../../helper/formatDuration";
import { images } from "../../assets/images";
import { convertSecond } from "../../helper/convertSecond";
import { incrementHits } from "../../services/firestoreService";
import { FaPause } from "react-icons/fa";


export default function PodcastDetail() {
    const { state } = useLocation();
    const channel = state?.channel;
    const { play, share, download, warning, plus, forward10, repeateone, valumehigh, valumeslash } = images
    const [active, setActive] = useState<string>("Podcast");
    const [profileOpen, setProfileOpen] = useState<boolean>(false);
    const [description, setDescription] = useState<string>("");
    const [episodes, setEpisodes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const [volume, setVolume] = useState(80); // 0 – 100
    const [volumeMsg, setVolumeMsg] = useState<string | null>(null);
    const [showVolumeMsg, setShowVolumeMsg] = useState(false);


    const scrollRef = useRef<HTMLDivElement>(null);



    const audioRef = useRef<HTMLAudioElement | null>(null);

    const [currentEpisode, setCurrentEpisode] = useState<any>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isAudioLoading, setIsAudioLoading] = useState(false);

    const remainingTime = Math.max(duration - currentTime, 0);


    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume / 100;
        }
    }, [volume]);


    const increaseVolume = () => {
        setVolume((prev) => {
            const next = Math.min(prev + 10, 100);
            showVolumeFeedback(`+10 (${next}%)`);
            return next;
        });
    };

    const decreaseVolume = () => {
        setVolume((prev) => {
            const next = Math.max(prev - 10, 0);
            showVolumeFeedback(`-10 (${next}%)`);
            return next;
        });
    };

    const showVolumeFeedback = (msg: string) => {
        setVolumeMsg(msg);
        setShowVolumeMsg(true);
        setTimeout(() => setShowVolumeMsg(false), 800);
    };



    const fetchEpisodes = async (pageNo: number) => {
        if (loading || !hasMore) return;

        setLoading(true);
        try {
            const res = await axios.get(
                `https://getpaginateddata2-53ifvdv3fa-uc.a.run.app/?url=${channel.url}&page=${pageNo}`
            );

            setDescription(res.data?.description || "");

            const newEpisodes = res.data?.data || [];

            setEpisodes((prev) => {
                const updatedList = [...prev, ...newEpisodes];
                // Set first episode as default if none selected
                if (!currentEpisode && updatedList.length > 0) {
                    setCurrentEpisode(updatedList[0]);
                }
                return updatedList;
            });

            if (newEpisodes.length === 0) {
                setHasMore(false);
            }
        } catch (err) {
            console.error("Episode fetch error", err);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    };



    useEffect(() => {
        if (channel?.url) {
            setEpisodes([]);
            setPage(1);
            setHasMore(true);
            fetchEpisodes(1);

            // Log Channel View Event
            logEvent(analytics, "PodcastChannel", {
                item: JSON.stringify(channel),
                description: "PodcastChannel_event",
            });

            // Increment Hits in Firestore
            if (channel?.id) {
                incrementHits("Newchannels", channel.id);
            }
        }
    }, [channel?.url]);


    useEffect(() => {
        if (page > 1) {
            fetchEpisodes(page);
        }
    }, [page]);

    const handleScroll = () => {
        const el = scrollRef.current;
        if (!el || loading || !hasMore) return;

        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 60) {
            setPage((prev) => prev + 1);
        }
    };


    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        const onTimeUpdate = () => {
            if (!audioRef.current) return;
            setCurrentTime(audioRef.current.currentTime);
        };

        const onLoaded = () => setDuration(audio.duration || 0);
        const onEnded = () => setIsPlaying(false);
        const onWaiting = () => setIsAudioLoading(true);
        const onPlaying = () => setIsAudioLoading(false);

        audio.addEventListener("timeupdate", onTimeUpdate);
        audio.addEventListener("loadedmetadata", onLoaded);
        audio.addEventListener("ended", onEnded);
        audio.addEventListener("waiting", onWaiting);
        audio.addEventListener("playing", onPlaying);
        audio.addEventListener("canplay", onPlaying);

        return () => {
            audio.removeEventListener("timeupdate", onTimeUpdate);
            audio.removeEventListener("loadedmetadata", onLoaded);
            audio.removeEventListener("ended", onEnded);
            audio.removeEventListener("waiting", onWaiting);
            audio.removeEventListener("playing", onPlaying);
            audio.removeEventListener("canplay", onPlaying);
        };
    }, [currentEpisode]);


    const playEpisode = (episode: any) => {
        const audioUrl =
            episode?.enclosure?.[0]?.$?.url ||
            episode?.["media:content"]?.[0]?.$?.url;

        if (!audioUrl) return;

        // same episode → toggle
        if (currentEpisode?.guid?.[0]?._ === episode?.guid?.[0]?._) {
            if (isPlaying) {
                audioRef.current?.pause();
                setIsPlaying(false);
            } else {
                if (audioRef.current && !audioRef.current.src) {
                    audioRef.current.src = audioUrl;
                }
                audioRef.current?.play();
                setIsPlaying(true);
            }
            return;
        }

        // new episode
        setCurrentEpisode(episode);
        setIsPlaying(true);

        logEvent(analytics, "PodcastEpisode", {
            item: JSON.stringify(episode?.title),
            description: "PodcastEpisode_event",
            category: channel?.category?.name || "Unknown"
        });

        setTimeout(() => {
            if (audioRef.current) {
                audioRef.current.src = audioUrl;
                audioRef.current.play();
            }
        }, 0);
    };

    return (
        <>
            <Header
                active={active}
                setActive={setActive}
                profileOpen={profileOpen}
                setProfileOpen={setProfileOpen}
            />

            <div className="container">
                {/* LEFT 20% */}
                <div className="podcast-layout">
                    <div
                        className="podcast-left"
                        ref={scrollRef}
                        onScroll={handleScroll}
                    >
                        <h2 className="channel-title">{channel?.title.slice(0, 50) + "..."}</h2>

                        <p className="channel-description">
                            {description
                                ? stripHtml(description).slice(0, 120) + "..."
                                : "No description available"}
                        </p>

                        <div className="channel-actions">
                            <button className="follow-btn">
                                <img src={plus} alt="plus" />
                                <span>Follow</span>
                            </button>

                            <button className="icon-btn">
                                <img src={share} alt="share" />
                            </button>

                            <button className="icon-btn">
                                <img src={download} alt="download" />
                            </button>

                            <button className="icon-btn">
                                <img src={warning} alt="warning" />
                            </button>
                        </div>


                        <div className="episode-list">
                            {episodes.map((item, index) => {
                                const isCurrent = currentEpisode?.guid?.[0]?._ === item?.guid?.[0]?._;
                                return (
                                    <div key={index} className={`episode-row ${isCurrent ? "active-episode" : ""}`}>
                                        <div className="episode-info">
                                            <h4 className="episode-title">
                                                {item.title?.[0].slice(0, 50) + "..."}
                                            </h4>

                                            <p className="episode-desc">
                                                {item.description?.[0]
                                                    ? stripHtml(item.description[0]).slice(0, 80) + "..."
                                                    : "No description"}
                                            </p>

                                            <div className="episode-meta">
                                                <span className="duration">
                                                    {formatDuration(item["itunes:duration"]?.[0])}
                                                </span>
                                                <span>{formatDate(item.pubDate?.[0])}</span>
                                            </div>
                                        </div>

                                        <div className="episode-play" onClick={() => playEpisode(item)}>
                                            {isCurrent && isPlaying ? (
                                                <div className="playing-bars">
                                                    <span></span><span></span><span></span>
                                                </div>
                                            ) : (
                                                <img src={play} alt="play" />
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* LOADING INDICATOR */}
                        {loading && (
                            <p
                                style={{
                                    textAlign: "center",
                                    color: "#FB4A4A",
                                    fontSize: 12,
                                    opacity: 0.6,
                                    padding: "10px 0",
                                }}
                            >
                                Loading more episodes...
                            </p>
                        )}

                        {!hasMore && (
                            <p
                                style={{
                                    textAlign: "center",
                                    fontSize: 12,
                                    opacity: 0.4,
                                    padding: "10px 0",
                                }}
                            >
                                No more episodes
                            </p>
                        )}
                    </div>
                    {/* RIGHT 80% (empty for now) */}
                    <div className="podcast-right">
                        {loading && episodes.length === 0 ? (
                            <div className="page-loading">
                                <div className="spinner"></div>
                                <p>Loading Channel Data...</p>
                            </div>
                        ) : !currentEpisode ? (
                            <p style={{ opacity: 0.4 }}>Select an episode to play</p>
                        ) : (
                            <div className="player-box">
                                <img
                                    className="player-image"
                                    src={
                                        currentEpisode?.["itunes:image"]?.[0]?.$?.href ||
                                        channel?.imageUrl
                                    }
                                    alt="cover"
                                />

                                <h3 className="player-title">
                                    {currentEpisode?.title?.[0]}
                                </h3>
                                <p className="player-desc">
                                    {currentEpisode?.description?.[0]
                                        ? stripHtml(currentEpisode.description[0]).slice(0, 160) + "..."
                                        : ""}
                                </p>
                                {/* Progress */}
                                <div className="player-progress">
                                    <input
                                        className="sliderRed"
                                        type="range"
                                        min={0}
                                        max={duration || 1}
                                        step={1}
                                        value={currentTime}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            if (audioRef.current) {
                                                audioRef.current.currentTime = val;
                                                setCurrentTime(val);
                                            }
                                        }}
                                    />

                                    <div className="time-row">
                                        <span>{convertSecond(currentTime)}</span>
                                        <span>-{convertSecond(remainingTime)}</span>
                                    </div>
                                </div>


                                {/* Controls */}
                                <div className="player-controls">
                                    {/* 🔇 LOW / MUTE (START) */}
                                    <div className="volume-feedback-wrapper">
                                        <button className="podcast-ctrl-btn" onClick={decreaseVolume}>
                                            <img src={valumeslash} alt="volume down" />
                                        </button>
                                    </div>

                                    <button className="podcast-ctrl-btn" onClick={() => audioRef.current!.currentTime -= 1}>
                                        <img src={repeateone} alt="repeateone" />
                                    </button>

                                    <button
                                        className={`podcast-ctrl-btn play-main-btn ${isPlaying ? 'playing' : ''}`}
                                        onClick={() => playEpisode(currentEpisode)}
                                        disabled={isAudioLoading}
                                    >
                                        {isAudioLoading ? (
                                            <div className="btn-spinner"></div>
                                        ) : isPlaying ? (
                                            <FaPause size={22} />
                                        ) : (
                                            <img src={play} alt="play" />
                                        )}
                                    </button>

                                    <button className="podcast-ctrl-btn" onClick={() => audioRef.current!.currentTime += 10}>
                                        <img src={forward10} alt="forward" />
                                    </button>

                                    <div className="volume-feedback-wrapper">
                                        <button className="podcast-ctrl-btn" onClick={increaseVolume}>
                                            <img src={valumehigh} alt="volume up" />
                                        </button>
                                    </div>

                                </div>

                                <audio ref={audioRef} />
                            </div>
                        )}
                    </div>

                </div>
            </div>
            <Footer />
        </>
    );
}
