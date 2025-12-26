import { collection, getDocs, doc, updateDoc, increment, query, where, getDoc, documentId } from "firebase/firestore";
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

/**
 * Query documents with where clause
 * @param collectionName - name of the collection
 * @param whereClause - array of [field, operator, value]
 * @returns array of documents matching the query
 */
export const getDocWithQuery = async (
  collectionName: string,
  whereClause: [string, any, any]
) => {
  try {
    const collectionRef = collection(firestore, collectionName);
    const q = query(collectionRef, where(whereClause[0], whereClause[1], whereClause[2]));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error querying ${collectionName}:`, error);
    return [];
  }
};

/**
 * Update a document with new data
 * @param collectionName - name of the collection
 * @param docId - document ID
 * @param data - data to update
 */
export const updateDocument = async (
  collectionName: string,
  docId: string,
  data: any
) => {
  try {
    const docRef = doc(firestore, collectionName, docId);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error(`Error updating document ${docId} in ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Fetch multiple documents by their IDs
 * @param collectionName - name of the collection
 * @param ids - array of document IDs
 * @returns array of documents
 */
export const getDocumentsByIds = async (
  collectionName: string,
  ids: string[]
) => {
  try {
    if (ids.length === 0) return [];

    // Firestore 'in' query supports max 10 items, so we batch
    const batches = [];
    const batchSize = 10;

    for (let i = 0; i < ids.length; i += batchSize) {
      const batchIds = ids.slice(i, i + batchSize);
      const collectionRef = collection(firestore, collectionName);
      const q = query(collectionRef, where(documentId(), "in", batchIds));
      batches.push(getDocs(q));
    }

    const snapshots = await Promise.all(batches);
    const docs: any[] = [];

    snapshots.forEach((snapshot) => {
      snapshot.docs.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });
    });

    return docs;
  } catch (error) {
    console.error(`Error fetching documents by IDs from ${collectionName}:`, error);
    return [];
  }
};
