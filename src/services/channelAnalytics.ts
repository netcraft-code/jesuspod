import { firestore, analytics } from "./firebase";
import {
    collection,
    setDoc,
    getDoc,
    getDocs,
    query,
    orderBy,
    limit,
    increment,
    serverTimestamp,
    arrayUnion,
    arrayRemove,
    updateDoc,
    doc
} from "firebase/firestore";
import { logEvent } from "firebase/analytics";
import { getDocWithQuery, getDocumentsByIds } from "./firestoreService";

const ANALYTICS_COLLECTION = "channelAnalytics";
const CHANNELS_COLLECTION = "channels";

/**
 * Track channel play/watch event
 * Logs to Firebase Analytics and increments Firestore counter
 */
export const trackChannelPlay = async (
    channelId: string,
    channelTitle: string,
    country: string
) => {
    try {
        console.log("📺 Tracking channel play:", { channelId, channelTitle, country });

        // Log to Firebase Analytics
        logEvent(analytics, "Channel", {
            id: channelId,
            item: channelTitle,
            description: "Channel_event",
            country: country,
        });
        console.log("✅ Analytics event logged");

        // Update Firestore analytics
        const channelDocRef = doc(firestore, ANALYTICS_COLLECTION, channelId);

        const channelDoc = await getDoc(channelDocRef);

        if (channelDoc.exists()) {
            // Increment play count
            await setDoc(
                channelDocRef,
                {
                    playCount: increment(1),
                    lastPlayed: serverTimestamp(),
                },
                { merge: true }
            );
            console.log("✅ Watch count incremented");
        } else {
            // Create new analytics document
            await setDoc(channelDocRef, {
                channelId,
                title: channelTitle,
                country: country || "Unknown",
                playCount: 1,
                lastPlayed: serverTimestamp(),
            });
            console.log("✅ New analytics document created");
        }

        console.log(`✅ Channel play tracked successfully: ${channelTitle}`);
    } catch (error) {
        console.error("❌ Error tracking channel play:", error);
    }
};

/**
 * Get most watched channels
 * @param limitCount - Number of channels to fetch
 * @param countryFilter - Optional country filter
 */
export const getMostWatchedChannels = async (
    limitCount: number = 20,
    countryFilter?: string
): Promise<any[]> => {
    try {
        console.log("📊 Fetching most watched channels...", { limitCount, countryFilter });

        const analyticsRef = collection(firestore, ANALYTICS_COLLECTION);

        // ⚠️ NOTE: To avoid creating a Composite Index in Firestore for every country,
        // we will fetch the top Global results and filter by country in memory.
        // This is efficient enough for this scale.

        // Always query by playCount descending (requires only single-field index, which is auto-created)
        // We track a larger pool (e.g. 50 or limit * 5) to increase chance of finding country-specific items
        const fetchLimit = countryFilter ? 50 : limitCount;

        const q = query(
            analyticsRef,
            orderBy("playCount", "desc"),
            limit(fetchLimit)
        );

        const querySnapshot = await getDocs(q);
        console.log("📈 Analytics documents found:", querySnapshot.docs.length);

        // Filter by country if needed AND filter valids
        let validDocs = querySnapshot.docs;

        if (countryFilter) {
            validDocs = validDocs.filter(doc => {
                const data = doc.data();
                return data.country && data.country.toLowerCase() === countryFilter.toLowerCase();
            });
        }

        // Apply original limit
        validDocs = validDocs.slice(0, limitCount);

        // Map to IDs
        const channelIds = validDocs
            .map((doc) => doc.data().channelId)
            .filter((id) => id !== undefined && id !== null && id !== "");

        console.log("🎵 Channel IDs (Filtered):", channelIds);

        if (channelIds.length === 0) {
            console.log("⚠️ No analytics data found after filter");
            return [];
        }

        const channels = await getDocumentsByIds(CHANNELS_COLLECTION, channelIds);
        console.log("📺 Channel objects fetched:", channels.length);

        // Sort channels by playCount order
        const analyticsMap = new Map();
        querySnapshot.docs.forEach((doc) => {
            const data = doc.data();
            if (data.channelId) {
                analyticsMap.set(data.channelId, data.playCount);
            }
        });

        channels.sort((a, b) => {
            const aCount = analyticsMap.get(a.id) || analyticsMap.get(a._id) || 0;
            const bCount = analyticsMap.get(b.id) || analyticsMap.get(b._id) || 0;
            return bCount - aCount;
        });

        // Map fields to match UI requirements (similar to fetchChannels)
        return channels.map((doc: any) => ({
            ...doc,
            imageUrl: doc.image || doc.imageUrl || doc.thumbnail, // Map 'image' to 'imageUrl'
            title: doc.name || doc.title, // Map 'name' to 'title'
        }));
    } catch (error) {
        console.error("❌ Error fetching most watched channels:", error);
        return [];
    }
};

/**
 * Get top USA channels
 */
export const getTopUSAChannels = async (limitCount: number = 10): Promise<any[]> => {
    return getMostWatchedChannels(limitCount, "United States");
};

/**
 * Get user's saved channels
 * @param userId - User ID to fetch saved channels for
 */
export const getSavedChannels = async (userId?: string): Promise<any[]> => {
    try {
        if (!userId) {
            return [];
        }

        // Query Channels collection where star array contains userId
        const savedChannels = await getDocWithQuery(CHANNELS_COLLECTION, [
            "star",
            "array-contains",
            userId,
        ]);

        return savedChannels.map((doc: any) => ({
            ...doc,
            imageUrl: doc.image || doc.imageUrl || doc.thumbnail,
            title: doc.name || doc.title,
        }));
    } catch (error) {
        console.error("Error fetching saved channels:", error);
        return [];
    }
};

/**
 * Toggle channel save status
 * @param channelId - ID of the channel to save/unsave
 * @param userId - ID of the user performing the action
 * @param isSaved - Current save status (true = unsave, false = save)
 */
export const toggleChannelSave = async (channelId: string, userId: string, isSaved: boolean) => {
    try {
        console.log(`❤️ Toggling channel save: ${channelId}, User: ${userId}, IsSaved: ${isSaved}`);

        const channelRef = doc(firestore, CHANNELS_COLLECTION, channelId);

        if (isSaved) {
            // Remove user from star array
            await updateDoc(channelRef, {
                star: arrayRemove(userId)
            });
            console.log("💔 Channel unsaved");
        } else {
            // Add user to star array
            await updateDoc(channelRef, {
                star: arrayUnion(userId)
            });
            console.log("💖 Channel saved");
        }
        return true;
    } catch (error) {
        console.error("❌ Error toggling channel save:", error);
        return false;
    }
};
