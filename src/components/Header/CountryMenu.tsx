import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../redux/store";
import { setSelectedCountry } from "../../redux/dataSlice";
import { useTranslation } from "../../context/LanguageContext";
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
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const countries = useSelector((state: RootState) => state.data.Countries) as CountryItem[];
  const selectedCountry = useSelector((state: RootState) => state.data.selectedCountry);

  // Find selected country object or use "All Countries"
  const currentSelection = selectedCountry
    ? countries.find(c => c.title.toLowerCase() === selectedCountry.toLowerCase())
    : null;

  const handleCountrySelect = (countryTitle: string | null) => {
    dispatch(setSelectedCountry(countryTitle));
    setIsOpen(false);
  };

  return (
    <div className="country-wrapper">
      <div className="country-pill" onClick={() => setIsOpen(!isOpen)}>
        {currentSelection ? (
          <>
            <img src={currentSelection.imageUrl} alt={currentSelection.title} className="pill-flag" />
            <span className="pill-name">{currentSelection.title}</span>
          </>
        ) : (
          <span className="pill-name">{t("header.allCountries")}</span>
        )}
        <span className={`pill-arrow ${isOpen ? "open" : ""}`}>▼</span>
      </div>

      {isOpen && (
        <div className="country-dropdown">
          <div className="dropdown-scroll">
            {/* All Countries Option */}
            <div
              className={`dropdown-item ${!selectedCountry ? "active" : ""}`}
              onClick={() => handleCountrySelect(null)}
            >
              <div className="item-left">
                <span className="dropdown-name">🌍 {t("header.allCountries")}</span>
              </div>
              <div className={`radio-indicator ${!selectedCountry ? "checked" : ""}`}>
                {!selectedCountry && <span className="checkmark">✓</span>}
              </div>
            </div>

            {/* Individual Countries */}
            {countries.map((country) => (
              <div
                key={country.id}
                className={`dropdown-item ${selectedCountry?.toLowerCase() === country.title.toLowerCase() ? "active" : ""}`}
                onClick={() => handleCountrySelect(country.title)}
              >
                <div className="item-left">
                  <img src={country.imageUrl} alt={country.title} className="dropdown-flag" />
                  <span className="dropdown-name">{country.title}</span>
                </div>
                <div className={`radio-indicator ${selectedCountry?.toLowerCase() === country.title.toLowerCase() ? "checked" : ""}`}>
                  {selectedCountry?.toLowerCase() === country.title.toLowerCase() && <span className="checkmark">✓</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
