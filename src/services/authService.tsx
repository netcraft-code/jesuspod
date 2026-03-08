// authService.js
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode,
  signOut,
  signInWithPopup,
  getAuth, onAuthStateChanged, OAuthProvider
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";

export const loginWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const signupWithEmail = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);

export const sendResetEmail = (email: string) => {
  const actionCodeSettings = {
    // URL to redirect back to. The domain (www.example.com) must be
    // whitelisted in the Firebase Console.
    url: `${window.location.origin}/reset-password`,
    // This must be true.
    handleCodeInApp: true,
  };
  return sendPasswordResetEmail(auth, email, actionCodeSettings);
};

export const resetPassword = (code: string, newPassword: string) =>
  confirmPasswordReset(auth, code, newPassword);

export const verifyResetCode = (code: string) =>
  verifyPasswordResetCode(auth, code);

const appleProvider = new OAuthProvider("apple.com");

export const loginWithApple = () => signInWithPopup(auth, appleProvider);

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
