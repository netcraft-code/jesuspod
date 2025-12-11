// authService.js
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export const loginWithEmail = (email:string, password:string) =>
  signInWithEmailAndPassword(auth, email, password);

export const signupWithEmail = (email:string, password:string) =>
  createUserWithEmailAndPassword(auth, email, password);

export const sendResetEmail = (email:string) => sendPasswordResetEmail(auth, email);

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const getUserFromToken = () => {
  return new Promise((resolve, reject) => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        });
      } else {
        reject("User not found");
      }
    });
  });
};
export const logout = () => signOut(auth);
