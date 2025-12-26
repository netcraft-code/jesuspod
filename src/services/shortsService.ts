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
