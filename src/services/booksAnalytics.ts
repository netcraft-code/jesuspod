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

const ANALYTICS_COLLECTION = "bookAnalytics";
const BOOKS_COLLECTION = "Books";

/**
 * Track book read/click event
 */
export const trackBookRead = async (
    bookId: string,
    bookTitle: string,
    country: string
) => {
    try {
        // console.log("📖 Tracking book read:", { bookId, bookTitle, country });

        // Log to Firebase Analytics
        logEvent(analytics, "Book", {
            id: bookId,
            item: bookTitle,
            description: "Book_read_event",
            country: country,
        });

        // Update Firestore analytics
        const bookDocRef = doc(firestore, ANALYTICS_COLLECTION, bookId);
        const bookDoc = await getDoc(bookDocRef);

        if (bookDoc.exists()) {
            await setDoc(
                bookDocRef,
                {
                    readCount: increment(1),
                    lastRead: serverTimestamp(),
                },
                { merge: true }
            );
        } else {
            await setDoc(bookDocRef, {
                bookId,
                title: bookTitle,
                country: country || "Unknown",
                readCount: 1,
                lastRead: serverTimestamp(),
            });
        }
    } catch (error) {
        console.error("❌ Error tracking book read:", error);
    }
};

/**
 * Get most read books
 */
export const getMostReadBooks = async (
    limitCount: number = 20,
    countryFilter?: string
): Promise<any[]> => {
    try {
        const analyticsRef = collection(firestore, ANALYTICS_COLLECTION);
        const fetchLimit = countryFilter ? 50 : limitCount;

        const q = query(
            analyticsRef,
            orderBy("readCount", "desc"),
            limit(fetchLimit)
        );

        const querySnapshot = await getDocs(q);
        let validDocs = querySnapshot.docs;

        if (countryFilter) {
            validDocs = validDocs.filter(doc => {
                const data = doc.data();
                return data.country && data.country.toLowerCase() === countryFilter.toLowerCase();
            });
        }

        validDocs = validDocs.slice(0, limitCount);

        const bookIds = validDocs
            .map((doc) => doc.data().bookId)
            .filter((id) => id);

        if (bookIds.length === 0) return [];

        const books = await getDocumentsByIds(BOOKS_COLLECTION, bookIds);

        // Sort by readCount order using a map
        const analyticsMap = new Map();
        querySnapshot.docs.forEach((doc) => {
            const data = doc.data();
            if (data.bookId) analyticsMap.set(data.bookId, data.readCount);
        });

        books.sort((a, b) => {
            const aCount = analyticsMap.get(a.id) || analyticsMap.get(a._id) || 0;
            const bCount = analyticsMap.get(b.id) || analyticsMap.get(b._id) || 0;
            return bCount - aCount;
        });

        return books.map((doc: any) => ({
            ...doc,
            imageUrl: doc.image || doc.imageUrl || doc.thumbnail,
            title: doc.name || doc.title,
        }));
    } catch (error) {
        console.error("❌ Error fetching most read books:", error);
        return [];
    }
};

/**
 * Get top USA books
 */
export const getTopUSABooks = async (limitCount: number = 10): Promise<any[]> => {
    return getMostReadBooks(limitCount, "United States");
};

/**
 * Get saved books
 */
export const getSavedBooks = async (userId?: string): Promise<any[]> => {
    try {
        if (!userId) return [];

        const savedBooks = await getDocWithQuery(BOOKS_COLLECTION, [
            "star",
            "array-contains",
            userId,
        ]);

        return savedBooks.map((doc: any) => ({
            ...doc,
            imageUrl: doc.image || doc.imageUrl || doc.thumbnail,
            title: doc.name || doc.title,
        }));
    } catch (error) {
        console.error("Error fetching saved books:", error);
        return [];
    }
};

/**
 * Toggle book save status
 */
export const toggleBookSave = async (bookId: string, userId: string, isSaved: boolean) => {
    try {
        const bookRef = doc(firestore, BOOKS_COLLECTION, bookId);

        if (isSaved) {
            await updateDoc(bookRef, {
                star: arrayRemove(userId)
            });
        } else {
            await updateDoc(bookRef, {
                star: arrayUnion(userId)
            });
        }
        return true;
    } catch (error) {
        console.error("❌ Error toggling book save:", error);
        return false;
    }
};
