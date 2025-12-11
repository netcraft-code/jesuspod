import { getStorage, getDownloadURL, uploadBytes, ref } from "firebase/storage";

export const uploadUserImage = async (file:any) => {
    try {
        const storage = getStorage();
        const storageRef = ref(
            storage,
            `gs://new-jesuspod.appspot.com/UserImages/${file.name}`
        );
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        //  console.log("File available at", downloadURL);
        return downloadURL;
    } catch (error) {
        console.error("Image Upload Error:", error);
        throw error;
    }
};
