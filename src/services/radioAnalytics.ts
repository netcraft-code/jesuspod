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
    where,
    increment,
    serverTimestamp
} from "firebase/firestore";
import { logEvent } from "firebase/analytics";
import { getDocWithQuery, getDocumentsByIds } from "./firestoreService";

const ANALYTICS_COLLECTION = "radioAnalytics";
const RADIO_COLLECTION = "Radio";

/**
 * Track radio play event
 * Logs to Firebase Analytics and increments Firestore counter
 */
export const trackRadioPlay = async (
    radioId: string,
    radioTitle: string,
    country: string
) => {
    try {
        // console.log("🎵 Tracking radio play:", { radioId, radioTitle, country });

        // Log to Firebase Analytics
        logEvent(analytics, "Radio", {
            id: radioId,
            item: radioTitle,
            description: "Radio_event",
            country: country,
        });
        // console.log("✅ Analytics event logged");

        // Update Firestore analytics
        const radioDocRef = doc(firestore, ANALYTICS_COLLECTION, radioId);
        // console.log("📄 Document reference created:", ANALYTICS_COLLECTION, radioId);

        const radioDoc = await getDoc(radioDocRef);
        // console.log("📊 Document exists:", radioDoc.exists());

        if (radioDoc.exists()) {
            // Increment play count
            await setDoc(
                radioDocRef,
                {
                    playCount: increment(1),
                    lastPlayed: serverTimestamp(),
                    radioId: radioId, // Ensure canonical ID is stored
                    title: radioTitle,
                },
                { merge: true }
            );
            // console.log("✅ Play count incremented");
        } else {
            // Create new analytics document
            await setDoc(radioDocRef, {
                radioId, // Canonical Document ID
                title: radioTitle,
                country: country || "Unknown", // Reverted to original `country` as `radioType` is undefined
                playCount: 1,
                lastPlayed: serverTimestamp(),
            });
            // console.log("✅ New analytics document created");
        }

        console.log(`✅ Radio play tracked successfully: ${radioTitle}`);
    } catch (error) {
        console.error("❌ Error tracking radio play:", error);
        console.error("Error details:", {
            message: error instanceof Error ? error.message : "Unknown error",
            radioId,
            radioTitle,
            country
        });
    }
};

/**
 * Get most listened radios
 * @param limitCount - Number of radios to fetch
 * @param countryFilter - Optional country filter
 */
export const getMostListenedRadios = async (
    limitCount: number = 20,
    countryFilter?: string
): Promise<any[]> => {
    try {
        // console.log("📊 Fetching most listened radios...", { limitCount, countryFilter });

        const analyticsRef = collection(firestore, ANALYTICS_COLLECTION);

        let q;
        if (countryFilter) {
            q = query(
                analyticsRef,
                where("country", "==", countryFilter),
                orderBy("playCount", "desc"),
                limit(limitCount)
            );
        } else {
            q = query(
                analyticsRef,
                orderBy("playCount", "desc"),
                limit(limitCount)
            );
        }

        const querySnapshot = await getDocs(q);
        // console.log("📈 Analytics documents found:", querySnapshot.docs.length);

        // ✅ Filter out undefined/null radioIds
        const radioIds = querySnapshot.docs
            .map((doc) => doc.data().radioId)
            .filter((id) => id !== undefined && id !== null && id !== "");

        // console.log("🎵 Radio IDs:", radioIds);

        // Fetch actual radio objects from Radio collection
        if (radioIds.length === 0) {
            console.log("⚠️ No analytics data found");
            return [];
        }

        const radios = await getDocumentsByIds(RADIO_COLLECTION, radioIds);
        // console.log("📻 Radio objects fetched:", radios.length);

        // Sort radios by playCount order
        const analyticsMap = new Map();
        querySnapshot.docs.forEach((doc) => {
            const data = doc.data();
            if (data.radioId) {
                analyticsMap.set(data.radioId, data.playCount);
            }
        });

        radios.sort((a, b) => {
            const getCount = (doc: any) => {
                if (analyticsMap.has(doc.id)) return analyticsMap.get(doc.id);
                if (analyticsMap.has(doc._id)) return analyticsMap.get(doc._id);
                return 0;
            };

            return getCount(b) - getCount(a);
        });

        // console.log("✅ Most listened radios fetched successfully:", radios.length);
        return radios;
    } catch (error) {
        console.error("❌ Error fetching most listened radios:", error);
        return [];
    }
};

/**
 * Get top USA radios
 */
export const getTopUSARadios = async (limitCount: number = 10): Promise<any[]> => {
    return getMostListenedRadios(limitCount, "United States");
};

/**
 * Get user's saved radios
 * @param userId - User ID to fetch saved radios for
 */
export const getSavedRadios = async (userId?: string): Promise<any[]> => {
    try {
        if (!userId) {
            console.log("No user ID provided for saved radios");
            return [];
        }

        // Query Radio collection where star array contains userId
        const savedRadios = await getDocWithQuery(RADIO_COLLECTION, [
            "star",
            "array-contains",
            userId,
        ]);

        return savedRadios;
    } catch (error) {
        console.error("Error fetching saved radios:", error);
        return [];
    }
};

