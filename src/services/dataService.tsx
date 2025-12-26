// services/dataService.js
import { getAllDocs } from "./firestoreService";

/**
 * Fetch all channels
 */
export const fetchChannels = async () => {
  return await getAllDocs("Newchannels");
};

/**
 * Fetch all radios
 */
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
  return await getAllDocs("Podcasts"); // create this collection in Firestore if needed
};

/**
 * Fetch all movies
 */
export const fetchMovies = async () => {
  return await getAllDocs("Movies");
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

