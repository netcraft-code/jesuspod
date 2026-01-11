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

const ANALYTICS_COLLECTION = "movieAnalytics";
const MOVIES_COLLECTION = "movies";

/**
 * Track movie play/watch event
 * Logs to Firebase Analytics and increments Firestore counter
 */
export const trackMoviePlay = async (
    movieId: string,
    movieName: string,
    category: string
) => {
    try {
        console.log("🎬 Tracking movie play:", { movieId, movieName, category });

        // Log to Firebase Analytics
        logEvent(analytics, "Movie", {
            id: movieId,
            item: movieName,
            description: "Movie_event",
            category: category,
        });
        console.log("✅ Analytics event logged");

        // Update Firestore analytics
        const movieDocRef = doc(firestore, ANALYTICS_COLLECTION, movieId);

        const movieDoc = await getDoc(movieDocRef);

        if (movieDoc.exists()) {
            // Increment play count
            await setDoc(
                movieDocRef,
                {
                    playCount: increment(1),
                    lastPlayed: serverTimestamp(),
                },
                { merge: true }
            );
            console.log("✅ Watch count incremented");
        } else {
            // Create new analytics document
            await setDoc(movieDocRef, {
                movieId,
                name: movieName,
                category: category || "Unknown",
                playCount: 1,
                lastPlayed: serverTimestamp(),
            });
            console.log("✅ New analytics document created");
        }

        console.log(`✅ Movie play tracked successfully: ${movieName}`);
    } catch (error) {
        console.error("❌ Error tracking movie play:", error);
    }
};

/**
 * Get most watched movies
 * @param limitCount - Number of movies to fetch
 */
export const getMostWatchedMovies = async (
    limitCount: number = 20
): Promise<any[]> => {
    try {
        console.log("📊 Fetching most watched movies...", { limitCount });

        const analyticsRef = collection(firestore, ANALYTICS_COLLECTION);

        const q = query(
            analyticsRef,
            orderBy("playCount", "desc"),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        console.log("📈 Analytics documents found:", querySnapshot.docs.length);

        // Map to IDs
        const movieIds = querySnapshot.docs
            .map((doc) => doc.data().movieId)
            .filter((id) => id !== undefined && id !== null && id !== "");

        console.log("🎬 Movie IDs:", movieIds);

        if (movieIds.length === 0) {
            console.log("⚠️ No analytics data found");
            return [];
        }

        const movies = await getDocumentsByIds(MOVIES_COLLECTION, movieIds);
        console.log("🎬 Movie objects fetched:", movies.length);

        // Sort movies by playCount order
        const analyticsMap = new Map();
        querySnapshot.docs.forEach((doc) => {
            const data = doc.data();
            if (data.movieId) {
                analyticsMap.set(data.movieId, data.playCount);
            }
        });

        movies.sort((a, b) => {
            const aCount = analyticsMap.get(a.id) || analyticsMap.get(a._id) || 0;
            const bCount = analyticsMap.get(b.id) || analyticsMap.get(b._id) || 0;
            return bCount - aCount;
        });

        // Map fields to match UI requirements
        return movies.map((doc: any) => ({
            ...doc,
            imageUrl: doc.image || doc.imageUrl || doc.thumbnail,
            title: doc.name || doc.title,
            createdAt: doc.createdAt?.toMillis ? doc.createdAt.toMillis() : doc.createdAt,
            updatedAt: doc.updatedAt?.toMillis ? doc.updatedAt.toMillis() : doc.updatedAt,
            lastPlayed: doc.lastPlayed?.toMillis ? doc.lastPlayed.toMillis() : doc.lastPlayed,
        }));
    } catch (error) {
        console.error("❌ Error fetching most watched movies:", error);
        return [];
    }
};

/**
 * Get user's saved movies
 * @param userId - User ID to fetch saved movies for
 */
export const getSavedMovies = async (userId?: string): Promise<any[]> => {
    try {
        if (!userId) {
            return [];
        }

        // Query Movies collection where star array contains userId
        const savedMovies = await getDocWithQuery(MOVIES_COLLECTION, [
            "star",
            "array-contains",
            userId,
        ]);

        return savedMovies.map((doc: any) => ({
            ...doc,
            imageUrl: doc.image || doc.imageUrl || doc.thumbnail,
            title: doc.name || doc.title,
            createdAt: doc.createdAt?.toMillis ? doc.createdAt.toMillis() : doc.createdAt,
            updatedAt: doc.updatedAt?.toMillis ? doc.updatedAt.toMillis() : doc.updatedAt,
            // Sanitize any other potential timestamps
            lastPlayed: doc.lastPlayed?.toMillis ? doc.lastPlayed.toMillis() : doc.lastPlayed,
        }));
    } catch (error) {
        console.error("Error fetching saved movies:", error);
        return [];
    }
};

/**
 * Toggle movie save status
 * @param movieId - ID of the movie to save/unsave
 * @param userId - ID of the user performing the action
 * @param isSaved - Current save status (true = unsave, false = save)
 */
export const toggleMovieSave = async (movieId: string, userId: string, isSaved: boolean) => {
    try {
        console.log(`❤️ Toggling movie save: ${movieId}, User: ${userId}, IsSaved: ${isSaved}`);

        const movieRef = doc(firestore, MOVIES_COLLECTION, movieId);

        if (isSaved) {
            // Remove user from star array
            await updateDoc(movieRef, {
                star: arrayRemove(userId)
            });
            console.log("💔 Movie unsaved");
        } else {
            // Add user to star array
            await updateDoc(movieRef, {
                star: arrayUnion(userId)
            });
            console.log("💖 Movie saved");
        }
        return true;
    } catch (error) {
        console.error("❌ Error toggling movie save:", error);
        return false;
    }
};
