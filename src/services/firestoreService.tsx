import { collection, getDocs, doc, updateDoc, increment } from "firebase/firestore";
import { firestore } from "./firebase";


/**
 * Generic function to fetch all documents from a Firestore collection
 * @param {string} collectionName - name of the collection
 * @returns array of documents with id and data
 */
export const getAllDocs = async (collectionName: string) => {
  try {
    const collectionRef = collection(firestore, collectionName);
    const snapshot = await getDocs(collectionRef);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error fetching documents from ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Atomically increment popularity hits for a document
 */
export const incrementHits = async (collectionName: string, docId: string) => {
  try {
    const docRef = doc(firestore, collectionName, docId);
    await updateDoc(docRef, {
      hits: increment(1)
    });
  } catch (error) {
    console.error(`Error incrementing hits for ${docId} in ${collectionName}:`, error);
  }
};
