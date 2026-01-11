import { useLocation, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { logEvent } from "firebase/analytics";
import { analytics, firestore } from "../../services/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { useSelector } from "react-redux";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./Podcast.css";
import { stripHtml } from "../../helper/stripHtml ";
import { formatDate } from "../../helper/formatDate";
import { formatDuration } from "../../helper/formatDuration";
import { images } from "../../assets/images";
import { convertSecond } from "../../helper/convertSecond";
import { incrementHits } from "../../services/firestoreService";
import { trackPodcastPlay } from "../../services/podcastAnalytics";
import { FaPause } from "react-icons/fa";

export default function PodcastDetail() {
  const { state } = useLocation();
  const { id } = useParams();
  const [fetchedChannel, setFetchedChannel] = useState<any>(null);
  const channel = state?.channel || fetchedChannel;
  const {
    play,
    share,
    download,
    plus,
    forward10,
    repeateone,
    valumehigh,
    valumeslash,
  } = images;
  const [active, setActive] = useState<string>("Podcast");
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const [description, setDescription] = useState<string>("");
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [volume, setVolume] = useState(80); // 0 – 100
  // const [volumeMsg, setVolumeMsg] = useState<string | null>(null);
  // const [showVolumeMsg, setShowVolumeMsg] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [downloadingEpisode, setDownloadingEpisode] = useState<string | null>(
    null
  );
  const [downloadedEpisodeIds, setDownloadedEpisodeIds] = useState<string[]>(
    []
  );
  const [expandedEpisodes, setExpandedEpisodes] = useState<Set<number>>(
    new Set()
  );
  const [channelDescExpanded, setChannelDescExpanded] = useState(false);
  const [playerDescExpanded, setPlayerDescExpanded] = useState(false);
  const [channelTitleExpanded, setChannelTitleExpanded] = useState(false);
  const [playerTitleExpanded, setPlayerTitleExpanded] = useState(false);
  const [expandedTitles, setExpandedTitles] = useState<Set<number>>(new Set());

  // Get user from Redux store
  const user = useSelector((state: any) => state.auth.user);

  const scrollRef = useRef<HTMLDivElement>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentEpisode, setCurrentEpisode] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  const remainingTime = Math.max(duration - currentTime, 0);

  useEffect(() => {
    if (!channel && id) {
      const getChannel = async () => {
        setLoading(true);
        try {
          const docRef = doc(firestore, "Newchannels", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setFetchedChannel({ id: docSnap.id, ...docSnap.data() });
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching channel:", error);
        } finally {
          setLoading(false);
        }
      };
      getChannel();
    }
  }, [id, channel]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const increaseVolume = () => {
    setVolume((prev) => {
      const next = Math.min(prev + 10, 100);
      // showVolumeFeedback(`+10 (${next}%)`);
      return next;
    });
  };

  const decreaseVolume = () => {
    setVolume((prev) => {
      const next = Math.max(prev - 10, 0);
      // showVolumeFeedback(`-10 (${next}%)`);
      return next;
    });
  };

  // const showVolumeFeedback = (msg: string) => {
  //     // setVolumeMsg(msg);
  //     // setShowVolumeMsg(true);
  //     // setTimeout(() => setShowVolumeMsg(false), 800);
  // };

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
      checkSubscriptionStatus();
      fetchDownloadedEpisodes();

      // Log Channel View Event
      logEvent(analytics, "PodcastChannel", {
        item: JSON.stringify(channel),
        description: "PodcastChannel_event",
      });

      // Track podcast analytics (channel view)
      if (channel?.id && channel?.title) {
        trackPodcastPlay(channel.id, channel.title);
      }

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
      category: channel?.category?.name || "Unknown",
    });

    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      }
    }, 0);
  };

  // Check if user is subscribed to this channel
  const checkSubscriptionStatus = async () => {
    const channelIdToQuery = channel?._id || channel?.id;
    if (!user?.uid || !channelIdToQuery) return;

    try {
      const channelsRef = collection(firestore, "Newchannels");
      const q = query(channelsRef, where("_id", "==", channelIdToQuery));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const channelData = snapshot.docs[0].data();
        const subscribers = channelData?.sub || [];
        setIsSubscribed(subscribers.includes(user.uid));
      }
    } catch (error) {
      console.error("Error checking subscription status:", error);
    }
  };

  // Fetch downloaded episodes
  const fetchDownloadedEpisodes = async () => {
    if (!user?.uid) return;

    try {
      const downloadsRef = collection(firestore, `users/${user.uid}/downloads`);
      const snapshot = await getDocs(downloadsRef);
      const downloadedIds = snapshot.docs.map((doc) => doc.id);
      setDownloadedEpisodeIds(downloadedIds);
    } catch (error) {
      console.error("Error fetching downloaded episodes:", error);
    }
  };

  // Handle subscribe/unsubscribe
  const handleSubscribe = async () => {
    if (!user?.uid) {
      alert("Please login to subscribe to this podcast");
      return;
    }

    console.log("Channel data:", channel);
    const channelIdToQuery = channel?._id || channel?.id;

    if (!channelIdToQuery) {
      console.error("No channel ID found");
      alert("Channel ID not found");
      return;
    }

    console.log("Querying with _id:", channelIdToQuery);

    setSubscribeLoading(true);
    try {
      const channelsRef = collection(firestore, "Newchannels");
      const q = query(channelsRef, where("_id", "==", channelIdToQuery));
      const snapshot = await getDocs(q);

      console.log(
        "Query result:",
        snapshot.empty ? "No docs found" : `Found ${snapshot.docs.length} docs`
      );

      if (!snapshot.empty) {
        const docRef = doc(firestore, "Newchannels", snapshot.docs[0].id);
        const channelData = snapshot.docs[0].data();
        const currentSubs = channelData?.sub || [];

        let updatedSubs;
        if (isSubscribed) {
          // Unsubscribe
          updatedSubs = currentSubs.filter((id: string) => id !== user.uid);
        } else {
          // Subscribe
          updatedSubs = [...currentSubs, user.uid];
        }

        // Update entire channel data with new sub array (matching archive pattern)
        await updateDoc(docRef, {
          ...channelData,
          sub: updatedSubs,
        });

        setIsSubscribed(!isSubscribed);

        logEvent(analytics, isSubscribed ? "Unsubscribe" : "Subscribe", {
          channelId: channelIdToQuery,
          channelTitle: channel.title,
        });

        console.log("Subscribe successful!");
      } else {
        console.log("No document found with _id:", channelIdToQuery);
        alert("Channel not found in database. Please try again.");
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
      alert("Failed to update subscription. Please try again.");
    } finally {
      setSubscribeLoading(false);
    }
  };

  // Handle share channel
  const handleShareChannel = async () => {
    const shareTitle = channel?.title || "Podcast";
    const shareLink = window.location.href;
    const shareMessage = `Listen to ${shareTitle} on JesusPOD\n\n${shareLink}`;

    try {
      if (navigator.share) {
        // Only use text field to ensure message is included
        await navigator.share({
          title: shareTitle,
          text: shareMessage,
        });
        logEvent(analytics, "Share_Channel", {
          channelId: channel?.id,
          channelTitle: channel?.title,
        });
      } else {
        // Fallback: copy message to clipboard
        await navigator.clipboard.writeText(shareMessage);
        alert("Message copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  // Handle download episode
  const handleDownloadEpisode = async (episode: any) => {
    if (!user?.uid) {
      alert("Please login to download episodes");
      return;
    }

    const audioUrl =
      episode?.enclosure?.[0]?.$?.url ||
      episode?.["media:content"]?.[0]?.$?.url;

    if (!audioUrl) {
      alert("Audio file not available for download");
      return;
    }

    const episodeTitle = episode?.title?.[0] || "episode";
    const episodeGuid = episode?.guid?.[0]?._ || episodeTitle;
    setDownloadingEpisode(episodeTitle);

    try {
      // Save to Firestore
      const downloadRef = doc(
        firestore,
        `users/${user.uid}/downloads`,
        episodeGuid
      );
      await setDoc(downloadRef, {
        episodeTitle: episodeTitle,
        channelTitle: channel?.title || "Unknown",
        channelId: channel?.id || "",
        audioUrl: audioUrl,
        imageUrl:
          episode?.["itunes:image"]?.[0]?.$?.href || channel?.imageUrl || "",
        downloadedAt: Timestamp.now(),
        duration: episode?.["itunes:duration"]?.[0] || "",
        description: episode?.description?.[0] || "",
      });

      logEvent(analytics, "Download_Episode", {
        episodeTitle: episodeTitle,
        channelTitle: channel?.title,
      });

      // Refresh downloaded episodes list
      fetchDownloadedEpisodes();

      alert(
        "Episode saved to Downloads! You can play it from your Downloads page."
      );
      setTimeout(() => setDownloadingEpisode(null), 2000);
    } catch (error) {
      console.error("Error downloading episode:", error);
      alert("Failed to save episode. Please try again.");
      setDownloadingEpisode(null);
    }
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
          <div className="podcast-left" ref={scrollRef} onScroll={handleScroll}>
            <h2 className="channel-title-details">
              {(() => {
                const fullTitle = channel?.title || "";
                const shouldTruncate = fullTitle.length > 50;

                return (
                  <>
                    {channelTitleExpanded
                      ? fullTitle
                      : shouldTruncate
                        ? fullTitle.slice(0, 50) + "..."
                        : fullTitle}
                    {shouldTruncate && (
                      <span
                        onClick={() =>
                          setChannelTitleExpanded(!channelTitleExpanded)
                        }
                        style={{
                          color: "#FB4A4A",
                          cursor: "pointer",
                          marginLeft: "8px",
                          fontWeight: "600",
                          fontSize: "14px",
                        }}
                      >
                        {channelTitleExpanded ? "Show Less" : "Show More"}
                      </span>
                    )}
                  </>
                );
              })()}
            </h2>

            <p className="channel-description">
              {(() => {
                const fullDesc = description
                  ? stripHtml(description)
                  : "No description available";
                const shouldTruncate = fullDesc.length > 120;

                return (
                  <>
                    {channelDescExpanded
                      ? fullDesc
                      : shouldTruncate
                        ? fullDesc.slice(0, 120) + "..."
                        : fullDesc}
                    {shouldTruncate && (
                      <span
                        onClick={() =>
                          setChannelDescExpanded(!channelDescExpanded)
                        }
                        style={{
                          color: "#FB4A4A",
                          cursor: "pointer",
                          marginLeft: "5px",
                          fontWeight: "600",
                          fontSize: "12px",
                          display: "block",
                          marginTop: "5px",
                        }}
                      >
                        {channelDescExpanded ? "Show Less" : "Show More"}
                      </span>
                    )}
                  </>
                );
              })()}
            </p>

            <div className="channel-actions">
              <button
                className="follow-btn"
                onClick={handleSubscribe}
                disabled={subscribeLoading}
              >
                <img src={plus} alt="plus" />
                <span>
                  {subscribeLoading
                    ? "Loading..."
                    : isSubscribed
                      ? "Unfollow"
                      : "Follow"}
                </span>
              </button>

              <button className="icon-btn" onClick={handleShareChannel}>
                <img src={share} alt="share" />
              </button>

              <button
                className="icon-btn"
                onClick={() =>
                  currentEpisode && handleDownloadEpisode(currentEpisode)
                }
                disabled={!currentEpisode || downloadingEpisode !== null}
                title={
                  downloadingEpisode !== null
                    ? "Downloading..."
                    : currentEpisode
                      ? "Download current episode"
                      : "Select an episode first"
                }
                style={{
                  opacity: downloadingEpisode !== null ? 0.5 : 1,
                  cursor:
                    downloadingEpisode !== null ? "not-allowed" : "pointer",
                }}
              >
                <img src={download} alt="download" />
                {downloadingEpisode !== null && (
                  <span
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      fontSize: "10px",
                      color: "#FB4A4A",
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                    }}
                  >
                    ...
                  </span>
                )}
              </button>
            </div>

            <div className="episode-list">
              {episodes.map((item, index) => {
                const isCurrent =
                  currentEpisode?.guid?.[0]?._ === item?.guid?.[0]?._;
                return (
                  <div
                    key={index}
                    className={`episode-row ${isCurrent ? "active-episode" : ""
                      }`}
                  >
                    <div className="episode-info">
                      <h4 className="episode-title">
                        {(() => {
                          const fullTitle = item.title?.[0] || "Untitled";
                          const isExpanded = expandedTitles.has(index);
                          const shouldTruncate = fullTitle.length > 50;

                          return (
                            <>
                              {isExpanded
                                ? fullTitle
                                : shouldTruncate
                                  ? fullTitle.slice(0, 50) + "..."
                                  : fullTitle}
                              {downloadedEpisodeIds.includes(
                                item?.guid?.[0]?._ || item.title?.[0]
                              ) && (
                                  <span
                                    style={{
                                      marginLeft: "8px",
                                      padding: "2px 8px",
                                      backgroundColor: "#4CAF50",
                                      color: "white",
                                      borderRadius: "4px",
                                      fontSize: "10px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    ✓ SAVED
                                  </span>
                                )}
                              {shouldTruncate && (
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newExpanded = new Set(expandedTitles);
                                    if (isExpanded) {
                                      newExpanded.delete(index);
                                    } else {
                                      newExpanded.add(index);
                                    }
                                    setExpandedTitles(newExpanded);
                                  }}
                                  style={{
                                    color: "#FB4A4A",
                                    cursor: "pointer",
                                    marginLeft: "8px",
                                    fontWeight: "600",
                                    fontSize: "11px",
                                  }}
                                >
                                  {isExpanded ? "Less" : "More"}
                                </span>
                              )}
                            </>
                          );
                        })()}
                      </h4>

                      <p className="episode-desc">
                        {(() => {
                          const fullDesc = item.description?.[0]
                            ? stripHtml(item.description[0])
                            : "No description";
                          const isExpanded = expandedEpisodes.has(index);
                          const shouldTruncate = fullDesc.length > 80;

                          return (
                            <>
                              {isExpanded
                                ? fullDesc
                                : shouldTruncate
                                  ? fullDesc.slice(0, 80) + "..."
                                  : fullDesc}
                              {shouldTruncate && (
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newExpanded = new Set(
                                      expandedEpisodes
                                    );
                                    if (isExpanded) {
                                      newExpanded.delete(index);
                                    } else {
                                      newExpanded.add(index);
                                    }
                                    setExpandedEpisodes(newExpanded);
                                  }}
                                  style={{
                                    color: "#FB4A4A",
                                    cursor: "pointer",
                                    marginLeft: "5px",
                                    fontWeight: "600",
                                    fontSize: "12px",
                                  }}
                                >
                                  {isExpanded ? "Show Less" : "Show More"}
                                </span>
                              )}
                            </>
                          );
                        })()}
                      </p>

                      <div className="episode-meta">
                        <span className="duration">
                          {formatDuration(item["itunes:duration"]?.[0])}
                        </span>
                        <span>{formatDate(item.pubDate?.[0])}</span>
                      </div>
                    </div>

                    <div
                      className="episode-play"
                      onClick={() => playEpisode(item)}
                    >
                      {isCurrent && isPlaying ? (
                        <div className="playing-bars">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      ) : (
                        <img src={play} alt="play" />
                      )}
                    </div>
                  </div>
                );
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
                <div style={{ textAlign: "center" }}>
                  <img
                    className="player-image"
                    src={
                      currentEpisode?.["itunes:image"]?.[0]?.$?.href ||
                      channel?.imageUrl
                    }
                    alt="cover"
                  />
                </div>

                <h3 className="player-title">
                  {(() => {
                    const fullTitle = currentEpisode?.title?.[0] || "";
                    const shouldTruncate = fullTitle.length > 60;

                    return (
                      <>
                        {playerTitleExpanded
                          ? fullTitle
                          : shouldTruncate
                            ? fullTitle.slice(0, 100) + "..."
                            : fullTitle}
                        {shouldTruncate && (
                          <span
                            onClick={() =>
                              setPlayerTitleExpanded(!playerTitleExpanded)
                            }
                            style={{
                              color: "#FB4A4A",
                              cursor: "pointer",
                              marginLeft: "8px",
                              fontWeight: "600",
                              fontSize: "13px",
                            }}
                          >
                            {playerTitleExpanded ? "Show Less" : "Show More"}
                          </span>
                        )}
                      </>
                    );
                  })()}
                </h3>
                <p className="player-desc">
                  {(() => {
                    const fullDesc = currentEpisode?.description?.[0]
                      ? stripHtml(currentEpisode.description[0])
                      : "";
                    const shouldTruncate = fullDesc.length > 160;

                    return (
                      <>
                        {playerDescExpanded
                          ? fullDesc
                          : shouldTruncate
                            ? fullDesc.slice(0, 160) + "..."
                            : fullDesc}
                        {shouldTruncate && (
                          <span
                            onClick={() =>
                              setPlayerDescExpanded(!playerDescExpanded)
                            }
                            style={{
                              color: "#FB4A4A",
                              cursor: "pointer",
                              marginLeft: "5px",
                              fontWeight: "600",
                              fontSize: "12px",
                              display: "block",
                              marginTop: "5px",
                            }}
                          >
                            {playerDescExpanded ? "Show Less" : "Show More"}
                          </span>
                        )}
                      </>
                    );
                  })()}
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
                    <button
                      className="podcast-ctrl-btn"
                      onClick={decreaseVolume}
                    >
                      <img src={valumeslash} alt="volume down" />
                    </button>
                  </div>

                  <button
                    className="podcast-ctrl-btn"
                    onClick={() => (audioRef.current!.currentTime -= 1)}
                  >
                    <img src={repeateone} alt="repeateone" />
                  </button>

                  <button
                    className={`podcast-ctrl-btn play-main-btn ${isPlaying ? "playing" : ""
                      }`}
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

                  <button
                    className="podcast-ctrl-btn"
                    onClick={() => (audioRef.current!.currentTime += 10)}
                  >
                    <img src={forward10} alt="forward" />
                  </button>

                  <div className="volume-feedback-wrapper">
                    <button
                      className="podcast-ctrl-btn"
                      onClick={increaseVolume}
                    >
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
