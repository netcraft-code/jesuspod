// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
   apiKey: "AIzaSyDMk7EnnJQ8E7fWmdaSb5IjNzx-WxQMdIA",
  authDomain: "new-jesuspod.firebaseapp.com",
  projectId: "new-jesuspod",
  storageBucket: "new-jesuspod.appspot.com",
  messagingSenderId: "913487026448",
  appId: "1:913487026448:web:6e0de032bd007c36dead95",
  measurementId: "G-QTPEPSCL9L"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const functions = getFunctions(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
