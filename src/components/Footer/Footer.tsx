import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import "./Footer.css";

export default function Footer() {
    return (
        <footer className="main-footer">
            <div className="footer-content">
                <div className="footer-left">
                    <p>&copy; 2025 All Rights Reserved</p>
                </div>
                <div className="footer-center">
                    <div className="footer-logo">JesusPOD</div>
                    {/* Optional: Add links or logo here if needed */}
                </div>
                <div className="footer-right">
                    <a className="social-icon"><FaFacebook /></a>
                    <a className="social-icon"><FaInstagram /></a>
                    <a className="social-icon"><FaYoutube /></a>
                </div>
            </div>
        </footer>
    );
}
