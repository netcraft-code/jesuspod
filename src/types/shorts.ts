// TypeScript interfaces for Shorts feature

export interface Short {
    id: string;
    uid?: string;
    youtubeVideoId: string;
    youtubeUrl?: string; // Full YouTube URL (supports shorts URLs)
    thumbnailUrl?: string; // Thumbnail URL
    title: string;
    description: string;
    tags?: string[];
    category?: string;
    likeCount: number;
    viewCount: number;
    shareCount: number;
    createdAt?: any; // Firestore Timestamp
    updatedAt?: any; // Firestore Timestamp
    publishedAt?: any; // Firestore Timestamp
    createdBy?: string;
    lastModifiedBy?: string;
    isActive?: boolean;
    isPinned?: boolean;
    searchKeywords?: string[];
}

export interface UserInteractions {
    likedShorts: string[];
    savedShorts: string[];
}

export interface ShortsResponse {
    shorts: Short[];
    lastVisible: any; // Firestore DocumentSnapshot
    hasMore: boolean;
}

export interface ShortItemProps {
    item: Short;
    isActive: boolean;
    isSaved?: boolean;
    onEnd?: () => void;
    onLikeToggle: (shortId: string, isLiked: boolean) => Promise<void>;
    onSaveToggle: (shortId: string, isSaved: boolean) => Promise<void>;
    onViewIncrement: (shortId: string) => Promise<void>;
}
