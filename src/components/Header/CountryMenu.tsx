import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import "./style.css";

interface CountryItem {
  id: string;
  order: number;
  imageUrl: string;
  title: string;
  _id: string;
}

interface CountryMenuProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function CountryMenu({ isOpen, setIsOpen }: CountryMenuProps) {
  const countries = useSelector((state: RootState) => state.data.Countries) as CountryItem[];
  const [selectedCountry, setSelectedCountry] = useState<CountryItem | null>(null);

  // default selection or first available
  const currentSelection = selectedCountry || (countries.length > 0 ? countries[0] : null);

  return (
    <div className="country-wrapper">
      <div className="country-pill" onClick={() => setIsOpen(!isOpen)}>
        {currentSelection && (
          <>
            <img src={currentSelection.imageUrl} alt={currentSelection.title} className="pill-flag" />
            <span className="pill-name">{currentSelection.title}</span>
          </>
        )}
        <span className={`pill-arrow ${isOpen ? "open" : ""}`}>▼</span>
      </div>

      {isOpen && (
        <div className="country-dropdown">
          <div className="dropdown-scroll">
            {countries.map((country) => (
              <div
                key={country.id}
                className={`dropdown-item ${currentSelection?.id === country.id ? "active" : ""}`}
                onClick={() => {
                  setSelectedCountry(country);
                  setIsOpen(false);
                }}
              >
                <div className="item-left">
                  <img src={country.imageUrl} alt={country.title} className="dropdown-flag" />
                  <span className="dropdown-name">{country.title}</span>
                </div>
                <div className={`radio-indicator ${currentSelection?.id === country.id ? "checked" : ""}`}>
                  {currentSelection?.id === country.id && <span className="checkmark">✓</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
