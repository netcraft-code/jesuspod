import React, { useState } from "react";
import { FaBookmark, FaTv, FaBook, FaFilm, FaMicrophone, FaGlobe } from "react-icons/fa";

import defaultAvatar from "../../assets/default-avatar.svg";
import { images } from "../../assets/images";
import { logout } from "../../services/authService";
import { authLogout } from "../../redux/authSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearData } from "../../redux/dataSlice";
import { useTranslation } from "../../context/LanguageContext";

interface ProfileMenuProps {
    user: {
        displayName?: string;
        photoURL?: string;
        email?: string;
    } | null;
    // onLogout: () => void;
}

interface MenuItemProps {
    icon: React.ReactNode;
    label: string;
    arrow?: boolean;
    onClick: () => void;
    red?: boolean;
}

import { resetSplashState } from "../../pages/home/Home";

export default function ProfileMenu({ user }: ProfileMenuProps) {
    const { liked, subscription, down, share, privacy, help, exit } = images;

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t, language, setLanguage } = useTranslation();
    const [langOpen, setLangOpen] = useState(false);

    const languages = [
        { code: "en", label: "English", flag: "🇺🇸" },
        { code: "es", label: "Español", flag: "🇪🇸" },
        { code: "pt", label: "Português", flag: "🇵🇹" },
        { code: "sw", label: "Swahili", flag: "🇹🇿" }
    ] as const;

    const handleLogout = () => {
        if (window.confirm(t("profileMenu.logoutConfirm"))) {
            logout();
            localStorage.removeItem("token");
            dispatch(authLogout());
            dispatch(clearData());
            resetSplashState(); // Reset splash for next login
            navigate("/login", { replace: true });
        }
    };
    return (
        <div className="profile-menu">
            {/* PROFILE IMAGE */}
            <div className="profile-header">
                <div className="avatar-container">
                    <img
                        src={user?.photoURL ?? defaultAvatar}
                        alt="profile"
                        className="profile-image"
                    />
                    <div className="camera-overlay">
                        <img src={images.camera} alt="camera" width={16} color="white" />
                    </div>
                </div>
                <h3 className="profile-name">{user?.displayName || "No Name"}</h3>
            </div>

            {/* MENU */}
            <div className="menu-list">
                <MenuItem
                    icon={<img src={liked} alt="like" width={25} />}
                    label={t("profileMenu.favoriteRadio")}
                    arrow
                    onClick={() => navigate("/favorite-radios")}
                />

                <MenuItem
                    icon={<FaBookmark size={20} color="#ff4444" />}
                    label={t("profileMenu.favoriteShorts")}
                    arrow
                    onClick={() => navigate("/saved-shorts")}
                />

                <MenuItem
                    icon={<FaTv size={20} color="#ff4444" />}
                    label={t("profileMenu.myChannels")}
                    arrow
                    onClick={() => navigate("/all-channels", { state: { filter: 'saved' } })}
                />

                <MenuItem
                    icon={<FaFilm size={20} color="#ff4444" />}
                    label={t("profileMenu.myMovies")}
                    arrow
                    onClick={() => navigate("/all-movies", { state: { filter: 'saved' } })}
                />

                <MenuItem
                    icon={<FaMicrophone size={20} color="#ff4444" />}
                    label={t("profileMenu.myPodcast")}
                    arrow
                    onClick={() => navigate("/all-podcast", { state: { filter: 'saved' } })}
                />

                <MenuItem
                    icon={<FaBook size={20} color="#ff4444" />}
                    label={t("profileMenu.myBooks")}
                    arrow
                    onClick={() => navigate("/all-books", { state: { filter: 'saved' } })}
                />

                <MenuItem
                    icon={<img src={subscription} alt="sub" width={25} />}
                    label={t("profileMenu.following")}
                    arrow
                    onClick={() => navigate("/subscriptions")}
                />

                <MenuItem
                    icon={<img src={down} alt="download" width={25} />}
                    label={t("profileMenu.downloads")}
                    arrow
                    onClick={() => navigate("/downloads")}
                />

                <MenuItem
                    icon={<FaGlobe size={20} color="#ff4444" />}
                    label={`${t("profileMenu.language") || "Language"}: ${languages.find(l => l.code === language)?.label || "English"}`}
                    arrow={!langOpen}
                    onClick={() => setLangOpen(!langOpen)}
                />

                {langOpen && (
                    <div className="language-submenu" style={{ paddingLeft: "45px", display: "flex", flexDirection: "column", gap: "6px", marginTop: "-4px", marginBottom: "8px" }}>
                        {languages.map((lang) => (
                            <div
                                key={lang.code}
                                onClick={() => setLanguage(lang.code as any)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "6px 12px",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    backgroundColor: language === lang.code ? "rgba(255, 68, 68, 0.1)" : "transparent",
                                    color: language === lang.code ? "#ff4444" : "#aaa",
                                    transition: "all 0.2s"
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <span style={{ fontSize: "16px" }}>{lang.flag}</span>
                                    <span style={{ fontSize: "14px" }}>{lang.label}</span>
                                </div>
                                {language === lang.code && <span style={{ color: "#ff4444", fontWeight: "bold" }}>✓</span>}
                            </div>
                        ))}
                    </div>
                )}

                <MenuItem
                    icon={<img src={share} alt="share" width={25} />}
                    label={t("profileMenu.shareApp")}
                    onClick={() => {
                        const shareData = {
                            title: 'JesusPod',
                            text: 'Check out the JesusPod app!',
                            url: window.location.origin,
                        };
                        if (navigator.share) {
                            navigator.share(shareData).catch(err => console.log('Error sharing', err));
                        } else {
                            navigator.clipboard.writeText(window.location.origin);
                            alert(t("radio.linkCopied"));
                        }
                    }}
                />

                <MenuItem
                    icon={<img src={privacy} alt="privacy" width={20} />}
                    label={t("profileMenu.privacyPolicy")}
                    onClick={() => navigate("/privacy-policy")}
                />

                <MenuItem
                    icon={<img src={help} alt="help" width={25} />}
                    label={t("profileMenu.helpCenter")}
                    onClick={() => navigate("/help-center")}
                />

                <MenuItem
                    icon={<img src={exit} alt="logout" width={20} />}
                    label={t("profileMenu.logout")}
                    red
                    onClick={handleLogout}
                />
            </div>
        </div>
    );
}


function MenuItem({ icon, label, arrow = false, onClick, red = false }: MenuItemProps) {
    return (
        <div
            className={`menu-item ${red ? "menu-red" : ""}`}
            onClick={onClick}
        >
            <div className="menu-left">
                <span className="menu-icon">{icon}</span>
                <span className="menu-label">{label}</span>
            </div>

            {arrow && (
                <img
                    src={images.arrowLeft}
                    alt="arrow"
                    width={18}
                    className="menu-arrow-right"
                />
            )}
        </div>
    );
}
