import { useState, useEffect } from "react";
import "./SplashScreen.css";

interface SplashScreenProps {
    isVisible: boolean;
}

export default function SplashScreen({ isVisible }: SplashScreenProps) {
    const [loadingText, setLoadingText] = useState("Initializing...");
    const [progress, setProgress] = useState(0);

    const messages = [
        "Establishing Secure Connection...",
        "Syncing Spiritual Data...",
        "Optimizing Audio Stream...",
        "Welcome to JesusPOD"
    ];

    useEffect(() => {
        // Message rotation
        let msgIndex = 0;
        const msgInterval = setInterval(() => {
            msgIndex = (msgIndex + 1) % messages.length;
            setLoadingText(messages[msgIndex]);
        }, 1100);

        // Progress counter (0 to 100 over 4.5s approx)
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + 1;
            });
        }, 40); // 40ms * 100 = 4000ms

        return () => {
            clearInterval(msgInterval);
            clearInterval(progressInterval);
        };
    }, []);

    if (!isVisible) return null;

    // Generate some stars for background
    const stars = Array.from({ length: 50 }).map((_, i) => (
        <div key={i} className="star" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`
        }}></div>
    ));

    const strokeDashoffset = 440 - (440 * progress) / 100;

    return (
        <div className={`splash-screen ${!isVisible ? "fade-out" : ""}`}>
            <div className="starfield">{stars}</div>

            <div className="splash-content">
                <div className="logo-container">
                    <h1 className="splash-logo">JesusPOD</h1>
                    <p className="splash-tagline">RADIO &bull; PODCAST &bull; LIVE</p>
                </div>

                <div className="loader-circle-container">
                    <svg className="loader-svg" width="160" height="160">
                        <circle className="loader-bg" cx="80" cy="80" r="70"></circle>
                        <circle
                            className="loader-progress"
                            cx="80"
                            cy="80"
                            r="70"
                            style={{ strokeDashoffset }}
                        ></circle>
                    </svg>
                    <div className="loader-text">
                        <span className="percentage">{progress}%</span>
                    </div>
                </div>

                <p className="loading-status">{loadingText}</p>
            </div>
        </div>
    );
}
