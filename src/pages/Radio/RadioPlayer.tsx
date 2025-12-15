import { useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Header from "../../components/Header/Header";
import "./RadioPlayer.css";
import { Oval } from "react-loader-spinner";
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaForward,
  FaBookmark
} from "react-icons/fa";

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
  const [muted, setMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);
  const [saved, setSaved] = useState<boolean>(false);

  const [active, setActive] = useState<string>("Radio");
  const [profileOpen, setProfileOpen] = useState<boolean>(false);

  /* ================= EFFECT ================= */

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

  const toggleMute = (): void => {
    if (!audioRef.current) return;
    audioRef.current.muted = !muted;
    setMuted(!muted);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const v = Number(e.target.value);
    if (!audioRef.current) return;

    audioRef.current.volume = v;
    setVolume(v);
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
                  <div className="radio-overlay"></div>
                  <h3 className="radio-title">{item.title}</h3>
                </div>
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
          <div className="control-bar">

            {/* MUTE */}
            <button className="ctrl-btn" onClick={toggleMute}>
              {muted ? <FaVolumeMute size={26} /> : <FaVolumeUp size={26} />}
            </button>

            {/* SAVE (ROUND + 1 STYLE) */}
            <button
              className={`ctrl-btn save-btn ${saved ? "active" : ""}`}
              onClick={saveMusic}
            >
              <FaBookmark size={24} />
              <span className="save-count">1</span>
            </button>

            {/* PLAY / PAUSE */}
            <button className="ctrl-btn main" onClick={togglePlay}>
              {loading ? (
                <Oval
                  height={40}
                  width={40}
                  color="#fff"
                  secondaryColor="rgba(255,255,255,0.4)"
                />
              ) : playing ? (
                <FaPause size={34} />
              ) : (
                <FaPlay size={34} />
              )}
            </button>

            {/* 10s FORWARD */}
            <button className="ctrl-btn" onClick={seekForward}>
              <FaForward size={26} />
            </button>

            {/* VOLUME */}
            <div className="volume-box">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolume}
              />
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
