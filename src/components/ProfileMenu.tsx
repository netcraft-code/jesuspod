import React from "react";
import {
    FaHeart,
    FaStar,
    FaDownload,
    FaShareAlt,
    FaShieldAlt,
    FaQuestionCircle,
    FaSignOutAlt,
    FaChevronRight,
} from "react-icons/fa";
import colors from "../theme/colors";
import defaultAvatar from "../assets/default-avatar.svg";
// Props ke types define karo
interface ProfileMenuProps {
    user: {
        displayName?: string;
        photoURL?: string;
        email?: string;
    } | null;
    onLogout: () => void;
    //   onClose?: () => void;
}

interface MenuItemProps {
    icon: React.ReactNode;
    label: string;
    arrow?: boolean;
    onClick: () => void;
    red?: boolean;
}

export default function ProfileMenu({ user, onLogout }: ProfileMenuProps) {
    return (
        <div
            style={{
                position: "absolute",
                top: "60px",
                right: 30,
                width: 360,
                background: colors.cardBg,
                borderRadius: 12,
                padding: 20,
                zIndex: 999,
            }}
        >
            {/* PROFILE IMAGE */}
            <div style={{ textAlign: "center" }}>
                {user && (
                    <img
                        src={user.photoURL ?? defaultAvatar}

                        alt="profile"
                        style={{
                            width: 70,
                            height: 70,
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: `2px solid ${colors.red}`,
                        }}
                    />
                )}
                <h3 style={{ color: colors.textLight, marginTop: 10 }}>
                    {user?.displayName || "No Name"}
                </h3>
            </div>

            {/* MENU ITEMS */}
            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                <MenuItem icon={<FaHeart />} label="Favorite Radio" arrow onClick={() => alert("Fav Radio")} />
                <MenuItem icon={<FaStar />} label="Subscriptions" arrow onClick={() => alert("Subscription")} />
                <MenuItem icon={<FaDownload />} label="Downloads" arrow onClick={() => alert("Downloads")} />
                <MenuItem icon={<FaShareAlt />} label="Share App with friends" onClick={() => alert("Share")} />
                <MenuItem icon={<FaShieldAlt />} label="Privacy Policy" onClick={() => alert("Privacy Policy")} />
                <MenuItem icon={<FaQuestionCircle />} label="Help Center" onClick={() => alert("Help Center")} />
                <MenuItem icon={<FaSignOutAlt />} label="Logout" red onClick={onLogout} />
            </div>
        </div>
    );
}

function MenuItem({ icon, label, arrow = false, onClick, red = false }: MenuItemProps) {
    return (
        <div
            onClick={onClick}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                cursor: "pointer",
                color: red ? colors.red : colors.textLight,
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                <span>{label}</span>
            </div>
            {arrow && <FaChevronRight style={{ opacity: 0.6, fontSize: 14 }} />}
        </div>
    );
}
