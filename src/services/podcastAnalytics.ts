import { firestore, analytics } from "./firebase";
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    orderBy,
    limit,
    increment,
    serverTimestamp,
    updateDoc,
    arrayUnion,
    arrayRemove
} from "firebase/firestore";
import { logEvent } from "firebase/analytics";
import { getDocWithQuery, getDocumentsByIds } from "./firestoreService";

const ANALYTICS_COLLECTION = "podcastAnalytics";
const CHANNELS_COLLECTION = "Newchannels";

/**
 * Track podcast play event
 * Logs to Firebase Analytics and increments Firestore counter
 */
export const trackPodcastPlay = async (
    channelId: string,
    channelTitle: string,
    episodeTitle?: string
) => {
    try {
        // console.log("🎧 Tracking podcast play:", { channelId, channelTitle, episodeTitle });

        // Log to Firebase Analytics
        logEvent(analytics, "Podcast_Play", {
            channelId: channelId,
            channelTitle: channelTitle,
            episodeTitle: episodeTitle || "Unknown",
            description: "Podcast_Play_Event",
        });
        // console.log("✅ Analytics event logged");

        // Update Firestore analytics
        const podcastDocRef = doc(firestore, ANALYTICS_COLLECTION, channelId);
        // console.log("📄 Document reference created:", ANALYTICS_COLLECTION, channelId);

        const podcastDoc = await getDoc(podcastDocRef);
        // console.log("📊 Document exists:", podcastDoc.exists());

        if (podcastDoc.exists()) {
            // Increment play count
            await setDoc(
                podcastDocRef,
                {
                    playCount: increment(1),
                    lastPlayed: serverTimestamp(),
                },
                { merge: true }
            );
            // console.log("✅ Play count incremented");
        } else {
            // Create new analytics document
            await setDoc(podcastDocRef, {
                channelId,
                title: channelTitle,
                playCount: 1,
                lastPlayed: serverTimestamp(),
                createdAt: serverTimestamp(),
            });
            // console.log("✅ New analytics document created");
        }

        // console.log(`✅ Podcast play tracked successfully: ${channelTitle}`);
    } catch (error) {
        console.error("❌ Error tracking podcast play:", error);
        console.error("Error details:", {
            message: error instanceof Error ? error.message : "Unknown error",
            channelId,
            channelTitle,
            episodeTitle
        });
    }
};

/**
 * Get most listened podcasts
 * @param limitCount - Number of podcasts to fetch
 */
export const getMostListenedPodcasts = async (
    limitCount: number = 30
): Promise<any[]> => {
    try {
        // console.log("📊 Fetching most listened podcasts...", { limitCount });

        const analyticsRef = collection(firestore, ANALYTICS_COLLECTION);

        const q = query(
            analyticsRef,
            orderBy("playCount", "desc"),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        // console.log("📈 Analytics documents found:", querySnapshot.docs.length);

        // Filter out undefined/null channelIds
        const channelIds = querySnapshot.docs
            .map((doc) => doc.data().channelId)
            .filter((id) => id !== undefined && id !== null && id !== "");

        // console.log("🎧 Channel IDs:", channelIds);

        // Fetch actual channel objects from Newchannels collection
        if (channelIds.length === 0) {
            console.log("⚠️ No analytics data found");
            return [];
        }

        // 1. Try fetching by Document ID (Primary method)
        let channels = await getDocumentsByIds(CHANNELS_COLLECTION, channelIds);
        // console.log(`📻 Channels found by Doc ID: ${channels.length}`);

        // 2. Identify missing IDs
        const foundIds = new Set(channels.map((c: any) => c.id));
        const missingIds = channelIds.filter((id) => !foundIds.has(id));

        if (missingIds.length > 0) {
            // console.log(`⚠️ Missing ${missingIds.length} channels, attempting fallback lookup...`, missingIds);

            // 3. Fallback: Query by 'id' field or '_id' field
            // We do this in parallel for efficiency
            const fallbackPromises = missingIds.map(async (missingId) => {
                // Try 'id' field
                let docs = await getDocWithQuery(CHANNELS_COLLECTION, ["id", "==", missingId]);
                if (docs.length > 0) return docs[0];

                // Try '_id' field
                docs = await getDocWithQuery(CHANNELS_COLLECTION, ["_id", "==", missingId]);
                if (docs.length > 0) return docs[0];

                return null;
            });

            const fallbackResults = await Promise.all(fallbackPromises);
            const foundFallback = fallbackResults.filter((doc) => doc !== null);
            // console.log(`✅ Found ${foundFallback.length} channels via fallback lookup`);

            channels = [...channels, ...foundFallback];
        }

        // Sort channels by playCount order
        const analyticsMap = new Map();
        querySnapshot.docs.forEach((doc) => {
            const data = doc.data();
            if (data.channelId) {
                analyticsMap.set(data.channelId, data.playCount);
            }
        });

        channels.sort((a, b) => {
            // Check Document ID, then 'id' field, then '_id' field
            // const aId = a.id;
            // const bId = b.id;

            // We need to resolve which analytics ID corresponds to this channel
            // It might match the doc.id, doc.data.id, or doc.data._id
            const getCount = (doc: any) => {
                if (analyticsMap.has(doc.id)) return analyticsMap.get(doc.id);
                if (analyticsMap.has(doc.id)) return analyticsMap.get(doc.id); // Check internal id field if exists
                if (analyticsMap.has(doc._id)) return analyticsMap.get(doc._id);

                // Reverse lookup: check if any analytics ID matches this doc's IDs
                // (This is a bit expensive but robust)
                for (const [key, val] of analyticsMap.entries()) {
                    if (key === doc.id || key === doc.id || key === doc._id) return val;
                }
                return 0;
            };

            return getCount(b) - getCount(a);
        });

        // console.log("✅ Most listened podcasts fetched successfully:", channels.length);
        return channels;
    } catch (error) {
        console.error("❌ Error fetching most listened podcasts:", error);
        return [];
    }
};

/**
 * Get new & noteworthy podcasts
 * Recent podcasts with some play activity
 */
export const getNewNoteworthyPodcasts = async (
    limitCount: number = 15
): Promise<any[]> => {
    try {
        // console.log("📊 Fetching new & noteworthy podcasts...", { limitCount });

        const analyticsRef = collection(firestore, ANALYTICS_COLLECTION);

        // Get podcasts ordered by last played (recent activity)
        const q = query(
            analyticsRef,
            orderBy("lastPlayed", "desc"),
            limit(limitCount * 2) // Fetch more to filter
        );

        const querySnapshot = await getDocs(q);
        // console.log("📈 Analytics documents found:", querySnapshot.docs.length);

        // Filter: playCount between 1-50 (not too popular, not brand new)
        const recentChannelIds = querySnapshot.docs
            .map((doc) => {
                const data = doc.data();
                const playCount = data.playCount || 0;
                // New & noteworthy: some plays but not top tier
                if (playCount >= 1 && playCount <= 100) {
                    return data.channelId;
                }
                return null;
            })
            .filter((id) => id !== null && id !== undefined && id !== "")
            .slice(0, limitCount);

        // console.log("🎧 New & Noteworthy Channel IDs:", recentChannelIds);

        if (recentChannelIds.length === 0) {
            // console.log("⚠️ No new & noteworthy data found");
            return [];
        }

        const channels = await getDocumentsByIds(CHANNELS_COLLECTION, recentChannelIds);
        // console.log("📻 Channel objects fetched:", channels.length);

        // console.log("✅ New & noteworthy podcasts fetched successfully:", channels.length);
        return channels;
    } catch (error) {
        console.error("❌ Error fetching new & noteworthy podcasts:", error);
        return [];
    }
};

/**
 * Get user's subscribed podcasts
 * @param userId - User ID to fetch subscribed podcasts for
 */
export const getSubscribedPodcasts = async (userId?: string): Promise<any[]> => {
    try {
        if (!userId) {
            console.log("No user ID provided for subscribed podcasts");
            return [];
        }

        // Query Newchannels collection where sub array contains userId
        const subscribedPodcasts = await getDocWithQuery(CHANNELS_COLLECTION, [
            "sub",
            "array-contains",
            userId,
        ]);

        // console.log("✅ Subscribed podcasts fetched:", subscribedPodcasts.length);
        return subscribedPodcasts;
    } catch (error) {
        console.error("Error fetching subscribed podcasts:", error);
        return [];
    }
};

/**
 * Toggle podcast save status (Favorite/Unfavorite)
 * Uses 'star' field to separate from subscriptions
 * @param channelId - ID of the podcast to save/unsave
 * @param userId - ID of the user performing the action
 * @param isSaved - Current save status (true = unsave, false = save)
 */
export const togglePodcastSave = async (channelId: string, userId: string, isSaved: boolean) => {
    try {
        console.log(`❤️ Toggling podcast save (star): ${channelId}, User: ${userId}, IsSaved: ${isSaved}`);

        const podcastRef = doc(firestore, CHANNELS_COLLECTION, channelId);

        if (isSaved) {
            // Remove user from star array
            await updateDoc(podcastRef, {
                star: arrayRemove(userId)
            });
            console.log("💔 Podcast unsaved (unstarred)");
        } else {
            // Add user to star array
            await updateDoc(podcastRef, {
                star: arrayUnion(userId)
            });
            console.log("💖 Podcast saved (starred)");
        }
        return true;
    } catch (error) {
        console.error("❌ Error toggling podcast save:", error);
        return false;
    }
};

/**
 * Get user's saved podcasts (Favorites)
 * @param userId - User ID to fetch saved podcasts for
 */
export const getSavedPodcasts = async (userId?: string): Promise<any[]> => {
    try {
        if (!userId) {
            return [];
        }

        // Query Newchannels collection where star array contains userId
        const savedPodcasts = await getDocWithQuery(CHANNELS_COLLECTION, [
            "star",
            "array-contains",
            userId,
        ]);

        console.log("✅ Saved podcasts fetched:", savedPodcasts.length);
        return savedPodcasts;
    } catch (error) {
        console.error("Error fetching saved podcasts:", error);
        return [];
    }
};
