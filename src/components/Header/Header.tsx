import { useState } from "react";
import "./style.css";
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

  const [countryOpen, setCountryOpen] = useState<boolean>(false);
  // const [country, setCountry] = useState<string>("India 🇮🇳");

  const firstLetter =
    user?.displayName?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "";

  const overlayActive = profileOpen || countryOpen;

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
          <div className="logo">JesusPOD</div>
        </div>

        {/* CENTER TABS */}
        <div className="header-middle">
          <Tabs active={active} setActive={setActive} />
        </div>

        <div className="header-right">
          <div onClick={() => setCountryOpen(!countryOpen)}>
            <CountryMenu />
          </div>

          <ProfileButton
            letter={firstLetter}
            onClick={() => setProfileOpen(!profileOpen)}
          />
        </div>
      </header>

      {profileOpen && user && (
        <div className="profile-menu-container">
          <ProfileMenu user={user} />
        </div>
      )}

      {countryOpen && (
        <div className="country-popup">
          <div >India 🇮🇳</div>
          <div >USA 🇺🇸</div>
          <div>UK 🇬🇧</div>
        </div>
      )}
    </>
  );
}
