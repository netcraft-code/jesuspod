import { useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./Radio.css";
import { images } from "../../assets/images";
import { FaPause } from "react-icons/fa";

/* ================= TYPES ================= */

type RadioItem = {
  id: string;
  title: string;
  imageUrl: string;
  url: string;
  type?: string;
};

type LocationState = {
  current: RadioItem;
  list: RadioItem[];
  type?: string;
};

/* ================= COMPONENT ================= */

export default function RadioPlayer() {
  const location = useLocation();
  const state = location.state as LocationState | null;

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playlist: RadioItem[] = state?.list ?? [];
  const [current, setCurrent] = useState<RadioItem | null>(
    state?.current ?? null
  );

  const [playing, setPlaying] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(80); // 0-100
  const [saved, setSaved] = useState<boolean>(false);
  const [volumeMsg, setVolumeMsg] = useState<string | null>(null);
  const [showVolumeMsg, setShowVolumeMsg] = useState(false);

  const [active, setActive] = useState<string>("Radio");
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const { play, forward10, repeateone, valumehigh, valumeslash } = images;

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
      .then(() => setPlaying(true))
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

  const saveMusic = (): void => {
    setSaved(true);
    // future: save to redux / localStorage
  };

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
          <h2 className="list-title">{state?.type}</h2>

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
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}
