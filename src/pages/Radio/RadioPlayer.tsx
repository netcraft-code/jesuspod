import { useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../redux/store";
import { refreshSavedRadios } from "../../redux/dataSlice";
import { trackRadioPlay } from "../../services/radioAnalytics";
import { updateDocument } from "../../services/firestoreService";
import { collection, getDocs, query, where } from "firebase/firestore";
import { firestore } from "../../services/firebase";
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
  // const navigate = useNavigate();
  const dispatch = useDispatch();
  const state = location.state as LocationState | null;

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Redux selectors - use filtered radio
  // const radio = useSelector(getFilteredRadio);
  // Get ALL radios (unfiltered) for country click
  const allRadios = useSelector((state: RootState) => state.data.radio);
  const countries = useSelector<RootState, CountryItem[]>(
    (state) => state.data.Countries
  );
  const user = useSelector((state: RootState) => state.auth.user);

  const [playlist, setPlaylist] = useState<RadioItem[]>(state?.list ?? []);
  const [current, setCurrent] = useState<RadioItem | null>(
    state?.current ?? null
  );

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
  const [playlistTitle, setPlaylistTitle] = useState<string>(state?.type || "Radio Stations");
  const { play, forward10, repeateone, valumehigh, valumeslash } = images;

  // Filter countries based on search
  const filteredCountries = countries.filter((c) =>
    c.title.toLowerCase().includes(countrySearch.toLowerCase())
  );

  /* ================= EFFECT ================= */

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
        // Track radio play for analytics
        trackRadioPlay(current.id, current.title, current.type || "Unknown");
      })
      .catch(() => setPlaying(false));
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
          // Remove from favorites
          updatedStars = currentStars.filter((id: string) => id !== userId);
          setIsFavorite(false);
        } else {
          // Add to favorites
          updatedStars = [...currentStars, userId];
          setIsFavorite(true);
        }

        // Update Firestore
        await updateDocument("Radio", docId, { star: updatedStars });

        // Refresh saved radios in Redux
        dispatch(refreshSavedRadios(userId) as any);

        console.log("Favorite updated successfully");
      } else {
        console.error("Radio document not found");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  // Check if current radio is favorited
  useEffect(() => {
    if (current && user) {
      // const radioId = current._id || current.id;
      const userId = user.uid;
      const stars = current.star || [];
      setIsFavorite(stars.includes(userId));
    }
  }, [current, user]);

  if (!current) return null;

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
                // Filter radios by selected country
                const countryRadios = allRadios.filter(
                  (r: RadioItem) => r.type?.toLowerCase() === item.title.toLowerCase()
                );

                if (countryRadios.length > 0) {
                  // Update playlist with filtered radios
                  setPlaylist(countryRadios);

                  // Update playlist title
                  setPlaylistTitle(item.title);

                  // Set first radio as current
                  setCurrent(countryRadios[0]);

                  // Scroll to top to show the playlist
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
