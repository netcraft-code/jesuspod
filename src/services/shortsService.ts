// shortsService.ts - Firebase service for shorts data management
import {
    collection,
    query,
    orderBy,
    limit,
    startAfter,
    getDocs,
    doc,
    updateDoc,
    increment,
    arrayUnion,
    arrayRemove,
    getDoc,
    setDoc,
    where,
    DocumentSnapshot,
} from "firebase/firestore";
import { firestore } from "./firebase";
import type { Short, ShortsResponse, UserInteractions } from "../types/shorts";

export class ShortsService {
    static COLLECTION_NAME = "Shorts";
    static USERS_COLLECTION = "users";

    // Available tags for rotation
    static AVAILABLE_TAGS = [
        "Worship",
        "Word",
        "Preach",
        "Testimony",
        "Miracle",
        "Healing",
        "Praise",
    ];

    /**
     * Group videos by their primary tag
     */
    static groupVideosByTag(videos: Short[]): Map<string, Short[]> {
        const videosByTag = new Map<string, Short[]>();

        // Initialize all tags
        this.AVAILABLE_TAGS.forEach((tag) => {
            videosByTag.set(tag, []);
        });

        // Group videos by their primary tag
        videos.forEach((video) => {
            const tags = video.tags || [];
            const primaryTag = tags.length > 0 ? tags[0] : "Word"; // Default to 'Word' if no tags

            if (videosByTag.has(primaryTag)) {
                videosByTag.get(primaryTag)!.push(video);
            } else {
                // If tag not in our list, add to 'Word' category
                videosByTag.get("Word")!.push(video);
            }
        });

        return videosByTag;
    }

    /**
     * Calculate personalized score for a video
     */
    static calculatePersonalizedScore(
        video: Short,
        viewedSet: Set<string>,
        tagPreferences: Map<string, number>
    ): number {
        const now = new Date();
        const createdAt = video.createdAt ? new Date(video.createdAt as any) : new Date(0);
        const hoursOld = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        const isViewed = viewedSet.has(video.id);
        const primaryTag = video.tags?.[0] || "Word";

        let score = 0;

        // Priority 1: Strong preference for unseen videos
        if (!isViewed) {
            score += 1000;
        } else {
            score -= 200; // Penalty for viewed videos
        }

        // Priority 2: Tag preference bonus
        const tagEngagement = tagPreferences.get(primaryTag) || 0;
        score += tagEngagement * 100; // Boost based on user's engagement with this tag

        // Priority 3: Recency bonus
        if (hoursOld < 1) score += 100;
        else if (hoursOld < 6) score += 80;
        else if (hoursOld < 24) score += 60;
        else if (hoursOld < 168) score += 40;
        else score += 20;

        // Priority 4: Engagement metrics
        const likeCount = video.likeCount || 0;
        const viewCount = video.viewCount || 0;
        const shareCount = video.shareCount || 0;

        const engagementScore = likeCount * 3 + viewCount * 0.1 + shareCount * 5;
        score += Math.min(engagementScore / 10, 100);

        // Priority 5: Small randomness for variety
        score += Math.random() * 50;

        return score;
    }

    /**
     * Create diverse feed with tag rotation
     */
    static createDiverseFeed(
        videos: Short[],
        viewedSet: Set<string>,
        tagPreferences: Map<string, number>
    ): Short[] {
        console.log("Creating diverse feed with", videos.length, "videos");

        // Group videos by tags
        const videosByTag = this.groupVideosByTag(videos);

        // Sort videos within each tag by personalized score
        const sortedVideosByTag = new Map<string, Short[]>();
        videosByTag.forEach((tagVideos, tag) => {
            const sortedVideos = tagVideos
                .map((video) => ({
                    ...video,
                    personalizedScore: this.calculatePersonalizedScore(
                        video,
                        viewedSet,
                        tagPreferences
                    ),
                }))
                .sort((a, b) => b.personalizedScore - a.personalizedScore);

            sortedVideosByTag.set(tag, sortedVideos);
            console.log(
                `${tag}: ${sortedVideos.length} videos (${sortedVideos.filter((v) => !viewedSet.has(v.id)).length
                } new)`
            );
        });

        // Create rotating feed
        const diverseFeed: Short[] = [];
        let maxRounds = 50; // Prevent infinite loop
        let round = 0;

        // Create tag rotation pattern based on user preferences
        const tagRotationOrder = [...this.AVAILABLE_TAGS].sort((a, b) => {
            const aScore = (tagPreferences.get(a) || 0) + Math.random() * 0.5;
            const bScore = (tagPreferences.get(b) || 0) + Math.random() * 0.5;
            return bScore - aScore; // Higher engagement tags first, with some randomness
        });

        console.log("Tag rotation order:", tagRotationOrder);

        while (diverseFeed.length < videos.length && round < maxRounds) {
            let addedInThisRound = false;

            // Go through tags in rotation order
            for (const tag of tagRotationOrder) {
                const tagVideos = sortedVideosByTag.get(tag) || [];
                const availableVideos = tagVideos.filter(
                    (video) => !diverseFeed.find((feedVideo) => feedVideo.id === video.id)
                );

                if (availableVideos.length > 0) {
                    // Add best video from this tag that hasn't been added yet
                    diverseFeed.push(availableVideos[0]);
                    addedInThisRound = true;

                    if (diverseFeed.length >= videos.length) break;
                }
            }

            if (!addedInThisRound) break; // No more videos to add
            round++;
        }

        console.log(
            `Created diverse feed with ${diverseFeed.length} videos over ${round} rounds`
        );

        return diverseFeed;
    }

    /**
     * Get user's viewing history and tag preferences
     */
    static async getUserViewHistory(userId: string): Promise<{
        viewedShorts: string[];
        tagPreferences: Record<string, number>;
    }> {
        try {
            const userDoc = await getDoc(doc(firestore, this.USERS_COLLECTION, userId));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                return {
                    viewedShorts: userData.viewedShorts || [],
                    tagPreferences: userData.tagPreferences || {},
                };
            }
            return {
                viewedShorts: [],
                tagPreferences: {},
            };
        } catch (error) {
            console.error("Error fetching user view history:", error);
            return {
                viewedShorts: [],
                tagPreferences: {},
            };
        }
    }


    /**
     * Fetch shorts from Firestore with pagination
     */
    static async fetchShorts({
        limitCount = 10,
        lastVisible = null,
        orderField = "createdAt",
        orderDirection = "desc" as "desc" | "asc",
        category = null,

    }: {
        limitCount?: number;
        lastVisible?: DocumentSnapshot | null;
        orderField?: string;
        orderDirection?: "desc" | "asc";
        category?: string | null;
        onlyActive?: boolean;
    } = {}): Promise<ShortsResponse> {
        try {
            let q = query(collection(firestore, this.COLLECTION_NAME));

            // Filter by active status


            // Filter by category if provided
            if (category) {
                q = query(q, where("category", "==", category));
            }

            // Add ordering
            q = query(q, orderBy(orderField, orderDirection));

            // Add pagination
            if (lastVisible) {
                q = query(q, startAfter(lastVisible));
            }

            // Add limit
            q = query(q, limit(limitCount));

            const querySnapshot = await getDocs(q);
            const shorts: Short[] = [];

            querySnapshot.forEach((doc) => {
                shorts.push({
                    id: doc.id,
                    uid: doc.id,
                    ...doc.data(),
                } as Short);
            });

            return {
                shorts,
                lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
                hasMore: querySnapshot.docs.length === limitCount,
            };
        } catch (error) {
            console.error("Error fetching shorts:", error);
            throw error;
        }
    }

    /**
     * Get a single short by ID
     */
    static async getShort(shortId: string): Promise<Short | null> {
        try {
            const shortDoc = await getDoc(doc(firestore, this.COLLECTION_NAME, shortId));
            if (shortDoc.exists()) {
                return {
                    id: shortDoc.id,
                    uid: shortDoc.id,
                    ...shortDoc.data(),
                } as Short;
            }
            return null;
        } catch (error) {
            console.error("Error fetching short:", error);
            throw error;
        }
    }

    /**
     * Increment view count for a short
     */
    static async incrementViewCount(shortId: string): Promise<void> {
        try {
            const shortRef = doc(firestore, this.COLLECTION_NAME, shortId);
            await updateDoc(shortRef, {
                viewCount: increment(1),
            });
        } catch (error) {
            console.error("Error incrementing view count:", error);
            throw error;
        }
    }

    /**
     * Increment share count for a short
     */
    static async incrementShareCount(shortId: string): Promise<void> {
        try {
            const shortRef = doc(firestore, this.COLLECTION_NAME, shortId);
            await updateDoc(shortRef, {
                shareCount: increment(1),
            });
        } catch (error) {
            console.error("Error incrementing share count:", error);
            throw error;
        }
    }

    /**
     * Toggle like status for a short
     */
    static async toggleLike(
        shortId: string,
        userId: string,
        isLiked: boolean
    ): Promise<void> {
        try {
            const shortRef = doc(firestore, this.COLLECTION_NAME, shortId);
            const userRef = doc(firestore, this.USERS_COLLECTION, userId);

            // Update in parallel for better performance
            await Promise.all([
                // Update short's like count
                updateDoc(shortRef, {
                    likeCount: increment(isLiked ? 1 : -1),
                }),
                // Update user's liked shorts
                updateDoc(userRef, {
                    likedShorts: isLiked ? arrayUnion(shortId) : arrayRemove(shortId),
                }),
            ]);
        } catch (error) {
            console.error("Error toggling like:", error);
            throw error;
        }
    }

    /**
     * Toggle save status for a short
     */
    static async toggleSave(
        shortId: string,
        userId: string,
        isSaved: boolean
    ): Promise<void> {
        try {
            const userRef = doc(firestore, this.USERS_COLLECTION, userId);

            // Create user document if it doesn't exist and update saved shorts
            await setDoc(
                userRef,
                {
                    savedShorts: isSaved ? arrayUnion(shortId) : arrayRemove(shortId),
                },
                { merge: true }
            );
        } catch (error) {
            console.error("Error toggling save:", error);
            throw error;
        }
    }

    /**
     * Get user's interaction data (liked and saved shorts)
     */
    static async getUserInteractions(userId: string): Promise<UserInteractions> {
        try {
            const userDoc = await getDoc(doc(firestore, this.USERS_COLLECTION, userId));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                return {
                    likedShorts: userData.likedShorts || [],
                    savedShorts: userData.savedShorts || [],
                };
            }
            return {
                likedShorts: [],
                savedShorts: [],
            };
        } catch (error) {
            console.error("Error fetching user interactions:", error);
            throw error;
        }
    }
}

// Utility functions
export const formatCount = (count: number): string => {
    if (!count) return "0";
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
};

export const extractVideoId = (url: string): string | null => {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^#&?]{11})/, // Regular videos
        /youtube\.com\/shorts\/([^#&?]{11})/, // YouTube Shorts
        /youtube\.com\/embed\/([^#&?]{11})/, // Embedded videos
        /youtube\.com\/v\/([^#&?]{11})/, // Old format
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1] && match[1].length === 11) {
            return match[1];
        }
    }

    return null;
};
