import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Tabs from "./Tabs";
import ProfileButton from "./ProfileButton";
import CountryMenu from "./CountryMenu";
import ProfileMenu from "../ProfileMenu/ProfileMenu";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";

/** 🔹 Props typing */
interface HeaderProps {
  active: string;
  setActive: React.Dispatch<React.SetStateAction<string>>;
  profileOpen: boolean;
  setProfileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

/** 🔹 User type (auth slice) */
interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

export default function Header({
  active,
  setActive,
  profileOpen,
  setProfileOpen,
}: HeaderProps) {
  const user = useSelector<RootState, User | null>(
    (state) => state.auth.user
  );

  const navigate = useNavigate();

  const [countryOpen, setCountryOpen] = useState<boolean>(false);

  const firstLetter =
    user?.displayName?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "";

  const overlayActive = profileOpen || countryOpen;

  // REFS for click detection
  const countryRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // CLICK OUTSIDE HANDLER
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Close Country Menu if open and clicked outside
      if (countryOpen && countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setCountryOpen(false);
      }

      // Close Profile Menu if open and clicked outside both button and menu
      if (
        profileOpen &&
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [countryOpen, profileOpen, setCountryOpen, setProfileOpen]);

  return (
    <>
      {/* RED OVERLAY */}
      {overlayActive && <div className="red-overlay" />}

      <header
        className="main-header"
        style={{
          borderBottomLeftRadius: overlayActive ? 20 : 0,
          borderBottomRightRadius: overlayActive ? 20 : 0,
        }}
      >
        <div className="header-left">
          <div
            className="logo"
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          >
            JesusPOD
          </div>
        </div>

        {/* CENTER TABS */}
        <div className="header-middle">
          <Tabs active={active} setActive={setActive} />
        </div>

        <div className="header-right">
          <div ref={countryRef} style={{ position: 'relative' }}>
            <CountryMenu isOpen={countryOpen} setIsOpen={setCountryOpen} />
          </div>

          <div ref={profileButtonRef}>
            <ProfileButton
              letter={firstLetter}
              onClick={() => setProfileOpen(!profileOpen)}
            />
          </div>
        </div>
      </header>

      {profileOpen && user && (
        <div className="profile-menu-container" ref={profileMenuRef}>
          <ProfileMenu user={user} />
        </div>
      )}
    </>
  );
}
