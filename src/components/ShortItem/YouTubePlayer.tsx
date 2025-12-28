import { useEffect, useRef, useState } from "react";

interface YouTubePlayerProps {
    videoId: string;
    isActive: boolean;
    onProgress?: (playedSeconds: number) => void;
    onEnded?: () => void;
}

export default function YouTubePlayer({
    videoId,
    isActive,
    onProgress,
    onEnded,
}: YouTubePlayerProps) {
    const playerRef = useRef<any>(null);
    const intervalRef = useRef<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const currentVideoIdRef = useRef<string>("");

    // Load YouTube IFrame API
    useEffect(() => {
        if ((window as any).YT) return;

        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }, []);

    // Handle play/pause based on isActive
    useEffect(() => {
        if (!playerRef.current) return;

        try {
            if (isActive) {
                playerRef.current.unMute(); // Unmute when becoming active
                playerRef.current.playVideo();
            } else {
                playerRef.current.pauseVideo();
            }
        } catch (error) {
            console.error("Error controlling playback:", error);
        }
    }, [isActive]);

    // Create/Destroy player based on videoId changes
    useEffect(() => {
        // If same video, don't recreate
        if (currentVideoIdRef.current === videoId && playerRef.current) {
            return;
        }

        // Cleanup previous player
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (playerRef.current) {
            try {
                playerRef.current.destroy();
            } catch (error) {
                console.error("Error destroying player:", error);
            }
            playerRef.current = null;
        }

        if (!videoId || videoId.length !== 11) {
            console.error("Invalid video ID:", videoId);
            return;
        }

        currentVideoIdRef.current = videoId;
        setIsLoading(true);
        setIsPlayerReady(false);

        const createPlayer = () => {
            const YT = (window as any).YT;
            if (!YT || !YT.Player) {
                setTimeout(createPlayer, 100);
                return;
            }

            if (!containerRef.current) {
                console.error("Container not available");
                return;
            }

            // Clear container
            containerRef.current.innerHTML = "";

            // Create player div
            const playerDiv = document.createElement("div");
            containerRef.current.appendChild(playerDiv);

            try {
                playerRef.current = new YT.Player(playerDiv, {
                    videoId: videoId,
                    width: "100%",
                    height: "100%",
                    playerVars: {
                        autoplay: 0, // Don't autoplay, we'll control it manually
                        controls: 1,
                        modestbranding: 1,
                        rel: 0,
                        playsinline: 1,
                        fs: 1,
                        mute: 1, // Start muted to prevent browser blocking
                        enablejsapi: 1,
                        iv_load_policy: 3, // Hide annotations
                        cc_load_policy: 0, // Hide captions by default
                    },
                    events: {
                        onReady: (event: any) => {
                            console.log("Player ready for video:", videoId);
                            setIsPlayerReady(true);
                            setIsLoading(false);

                            // Only play if active
                            if (isActive) {
                                try {
                                    event.target.unMute(); // Unmute when playing
                                    event.target.playVideo();
                                } catch (error) {
                                    console.error("Error starting video:", error);
                                }
                            }

                            // Start progress tracking
                            if (onProgress) {
                                intervalRef.current = setInterval(() => {
                                    if (playerRef.current?.getCurrentTime) {
                                        try {
                                            onProgress(playerRef.current.getCurrentTime());
                                        } catch (error) {
                                            console.error("Error getting current time:", error);
                                        }
                                    }
                                }, 1000) as any;
                            }
                        },
                        onStateChange: (event: any) => {
                            if (event.data === YT.PlayerState.ENDED && onEnded) {
                                onEnded();
                            }
                        },
                        onError: (event: any) => {
                            console.error("YouTube Player Error:", event.data, "for video:", videoId);
                            setIsPlayerReady(false);
                            setIsLoading(false);
                        },
                    },
                });
            } catch (error) {
                console.error("Error creating YouTube player:", error);
                setIsLoading(false);
            }
        };

        createPlayer();

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }

            if (playerRef.current) {
                try {
                    playerRef.current.destroy();
                } catch (error) {
                    // Ignore cleanup errors
                }
                playerRef.current = null;
            }
        };
    }, [videoId]); // Only recreate when videoId changes

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative"
            }}
        >
            {/* YouTube player container */}
            <div
                ref={containerRef}
                style={{
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                    top: 0,
                    left: 0
                }}
            />

            {/* Loading indicator */}
            {isLoading && !isPlayerReady && (
                <div style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "16px",
                    zIndex: 10,
                    pointerEvents: "none"
                }}>
                    <div style={{
                        width: "50px",
                        height: "50px",
                        border: "4px solid rgba(255, 255, 255, 0.1)",
                        borderTopColor: "#dc2626",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite"
                    }} />
                    <div style={{
                        color: "#fff",
                        fontSize: "14px",
                        fontFamily: "Arial, sans-serif",
                        fontWeight: "500"
                    }}>
                        Loading video...
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </div>
    );
}
