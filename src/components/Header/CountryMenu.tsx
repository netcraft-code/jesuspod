import { useState } from "react";
import "./style.css";

export default function CountryMenu() {
  const [open, setOpen] = useState(false);
  // const [country, setCountry] = useState("India 🇮🇳");

  return (
    <div className="country-wrapper">
      <div className="country-selected" onClick={() => setOpen(!open)}>
        {"India 🇮🇳"}
      </div>

  
    </div>
  );
}
