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
