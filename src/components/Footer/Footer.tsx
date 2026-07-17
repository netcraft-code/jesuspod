import { FaFacebook, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import "./Footer.css";
import { useTranslation } from "../../context/LanguageContext";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-left">
          <p>&copy; 2026 {t("footer.allRightsReserved")}</p>
        </div>
        <div className="footer-center" style={{ textAlign: "center" }}>
          <div className="footer-logo">JesusPOD</div>
          <span>
            {t("footer.craftedBy")}{" "}
            <a target="_blank" href="http://netcraftglobal.com">
              NetCraft Global
            </a>{" "}
            ❤️
          </span>
          {/* Optional: Add links or logo here if needed */}
        </div>
        <div className="footer-right">
          <a
            href="https://www.facebook.com/share/16gQpE1vyY/?mibextid=wwXIfr"
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon"
          >
            <FaFacebook />
          </a>
          <a
            href="https://www.instagram.com/jesuspod_app?igsh=MTE3ZGh4dWxoZGszeg=="
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon"
          >
            <FaInstagram />
          </a>
          <a
            href="https://x.com/jesus_pod?s=11&t=ZgW5e0PxSgTCzRqKv6RAMA"
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon"
          >
            <FaXTwitter />
          </a>
        </div>
      </div>
    </footer>
  );
}

