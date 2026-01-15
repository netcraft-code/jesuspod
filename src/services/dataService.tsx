// services/dataService.js
import { getAllDocs } from "./firestoreService";

/**
 * Fetch all channels
 */
export const fetchChannels = async () => {
  const docs = await getAllDocs("channels");
  return docs.map((doc: any) => ({
    ...doc,
    imageUrl: doc.image || doc.imageUrl || doc.thumbnail, // Map 'image' to 'imageUrl'
    title: doc.name || doc.title, // Map 'name' to 'title'
    // Ensure id exists if not handled by getAllDocs properly (though it usually is)
  }));
};

/**
 * Fetch all radios
 */

/**
 * Fetch all banners
 */
export const fetchBanners = async () => {
  const docs = await getAllDocs("BannersCollection");
  return docs.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
};

export const fetchRadio = async () => {
  return await getAllDocs("Radio");
};



export const getAllFalgs = async () => {
  return await getAllDocs("Countries");
};

/**
 * Fetch all podcasts
 */
export const fetchPodcasts = async () => {
  const docs = await getAllDocs("Newchannels");
  return docs.map((doc: any) => ({
    ...doc,
    imageUrl: doc.image || doc.imageUrl || doc.thumbnail, // Standardize image field
    title: doc.name || doc.title, // Standardize title field
    id: doc._id || doc.id // Ensure ID presence
  }));
};

/**
 * Fetch all movies
 */
export const fetchMovies = async () => {
  const docs = await getAllDocs("movies");
  return docs.map((doc: any) => ({
    ...doc,
    imageUrl: doc.image || doc.imageUrl || doc.thumbnail, // Standardize image field
    title: doc.name || doc.title, // Standardize title field
    createdAt: doc.createdAt?.toMillis ? doc.createdAt.toMillis() : doc.createdAt,
    updatedAt: doc.updatedAt?.toMillis ? doc.updatedAt.toMillis() : doc.updatedAt,
  }));
};

/**
 * Fetch all books
 */
export const fetchBooks = async () => {
  return await getAllDocs("Books");
};

/**
 * Fetch all Acts2
 */
export const fetchActs2 = async () => {
  return await getAllDocs("Acts2");
};

/**
 * Fetch most listened radios from analytics
 */
export const fetchMostListenedRadios = async () => {
  try {
    const { getMostListenedRadios } = await import("./radioAnalytics");
    return await getMostListenedRadios(20);
  } catch (error) {
    console.error("Error fetching most listened radios:", error);
    return [];
  }
};

/**
 * Fetch top USA radios from analytics
 */
export const fetchTopUSARadios = async () => {
  try {
    const { getTopUSARadios } = await import("./radioAnalytics");
    return await getTopUSARadios(10);
  } catch (error) {
    console.error("Error fetching top USA radios:", error);
    return [];
  }
};

/**
 * Fetch saved radios (placeholder)
 */
export const fetchSavedRadios = async (userId?: string) => {
  try {
    const { getSavedRadios } = await import("./radioAnalytics");
    return await getSavedRadios(userId);
  } catch (error) {
    console.error("Error fetching saved radios:", error);
    return [];
  }
};

/**
 * Fetch most listened podcasts from analytics
 */
export const fetchMostListenedPodcasts = async () => {
  try {
    const { getMostListenedPodcasts } = await import("./podcastAnalytics");
    return await getMostListenedPodcasts(20);
  } catch (error) {
    console.error("Error fetching most listened podcasts:", error);
    return [];
  }
};

/**
 * Fetch new & noteworthy podcasts from analytics
 */
export const fetchNewNoteworthyPodcasts = async () => {
  try {
    const { getNewNoteworthyPodcasts } = await import("./podcastAnalytics");
    return await getNewNoteworthyPodcasts(15);
  } catch (error) {
    console.error("Error fetching new noteworthy podcasts:", error);
    return [];
  }
};

/**
 * Fetch user's subscribed podcasts
 */
export const fetchSubscribedPodcasts = async (userId?: string) => {
  try {
    const { getSubscribedPodcasts } = await import("./podcastAnalytics");
    return await getSubscribedPodcasts(userId);
  } catch (error) {
    console.error("Error fetching subscribed podcasts:", error);
    return [];
  }
};

/**
 * Fetch live channels from Firestore "channels" collection
 * Only returns channels where isLive == true
 */
export const fetchLiveVideos = async () => {
  try {
    const { getDocWithQuery } = await import("./firestoreService");

    // Query channels collection where isLive == true
    const liveChannels = await getDocWithQuery("channels", ["isLive", "==", true]);

    console.log(`Found ${liveChannels.length} live channels`);

    // Sort by liveStartTime (most recent first)
    const sortedChannels = liveChannels.sort((a: any, b: any) => {
      const timeA = a.liveStartTime ? new Date(a.liveStartTime).getTime() : 0;
      const timeB = b.liveStartTime ? new Date(b.liveStartTime).getTime() : 0;
      return timeB - timeA; // Most recent first
    });

    // Map to expected structure for compatibility
    return sortedChannels.map((channel: any) => ({
      id: channel.id,
      _id: channel.id,
      title: channel.liveTitle || channel.name,
      imageUrl: channel.liveThumbnail || channel.image,
      category: channel.category || '',
      url: channel.liveVideoId ? `https://www.youtube.com/watch?v=${channel.liveVideoId}` : '',
      liveVideoId: channel.liveVideoId,
      liveThumbnail: channel.liveThumbnail,
      liveTitle: channel.liveTitle,
      liveStartTime: channel.liveStartTime,
      name: channel.name,
      image: channel.image,
    }));
  } catch (error) {
    console.error("Error fetching live channels:", error);
    return [];
  }
};

/**
 * Fetch most watched channels from analytics
 */
export const fetchMostWatchedChannels = async () => {
  try {
    const { getMostWatchedChannels } = await import("./channelAnalytics.ts");
    return await getMostWatchedChannels(20);
  } catch (error) {
    console.error("Error fetching most watched channels:", error);
    return [];
  }
};

/**
 * Fetch top USA channels from analytics
 */
export const fetchTopUSAChannels = async () => {
  try {
    const { getTopUSAChannels } = await import("./channelAnalytics.ts");
    return await getTopUSAChannels(10);
  } catch (error) {
    console.error("Error fetching top USA channels:", error);
    return [];
  }
};

/**
 * Fetch saved channels
 */
export const fetchSavedChannels = async (userId?: string) => {
  try {
    const { getSavedChannels } = await import("./channelAnalytics.ts");
    return await getSavedChannels(userId);
  } catch (error) {
    console.error("Error fetching saved channels:", error);
    return [];
  }
};



/**
 * Toggle save status of a channel
 */
export const toggleChannelSave = async (channelId: string, userId: string, isSaved: boolean) => {
  try {
    const { toggleChannelSave } = await import("./channelAnalytics.ts");
    return await toggleChannelSave(channelId, userId, isSaved);
  } catch (error) {
    console.error("Error toggling channel save:", error);
    return false;
  }
};


// -------------------- BOOKS --------------------

/**
 * Fetch most read books from analytics
 */
export const fetchMostReadBooks = async () => {
  try {
    const { getMostReadBooks } = await import("./booksAnalytics.ts");
    return await getMostReadBooks(20);
  } catch (error) {
    console.error("Error fetching most read books:", error);
    return [];
  }
};

/**
 * Fetch top USA books from analytics
 */
export const fetchTopUSABooks = async () => {
  try {
    const { getTopUSABooks } = await import("./booksAnalytics.ts");
    return await getTopUSABooks(10);
  } catch (error) {
    console.error("Error fetching top USA books:", error);
    return [];
  }
};

/**
 * Fetch saved books
 */
export const fetchSavedBooks = async (userId?: string) => {
  try {
    const { getSavedBooks } = await import("./booksAnalytics.ts");
    return await getSavedBooks(userId);
  } catch (error) {
    console.error("Error fetching saved books:", error);
    return [];
  }
};

/**
 * Toggle save status of a book
 */
export const toggleBookSave = async (bookId: string, userId: string, isSaved: boolean) => {
  try {
    const { toggleBookSave } = await import("./booksAnalytics.ts");
    return await toggleBookSave(bookId, userId, isSaved);
  } catch (error) {
    console.error("Error toggling book save:", error);
    return false;
  }
};


// -------------------- MOVIES --------------------

/**
 * Fetch most watched movies from analytics
 */
export const fetchMostWatchedMovies = async () => {
  try {
    const { getMostWatchedMovies } = await import("./movieAnalytics");
    return await getMostWatchedMovies(20);
  } catch (error) {
    console.error("Error fetching most watched movies:", error);
    return [];
  }
};

/**
 * Fetch saved movies
 */
export const fetchSavedMovies = async (userId?: string) => {
  try {
    const { getSavedMovies } = await import("./movieAnalytics");
    return await getSavedMovies(userId);
  } catch (error) {
    console.error("Error fetching saved movies:", error);
    return [];
  }
};

/**
 * Toggle save status of a movie
 */
export const toggleMovieSave = async (movieId: string, userId: string, isSaved: boolean) => {
  try {
    const { toggleMovieSave } = await import("./movieAnalytics");
    return await toggleMovieSave(movieId, userId, isSaved);
  } catch (error) {
    console.error("Error toggling movie save:", error);
    return false;
  }
};
