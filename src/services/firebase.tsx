// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getAnalytics } from "firebase/analytics";

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
export const analytics = getAnalytics(app);
export const googleProvider = new GoogleAuthProvider();

// AI Chat Search Backend Endpoint (Local and Production URL config)
export const AI_CHAT_API_URL = window.location.hostname === "localhost"
  ? "http://127.0.0.1:5001/new-jesuspod/us-central1/chatWithAI"
  : "https://us-central1-new-jesuspod.cloudfunctions.net/chatWithAI";

export default app;
