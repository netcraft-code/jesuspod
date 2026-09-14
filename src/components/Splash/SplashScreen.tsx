import { useState, useEffect, useMemo } from "react";
import "./SplashScreen.css";

interface SplashScreenProps {
    isVisible: boolean;
}

export default function SplashScreen({ isVisible }: SplashScreenProps) {
    const [loadingText, setLoadingText] = useState("Initializing...");
    const [progress, setProgress] = useState(25);

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
        }, 600);

        // Smooth fast progress counter (0 to 100 in ~700ms)
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + 15;
            });
        }, 70);

        return () => {
            clearInterval(msgInterval);
            clearInterval(progressInterval);
        };
    }, []);

    // Generate static stars once (avoid continuous re-computation)
    const stars = useMemo(() => Array.from({ length: 40 }).map((_, i) => (
        <div key={i} className="star" style={{
            left: `${(i * 19) % 100}%`,
            top: `${(i * 23) % 100}%`,
            animationDelay: `${(i % 5) * 0.4}s`
        }}></div>
    )), []);

    if (!isVisible) return null;

    const strokeDashoffset = 440 - (440 * progress) / 100;

    return (
        <div className={`splash-screen ${!isVisible ? "fade-out" : ""}`}>
            <div className="starfield">{stars}</div>

            <div className="splash-content">
                <div className="logo-container">
                    <h1 className="splash-logo">
                        JESUSPOD
                    </h1>
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
