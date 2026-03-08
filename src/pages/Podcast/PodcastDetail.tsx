import { useLocation, useParams, useSearchParams } from "react-router-dom";
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
  const [searchParams] = useSearchParams();
  // const navigate = useNavigate();
  const episodeIdFromUrl = searchParams.get("episodeId");

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

  const hasTracked = useRef(false);

  useEffect(() => {
    // Only fetch if we don't have the real object key or if we are loading via ID
    if (id) {
      const getChannel = async () => {
        setLoading(true);
        try {
          // 1. Try Document ID (Primary)
          const docRef = doc(firestore, "Newchannels", id);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setFetchedChannel({ id: docSnap.id, ...docSnap.data(), _realId: docSnap.id });
          } else {
            // 2. Fallback: Query by '_id' (Internal ID)
            const channelsRef = collection(firestore, "Newchannels");
            let q = query(channelsRef, where("_id", "==", id));
            let snapshot = await getDocs(q);

            if (!snapshot.empty) {
              const docData = snapshot.docs[0];
              setFetchedChannel({ id: docData.id, ...docData.data(), _realId: docData.id, _virtualId: id });
            } else {
              // 3. Last resort: Query by 'id' field
              q = query(channelsRef, where("id", "==", id));
              snapshot = await getDocs(q);

              if (!snapshot.empty) {
                const docData = snapshot.docs[0];
                setFetchedChannel({ id: docData.id, ...docData.data(), _realId: docData.id, _virtualId: id });
              } else {
                console.log("❌ No channel found with this ID");
              }
            }
          }
        } catch (error) {
          console.error("Error fetching channel:", error);
        } finally {
          setLoading(false);
        }
      };
      getChannel();
    }
  }, [id]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const increaseVolume = () => {
    setVolume((prev) => {
      const next = Math.min(prev + 10, 100);
      return next;
    });
  };

  const decreaseVolume = () => {
    setVolume((prev) => {
      const next = Math.max(prev - 10, 0);
      return next;
    });
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

        // Handle deep linking for episodes
        if (episodeIdFromUrl && !currentEpisode) {
          const deepLinkedEpisode = updatedList.find(ep =>
            (ep?.guid?.[0]?._ === episodeIdFromUrl) ||
            (ep?.guid?.[0]?._ === decodeURIComponent(episodeIdFromUrl)) ||
            (ep?.title?.[0] === decodeURIComponent(episodeIdFromUrl))
          );

          if (deepLinkedEpisode) {
            setCurrentEpisode(deepLinkedEpisode);
            setTimeout(() => {
              const audioUrl = deepLinkedEpisode?.enclosure?.[0]?.$?.url || deepLinkedEpisode?.["media:content"]?.[0]?.$?.url;
              if (audioRef.current && audioUrl) {
                audioRef.current.src = audioUrl;
              }
            }, 500);
          } else if (updatedList.length > 0 && !currentEpisode) {
            setCurrentEpisode(updatedList[0]);
          }
        } else if (!currentEpisode && updatedList.length > 0) {
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
    // Only proceed if we have a valid channel URL
    if (channel?.url && !hasTracked.current) {
      setEpisodes([]);
      setPage(1);
      setHasMore(true);
      fetchEpisodes(1);

      // Standardized: Always use channel.id as the primary identifier (normalized to Firestore Doc ID)
      const realChannelId = channel?.id || fetchedChannel?.id || channel?._id;

      console.log("Analytics Debug - Channel Data:", {
        providedId: channel?.id,
        fetchedId: fetchedChannel?.id,
        resolvedId: realChannelId
      });

      if (realChannelId) {
        checkSubscriptionStatus(realChannelId);
        fetchDownloadedEpisodes();
        incrementHits("Newchannels", realChannelId);

        if (channel?.title) {
          trackPodcastPlay(realChannelId, channel.title);
        }

        // Mark as tracked to prevent duplicates on re-renders or dependency changes
        hasTracked.current = true;
      } else {
        // Fallback just in case we haven't fetched resolved channel yet
        checkSubscriptionStatus(channel?.id);
      }

      logEvent(analytics, "PodcastChannel", {
        item: JSON.stringify(channel),
        description: "PodcastChannel_event",
      });
    }
  }, [channel?.url, fetchedChannel?.id, channel?.title]); // Added channel.title as it's used inside

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
    const handleWindowScroll = () => {
      // Check if we are on mobile/tablet (<= 1024px to match CSS)
      if (window.innerWidth > 1024) return;
      if (loading || !hasMore) return;

      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100
      ) {
        setPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleWindowScroll);
    return () => window.removeEventListener("scroll", handleWindowScroll);
  }, [loading, hasMore]);

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

  const checkSubscriptionStatus = async (overrideId?: string) => {
    const channelIdToQuery = overrideId || fetchedChannel?.id || channel?._id || channel?.id;
    if (!user?.uid || !channelIdToQuery) return;

    try {
      // 1. Try checking strictly by ID (if it's a key)
      const docRef = doc(firestore, "Newchannels", channelIdToQuery);
      let docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const channelData = docSnap.data();
        const subscribers = channelData?.sub || [];
        setIsSubscribed(subscribers.includes(user.uid));
        return;
      }

      // 2. Fallback: Query by _id
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

  const handleSubscribe = async () => {
    if (!user?.uid) {
      alert("Please login to subscribe to this podcast");
      return;
    }

    // Always prefer the fetched Firestore Key
    const channelKey = fetchedChannel?.id || channel?.id;

    // We strictly use the Document Key logic for updates if possible
    if (!channelKey) {
      alert("Channel ID not found");
      return;
    }

    setSubscribeLoading(true);
    try {
      // Direct update using key (assuming channelKey is the document ID)
      // If we are not sure it's the key, we should query first, but fetchedChannel.id IS the key.
      // If we only have channel.id (virtual), we must find the key first.

      let docRef;
      let channelData;

      // Try resolving document if we suspect virtual ID or just wanna be safe
      if (fetchedChannel?.id) {
        docRef = doc(firestore, "Newchannels", fetchedChannel.id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          channelData = snap.data();
        }
      }

      // If direct fetch failed or we don't have fetchedChannel yet, query
      if (!channelData) {
        const channelsRef = collection(firestore, "Newchannels");
        // Try query by _id with the ID we have
        const q = query(channelsRef, where("_id", "==", channelKey));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          docRef = doc(firestore, "Newchannels", snapshot.docs[0].id);
          channelData = snapshot.docs[0].data();
        } else {
          // Try query by id
          const q2 = query(channelsRef, where("id", "==", channelKey));
          const s2 = await getDocs(q2);
          if (!s2.empty) {
            docRef = doc(firestore, "Newchannels", s2.docs[0].id);
            channelData = s2.docs[0].data();
          }
        }
      }

      if (docRef && channelData) {
        const currentSubs = channelData?.sub || [];

        let updatedSubs;
        if (isSubscribed) {
          updatedSubs = currentSubs.filter((id: string) => id !== user.uid);
        } else {
          updatedSubs = [...currentSubs, user.uid];
        }

        await updateDoc(docRef, {
          ...channelData,
          sub: updatedSubs,
        });

        setIsSubscribed(!isSubscribed);

        logEvent(analytics, isSubscribed ? "Unsubscribe" : "Subscribe", {
          channelId: channelKey,
          channelTitle: channel.title,
        });
      } else {
        alert("Channel not found in database. Please try again.");
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
      alert("Failed to update subscription. Please try again.");
    } finally {
      setSubscribeLoading(false);
    }
  };

  const handleShareChannel = async () => {
    const shareTitle = channel?.title || "Podcast";
    const channelId = channel?._id || channel?.id;
    const shareLink = `${window.location.origin}/api/share?type=podcast&id=${encodeURIComponent(channelId)}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: `Listen to ${shareTitle} on JesusPOD`,
          url: shareLink
        });
        logEvent(analytics, "Share_Channel", {
          channelId: channel?.id,
          channelTitle: channel?.title,
        });
      } else {
        await navigator.clipboard.writeText(shareLink);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleShareEpisode = async (episode: any, e: any) => {
    e.stopPropagation();
    const episodeTitle = episode?.title?.[0] || "Episode";
    const episodeGuid = episode?.guid?.[0]?._ || episodeTitle;

    // We encode the episode identifier to handle spaces or special chars
    // Using GUID from RSS which is usually reliable for identifying episodes
    const channelId = channel?._id || channel?.id;

    // Use share.php with episodeId for preview + deep link
    const shareLink = `${window.location.origin}/api/share?type=podcast&id=${encodeURIComponent(channelId)}&episodeId=${encodeURIComponent(episodeGuid)}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: episodeTitle,
          text: `Listen to ${episodeTitle} from ${channel?.title} on JesusPOD`,
          url: shareLink
        });
        logEvent(analytics, "Share_Episode", {
          channelId: channel?.id,
          episodeTitle: episodeTitle,
        });
      } else {
        await navigator.clipboard.writeText(shareLink);
        alert("Episode link copied to clipboard!");
      }
    } catch (error) {
      console.error("Share failed", error);
    }
  };

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
                      <h4
                        className="episode-title"
                        onClick={() => playEpisode(item)}
                        style={{ cursor: "pointer" }}
                      >
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button
                        className="icon-btn"
                        onClick={(e) => handleShareEpisode(item, e)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                        title="Share Episode"
                      >
                        <img src={share} alt="share" style={{ width: 16, height: 16, opacity: 0.7 }} />
                      </button>
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
                  </div>
                );
              })}
            </div>

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
                    onClick={() => { if (audioRef.current) audioRef.current.currentTime -= 1 }}
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
                    onClick={() => { if (audioRef.current) audioRef.current.currentTime += 10 }}
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
