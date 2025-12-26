import axios from "axios";

const LIVE_API_URL = "https://getpaginatedvideos-913487026448.us-central1.run.app/";

export interface LiveVideo {
    url: string;
    thumbnail: string;
    title: string;
    publishedAt: {
        _seconds: number;
    };
}

export interface LiveVideosResponse {
    videos: LiveVideo[];
    totalPages: number;
    currentPage: number;
}

/**
 * Fetch paginated live videos with optional search
 * @param page - Page number (default: 1)
 * @param searchQuery - Search query string (default: "")
 * @returns Promise with videos array and pagination info
 */
export const fetchLiveVideos = async (
    page: number = 1,
    searchQuery: string = ""
): Promise<LiveVideosResponse> => {
    try {
        const response = await axios.post(
            `${LIVE_API_URL}?page=${page}&search=${searchQuery}`
        );

        return {
            videos: response.data.videos || [],
            totalPages: response.data.totalPages || 1,
            currentPage: page,
        };
    } catch (error) {
        console.error("Error fetching live videos:", error);
        return {
            videos: [],
            totalPages: 1,
            currentPage: 1,
        };
    }
};

/**
 * Fetch initial live videos for home page (first page only)
 * @returns Promise with array of live videos
 */
export const fetchAllLiveVideos = async (): Promise<LiveVideo[]> => {
    try {
        const response = await fetchLiveVideos(1, "");
        return response.videos;
    } catch (error) {
        console.error("Error fetching all live videos:", error);
        return [];
    }
};

/**
 * Calculate time ago from timestamp in seconds
 * @param timestampInSeconds - Unix timestamp in seconds
 * @returns Human-readable time ago string
 */
export const getTimeAgo = (timestampInSeconds: number): string => {
    const now = new Date();
    const publishedDate = new Date(timestampInSeconds * 1000);
    const diffInSeconds = Math.floor((now.getTime() - publishedDate.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours}h ago`;
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days}d ago`;
    }
};
