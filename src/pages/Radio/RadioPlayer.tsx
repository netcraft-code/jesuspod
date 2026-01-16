import { useLocation, useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../redux/store";
import { refreshSavedRadios } from "../../redux/dataSlice";
import { trackRadioPlay } from "../../services/radioAnalytics";
import { updateDocument } from "../../services/firestoreService";
import { collection, getDocs, query, where } from "firebase/firestore";
import { firestore, analytics } from "../../services/firebase";
import { logEvent } from "firebase/analytics";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import CircleImageCard from "../../components/Cards/CircleImageCard";
import "./Radio.css";
import { images } from "../../assets/images";
import { FaPause, FaHeart, FaRegHeart } from "react-icons/fa";

/* ================= TYPES ================= */

type RadioItem = {
  id: string;
  title: string;
  imageUrl: string;
  url: string;
  type?: string;
  star?: string[];
  _id?: string;
};

type LocationState = {
  current: RadioItem;
  list: RadioItem[];
  type?: string;
};

interface CountryItem {
  id: string;
  title: string;
  imageUrl: string;
  order?: number;
}

/* ================= COMPONENT ================= */

export default function RadioPlayer() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const paramType = searchParams.get("type");
  const paramId = searchParams.get("id");

  const dispatch = useDispatch();
  const state = location.state as LocationState | null;

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Redux selectors
  const allRadios = useSelector((state: RootState) => state.data.radio);
  const countries = useSelector<RootState, CountryItem[]>(
    (state) => state.data.Countries
  );
  const user = useSelector((state: RootState) => state.auth.user);

  // Initialize state - prefer location.state, fallback to URL params logic (initially empty, filled by effect)
  const [playlist, setPlaylist] = useState<RadioItem[]>(state?.list ?? []);
  const [current, setCurrent] = useState<RadioItem | null>(state?.current ?? null);

  const [playing, setPlaying] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(80); // 0-100
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [favoriteLoading, setFavoriteLoading] = useState<boolean>(false);
  const [volumeMsg, setVolumeMsg] = useState<string | null>(null);
  const [showVolumeMsg, setShowVolumeMsg] = useState(false);

  const [active, setActive] = useState<string>("Radio");
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const [countrySearch, setCountrySearch] = useState<string>("");
  const initialTitle = state?.type || paramType || "Radio Stations";
  const [playlistTitle, setPlaylistTitle] = useState<string>(initialTitle);
  const { play, forward10, repeateone, valumehigh, valumeslash, share } = images;

  // Filter countries based on search
  const filteredCountries = countries.filter((c) =>
    c.title.toLowerCase().includes(countrySearch.toLowerCase())
  );

  /* ================= EFFECT ================= */

  // Handle Deep Linking / URL Params
  useEffect(() => {
    // Only run if we DON'T have state but DO have params
    if (!state && paramType && allRadios.length > 0) {
      // 1. Filter radios by type (Country)
      const countryRadios = allRadios.filter(
        (r: RadioItem) => r.type?.toLowerCase() === paramType.toLowerCase()
      );

      if (countryRadios.length > 0) {
        setPlaylist(countryRadios);
        setPlaylistTitle(paramType);

        // 2. Find specific radio by ID
        if (paramId) {
          const foundRadio = countryRadios.find((r: RadioItem) => r.id === paramId || r._id === paramId);
          if (foundRadio) {
            setCurrent(foundRadio);
          } else {
            setCurrent(countryRadios[0]); // Fallback
          }
        } else {
          setCurrent(countryRadios[0]);
        }
      }
    }
  }, [state, paramType, paramId, allRadios]);


  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (!audioRef.current || !current) return;

    setLoading(true);
    audioRef.current.load();
    audioRef.current
      .play()
      .then(() => {
        setPlaying(true);
        trackRadioPlay(current.id, current.title, current.type || "Unknown");
      })
      .catch((e) => {
        console.warn("Autoplay blocked or failed", e);
        setPlaying(false);
      });
  }, [current]);

  /* ================= HANDLERS ================= */

  const togglePlay = (): void => {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const seekForward = (): void => {
    if (!audioRef.current) return;
    audioRef.current.currentTime += 10;
  };

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

  const toggleFavorite = async (): Promise<void> => {
    if (!user || !current) {
      alert("Please login to save favorites");
      return;
    }

    setFavoriteLoading(true);
    try {
      const radioId = current._id || current.id;
      const userId = user.uid;

      // Query to find the radio document
      const radioCollection = collection(firestore, "Radio");
      const q = query(radioCollection, where("_id", "==", radioId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docId = querySnapshot.docs[0].id;
        const radioData = querySnapshot.docs[0].data();
        const currentStars = radioData.star || [];

        let updatedStars: string[];
        if (currentStars.includes(userId)) {
          updatedStars = currentStars.filter((id: string) => id !== userId);
          setIsFavorite(false);
        } else {
          updatedStars = [...currentStars, userId];
          setIsFavorite(true);
        }

        await updateDocument("Radio", docId, { star: updatedStars });
        dispatch(refreshSavedRadios(userId) as any);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleShare = async () => {
    if (!current) return;

    const shareUrl = `${window.location.origin}/radio-player?type=${encodeURIComponent(current.type || "")}&id=${current.id}`;
    const shareData = {
      title: current.title,
      text: `Listen to ${current.title} on JesusPOD Radio`,
      url: shareUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        logEvent(analytics, "Share_Radio", {
          radioId: current.id,
          radioTitle: current.title,
          type: current.type
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Share failed", err);
    }
  };

  useEffect(() => {
    if (current && user) {
      const userId = user.uid;
      const stars = current.star || [];
      setIsFavorite(stars.includes(userId));
    }
  }, [current, user]);

  if (!current) return (
    <div className="player-page">
      <Header active={active} setActive={setActive} profileOpen={profileOpen} setProfileOpen={setProfileOpen} />
      <div className="player-layout" style={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p>Select a radio station to play</p>
      </div>
      <Footer />
    </div>
  );

  /* ================= JSX ================= */

  return (
    <div className="player-page">
      <Header
        active={active}
        setActive={setActive}
        profileOpen={profileOpen}
        setProfileOpen={setProfileOpen}
      />

      <div className="player-layout">

        {/* LEFT */}
        <div className="player-left">
          <h2 className="list-title">{playlistTitle}</h2>

          <div className="left-grid">
            {playlist.map((item) => (
              <div
                key={item.id}
                className={`radio-card ${current.id === item.id ? "active" : ""
                  }`}
                onClick={() => setCurrent(item)}
              >
                <div className="radio-img-wrapper">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="radio-img"
                  />
                </div>
                <h3 className="radio-card-title">{item.title}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="player-right">

          {/* IMAGE */}
          <div className="image-card">
            <div
              className="image-blur-bg"
              style={{ backgroundImage: `url(${current.imageUrl})` }}
            />
            <img
              src={current.imageUrl}
              alt={current.title}
              className="main-image"
            />
          </div>


          {/* AUDIO */}
          <audio
            ref={audioRef}
            src={current.url}
            onCanPlay={() => setLoading(false)}
            onEnded={() => setPlaying(false)}
          />

          {/* CONTROLS */}
          <div className="player-box">
            <h3 className="player-title">{current.title}</h3>
            <p className="player-desc">Live Music Streaming</p>

            <div className="player-controls">
              {/* VOLUME DOWN */}
              <div className="volume-feedback-wrapper">
                <button className="podcast-ctrl-btn" onClick={decreaseVolume}>
                  <img src={valumeslash} alt="volume down" />
                </button>
                {showVolumeMsg && volumeMsg?.startsWith("-") && <div className="volume-popup show">{volumeMsg}</div>}
              </div>

              {/* REPEAT/BACK */}
              <button className="podcast-ctrl-btn" onClick={() => { if (audioRef.current) audioRef.current.currentTime -= 1 }}>
                <img src={repeateone} alt="repeat" />
              </button>

              {/* PLAY / PAUSE */}
              <button
                className={`podcast-ctrl-btn play-main-btn ${playing ? 'playing' : ''}`}
                onClick={togglePlay}
                disabled={loading}
              >
                {loading ? (
                  <div className="btn-spinner"></div>
                ) : playing ? (
                  <FaPause size={25} />
                ) : (
                  <img src={play} alt="play" />
                )}
              </button>

              {/* 10s FORWARD */}
              <button className="podcast-ctrl-btn" onClick={seekForward}>
                <img src={forward10} alt="forward" />
              </button>

              {/* VOLUME UP */}
              <div className="volume-feedback-wrapper">
                <button className="podcast-ctrl-btn" onClick={increaseVolume}>
                  <img src={valumehigh} alt="volume high" />
                </button>
                {showVolumeMsg && volumeMsg?.startsWith("+") && <div className="volume-popup show">{volumeMsg}</div>}
              </div>

              {/* FAVORITE */}
              <button
                className="podcast-ctrl-btn"
                onClick={toggleFavorite}
                disabled={favoriteLoading}
                style={{ color: isFavorite ? '#e74c3c' : '#fff' }}
              >
                {favoriteLoading ? (
                  <div className="btn-spinner"></div>
                ) : isFavorite ? (
                  <FaHeart size={24} />
                ) : (
                  <FaRegHeart size={24} />
                )}
              </button>

              {/* SHARE BUTTON - ADDED */}
              <button
                className="podcast-ctrl-btn"
                onClick={handleShare}
                title="Share Station"
              >
                <img src={share} alt="share" style={{ width: 22, height: 22 }} />
              </button>
            </div>
          </div>


        </div>
      </div>

      {/* COUNTRY SECTION - AT BOTTOM OF PAGE */}
      <div className="player-country-section">
        <div className="player-country-header">
          <h2 className="sub-title">Search For Radio</h2>

          <input
            type="text"
            className="search-input"
            placeholder="Search country..."
            value={countrySearch}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCountrySearch(e.target.value)
            }
          />
        </div>

        <div className="country-grid">
          {filteredCountries.map((item) => (
            <CircleImageCard
              key={item.id}
              title={item.title}
              imageUrl={item.imageUrl}
              onClick={() => {
                const countryRadios = allRadios.filter(
                  (r: RadioItem) => r.type?.toLowerCase() === item.title.toLowerCase()
                );

                if (countryRadios.length > 0) {
                  setPlaylist(countryRadios);
                  setPlaylistTitle(item.title);
                  setCurrent(countryRadios[0]);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
